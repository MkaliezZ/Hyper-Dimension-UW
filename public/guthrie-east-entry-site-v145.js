import {terrainHeight} from './terrain-surface.js';

export function createGuthrieEastApron(campus,survey){
 const {geometryHash,frame,fit,apronPolygon:polygon,campusWalkwayId:pathId}=survey;
 if(campus.geometryHash!==geometryHash||!campus.buildings.some(b=>b.id==='sea-28352-0'))return null;
 const path=campus.paths.find(p=>p.id===pathId);
 if(path?.points.length!==3)return null;
 const {originXZ:[ox,oz],axisXWorldXZ:U,axisZWorldXZ:V}=frame;
 const world=(u,v)=>[ox+U[0]*u+V[0]*v,oz+U[1]*u+V[1]*v];
 const local=(x,z)=>[U[0]*(x-ox)+U[1]*(z-oz),V[0]*(x-ox)+V[1]*(z-oz)];
 const surveyed=(u,v)=>fit.entranceApron.plane[0]*u+fit.entranceApron.plane[1]*v+fit.entranceApron.plane[2];
 const ground=(u,v)=>terrainHeight(campus.terrain,...world(u,v));
 const entry=survey.entry,A=entry.endpoints[0],B=entry.endpoints[1],L=Math.hypot(B[0]-A[0],B[1]-A[1]),T=B.map((v,i)=>(v-A[i])/L);
 const N=entry.outward,toeY=entry.thresholdWorldY-entry.steps*entry.rise;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function entryLocal(u,v){const q=[u-A[0],v-A[1]];return [q[0]*T[0]+q[1]*T[1],q[0]*N[0]+q[1]*N[1]];}
 const heights=(u,v)=>{
  const y=ground(u,v);
  const sideJoin=Math.max(0,Math.min(1,(1.6-v)/.86));
  const transverseWeight=Math.max(0,Math.min(1,(1.62-Math.abs(u-20.16))/.44));
  const [along,depth]=entryLocal(u,v);
  const withinStair=smooth((along-(entry.stairSpan[0]-.13))/.18)*smooth(((entry.stairSpan[1]+.13)-along)/.18);
  const tie=withinStair*(1-smooth(Math.abs(depth-entry.lastTreadOuter)/.88));
  const core=Math.max(surveyed(u,v),y+.021);
  const lowGrade=core+(toeY-core)*tie;
  const t=sideJoin*transverseWeight;
  return lowGrade+(y+.28-lowGrade)*t*t*(3-2*t);
 };
 const stations=polygon.map(p=>p[1]).sort((a,b)=>a-b);
 const edges=polygon.map((p,i)=>[p,polygon[(i+1)%polygon.length]]);
 function extent(v){
  const cuts=edges.flatMap(([[x,y],[b,c]])=>{
   if(v<Math.min(y,c)-1e-8||v>Math.max(y,c)+1e-8)return [];
   return Math.abs(c-y)<1e-8?[x,b]:[x+(b-x)*(v-y)/(c-y)];
  }).sort((a,b)=>a-b);
  return [cuts[0],cuts.at(-1)];
 }
 const step=.12,across=36,rows=[];
 for(let i=1;i<stations.length;i++){
  const a=stations[i-1],b=stations[i],n=Math.ceil((b-a)/step);
  for(let j=0;j<n;j++)rows.push(a+(b-a)*j/n);
 }
 rows.push(stations.at(-1));
 const nodes=rows.map(v=>{
  const [lo,hi]=extent(v);
  return Array.from({length:across+1},(_,i)=>{
   const u=lo+(hi-lo)*i/across,[x,z]=world(u,v);
   return {u,v,body:[x,heights(u,v),z]};
  });
 });
 const cells=[],draw=[],uv=[],skirts=[];
 function drawFace(...t){
  const [a,b,c]=t;
  const area=(b.u-a.u)*(c.v-a.v)-(b.v-a.v)*(c.u-a.u);
  if(Math.abs(area)<1e-9)return;
  const triangle=area>0?t.toReversed():t;
  draw.push(...triangle.map(p=>p.body));
  uv.push(...triangle.map(({u,v})=>[u/2.1,v/2.1]));
  return triangle;
 }
 for(let j=1;j<nodes.length;j++){
  const A=nodes[j-1],B=nodes[j];
  cells.push(Array.from({length:across},(_,i)=>[drawFace(A[i],A[i+1],B[i]),drawFace(A[i+1],B[i+1],B[i])].filter(Boolean)));
  for(const i of [0,across]){
   const a=A[i],b=B[i],under=p=>[p.body[0],ground(p.u,p.v)-.025,p.body[2]];
   skirts.push([a.body,under(a),b.body],[under(a),under(b),b.body]);
  }
 }
 for(const [last,row]of [[false,nodes[0]],[true,nodes.at(-1)]]){
  for(let i=1;i<row.length;i++){
   const a=row[i-1],b=row[i],under=p=>[p.body[0],ground(p.u,p.v)-.027,p.body[2]];
   const low=under(a),high=under(b),tris=[[a.body,low,b.body],[low,high,b.body]];
   skirts.push(...(last?tris.map(t=>t.toReversed()):tris));
  }
 }
 // Retain the public north sidewalk to the exact inner turning point.
 const [start,end]=path.points;
 const ps=local(start[0],start[2]),pe=local(end[0],end[2]);
 const v=.74,u=ps[0]+(pe[0]-ps[0])*(v-ps[1])/(pe[1]-ps[1]),[x,z]=world(u,v);
 const retainedNorth=[start,[x,ground(u,v),z]];
 const segment=[rows[0],rows.at(-1)];
 function height(x,z){
  const [u,v]=local(x,z);
  if(v<segment[0]-1e-6||v>segment[1]+1e-6)return undefined;
  let index=0,hi=rows.length-1;
  while(hi-index>1){
   const k=(hi+index)>>1;
   if(rows[k]<=v)index=k;
   else hi=k;
  }
  const k=Math.max(0,Math.min(1,(v-rows[index])/(rows[index+1]-rows[index])));
  const lo=nodes[index][0].u+(nodes[index+1][0].u-nodes[index][0].u)*k;
  const right=nodes[index][across].u+(nodes[index+1][across].u-nodes[index][across].u)*k;
  if(u<lo-1e-6||u>right+1e-6||right-lo<1e-9)return undefined;
  const i=Math.max(0,Math.min(across-1,Math.floor((u-lo)/(right-lo)*across)));
  for(const [a,b,c] of cells[index][i]){
   const bx=b.u-a.u,bz=b.v-a.v,cx=c.u-a.u,cz=c.v-a.v,x=u-a.u,z=v-a.v;
   const d=bx*cz-bz*cx,s=(x*cz-z*cx)/d,t=(bx*z-bz*x)/d;
   if(Math.min(s,t)>=-1e-6&&s+t<=1+1e-6)return a.body[1]+s*(b.body[1]-a.body[1])+t*(c.body[1]-a.body[1]);
  }
 }
 return {world,local,pathId,entryLocal,retainedNorth,draw,uv,skirts,surveyed,height};
}


const registeredApron={"geometryHash":"e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d","frame":{"originXZ":[-222.42786601619116,250.4949569976308],"runtimeRotationY":-0.011116707584504372,"axisXWorldXZ":[0.999938210042584,0.011116478616598417],"axisZWorldXZ":[-0.011116478616598417,0.999938210042584]},"fit":{"entranceApron":{"plane":[-0.028940598780327932,0.00589009908015381,19.612962419749813]}},"apronPolygon":[[18.94,5.6],[19.02,0.55],[19.657,0.541],[20.64,0.564],[25.86,0.79],[26.55,1.17],[26.72,4.58],[25.87,5.48],[22.3,5.63]],"campusWalkwayId":"uw-35-250-181","entry":{"edge":24,"awning":{"s0":0.13,"s1":4.83,"lo":3.0349999999999984,"hi":3.4999999999999982,"projection":0.61},"label":{"a":0.16,"b":1.1,"low":3.1749999999999985,"high":3.5409999999999986,"front":0.83},"endpoints":[[18.355126227911338,5.6823527481908105],[18.33037086691214,0.6976962962837816]],"outward":[0.9999876680988373,-0.004966251126306134],"stairSpan":[0.42,4.56],"thresholdWorldY":19.65,"landingDepth":1.14,"steps":4,"rise":0.145,"run":0.36,"lastTreadOuter":2.58,"coveredPhotoGlazingSpan":[0.32,4.67]}};
export function campusGuthrieEastApron(campus){return createGuthrieEastApron(campus,registeredApron);}
