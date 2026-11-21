import {BAGLEY_SITE as plan} from './bag-entry-floor-data-v95.js';
const cache=new WeakMap();
export function bagleySite(campus){
 if(cache.has(campus))return cache.get(campus);
 if(campus.geometryHash!==plan.frame||!campus.buildings.some(b=>b.id===plan.identity))return;
 const [u,v]=plan.axes,[a,b]=plan.origin;
 const fromLocal=(s,d)=>[a+u[0]*s+v[0]*d,b+u[1]*s+v[1]*d];
 const toLocal=(x,z)=>[u[0]*(x-a)+u[1]*(z-b),v[0]*(x-a)+v[1]*(z-b)];
 const {landingSpan,stairSpan,rightLandingSpan,rightLandingOuter,levels,edges}=plan.thresholds;
 const published=Object.freeze([plan.excludedPath]);
 function floor(x,z){
  const [s,d]=toLocal(x,z);
  if(d>=-.00001&&d<=edges[0]&&s>=landingSpan[0]&&s<=landingSpan[1])return levels[0];
  if(d>=edges[0]&&d<=rightLandingOuter&&s>=rightLandingSpan[0]+.012&&s<=rightLandingSpan[1])return levels[0];
  if(d>=edges[0]&&d<edges.at(-1)&&s>=stairSpan[0]&&s<=stairSpan[1]){
   const index=edges.findIndex(t=>d<t);
   return levels[index];
  }
  if(d<=4||d>=9||s<5.5||s>19.8)return undefined;
  for(const [a,b,c]of plan.triangles){
   const bx=b[0]-a[0],bz=b[2]-a[2],cx=c[0]-a[0],cz=c[2]-a[2],u=x-a[0],v=z-a[2];
   const det=bx*cz-bz*cx,p=(u*cz-v*cx)/det,q=(bx*v-bz*u)/det;
   if(p>=-2e-7&&q>=-2e-7&&p+q<=1+2e-7)return a[1]+p*(b[1]-a[1])+q*(c[1]-a[1]);
  }
 }
 function blocked(x,z,radius){
  const [s,d]=toLocal(x,z);
  // The renderer has no indoor passage here. Keep the visitor outside the
  // reference-backed stone piers and the side landing's raised outer edge.
  if(s>7.46-radius&&s<17.54+radius&&d>0&&d<.67+radius)return true;
  return s>18.2&&s<21.7&&Math.abs(d-rightLandingOuter)<radius;
 }
 const clipRenderPaths=new Set(plan.clipRenderPaths);
 const value={id:plan.identity,excluded:new Set(published),clipRenderPaths,fromLocal,toLocal,floor,blocked,
  apron:plan.triangles,retained:plan.retained,arrival:fromLocal(...plan.arrivalLocal)};
 cache.set(campus,value);
 return value;
}
export function bagleyPavingGeometry(T,triangles){
 const points=triangles.flat(),geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
 geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([x,,z])=>[x/3,z/3]),2));
 geo.computeVertexNormals();
 return geo;
}
