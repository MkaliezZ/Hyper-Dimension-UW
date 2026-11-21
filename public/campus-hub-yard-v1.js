import {HUB_YARD} from './campus-hub-yard-data-v1.js';
import {terrainHeight,terrainEdgeSamples} from './terrain-surface.js';

const {frame,runs,clippedInheritedPaths}=HUB_YARD;
const cosine=Math.cos(frame.angle),sine=Math.sin(frame.angle);
const toWorld=([u,v])=>[frame.x+u*cosine+v*sine,frame.z-u*sine+v*cosine];
const toLocal=(x,z)=>[cosine*(x-frame.x)-sine*(z-frame.z),sine*(x-frame.x)+cosine*(z-frame.z)];
const yAt=(run,u,v)=>{
 const [a,b,c]=run.yPlane,[x,z]=run.planeOrigin;
 return a*(u-x)+b*(v-z)+c;
};
function inside(x,z,ring){
 const [a,b]=ring[0],[c,d]=ring[2];
 return a<=x&&x<=c&&b<=z&&z<=d;
}
export function hubWestYard(campus){
 if(campus.geometryHash!==HUB_YARD.geometryHash)return null;
 const floor=(x,z)=>{
  const [u,v]=toLocal(x,z),run=runs.find(r=>inside(u,v,r.ring));
  if(!run)return undefined;
  return yAt(run,u,v);
 };
 return {runs,clippedInheritedPaths,arrival:toWorld(HUB_YARD.entryStop),floor};
}

export function brickMaterial(T,disposables){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const draw=canvas.getContext('2d');
 draw.fillStyle='#a18b7a';draw.fillRect(0,0,512,512);
 for(let row=0;row<16;row++){
  for(let col=-1;col<8;col++){
   const x=col*64+row%2*32,y=row*32,shift=(col*3+row*7+32)%18;
   draw.fillStyle='rgb('+[151+shift,99+shift,75+shift].join(',')+')';
   draw.fillRect(x+1,y+1,62,30);
   draw.fillStyle='rgba(45,31,13,.14)';
   draw.fillRect(x+1,y+29,62,2);
  }
 }
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 texture.wrapS=texture.wrapT=T.RepeatWrapping;
 texture.anisotropy=8;
 disposables.push(texture);
 return new T.MeshStandardMaterial({map:texture,roughness:.95});
}
export function addHubWestYard(T,campus,yard,{paving,mesh,disposables}){
 const brick=brickMaterial(T,disposables),edgeMaterial=new T.MeshStandardMaterial({color:'#8f816e',roughness:.98});
 for(const run of yard.runs){
  const surfaceMaterial=run.material==='brick'?brick:paving;
  const verts=[],uv=[],edgeVerts=[];
  const rim=run.ring.map(toWorld);
  // Keep the fitted continuous walking surface and close the grade beneath it.
  for(const i of [0,2,1,0,3,2]){
   const [u,v]=run.ring[i],[x,z]=rim[i];
   verts.push(x,yAt(run,u,v),z);uv.push(u/1.92,v/1.12);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  const pavement=mesh(geo,surfaceMaterial);
  pavement.name='HUB Yard '+run.id;
  pavement.castShadow=false;
  for(const [i,a] of rim.entries()){
   const b=rim[(i+1)%rim.length],profile=terrainEdgeSamples(campus.terrain,a,b);
   for(let j=1;j<profile.length;j++){
    const [x,g,z]=profile[j-1],[xx,gg,zz]=profile[j];
    const lo=g-.024,h=yAt(run,...toLocal(x,z)),lp=gg-.024,hh=yAt(run,...toLocal(xx,zz));
    edgeVerts.push(x,lo,z,xx,lp,zz,x,h,z,xx,lp,zz,xx,hh,zz,x,h,z);
   }
  }
  const skirt=new T.BufferGeometry();
  skirt.setAttribute('position',new T.Float32BufferAttribute(edgeVerts,3));skirt.computeVertexNormals();
  const piece=mesh(skirt,edgeMaterial);piece.name=pavement.name+' grade edge';piece.castShadow=false;
 }
}

