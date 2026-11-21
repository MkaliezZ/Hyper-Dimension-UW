// Camera constraints use solid building footprints in unchanged campus coordinates.
// Model placements supply real vertical extents instead of inferred map heights.
import {BUILDING_ACCESS,createBuildingAccess} from './campus-building-access.js';
function contains(x,z,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
const inParts=(x,z,parts)=>parts.some(rings=>contains(x,z,rings[0])&&!rings.slice(1).some(r=>contains(x,z,r)));
const cross=(ax,az,bx,bz)=>ax*bz-az*bx;
const polygonBounds=points=>[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),
  Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
const planeY=([a,b,c],x,z)=>a*x+b*z+c;
export function createCampusCameraClearance(campus,placements=()=>new Map()){
  const access=createBuildingAccess(campus,0);
  const actual=campus.geometryHash===BUILDING_ACCESS.geometryHash?new Map((BUILDING_ACCESS.collisionFootprints||[]).map(r=>[r.id,r])):new Map();
  const solids=campus.buildings.flatMap(building=>{
    const shape=actual.get(building.id);
    if(shape?.cameraVolumes)return shape.cameraVolumes.map(volume=>{
      const {ring,bottom,top}=volume;
      return {id:building.id,sourceModel:true,parts:[[ring]],bounds:polygonBounds(ring),volume,
        base:Math.min(...ring.map(([x,z])=>planeY(bottom,x,z))),
        roof:Math.max(...ring.map(([x,z])=>planeY(top,x,z)))};
    });
    const parts=shape?.rings||[building.rings];
    return [{id:building.id,base:building.baseY,roof:building.baseY+building.height,
      sourceModel:!!shape,parts,bounds:polygonBounds(parts.flat(2))}];
  });
  const range=row=>{if(row.volume)return [row.base,row.roof];const p=placements().get(row.id);return p&&Number.isFinite(p.groundY)&&Number.isFinite(p.height)?[p.groundY,p.groundY+p.height]:[row.base,row.roof];};
  // Reviewed exterior porches are open at head height even when the old map
  // outline includes them. Keep the solid volume above that short clearance.
  function solidAt(row,p){
    if(row.volume){
      const [x,y,z]=p,{bottom,top}=row.volume;
      return y>=planeY(bottom,x,z)&&y<=planeY(top,x,z)&&contains(x,z,row.volume.ring);
    }
    const [lo,hi]=range(row);if(p[1]<lo-.2||p[1]>hi+.2||!inParts(p[0],p[2],row.parts))return false;return row.sourceModel||!access.permits(row.id,p[0],p[2])||p[1]>access.height(p[0],p[2],row.base)+2.1;}
  function inside(p){return solids.some(row=>{const b=row.bounds;return p[0]>=b[0]&&p[0]<=b[2]&&p[2]>=b[1]&&p[2]<=b[3]&&solidAt(row,p);});}
  function clear(a,b){
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
    for(const row of solids){const q=row.bounds,[lo,hi]=range(row);if(Math.max(a[0],b[0])<q[0]||Math.min(a[0],b[0])>q[2]||Math.max(a[2],b[2])<q[1]||Math.min(a[2],b[2])>q[3]||Math.max(a[1],b[1])<lo||Math.min(a[1],b[1])>hi)continue;
      const cuts=[0,1];if(!row.sourceModel&&access.permits(row.id,a[0],a[2])){const n=Math.ceil(Math.hypot(dx,dy,dz)/.2);for(let i=1;i<n;i++)cuts.push(i/n);}if(Math.abs(dy)>1e-9)for(const y of[lo,hi]){const t=(y-a[1])/dy;if(t>0&&t<1)cuts.push(t);}
      if(row.volume)for(const plane of [row.volume.bottom,row.volume.top]){
        const aGap=a[1]-planeY(plane,a[0],a[2]),bGap=b[1]-planeY(plane,b[0],b[2]);
        if(aGap*bGap<0)cuts.push(aGap/(aGap-bGap));
      }
      for(const rings of row.parts)for(const ring of rings)for(let i=0;i<ring.length;i++){const p=ring[i],n=ring[(i+1)%ring.length],ex=n[0]-p[0],ez=n[1]-p[1],den=cross(dx,dz,ex,ez);if(Math.abs(den)<1e-10)continue;const px=p[0]-a[0],pz=p[1]-a[2],t=cross(px,pz,ex,ez)/den,u=cross(px,pz,dx,dz)/den;if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);}
      cuts.sort((x,y)=>x-y);for(let i=1;i<cuts.length;i++){const t=(cuts[i-1]+cuts[i])/2,y=a[1]+dy*t;if(solidAt(row,[a[0]+dx*t,y,a[2]+dz*t]))return false;}
    }return true;
  }
  function actorCamera(point,offset=[-18.6,16.5,21]){
    const target=[point[0],point[1]+1.1,point[2]],angles=[0];for(let i=1;i<8;i++)angles.push(i*Math.PI/8,-i*Math.PI/8);angles.push(Math.PI);
    for(const angle of angles){const c=Math.cos(angle),s=Math.sin(angle),p=[point[0]+c*offset[0]+s*offset[2],point[1]+offset[1],point[2]-s*offset[0]+c*offset[2]];if(!inside(p)&&clear(target,p))return {position:p,target,rotation:angle,overhead:false};}
    const top=Math.max(target[1]+30,...solids.map(r=>range(r)[1]+3)),p=[point[0],top,point[2]];
    if(!inside(p)&&clear(target,p))return {position:p,target,rotation:0,overhead:true};
    return null;
  }
  return {inside,clear,actorCamera};
}
