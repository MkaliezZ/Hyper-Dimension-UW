// Buildings and vegetation only need a new shadow map when their visible
// geometry or the light anchor changes. Moving actors use soft contact decals.
export function createCampusShadowCache(renderer){
  renderer.shadowMap.autoUpdate=false;
  let key,updates=0,skipped=0,lastMotion=-Infinity,drawnX,drawnZ;
  return {update(anchorX,anchorZ,buildingRevision=0,treeRevision=0,{moving=false,now=0}={}){
    if(moving)lastMotion=now;
    const next=[anchorX,anchorZ,buildingRevision,treeRevision].join(':');
    if(next===key){skipped++;return false;}
    // Keep the light and its cached projection together while walking. Tree
    // culling and 24m camera grid crossings otherwise redraw the whole campus
    // shadow pass during a stride. A 96m escape guard stays inside the 140m
    // shadow camera; all pending geometry changes are drawn after settling.
    if(key!==undefined&&now-lastMotion<180&&Math.hypot(anchorX-drawnX,anchorZ-drawnZ)<96){skipped++;return false;}
    drawnX=anchorX;drawnZ=anchorZ;
    key=next;updates++;renderer.shadowMap.needsUpdate=true;return true;
  },get stats(){return {updates,skipped};}};
}
