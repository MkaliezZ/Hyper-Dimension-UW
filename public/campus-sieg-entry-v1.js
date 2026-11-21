import {forecourtSampler} from './campus-engineering-entry-v1.js';
import {SIEG_THURSTON_APPROACH as plan} from './campus-sieg-entry-data-v1.js';

const cache=new WeakMap();
export function siegThurstonApproach(campus){
  if(campus.geometryHash!==plan.geometryHash||!campus.buildings.some(b=>b.id===plan.id))return;
  if(cache.has(campus))return cache.get(campus);
  const paved=forecourtSampler(plan.surface),soil=forecourtSampler(plan.soil);
  const result={...plan,floor(x,z){return paved(x,z)??soil(x,z);}};
  cache.set(campus,result);
  return result;
}
