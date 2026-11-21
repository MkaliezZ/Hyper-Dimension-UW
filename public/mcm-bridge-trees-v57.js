import {MCM_WEST,mcmLocal,mcmWorld} from './mcm-west-site-v56.js';

const volumes=MCM_WEST.bridgeParts.map(b=>({
  u0:b.deck[0]-.17,u1:b.deck[2]+.09,
  lo:Math.min(b.deck[1],b.canopy[1])-.008,hi:Math.max(b.deck[3],b.canopy[3])+.008,
  y0:b.approachY-.12,y1:b.roofY+.82,
}));
export function mcmCrownPlan(row,form,grade){
  const [u,v]=mcmLocal(row.x,row.z);
  if(u< -34||u> -5||Math.abs(v)>18)return null;
  const width=row.crownWidth*Math.hypot(form.widthFactor,form.depthFactor)*.52;
  const affected=volumes.filter(b=>u+width>b.u0&&u-width<b.u1
    &&v+width>b.lo&&v-width<b.hi&&grade-.12+row.height*form.heightFactor>b.y0&&grade-.12<b.y1);
  if(!affected.length)return null;
  let low=-Infinity,high=Infinity;
  for(const b of affected){
    if(v<=b.lo)high=Math.min(high,b.lo);
    else if(v>=b.hi)low=Math.max(low,b.hi);
    else throw Error('Public GIS trunk coincides with bridge: '+row.id);
  }
  return {id:row.id,origin:[row.x,row.z],pivotV:v,low,high};
}
function trim(value,pivot,limit,farthest,sign){
  if(!Number.isFinite(limit)||sign*(farthest-limit)<0)return value;
  const available=sign*(limit-pivot);
  const start=Math.min(.72,available*.40);
  const offset=sign*(value-pivot);
  if(offset<=start)return value;
  const extent=sign*(farthest-pivot),atBoundary=Math.max(start,available-.004);
  const progress=(offset-start)/(extent-start);
  return pivot+sign*(start+(atBoundary-start)*(1-Math.pow(1-progress,1.27)));
}
export function fitMcmCrown(T,geometry,matrix,plan){
  const field=geometry.attributes.position,p=new T.Vector3();
  const coords=[];
  let vMin=Infinity,vMax=-Infinity;
  for(let i=0;i<field.count;i++){
    p.fromBufferAttribute(field,i).applyMatrix4(matrix);
    const [u,v]=mcmLocal(p.x,p.z);
    coords.push([u,p.y,v]);
    vMin=Math.min(vMin,v);vMax=Math.max(vMax,v);
  }
  let modified=0;
  const inverse=matrix.clone().invert();
  for(const [i,[u,y,v]] of coords.entries()){
    const next=trim(trim(v,plan.pivotV,plan.low,vMin,-1),plan.pivotV,plan.high,vMax,1);
    if(next===v)continue;
    const [x,z]=mcmWorld(u,next);
    p.set(x,y,z).applyMatrix4(inverse);field.setXYZ(i,p.x,p.y,p.z);
    modified++;
  }
  if(modified){
    field.needsUpdate=true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
  }
  return modified;
}
export {volumes as mcmProtectedVolumes};
