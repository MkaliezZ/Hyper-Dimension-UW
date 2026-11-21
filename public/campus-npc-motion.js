// Service-point patrols are deterministic and collision-checked on the server.
// The browser samples the same timeline so labels, hit targets and rigs agree.
export function sampleNpcPatrol(patrol,time){
 const a=patrol.anchor,b=patrol.target;const seconds=Math.max(0,(time-patrol.epoch)/1000),travel=Math.hypot(b[0]-a[0],b[2]-a[2])/patrol.speed;
 if(travel<.01)return {position:[...a],action:'idle',yaw:patrol.facing||0};
 const wait=patrol.wait,cycle=travel*2+wait*2,t=(seconds+patrol.offset)%cycle;let fraction=0,action='idle',reverse=false;
 if(t<wait)fraction=0;else if(t<wait+travel){fraction=(t-wait)/travel;action='walk';}else if(t<2*wait+travel)fraction=1;else{fraction=1-(t-2*wait-travel)/travel;action='walk';reverse=true;}
 return {position:a.map((v,i)=>v+(b[i]-v)*fraction),action,yaw:Math.atan2((b[0]-a[0])*(reverse?-1:1),(b[2]-a[2])*(reverse?-1:1))};
}
export function createNpcPatrol(walking,anchor,index,epoch){
 let target=[...anchor];
 for(const radius of [2.2,1.6,1]){let found=false;for(let i=0;i<16;i++){
  const angle=index*2.4+i*Math.PI/8,x=anchor[0]+Math.cos(angle)*radius,z=anchor[2]+Math.sin(angle)*radius,point=[x,walking.height(x,z),z];
  // A corridor wider than the body, with terrain-height sampling, avoids wall/garden clipping.
  if(!walking.allowed(x,z)||!walking.segmentClear(anchor,point))continue;
  const nx=-Math.sin(angle)*.35,nz=Math.cos(angle)*.35;
  if(![-1,1].every(s=>walking.segmentClear([anchor[0]+nx*s,walking.height(anchor[0]+nx*s,anchor[2]+nz*s),anchor[2]+nz*s],[x+nx*s,walking.height(x+nx*s,z+nz*s),z+nz*s])))continue;
  const slopes=Array.from({length:13},(_,k)=>{const t=k/12,px=anchor[0]+(x-anchor[0])*t,pz=anchor[2]+(z-anchor[2])*t;return Math.abs(walking.height(px,pz)-(anchor[1]+(point[1]-anchor[1])*t));});
  if(Math.max(...slopes)>.12)continue;target=point;found=true;break;
 }if(found)break;}
 return {anchor:[...anchor],target,speed:.6,wait:4+index*.35,offset:index*2.7,epoch,maxRadius:2.2};
}
