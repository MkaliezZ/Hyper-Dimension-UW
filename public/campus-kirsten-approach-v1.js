import {KIRSTEN_APPROACH as plan} from './campus-kirsten-approach-data-v1.js';
import {forecourtSampler} from './campus-engineering-entry-v1.js';

const cache=new WeakMap();
export function kirstenApproach(campus){
  if(campus.geometryHash!==plan.geometryHash||!campus.buildings.some(building=>building.id===plan.id))return;
  if(cache.has(campus))return cache.get(campus);
  const c=Math.cos(plan.placement.angle),s=Math.sin(plan.placement.angle);
  const removeSkirt=(id,x,z)=>{
    if(id!==plan.id)return false;
    const dx=x-plan.placement.x,dz=z-plan.placement.z;
    const u=c*dx-s*dz,v=s*dx+c*dz;
    return u>=-18.75&&u<=3.45&&Math.abs(v-18.332)<.006;
  };
  const site={...plan,floor:forecourtSampler(plan.surface),removeSkirt};
  cache.set(campus,site);
  return site;
}
