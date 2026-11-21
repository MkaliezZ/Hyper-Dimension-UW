import {CHEMICAL_CONSTRUCTION as site} from './campus-chemical-construction-data-v1.js';

function distance(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],den=dx*dx+dz*dz;
 const t=den?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/den)):0;
 return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
}

function contains(x,z,edges){
  let result=false;
  for(const [a,b] of edges)
    if((a[1]>z)!==(b[1]>z)&&x<a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1]))result=!result;
  return result;
}

const edgesOf=ring=>ring.map((a,i)=>[a,ring[(i+1)%ring.length]]);

export function chemicalConstructionFor(campus,radius){
 if(campus.geometryHash!==site.geometryHash||!campus.buildings.some(b=>b.id===site.id))return null;
 const ring=site.ring,edges=edgesOf(ring),gravelEdges=edgesOf(site.gravelLane),[x0,z0,x1,z1]=site.body.bounds;
 function inside(x,z){
  if(x<x0||x>x1||z<z0||z>z1)return false;
  return contains(x,z,edges);
 }
 function blocked(x,z){
  return x>=x0-radius&&x<=x1+radius&&z>=z0-radius&&z<=z1+radius&&
    (inside(x,z)||edges.some(([a,b])=>distance(x,z,a,b)<radius));
 }
 function overlapsSegment(a,b){
  if(Math.max(a[0],b[0])<x0-radius||Math.min(a[0],b[0])>x1+radius||
      Math.max(a[2],b[2])<z0-radius||Math.min(a[2],b[2])>z1+radius)return false;
  const n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[2]-b[2])/.16));
  for(let i=0;i<=n;i++){
   const t=i/n;
   if(blocked(a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t))return true;
  }
  return false;
 }
 return {...site,inside,blocked,overlapsSegment,clearedGround:(x,z)=>contains(x,z,gravelEdges)};
}

// Project a stale persisted move onto the new virtual construction state.
// A read never changes storage or the movement revision.
export function resolveChemicalConstructionMove(site,move,now,point,outsidePoint){
 if(!site||!move)return {point,move:move??null};
 const atBarrier=site.blocked(point[0],point[2]);
 if(!atBarrier&&!move.stopped&&move.path?.length>1){
  let remaining=Math.max(0,(now-move.startedAt)/1000)*move.previewSpeed;
  for(let i=1;i<move.path.length;i++){
   const a=move.path[i-1].point,b=move.path[i].point;
   const length=Math.hypot(...a.map((v,j)=>b[j]-v));
   if(remaining>=length){remaining-=length;continue;}
   const start=remaining>0?a.map((v,j)=>v+(b[j]-v)*remaining/length):a;
   if(site.overlapsSegment(start,b))return stopped(point);
   remaining=0;
  }
 }
 return atBarrier?stopped(outsidePoint):{point,move};

 function stopped(at){
  return {point:[...at],move:{...move,path:[{levelId:'outdoors',point:[...at]}],stopped:true,
    startedAt:now,previewSpeed:0,distance:0,toId:undefined}};
 }
}

