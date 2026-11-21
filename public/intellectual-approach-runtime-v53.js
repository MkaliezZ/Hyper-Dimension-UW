import {INTELLECTUAL_HOUSE_SITE as site} from './intellectual-approach-data-v53.js';
const {geometryHash,buildingId,worldRing,start,end,outward,length,level,landingDepth,mesh}=site;
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(x,hi));
const cross=(ax,az,bx,bz)=>ax*bz-az*bx;
const tangent=[(end[0]-start[0])/length,(end[1]-start[1])/length];
const bounds=points=>[
 Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),
 Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))
];
const within=(b,x,z,r)=>x>=b[0]-r&&x<=b[2]+r&&z>=b[1]-r&&z<=b[3]+r;
const bodyBounds=bounds(worldRing),patchBounds=bounds(site.apron),triangles=[];
for(let i=0;i<mesh.top.position.length;i+=9){
 const [x,y,z,bx,by,bz,cx,cy,cz]=mesh.top.position.slice(i,i+9);
 const ux=bx-x,uz=bz-z,vx=cx-x,vz=cz-z;
 triangles.push({x,y,z,ux,uz,vx,vz,uy:by-y,vy:cy-y,den:cross(ux,uz,vx,vz),bounds:bounds([[x,z],[bx,bz],[cx,cz]])});
}
function entranceXY(station,depth){
 return start.map((value,i)=>value+station*tangent[i]+depth*outward[i]);
}
function entranceLocal(x,z){
 const a=x-start[0],b=z-start[1];
 return [a*tangent[0]+b*tangent[1],a*outward[0]+b*outward[1]];
}
function surface(x,z){
 const [s,d]=entranceLocal(x,z);
 if(s>=-1e-7&&s<=length+1e-7&&d>=-1e-7&&d<=landingDepth+1e-7)return level;
 if(!within(patchBounds,x,z,.000025))return;
 for(const t of triangles){
  if(!within(t.bounds,x,z,.000025))continue;
  const u=cross(x-t.x,z-t.z,t.vx,t.vz)/t.den,v=cross(t.ux,t.uz,x-t.x,z-t.z)/t.den;
  if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)return t.y+u*t.uy+v*t.vy;
 }
}
function blocked(x,z,radius){
 if(!within(bodyBounds,x,z,radius))return false;
 let inside=false;
 for(let i=0,j=worldRing.length-1;i<worldRing.length;j=i++){
  const [ax,az]=worldRing[i],[bx,bz]=worldRing[j],dx=bx-ax,dz=bz-az;
  const f=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
  if((x-ax-dx*f)**2+(z-az-dz*f)**2<radius**2)return true;
  if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
 }
 return inside;
}
const approach={...site,entranceXY,entranceLocal,surface,blocked};
export function intellectualApproach(campus){
 if(campus.geometryHash===geometryHash&&campus.buildings.some(b=>b.id===buildingId))return approach;
}
export function intellectualApproachGeometry(T,approach,type){
 const {position,uv}=approach.mesh[type],g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(position,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 return g;
}

