// Runtime motion is independent of the signed appearance recipe and saved art.
const animations=new WeakMap();
// A complete foot cycle with matched contact velocity. The old cosine swing
// had zero velocity at touch-down, followed immediately by a linear support
// phase: that discontinuity looked like a repeated kick at every footfall.
export function sampleVisitorStep(cycle,length,liftHeight,stance=.58){
  cycle=((cycle%1)+1)%1;
  if(cycle<stance)return {z:length*(1-2*cycle/stance),lift:0,pitch:0};
  const t=(cycle-stance)/(1-stance),t2=t*t,t3=t2*t;
  const tangent=-2*length*(1-stance)/stance;
  return {z:(2*t3-3*t2+1)*-length+(t3-2*t2+t)*tangent+(-2*t3+3*t2)*length+(t3-t2)*tangent,
    lift:Math.sin(t*Math.PI)**2*liftHeight,pitch:-(Math.sin(t*Math.PI)**2)*.18};
}
export function animateCampusVisitor(root,time,action='idle',motion){
  if(!root)return;
  if(!['v10-textured-modular-visitor','v11-textured-modular-visitor','v12-textured-modular-visitor','v13-textured-modular-visitor'].includes(root.userData.assetKind))return root.userData.animate?.(time,action,motion);
  let animate=animations.get(root);if(!animate){animate=createVisitorLocomotion(root);animations.set(root,animate);}
  animate(time,action,motion);
}
export function createVisitorLocomotion(root){
  const {joints,headJoint:head}=root.userData,hips=joints.hips,chest=joints.chest;
  let priorTime,walkWeight=0,waveWeight=0,phase=0,speedBlend=0,turnBlend=0;
  return (time,action='idle',motion)=>{
    const gap=priorTime===undefined?1/60:time-priorTime,dt=Math.max(0,Math.min(.25,gap));priorTime=time;
    const blend=(value,target,rate)=>{const next=value+(target-value)*(1-Math.exp(-dt*rate));return Math.abs(next-target)<1e-7?target:next;};
    const ease=(joint,axis,target)=>{joint.rotation[axis]=blend(joint.rotation[axis],target,16);};
    const walking=action==='walk'||action==='run',speed=Number.isFinite(motion?.speed)?Math.max(0,motion.speed):walking?1.7:0;
    const oldSpeed=speedBlend;speedBlend=blend(speedBlend,speed,12);
    const acceleration=dt?Math.max(-1,Math.min(1,(speedBlend-oldSpeed)/dt/20)):0;
    walkWeight=blend(walkWeight,Number(walking&&speed>.03),walking?8:10);
    waveWeight=blend(waveWeight,Number(action==='wave'),10);
    turnBlend=blend(turnBlend,Math.max(-1,Math.min(1,motion?.turn||0)),8);
    // Actual ground speed drives cadence. Pausing at a wall and turning in
    // place no longer play the same fixed-speed walk as a clear straight run.
    const pace=Math.min(1,speedBlend/7.8),cadence=Math.min(1.85,.95+speedBlend*.115);
    phase+=dt*Math.PI*2*cadence*walkWeight;const stride=Math.sin(phase)*walkWeight;
    // Leave knee flexion available throughout the longer stride. A high hip
    // drove the support leg into its reach clamp and snapped the knee straight.
    hips.position.y=.59+(-.010-.075*pace+Math.cos(phase*2-Math.PI*2*.58)*.009)*walkWeight+Math.sin(time*1.7)*.003*(1-walkWeight);
    hips.position.x=stride*.018;hips.position.z=Math.cos(phase*2)*.009*walkWeight;
    hips.rotation.y=-stride*.055;hips.rotation.z=stride*.022-turnBlend*.025*walkWeight;
    // A small weight transfer, breathing counter-motion and start/stop lean
    // keep the torso and shoulders from riding above the legs as one block.
    chest.rotation.x=(.10*pace+acceleration*.035+Math.sin(phase*2)*.012)*walkWeight;
    chest.rotation.y=stride*.10;chest.rotation.z=-stride*.032-turnBlend*.055*walkWeight;
    head.rotation.y=-chest.rotation.y*.55+turnBlend*.045*walkWeight;
    head.rotation.z=-chest.rotation.z*.75;head.rotation.x=-chest.rotation.x*.6;
    for(const [side,s]of [['left',-1],['right',1]]){
      const step=stride*s,cycle=((phase/(Math.PI*2)+(s===1?.5:0))%1+1)%1,stance=.58;
      const length=.08+.18*pace,{z:footZ,lift,pitch}=sampleVisitorStep(cycle,length,.055+.065*pace,stance);
      // Two-bone IK keeps the support sole level and lets the trailing knee
      // bend to lift the foot, instead of rotating each leg as a rigid pendulum.
      const leg=joints[side+'Leg'],knee=joints[side+'Knee'],foot=joints[side+'Foot'];
      const upper=-knee.position.y,lower=Math.hypot(foot.position.y,foot.position.z),down=hips.position.y+leg.position.y-.065-lift;
      const reach=Math.max(.05,Math.min(upper+lower-.0005,Math.hypot(down,footZ)));
      const bend=Math.PI-Math.acos(Math.max(-1,Math.min(1,(upper*upper+lower*lower-reach*reach)/(2*upper*lower))));
      const hip=-Math.atan2(footZ,down)-Math.acos(Math.max(-1,Math.min(1,(upper*upper+reach*reach-lower*lower)/(2*upper*reach))));
      ease(joints[side+'Arm'],'x',-step*(.32+.28*pace));
      ease(joints[side+'Arm'],'y',-s*.035*walkWeight+step*.035);
      ease(joints[side+'Forearm'],'x',-.16-.38*pace*walkWeight-Math.max(0,step)*(.16+.10*pace));
      ease(joints[side+'Forearm'],'y',s*(.035+.02*Math.cos(phase))*walkWeight);
      if(side==='left')ease(joints[side+'Arm'],'z',s*(.15+.045*walkWeight)+step*.025);
      const shinRestAngle=Math.atan2(foot.position.z,-foot.position.y),kneeAngle=bend+shinRestAngle;
      leg.rotation.x=hip*walkWeight;
      knee.rotation.x=kneeAngle*walkWeight;
      // Keep the support sole flat; flex the ankle only while the foot clears
      // the ground. A permanently locked ankle made the textured shoe march
      // like a rigid block even though the knee was bending.
      foot.rotation.x=(-(hip+kneeAngle)+pitch)*walkWeight;
    }
    const rightArmZ=.15+.045*walkWeight+stride*.025;
    ease(joints.rightArm,'z',rightArmZ+(2.4-rightArmZ)*waveWeight);
    joints.rightForearm.rotation.z=(.24+Math.sin(time*7)*.24)*waveWeight;
    const diagnostics=root.userData.locomotion??={};Object.assign(diagnostics,{phase,weight:walkWeight,speed:speedBlend,cadence,turn:turnBlend});
  };
}
