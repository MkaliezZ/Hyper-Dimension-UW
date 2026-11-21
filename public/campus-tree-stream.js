// Retain tree slots across camera updates. Only changed slots reach the GPU;
// a tree entering the view must not upload every other tree's matrix again.
export function createTreeSlots(mesh, records) {
  const ids=[], slots=new Map();
  return {sync(next) {
    const wanted=new Set(next), dirty=new Set();let changed=false;
    for(let i=ids.length-1;i>=0;i--)if(!wanted.has(ids[i])) {
      slots.delete(ids[i]);const last=ids.pop();
      if(i<ids.length){ids[i]=last;slots.set(last,i);dirty.add(i);}
      changed=true;
    }
    for(const id of next)if(!slots.has(id)) {
      const slot=ids.length;ids.push(id);slots.set(id,slot);dirty.add(slot);changed=true;
    }
    for(const slot of [...dirty].filter(i=>i<ids.length).sort((a,b)=>a-b)) {
      mesh.setMatrixAt(slot,records[ids[slot]].matrix);
      mesh.instanceMatrix.addUpdateRange(slot*16,16);
    }
    mesh.count=ids.length;
    if(dirty.size&&ids.length)mesh.instanceMatrix.needsUpdate=true;
    return {changed,slotsWritten:[...dirty].filter(i=>i<ids.length).length,count:ids.length};
  }};
}

// Separate entry and exit distances stop a tree oscillating between LODs
// whenever the follow camera eases around a threshold.
export function treeLod(distance, previous=-1) {
  if(previous===0&&distance<116)return 0;
  if(previous===1)return distance<92?0:distance<264?1:2;
  if(previous===2)return distance<92?0:distance<220?1:2;
  return distance<100?0:distance<240?1:2;
}
