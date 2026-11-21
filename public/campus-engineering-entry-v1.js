import {ENGINEERING_FORECOURT as court} from './campus-engineering-forecourt-data-v1.js';
import {ENGINEERING_ENTRY as plan} from './campus-engineering-entry-data-v1.js';

const cache=new WeakMap();
function heightAt([a,b,c],x,z){
 const [ax,ay,az]=a,dx=b[0]-ax,dz=b[2]-az,ex=c[0]-ax,ez=c[2]-az;
 const determinant=dx*ez-dz*ex;
 const u=((x-ax)*ez-(z-az)*ex)/determinant;
 const v=(dx*(z-az)-dz*(x-ax))/determinant;
 if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)return ay+u*(b[1]-ay)+v*(c[1]-ay);
}
export function forecourtSampler(triangles){
 const bins=new Map(),cell=4;
 for(const tri of triangles){
  const xs=tri.map(p=>p[0]),zs=tri.map(p=>p[2]);
  for(let i=Math.floor(Math.min(...xs)/cell);i<=Math.floor(Math.max(...xs)/cell);i++){
   for(let j=Math.floor(Math.min(...zs)/cell);j<=Math.floor(Math.max(...zs)/cell);j++){
    const key=i+':'+j;
    let bin=bins.get(key);
    if(!bin){bin=[];bins.set(key,bin);}
    bin.push(tri);
   }
  }
 }
 return (x,z)=>{
  const bin=bins.get(Math.floor(x/cell)+':'+Math.floor(z/cell));
  if(!bin)return;
  for(const tri of bin){
   const y=heightAt(tri,x,z);
   if(y!==undefined)return y;
  }
 };
}
// The listed index triples are removed from the existing DEM, then their
// clipped, UV-preserving remnants are rendered with the same material.
export function removeForecourtTerrain(indices,triples){
 const cuts=new Set(triples.map(t=>t.join(':'))),kept=[];let count=0;
 for(let i=0;i<indices.length;i+=3){
  const a=indices[i],b=indices[i+1],c=indices[i+2];
  if(cuts.has(a+':'+b+':'+c))count++;
  else kept.push(a,b,c);
 }
 if(count!==cuts.size)throw Error('Engineering forecourt no longer matches the terrain grid');
 return kept;
}
export function engineeringEntry(campus){
 if(cache.has(campus))return cache.get(campus);
 if(campus.geometryHash!==plan.geometryHash||!campus.buildings.some(b=>b.id===plan.id))return;
 const points=plan.surface.flat(),xs=points.map(p=>p[0]),zs=points.map(p=>p[2]);
 const [x0,x1,z0,z1]=[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];
 const upperFloor=(x,z)=>{
  if(x<x0||x>x1||z<z0||z>z1)return;
  let top;
  for(const tri of plan.surface){
   const height=heightAt(tri,x,z);
   if(height!==undefined)top=top===undefined?height:Math.max(height,top);
  }
  return top;
 };
 const forecourt=court.geometryHash===campus.geometryHash&&court.id===plan.id?court:undefined;
 const forecourtFloor=forecourt?forecourtSampler(forecourt.surface):()=>undefined;
 const floor=(x,z)=>upperFloor(x,z)??forecourtFloor(x,z);
 const value={...plan,floor,upperFloor,forecourtFloor,forecourt};
 cache.set(campus,value);
 return value;
}
export function engineeringEntryGeometry(T,triangles,wall,scale=2.4){
 const points=triangles.flat(),mesh=new T.BufferGeometry();
 mesh.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
 mesh.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([x,y,z])=>wall?[(x+z)/2,y/1.2]:[x/scale,z/scale]),2));
 mesh.computeVertexNormals();
 return mesh;
}

