// Shared server/browser walking surfaces and exact source-model body footprints.
// Campus source geometry, saved identities and durable positions are untouched.
import {BUILDING_ACCESS} from './campus-building-access-data.js';
export {BUILDING_ACCESS};

export function sitePavingForCampus(campus){
  if(campus.geometryHash!==BUILDING_ACCESS.geometryHash)return [];
  return (BUILDING_ACCESS.sitePaving||[]).filter(row=>campus.buildings.some(b=>b.id===row.id));
}

function distance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/d)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
function contains(x,z,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function intersectsBody(x,z,parts,radius){for(const rings of parts){
  if(contains(x,z,rings[0])&&!rings.slice(1).some(ring=>contains(x,z,ring)))return true;
  for(const ring of rings)for(let i=0;i<ring.length;i++)if(distance(x,z,ring[i],ring[(i+1)%ring.length])<radius)return true;
}return false;}
export function createBuildingAccess(campus,radius){
  const rows=campus.geometryHash===BUILDING_ACCESS.geometryHash?BUILDING_ACCESS.buildings.filter(row=>campus.buildings.some(b=>b.id===row.id)).map(row=>({...row,c:Math.cos(row.placement.angle),s:Math.sin(row.placement.angle)})):[];
  const bodies=campus.geometryHash===BUILDING_ACCESS.geometryHash?(BUILDING_ACCESS.collisionFootprints||[]).filter(row=>campus.buildings.some(b=>b.id===row.id)):[];
  const paving=sitePavingForCampus(campus);
  const exactFootprints=new Set(bodies.filter(row=>row.replaceCanonicalFootprint).map(row=>row.id));
  const bins=new Map(),cell=24;
  for(const row of bodies){const [x0,z0,x1,z1]=row.bounds;for(let x=Math.floor((x0-radius)/cell);x<=Math.floor((x1+radius)/cell);x++)for(let z=Math.floor((z0-radius)/cell);z<=Math.floor((z1+radius)/cell);z++){const key=x+':'+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(row);}}
  const local=(row,x,z)=>{const dx=x-row.placement.x,dz=z-row.placement.z;return [row.c*dx-row.s*dz,row.s*dx+row.c*dz];};
  function nearby(x,z){return rows.filter(row=>Math.abs(x-row.placement.x)<20&&Math.abs(z-row.placement.z)<20);}
  function blocked(x,z){
    for(const row of bins.get(Math.floor(x/cell)+':'+Math.floor(z/cell))||[]){const [x0,z0,x1,z1]=row.bounds;if(x>=x0-radius&&z>=z0-radius&&x<=x1+radius&&z<=z1+radius&&intersectsBody(x,z,row.rings,radius))return true;}
    for(const row of nearby(x,z)){const [X,Z]=local(row,x,z);if(row.rails.some(rail=>distance(X,Z,rail.a,rail.b)<radius+rail.radius))return true;}return false;
  }
  // Only reviewed exterior corridors permit entry through a canonical outline.
  function permits(buildingId,x,z){for(const row of nearby(x,z)){
    if(row.id!==buildingId)continue;const [X,Z]=local(row,x,z);
    if(row.openFootprintCorridors?.some(area=>X>=area.x[0]&&X<=area.x[1]&&Z>=area.z[0]&&Z<=area.z[1]))return true;
  }return false;}
  function height(x,z,fallback,ground=fallback){let result=fallback,found=false;for(const row of nearby(x,z)){
    const [X,Z]=local(row,x,z);
    for(const surface of row.surfaces){if(X<surface.x[0]||X>surface.x[1]||Z<surface.z[0]||Z>surface.z[1])continue;let y;
      if(surface.kind==='flat')y=surface.height;
      else {const range=surface[surface.axis],v=surface.axis==='x'?X:Z,t=Math.max(0,Math.min(1,(v-range[0])/(range[1]-range[0])));
        if(surface.kind==='ramp')y=surface.startHeight+(surface.endHeight-surface.startHeight)*t;
        else {const progress=surface.highAt==='min'?t:1-t,index=Math.min(surface.count-1,Math.max(0,Math.floor(progress*surface.count-1e-7)));y=surface.top-index*(surface.top-surface.bottom)/surface.count;}}
      result=Math.max(found?result:ground,row.placement.groundY+y+.055);found=true;
    }
  }
    for(const patch of paving)if(contains(x,z,patch.ring))result=Math.max(result,ground+patch.offset);
    return result;
  }
  return {blocked,height,permits,replacesFootprint:id=>exactFootprints.has(id),active:[...new Set(rows.map(row=>row.id))],collisionActive:[...new Set(bodies.map(row=>row.id))]};
}
