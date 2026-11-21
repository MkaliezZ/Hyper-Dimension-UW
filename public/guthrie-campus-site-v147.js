import {campusGuthrieSouthSite} from './guthrie-south-site-v121.js';
import {campusGuthrieEastApron} from './guthrie-east-entry-site-v145.js';

const ENTRY={"edge":24,"awning":{"s0":0.13,"s1":4.83,"lo":3.0349999999999984,"hi":3.4999999999999982,"projection":0.61},"label":{"a":0.16,"b":1.1,"low":3.1749999999999985,"high":3.5409999999999986,"front":0.83},"endpoints":[[18.355126227911338,5.6823527481908105],[18.33037086691214,0.6976962962837816]],"outward":[0.9999876680988373,-0.004966251126306134],"stairSpan":[0.42,4.56],"thresholdWorldY":19.65,"landingDepth":1.14,"steps":4,"rise":0.145,"run":0.36,"lastTreadOuter":2.58,"coveredPhotoGlazingSpan":[0.32,4.67]};
const buildingId='sea-28352-0',memo=new WeakMap();
// Both dynamic site surfaces are built once per campus, including when the
// server and renderer request walking and surface data separately.
export function guthrieCampusSite(campus){
 if(memo.has(campus))return memo.get(campus);
 const east=campusGuthrieEastApron(campus),south=campusGuthrieSouthSite(campus);
 if(!east||!south)return;
 const {landingDepth,run,rise,steps,lastTreadOuter,thresholdWorldY,stairSpan}=ENTRY;
 const [lo,hi]=stairSpan;
 const [a,b]=ENTRY.endpoints,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const t=b.map((v,i)=>(v-a[i])/length),n=ENTRY.outward;
 const at=(s,d)=>east.world(a[0]+s*t[0]+d*n[0],a[1]+s*t[1]+d*n[1]);
 const locate=(x,z)=>east.entryLocal(...east.local(x,z));
 function stair(x,z){
  const [s,d]=locate(x,z);
  if(s<lo||s>hi||d<0||d>lastTreadOuter+1e-8)return;
  const i=Math.max(0,Math.min(steps,Math.ceil((d-landingDepth)/run-1e-8)));
  return thresholdWorldY-rise*i;
 }
 function surface(x,z){
  const tread=stair(x,z);
  if(tread!==undefined)return tread;
  return east.height(x,z)??south.elevation(x,z);
 }
 const arrival=at((lo+hi)/2,.62);
 const blocked=(x,z,radius)=>south.blocked(x,z,radius);
 const result={buildingId,arrival,at,locate,stair,surface,blocked,east,south,entry:ENTRY};
 memo.set(campus,result);
 return result;
}
