import {CPG_ENTRY} from './campus-cpg-entry-data-v1.js';
import {terrainHeight} from './terrain-surface.js';

export function centralGarageEntry(campus){
  if(campus.geometryHash!==CPG_ENTRY.geometryHash)return null;
  const {cut:[west,north,east,south],origin:[cx,,cz],fit:{plane:[a,b,c]},stair}=CPG_ENTRY;
  const terrain=(x,z)=>terrainHeight(campus.terrain,x,z);
  const cut=(x,z)=>x>=west&&x<=east&&z>=north&&z<=south;
  const asphalt=(x,z)=>{
    const mix=Math.min(1,Math.max(0,(x-west)/2.5));
    return (1-mix)*terrain(x,z)+mix*(a*(x-cx)+b*(z-cz)+c);
  };
  const front=(x,z)=>cut(x,z)?asphalt(x,z):terrain(x,z);
  const stairAt=(x,z)=>x>=stair.x[0]&&x<=stair.x[1]&&z>=stair.z[0]&&z<=stair.z[1];
  const restricted=(x,z,radius)=>{
    const dx=Math.max(west-x,0,x-east),dz=Math.max(north-z,0,z-south);
    return cut(x,z)||(radius>0&&Math.hypot(dx,dz)<radius);
  };
  function moveBarrier(radius){
    const blocked=(x,z)=>restricted(x,z,radius);
    function overlapsSegment(a,b){
      if(Math.max(a[0],b[0])<west-radius||Math.min(a[0],b[0])>east+radius||
        Math.max(a[2],b[2])<north-radius||Math.min(a[2],b[2])>south+radius)return false;
      const n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[2]-b[2])/.16));
      for(let i=0;i<=n;i++){
        const t=i/n;
        if(blocked(a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t))return true;
      }
      return false;
    }
    return {blocked,overlapsSegment};
  }
  return {...CPG_ENTRY,cutBounds:CPG_ENTRY.renderCut,cut,asphalt,front,stairAt,moveBarrier};
}

function split(polygon,dimension,boundary,sign){
  const inside=[],outside=[];
  for(let i=0;i<polygon.length;i++){
    const p=polygon[i],q=polygon[(i+1)%polygon.length],a=sign*(p[dimension]-boundary),b=sign*(q[dimension]-boundary);
    if(a>=0)inside.push(p);
    if(a<=0)outside.push(p);
    if(a*b<0){
      const f=a/(a-b),point=p.map((v,k)=>v+f*(q[k]-v));
      inside.push(point);
      outside.push(point);
    }
  }
  return [inside,outside];
}

// Retain intersections with the original terrain triangles exactly at the
// edge of the excavation. Adjacent path and campus elevations are shared.
export function cutCentralGarageTerrain(T,geometry,site){
  const position=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
  const vertices=Array.from(position.array),coords=Array.from(uv.array),old=geometry.index.array,index=[];
  const [x0,z0,x1,z1]=site.cutBounds;
  const planes=[[0,x0,1],[0,x1,-1],[2,z0,1],[2,z1,-1]];
  let intersected=0;
  const point=i=>[position.getX(i),position.getY(i),position.getZ(i)];
  for(let k=0;k<old.length;k+=3){
    const ids=[old[k],old[k+1],old[k+2]];
    const xs=ids.map(i=>position.getX(i)),zs=ids.map(i=>position.getZ(i));
    if(Math.min(...xs)>=x1||Math.max(...xs)<=x0||Math.min(...zs)>=z1||Math.max(...zs)<=z0){index.push(...ids);continue;}
    let polygon=ids.map(point);
    for(const [dim,boundary,sign] of planes){
      if(!polygon.length)break;
      const [kept,outer]=split(polygon,dim,boundary,sign);
      for(let j=1;j<outer.length-1;j++){
        const points=[outer[0],outer[j],outer[j+1]];
        const [a,b,c]=points;
        const area=(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
        if(Math.abs(area)<1e-8)continue;
        for(const [x,y,z] of points){
          index.push(vertices.length/3);
          vertices.push(x,y,z);
          coords.push(x/5,z/5);
        }
      }
      polygon=kept;
    }
    intersected++;
  }
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(coords,2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return intersected;
}


