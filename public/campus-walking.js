import {siegThurstonApproach} from './campus-sieg-entry-v1.js';
import {chemicalConstructionFor} from './campus-chemical-construction-v2.js';
import {hubWestYard} from './campus-hub-yard-v1.js';
import {createHaggettSite} from './campus-haggett-site.js';
import {fosterSite} from './campus-foster-site-v4.js';
import {engineeringEntry} from './campus-engineering-entry-v1.js';
import {kirstenApproach} from './campus-kirsten-approach-v1.js';
import {bagleySite} from './bag-entry-site-v95.js';
import {physicsPlaza} from './campus-pab-plaza-v57.js';
import {guthrieCampusSite} from './guthrie-campus-site-v147.js';
import {intellectualApproach} from './intellectual-approach-runtime-v53.js';
import {createKincaidCourtyard} from './campus-site-kin-v99.js';
import {createPadelfordBridge} from './campus-site-pdl-bridge-v26.js';
import {createMcmBridgeAccess} from './mcm-west-site-v56.js';
import {sampleGuaApron} from './campus-site-gua-apron.js';
import {terrainHeight} from './terrain-surface.js';
import {RED_BOUNDARY,FOUNTAIN} from './campus-layout.js';
import {explorationBounds} from './campus-bounds.js';
import {RED_SEATING,RED_TOWERS,RED_OBELISK} from './red-square-layout.js';
import {createBuildingAccess} from './campus-building-access.js';
export const WALK_SPEED=7.8;
export const GUIDE_SPEED=23.4;
export const WALK_RADIUS=.38;
const finitePoint=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
export function ringContains(x,z,ring){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
const inBuilding=(x,z,rings)=>ringContains(x,z,rings[0])&&!rings.slice(1).some(r=>ringContains(x,z,r));
function edgeDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],d=dx*dx+dz*dz,t=d?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/d)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
function pointIndex(rows,bounds,cell=24){const bins=new Map();for(const row of rows){const b=bounds(row);for(let x=Math.floor(b[0]/cell);x<=Math.floor(b[2]/cell);x++)for(let z=Math.floor(b[1]/cell);z<=Math.floor(b[3]/cell);z++){const key=x+':'+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(row);}}const empty=[];return (x,z)=>bins.get(Math.floor(x/cell)+':'+Math.floor(z/cell))||empty;}
export function createCampusWalking(campus){
  const engineering=engineeringEntry(campus),kirsten=kirstenApproach(campus),sieg=siegThurstonApproach(campus);
  const foster=fosterSite(campus),haggett=createHaggettSite(campus,WALK_RADIUS),hubYard=hubWestYard(campus);
  const bounds=explorationBounds(campus),intSite=intellectualApproach(campus),gh=guthrieCampusSite(campus);
  const plaza=physicsPlaza(campus),bag=bagleySite(campus);
  const kin=createKincaidCourtyard(campus,WALK_RADIUS);
  const access=createBuildingAccess(campus,WALK_RADIUS);
  const mcm=createMcmBridgeAccess(campus,WALK_RADIUS);
  const pdlBridge=createPadelfordBridge(campus);
  const buildings=campus.buildings.map(b=>({...b,bounds:[Math.min(...b.rings[0].map(p=>p[0]))-WALK_RADIUS,Math.min(...b.rings[0].map(p=>p[1]))-WALK_RADIUS,Math.max(...b.rings[0].map(p=>p[0]))+WALK_RADIUS,Math.max(...b.rings[0].map(p=>p[1]))+WALK_RADIUS]}));
  const chemicalSite=chemicalConstructionFor(campus,WALK_RADIUS);
  const walkingPaths=chemicalSite?campus.paths.flatMap(path=>Object.hasOwn(chemicalSite.paths,path.id)?
    chemicalSite.paths[path.id].map(points=>({...path,points})):[path]):campus.paths;
  const paths=walkingPaths.filter(p=>!bag?.excluded.has(p.id)&&p.id!==foster?.pathId&&!haggett?.closedPathIds.includes(p.id)&&p.id!==kin?.pathId&&p.id!==intSite?.pathId).flatMap(p=>p.points.slice(1).map((b,i)=>({a:[p.points[i][0],p.points[i][2]],b:[b[0],b[2]],width:p.kind==='road'?3.5:1.55,offset:p.kind==='road'?.15:.28})));
  const nearbyBuildings=pointIndex(buildings,b=>b.bounds),nearbyPaths=pointIndex(paths,p=>[Math.min(p.a[0],p.b[0])-p.width,Math.min(p.a[1],p.b[1])-p.width,Math.max(p.a[0],p.b[0])+p.width,Math.max(p.a[1],p.b[1])+p.width]);
  const solidProps=[...RED_TOWERS.map(p=>[p.x,p.z,p.collisionRadius]),[RED_OBELISK.x,RED_OBELISK.z,RED_OBELISK.collisionRadius],...RED_SEATING.map(p=>[p.x,p.z,p.collisionRadius]),
    ...(engineering?.lanterns??[]).map(({position:[x,,z],collisionRadius})=>[x,z,collisionRadius])];
  const withinRectangle=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&x>=bounds[0]+WALK_RADIUS&&z>=bounds[1]+WALK_RADIUS&&x<=bounds[2]-WALK_RADIUS&&z<=bounds[3]-WALK_RADIUS;
  const withinBounds=(x,z)=>withinRectangle(x,z)||kin?.withinExtension(x,z)===true;
  function allowed(x,z){
    if(!withinBounds(x,z)||haggett?.blocked(x,z)||foster?.blocked(x,z,WALK_RADIUS)||bag?.blocked(x,z,WALK_RADIUS)||intSite?.blocked(x,z,WALK_RADIUS)||gh?.blocked(x,z,WALK_RADIUS))return false;
    if(kin?.blocked(x,z)||mcm?.blocked(x,z)||access.blocked(x,z)||pdlBridge?.blocked(x,z,WALK_RADIUS))return false;
    if(Math.hypot(x-FOUNTAIN.x,z-FOUNTAIN.z)<FOUNTAIN.rimRadius+WALK_RADIUS)return false;
    if(solidProps.some(([px,pz,r])=>Math.hypot(x-px,z-pz)<r+WALK_RADIUS))return false;
    for(const b of nearbyBuildings(x,z)){if(x<b.bounds[0]||z<b.bounds[1]||x>b.bounds[2]||z>b.bounds[3])continue;if((intSite&&intSite.buildingId===b.id)||(kin&&kin.buildingId===b.id)||(haggett&&haggett.id===b.id)||access.replacesFootprint(b.id)||access.permits(b.id,x,z)||mcm?.permits(b.id,x,z))continue;if(inBuilding(x,z,b.rings))return false;for(const ring of b.rings)for(let i=0;i<ring.length;i++)if(edgeDistance(x,z,ring[i],ring[(i+1)%ring.length])<WALK_RADIUS)return false;}
    return true;
  }
  function height(x,z){
    const siegGrade=sieg?.floor(x,z);
    if(siegGrade!==undefined)return siegGrade+.055;
    const libraryFloor=engineering?.floor(x,z);
    if(libraryFloor!==undefined)return libraryFloor+.055;
    const tunnelFloor=kirsten?.floor(x,z);
    if(tunnelFloor!==undefined)return tunnelFloor+.055;
   const hubY=hubYard?.floor(x,z);if(hubY!==undefined)return hubY+.055;const fosterY=foster?.floor(x,z);if(fosterY!==undefined)return fosterY+.055;const bagY=bag?.floor(x,z);if(bagY!==undefined)return bagY+.055;const pabY=plaza?.surface(x,z);if(pabY!==undefined)return pabY+.055;const guthrie=gh?.surface(x,z);if(guthrie!==undefined)return guthrie+.055;const intY=intSite?.surface(x,z);if(intY!==undefined)return intY+.055;const kinY=kin?.elevation(x,z);if(kinY!==undefined)return kinY+.055;const bridge=mcm?.elevation(x,z);if(bridge!=null)return bridge+.055;const bridgeY=pdlBridge?.elevation(x,z);if(bridgeY!=null)return bridgeY+.055;let offset=.055;if(ringContains(x,z,RED_BOUNDARY))offset=.57;else if(Math.hypot(x-FOUNTAIN.x,z-FOUNTAIN.z)<FOUNTAIN.promenadeRadius)offset=.47;else for(const p of nearbyPaths(x,z))if(edgeDistance(x,z,p.a,p.b)<=p.width)offset=Math.max(offset,p.offset);const ground=foster?.ground(x,z)??terrainHeight(campus.terrain,x,z);const apron=sampleGuaApron(campus,x,z);
    if(apron)return access.height(x,z,apron.footY,Math.max(ground+.055,apron.footY));
    return access.height(x,z,ground+offset,ground+.055);}
  function segmentClear(a,b){
    if(!finitePoint(a)||!finitePoint(b))return false;
    const length=Math.hypot(b[0]-a[0],b[2]-a[2]),count=Math.max(1,Math.ceil(length/.25));let previous=height(a[0],a[2]);
    for(let i=0;i<=count;i++){const t=i/count,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t;if(!allowed(x,z))return false;const y=height(x,z);if(i&&Math.abs(y-previous)>Math.max(.65,length/count))return false;previous=y;}return true;
  }
  function step(from,direction,durationMs){
    if(!finitePoint(from)||!Array.isArray(direction)||direction.length!==2||!direction.every(Number.isFinite)||!Number.isFinite(durationMs)||durationMs<=0||durationMs>500)throw Error('Invalid walking input');
    const magnitude=Math.hypot(...direction);if(magnitude<.001||magnitude>1.001)throw Error('Walking direction must be normalized');
    const travel=WALK_SPEED*durationMs/1000,count=Math.ceil(travel/.18),dx=direction[0]/magnitude*travel/count,dz=direction[1]/magnitude*travel/count;
    let point=[from[0],height(from[0],from[2]),from[2]],blocked=false,boundaryBlocked=false;const path=[{levelId:'outdoors',point:[...point]}];
    for(let i=0;i<count;i++){
      const choices=[[point[0]+dx,0,point[2]+dz],[point[0]+dx,0,point[2]],[point[0],0,point[2]+dz]].filter(p=>Math.hypot(p[0]-point[0],p[2]-point[2])>.00001);
      if(!withinBounds(point[0]+dx,point[2]+dz))boundaryBlocked=true;
      const next=choices.find(p=>segmentClear(point,p));if(!next){blocked=true;break;}if(next!==choices[0])blocked=true;point=[next[0],height(next[0],next[2]),next[2]];path.push({levelId:'outdoors',point:[...point]});
    }
    const distance=path.slice(1).reduce((n,p,i)=>n+Math.hypot(...p.point.map((v,j)=>v-path[i].point[j])),0);
    return {path,distance,blocked,boundaryBlocked,previewSpeed:distance/(durationMs/1000),durationMs};
  }
  const searchBounds=kin?[bounds[0],bounds[1],bounds[2],Math.max(bounds[3],kin.searchSouth)]:bounds;
  return {allowed,height,segmentClear,step,bounds:searchBounds};
}
