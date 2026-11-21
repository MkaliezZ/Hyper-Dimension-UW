// Preserve angular velocity when directions change instead of snapping to a
// new exponential curve at every key or collision response. Radians, Y up.
export function createVisitorFacing(initial=0){
  let angle=initial,velocity=0;
  return {advance(target,seconds){
    let remaining=Math.max(0,Math.min(.1,seconds));
    while(remaining>0){
      const dt=Math.min(remaining,1/120),error=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));
      const acceleration=Math.max(-40,Math.min(40,90*error-18*velocity));
      velocity=Math.max(-5.5,Math.min(5.5,velocity+acceleration*dt));
      angle+=velocity*dt;remaining-=dt;
      if(Math.abs(error)<1e-6&&Math.abs(velocity)<1e-5){angle+=error;velocity=0;}
    }
    return {angle,turn:velocity/5.5};
  }};
}
