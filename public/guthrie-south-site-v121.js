import {terrainHeight} from './terrain-surface.js';

// Shared site geometry in the building's source frame. All rendered triangles
// and foot heights use the same interpolation inside the surveyed corridor.
export function createGuthrieSouthSite(campus,source,frame){
 const pathId='uw-35-249-179';
 if(campus.geometryHash!==source.geometryHash||!campus.buildings.some(b=>b.id===source.id))return null;
 const path=campus.paths.find(p=>p.id===pathId);
 if(!path||path.points.length!==2)return null;
 const [ox,oz]=frame.originXZ,A=frame.axisXWorldXZ,B=frame.axisZWorldXZ;
 const world=(u,v)=>[ox+u*A[0]+v*B[0],oz+u*A[1]+v*B[1]];
 const local=(x,z)=>[(x-ox)*A[0]+(z-oz)*A[1],(x-ox)*B[0]+(z-oz)*B[1]];
 const ends=path.points.map(([x,y,z])=>local(x,z)).sort((a,b)=>a[0]-b[0]);
 const [[lo,v0],[hi,v1]]=ends;
 if(lo>=-20||hi<=30||Math.abs(v1-v0)>2)return null;
 const tangent=(v1-v0)/(hi-lo),oldHalf=1.55/Math.cos(Math.atan(tangent));
 const axis=u=>v0+(u-lo)*tangent;
 const ground=(u,v)=>terrainHeight(campus.terrain,...world(u,v));
 const smooth=(a,b,value)=>{
   const t=Math.max(0,Math.min(1,(value-a)/(b-a)));
   return t*t*(3-2*t);
 };
 const broadening=u=>smooth(-17.6,-14.2,u)*(1-smooth(14.2,17.9,u));
 const bounds=u=>{
  const k=broadening(u),center=axis(u);
  return [center-oldHalf+k*(15.58-center+oldHalf),center+oldHalf+k*(21.6-center-oldHalf)];
 };
 const [gx,gz,g0]=source.pavement.plane;
 function face(u,v){
  const y=ground(u,v)+.28;
  const measured=gx*u+gz*v+g0+smooth(19.2,18.45,v)*source.pavement.coveredOffsetM;
  const localGrade=Math.max(ground(u,v)+.04,measured);
  return y+(localGrade-y)*broadening(u)*smooth(-2,0,u);
 }
 const n=Math.ceil((hi-lo)/.35),across=16,slices=[];
 for(let i=0;i<=n;i++){
  const u=lo+(hi-lo)*i/n,[min,max]=bounds(u);
  slices.push(Array.from({length:across+1},(_,j)=>{
   const v=min+(max-min)*j/across;
   const [x,z]=world(u,v);
   return {u,v,p:[x,face(u,v),z]};
  }));
 }
 const faces=[],uv=[],geometry=[];
 const add=(...points)=>{
  geometry.push(...points.map(row=>row.p));
  uv.push(...points.map(({u,v})=>[u/3,v/3]));
 };
 for(let i=0;i<n;i++)for(let j=0;j<across;j++){
  const a=slices[i][j],b=slices[i+1][j],c=slices[i][j+1],d=slices[i+1][j+1];
  faces.push([[a,c,b],[b,c,d]]);add(a,c,b);add(b,c,d);
 }
 const skirts=[];
 for(let i=0;i<n;i++){
  if(!broadening(slices[i][0].u)&&!broadening(slices[i+1][0].u))continue;
  for(const j of [0,across]){
    const a=slices[i][j],b=slices[i+1][j],groundVertex=point=>[point.p[0],ground(point.u,point.v)-.015,point.p[2]];
    const low=groundVertex(a),next=groundVertex(b);
    const tris=[[a.p,b.p,low],[low,b.p,next]];
    skirts.push(...(j===0?tris:tris.map(t=>t.toReversed())));
  }
 }
 function elevation(x,z){
  const [u,v]=local(x,z);
  if(u<lo-1e-7||u>hi+1e-7)return undefined;
  const st=Math.max(0,Math.min(n-1,Math.floor((u-lo)/(hi-lo)*n)));
  const start=slices[st],end=slices[st+1],portion=(u-start[0].u)/(end[0].u-start[0].u);
  const interpolate=(a,b)=>a+(b-a)*portion;
  const left=interpolate(start[0].v,end[0].v),right=interpolate(start[across].v,end[across].v);
  if(v<left-1e-7||v>right+1e-7)return undefined;
  const j=Math.max(0,Math.min(across-1,Math.floor((v-left)/(right-left)*across))),cell=faces[st*across+j];
  for(const [a,b,c] of cell){
   const r=a.p,s=b.p,t=c.p,dx=x-r[0],dz=z-r[2];
   const ax=s[0]-r[0],az=s[2]-r[2],bx=t[0]-r[0],bz=t[2]-r[2],det=ax*bz-az*bx;
   const p=(dx*bz-dz*bx)/det,q=(ax*dz-az*dx)/det;
   if(p>=-1e-6&&q>=-1e-6&&p+q<=1+1e-6)return r[1]+p*(s[1]-r[1])+q*(t[1]-r[1]);
  }
 }
 const {moduleCenters,shape,designSlotsPerGroup,slotPitch,tubeRadius}=source.racks;
 const stations=moduleCenters.flatMap(center=>Array.from({length:designSlotsPerGroup},
   (_,index)=>center+(index-(designSlotsPerGroup-1)/2)*slotPitch));
 function blocked(x,z,radius){
  const [u,v]=local(x,z);
  if(u<-14.34-radius||u>14.2+radius||v<shape[0]-.32-radius||v>shape[1]+tubeRadius+radius)return false;
  for(const s of stations){
    const dv=Math.max(shape[0]-v,0,v-shape[1]);
    if(Math.hypot(u-s,dv)<tubeRadius+radius)return true;
  }
  return moduleCenters.some(center=>Math.abs(u-center)<designSlotsPerGroup*slotPitch*.5+radius&&v<shape[0]+.07+radius);
 }
 return {pathId,geometry,uv,skirts,elevation,blocked,world,local,bounds,face,
   coordinateRange:[lo,hi],scope:'Local south courtyard and hanging rack collision'};
}


const source={"geometryHash":"e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d","id":"sea-28352-0","pavement":{"plane":[-0.0012576708494799146,-0.025752547431108108,19.48805493596242],"coveredOffsetM":0.050822650754444254},"racks":{"moduleCenters":[-10.5,-3.51,3.48,10.47],"designSlotsPerGroup":10,"slotPitch":0.57,"shape":[15.91,17.14,0.24,1.38],"tubeRadius":0.035,"dimensionsInterpretation":"Rendered as one hanging hoop per rated parking place. Exact quantities of visible hoops, station depths and metal dimensions remain approximate."}};
const frame={"originXZ":[-222.42786601619116,250.4949569976308],"runtimeRotationY":-0.011116707584504372,"axisXWorldXZ":[0.999938210042584,0.011116478616598417],"axisZWorldXZ":[-0.011116478616598417,0.999938210042584]};

export function campusGuthrieSouthSite(campus){return createGuthrieSouthSite(campus,source,frame);}
