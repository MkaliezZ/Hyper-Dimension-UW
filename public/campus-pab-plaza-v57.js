import {PAB_PAVING} from './campus-pab-paving-data-v53.js';

const cache=new WeakMap();
const cell=5;
const key=(x,z)=>Math.floor(x/cell)+':'+Math.floor(z/cell);
export function physicsPlaza(campus){
 if(cache.has(campus))return cache.get(campus);
 const {frame,building,measured,legacy,paths,albedo}=PAB_PAVING;
 if(frame!==campus.geometryHash||!campus.buildings.some(b=>b.id===building))return;
 const bins=new Map();
 for(const tri of measured){
  const xs=tri.map(p=>p[0]),zs=tri.map(p=>p[2]);
  for(let i=Math.floor(Math.min(...xs)/cell);i<=Math.floor(Math.max(...xs)/cell);i++){
   for(let j=Math.floor(Math.min(...zs)/cell);j<=Math.floor(Math.max(...zs)/cell);j++){
    const id=i+':'+j;
    if(!bins.has(id))bins.set(id,[]);
    bins.get(id).push(tri);
   }
  }
 }
 function surface(x,z){
  for(const [a,b,c] of bins.get(key(x,z))||[]){
   const bx=b[0]-a[0],bz=b[2]-a[2],cx=c[0]-a[0],cz=c[2]-a[2],u=x-a[0],v=z-a[2];
   const det=bx*cz-bz*cx,p=(u*cz-v*cx)/det,q=(bx*v-bz*u)/det;
   if(p>=-1e-7&&q>=-1e-7&&p+q<=1+1e-7)return a[1]+p*(b[1]-a[1])+q*(c[1]-a[1]);
  }
 }
 const site={building,arrival:[-222.95,306.3],measured,retainedSidewalks:legacy,replacedPathIds:new Set(paths),albedo,surface};
 cache.set(campus,site);
 return site;
}
export function physicsPlazaGeometry(T,triangles){
 const positions=triangles.flat(),geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions.flat(),3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(positions.flatMap(([x,,z])=>[x/3,z/3]),2));
 geometry.computeVertexNormals();
 return geometry;
}
