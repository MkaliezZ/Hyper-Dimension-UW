import {KINCAID_SITE as data} from './kin-site-data-v99.js';

const inside=(x,z,ring)=>{
  let result=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[j],b=ring[i];
    if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])result=!result;
  }
  return result;
};
const distance=(x,z,a,b)=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz;
  const t=d?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/d)):0;
  return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
};
const edges=ring=>ring.map((point,i)=>[point,ring[(i+1)%ring.length]]);
const inBounds=(x,z,[x0,z0,x1,z1],padding=0)=>x>=x0-padding&&z>=z0-padding&&x<=x1+padding&&z<=z1+padding;
const rails=data.rails.map(({handrail:[a,b]})=>[[a[0],a[2]],[b[0],b[2]]]);
const perimeter=edges(data.perimeter),bodyEdges=edges(data.body);
const fixtureEdges=edges(data.trailFixtureRing);
const bodyBounds=[...['min','max'].flatMap(tag=>[0,1].map(axis=>Math[tag](...data.body.map(p=>p[axis]))))];
const cell=4,cache=new Map(),keys=(x,z)=>Math.floor(x/cell)+':'+Math.floor(z/cell);
for(const tri of data.pavement){
  const x=tri.map(p=>p[0]),z=tri.map(p=>p[2]);
  for(let i=Math.floor((Math.min(...x)-1e-5)/cell);i<=Math.floor((Math.max(...x)+1e-5)/cell);i++)
    for(let j=Math.floor((Math.min(...z)-1e-5)/cell);j<=Math.floor((Math.max(...z)+1e-5)/cell);j++){
      const key=i+':'+j;
      if(!cache.has(key))cache.set(key,[]);
      cache.get(key).push(tri);
    }
}

export function createKincaidCourtyard(campus,radius){
  if(campus.geometryHash!==data.geometryHash||!campus.buildings.some(b=>b.id===data.id)||
      !campus.buildings.some(b=>b.id===data.neighborId))return null;
  function elevation(x,z){
    if(!inBounds(x,z,data.siteBounds,1e-5))return undefined;
    let result;
    for(const [a,b,c] of cache.get(keys(x,z))||[]){
      const px=x-a[0],pz=z-a[2],bx=b[0]-a[0],bz=b[2]-a[2],cx=c[0]-a[0],cz=c[2]-a[2];
      const d=bx*cz-bz*cx,u=(px*cz-pz*cx)/d,v=(bx*pz-bz*px)/d;
      if(u>=-1e-6&&v>=-1e-6&&u+v<=1+1e-6){
        const value=a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]);
        result=result===undefined?value:Math.max(result,value);
      }
    }
    return result;
  }
  function withinExtension(x,z){
    return Number.isFinite(x)&&Number.isFinite(z)&&inBounds(x,z,data.siteBounds)&&inside(x,z,data.perimeter)&&
      !perimeter.some(([a,b])=>distance(x,z,a,b)<radius)&&elevation(x,z)!==undefined;
  }
  function blocked(x,z){
    if(inBounds(x,z,bodyBounds,radius)&&(inside(x,z,data.body)||bodyEdges.some(([a,b])=>distance(x,z,a,b)<radius)))return true;
    if(!inBounds(x,z,data.siteBounds,radius+.028))return false;
    if(inside(x,z,data.trailFixtureRing)||fixtureEdges.some(([a,b])=>distance(x,z,a,b)<radius))return true;
    return rails.some(([a,b])=>distance(x,z,a,b)<radius+.028)||
      data.guards.some(([a,b])=>distance(x,z,a,b)<radius);
  }
  return {elevation,blocked,withinExtension,buildingId:data.id,pathId:data.originalPathVisualId,
    searchSouth:data.siteBounds[3]};
}
