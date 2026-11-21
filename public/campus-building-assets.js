// Architectural identity belongs to the building, not a random style selected at runtime.
export const BUILDING_ASSETS={DEN:{asset:'denny-hall-v1',x:-72,z:-243,width:62,depth:29,angle:.778,features:['round corner turrets','three round-arched portals','central cupola','sandstone']},RAI:{asset:'raitt-hall-v1',x:45.8,z:-191.48,width:63,depth:24,angle:-2.34836,features:['projecting entry bay','pale green roof','rectangular mullioned windows','stone framed brick panels']},SAV:{asset:'savery-hall-v1',x:-22,z:-113,width:83,depth:20,angle:.77764,features:['long Gothic window rhythm','triangular end gable','restrained portal','ivy end wall']}};
export function inDetailedBuildingWing(code,x,z){return Boolean(BUILDING_ASSETS[code]);}
export function footprintFrame(ring){
  let best;for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],angle=Math.atan2(b[1]-a[1],b[0]-a[0]),c=Math.cos(angle),s=Math.sin(angle),points=ring.map(([x,z])=>[c*x+s*z,-s*x+c*z]),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),area=(maxX-minX)*(maxZ-minZ);if(!best||area<best.area)best={area,angle,minX,maxX,minZ,maxZ};}
  if(best.maxZ-best.minZ>best.maxX-best.minX){const old=best;best={...old,angle:old.angle+Math.PI/2,minX:old.minZ,maxX:old.maxZ,minZ:-old.maxX,maxZ:-old.minX};}
  const x=(best.minX+best.maxX)/2,z=(best.minZ+best.maxZ)/2,c=Math.cos(best.angle),s=Math.sin(best.angle);
  return {x:c*x-s*z,z:s*x+c*z,width:best.maxX-best.minX,depth:best.maxZ-best.minZ,angle:-best.angle};
}
