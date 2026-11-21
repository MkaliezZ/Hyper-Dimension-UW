export function presentationGroundSpeed(before,after,elapsedSeconds){
  return elapsedSeconds>0?Math.hypot(after[0]-before[0],after[2]-before[2])/elapsedSeconds:0;
}
export function motionPoint(move,now){
  if(!move?.path?.length)return null;let remaining=Math.max(0,now-move.startedAt)/1000*move.previewSpeed;
  for(let i=1;i<move.path.length;i++){const a=move.path[i-1].point,b=move.path[i].point,length=Math.hypot(...a.map((v,k)=>b[k]-v));if(remaining<length){const t=length?remaining/length:1;return a.map((v,k)=>v+(b[k]-v)*t);}remaining-=length;}
  return [...move.path.at(-1).point];
}

// Rendering prediction only: the backend continues to own durable position and collisions.
export function createWalkPresentation(walking,initial){
  // Keep the collision simulation separate from the visible reconciliation
  // offset. Feeding each correction back into the next prediction used to
  // accelerate/decelerate the avatar again at every HTTP receipt.
  let point=[...initial],simulation=[...initial],offset=[0,0,0],correctionVelocity=[0,0,0],lastAck=0,lastAdvance=0,active=false,hadInput=false,lastDirection=null;
  return {reset(position,now){point=[...position];simulation=[...position];offset=[0,0,0];correctionVelocity=[0,0,0];lastAck=lastAdvance=now;active=true;hadInput=false;lastDirection=null;},
    acknowledge(position,now){if(!position)return;if(active)this.advance(lastDirection,0,now);simulation=[...position];offset=point.map((v,i)=>v-position[i]);lastAck=now;active=true;},
    advance(direction,deltaMs,now){
      if(!active)return [...point];
      // Rendering may miss a frame while the GPU uploads an asset. Use the
      // monotonic input clock, rather than discarding everything beyond the
      // renderer's 50 ms animation clamp. Collision sweeps still visit every
      // 18 cm and disconnected prediction still expires after exactly 500 ms.
      const dt=Math.max(0,now-lastAdvance);lastAdvance=Math.max(lastAdvance,now);
      if(hadInput&&!direction){simulation=[...point];offset=[0,0,0];correctionVelocity=[0,0,0];}hadInput=Boolean(direction);lastDirection=direction?[...direction]:null;
      const predictionMs=Math.max(0,Math.min(dt,500,500-(now-dt-lastAck)));
      if(direction&&predictionMs>0)simulation=walking.step(simulation,direction,predictionMs).path.at(-1).point;
      // Retain the correction velocity across receipts. A first-order position
      // lerp changes visible velocity at every HTTP reply, even at a steady fps.
      const seconds=dt/1000,omega=13,decay=Math.exp(-omega*seconds);
      for(const axis of [0,2]){const x=offset[axis],v=correctionVelocity[axis],c=v+omega*x;offset[axis]=(x+c*seconds)*decay;correctionVelocity[axis]=(v-omega*c*seconds)*decay;}
      if(Math.hypot(offset[0],offset[2],correctionVelocity[0],correctionVelocity[2])<.000001){offset=[0,0,0];correctionVelocity=[0,0,0];}
      const next=[simulation[0]+offset[0],point[1],simulation[2]+offset[2]];
      if(walking.segmentClear(point,next)){point=next;point[1]=walking.height(point[0],point[2]);}
      else {simulation=[...point];offset=[0,0,0];correctionVelocity=[0,0,0];}
      return [...point];
    },get waiting(){return active;}};
}
