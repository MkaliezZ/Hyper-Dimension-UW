import {ringContains} from './campus-walking.js';
export function edgeDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],n=dx*dx+dz*dz,t=n?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/n)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function footprintAllowsPoint(rings,x,z,margin=0){const inside=ringContains(x,z,rings[0])&&!rings.slice(1).some(r=>ringContains(x,z,r));if(inside)return true;return margin>0&&rings.some(r=>r.some((p,i)=>edgeDistance(x,z,p,r[(i+1)%r.length])<=margin));}
export function placementContains(p,x,z,margin=0){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.angle),s=Math.sin(p.angle);return Math.abs(c*dx-s*dz)<=p.width/2+margin&&Math.abs(s*dx+c*dz)<=p.depth/2+margin;}
export function actuallyVisible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
export function pickVisibleBuildingHit(hits){return hits.find(hit=>actuallyVisible(hit.object)&&(!hit.object.userData.campusHiddenPlacement||!placementContains(hit.object.userData.campusHiddenPlacement,hit.point.x,hit.point.z))&&(!hit.object.userData.campusFootprint||footprintAllowsPoint(hit.object.userData.campusFootprint,hit.point.x,hit.point.z,hit.object.userData.footprintMargin||0)));}
export function chooseDetailedBuildings(rows,{max=4,enter=200,leave=245,selectedId=null,enterPixels=280,leavePixels=220}={}){
 const eligible=r=>r.visible&&(Number.isFinite(r.projectedPixels)?r.projectedPixels>=((r.detailed?leavePixels:enterPixels)*(r.id===selectedId ? .65 : 1)):r.distance<(r.detailed?leave:enter));
 const score=r=>Math.sqrt(Math.max(0,r.projectedArea||r.projectedPixels**2||0))*(r.detailed?1.12:1);
 const ordered=rows.filter(eligible).sort((a,b)=>(a.id===selectedId?-1:b.id===selectedId?1:0)||(Number.isFinite(a.projectedPixels)&&Number.isFinite(b.projectedPixels)?score(b)-score(a):0)||a.distance-b.distance||a.id.localeCompare(b.id));
 const chosen=[];let used=0;for(const row of ordered){const cost=Math.max(1,row.cost||1);if(used+cost>max)continue;chosen.push(row.id);used+=cost;}return chosen;
}
// Keep unfinished wings in the production registry without enabling them in a
// shared preview. Completion still requires every requested building to pass.
export function previewBuildingBindings(manifest){return manifest.buildings.filter(b=>['approved-previous','preview-reviewed'].includes(b.availability));}
