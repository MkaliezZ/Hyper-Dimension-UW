import {PDL_BRIDGE} from './pdl-bridge-data-v26.js';

const bridge=PDL_BRIDGE;
const crownId='uw-tree-3997605';
function lateral(x,z){
  return (x-bridge.origin[0])*bridge.basisV[0]+(z-bridge.origin[1])*bridge.basisV[1];
}
export function pdlCrownPlan(row){
  if(row.id!==crownId)return null;
  const [slope,offset]=bridge.railCohorts.north.centreW;
  const edge=Math.min(slope*bridge.railStart+offset,slope*bridge.railEnd+offset);
  return {
    id:row.id,origin:[row.x,row.z],pivot:lateral(row.x,row.z),
    limit:edge-bridge.railHalfWidth-.065,
  };
}
export function fitPdlMapleCrown(T,geometry,matrix,plan){
  const field=geometry.attributes.position,point=new T.Vector3();
  const local=Array.from({length:field.count},(_,i)=>{
    point.fromBufferAttribute(field,i).applyMatrix4(matrix);
    return lateral(point.x,point.z);
  });
  const far=Math.max(...local);
  if(far<=plan.limit)return 0;
  const trimStart=plan.pivot+.47, inverse=matrix.clone().invert();
  if(!(trimStart<plan.limit))throw Error('Maple trunk is too close to a bridge clearance boundary');
  let changed=0;
  for(const [i,w] of local.entries()){
    if(w<=trimStart)continue;
    const alpha=(w-trimStart)/(far-trimStart);
    const delta=trimStart+(plan.limit-trimStart)*(1-(1-alpha)**1.18)-w;
    point.fromBufferAttribute(field,i).applyMatrix4(matrix);
    point.x+=bridge.basisV[0]*delta;point.z+=bridge.basisV[1]*delta;
    point.applyMatrix4(inverse);
    field.setXYZ(i,point.x,point.y,point.z);
    changed++;
  }
  if(changed){
    field.needsUpdate=true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
  }
  return changed;
}
