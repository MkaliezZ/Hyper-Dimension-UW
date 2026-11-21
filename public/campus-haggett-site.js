import {terrainEdgeSamples,terrainHeight,terrainPatchGeometry} from './terrain-surface.js';
import {HAGGETT as site} from './campus-haggett-site-data.js';

function distance(x,z,a,b){
 const dx=b[0]-a[0],dz=b[1]-a[1],dd=dx*dx+dz*dz;
 const t=dd?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/dd)):0;
 return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
}
export function createHaggettSite(campus,radius=0){
 if(campus.geometryHash!==site.geometryHash||!campus.buildings.some(b=>b.id===site.id))return null;
 const ring=site.ring,edges=ring.slice(1).map((b,i)=>[ring[i],b]),[x0,z0,x1,z1]=site.bounds;
 function inside(x,z){
  let seen=false;
  for(const [a,b] of edges)
   if((a[1]>z)!==(b[1]>z)&&x<a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1]))seen=!seen;
  return seen;
 }
 function blocked(x,z){
  if(x<x0-radius||x>x1+radius||z<z0-radius||z>z1+radius)return false;
  return inside(x,z)||edges.some(([a,b])=>distance(x,z,a,b)<radius);
 }
 return {...site,inside,blocked,edges};
}
export function mountHaggettSite(T,campus,context,defined){
 const {scene,grass,disposables,pickables,places}=context,{terrain,edges,id}=defined;
 const group=new T.Group();group.name='Haggett Hall active construction overlay';scene.add(group);
 const xStep=(terrain.bounds[2]-terrain.bounds[0])/(terrain.width-1),zStep=(terrain.bounds[3]-terrain.bounds[1])/(terrain.height-1);
 const v=[],uv=[],ix=[];
 for(let j=0;j<terrain.height;j++)for(let i=0;i<terrain.width;i++){
  const x=terrain.bounds[0]+i*xStep,z=terrain.bounds[1]+j*zStep,k=j*terrain.width+i;
  v.push(x,terrain.heights[k],z);uv.push(x/5,z/5);
  // The existing McMahon patch starts exactly on the fifteenth original ground row.
  if(i&&j&&(z<=campus.terrain.bounds[1]+1e-7||x>campus.terrain.bounds[2]+1e-7&&z<=site.existingEastPatchTop+1e-7)){
   ix.push(k-terrain.width-1,k-1,k-terrain.width,k-terrain.width,k-1,k);
  }
 }
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(ix);geometry.computeVertexNormals();
 const extension=new T.Mesh(geometry,grass);extension.name='Haggett surrounding surveyed terrain';extension.receiveShadow=true;group.add(extension);
 const dirtGeometry=terrainPatchGeometry(T,terrain,defined.ring.slice(0,-1),.026);
 const dirtUV=[],positions=dirtGeometry.getAttribute('position');
 for(let i=0;i<positions.count;i++)dirtUV.push(positions.getX(i)/5,positions.getZ(i)/5);
 dirtGeometry.setAttribute('uv',new T.Float32BufferAttribute(dirtUV,2));
 const dirt=new T.Mesh(dirtGeometry,new T.MeshStandardMaterial({color:'#827666',roughness:.98}));dirt.name='Haggett staged construction ground';dirt.receiveShadow=true;group.add(dirt);
 const steel=new T.MeshStandardMaterial({name:'Construction galvanized rails',color:'#7d807a',roughness:.9});
 const card=document.createElement('canvas');card.width=card.height=128;
 const paint=card.getContext('2d');paint.strokeStyle='#949991';paint.lineWidth=2;
 for(let v=-128;v<256;v+=16){
  paint.beginPath();paint.moveTo(0,v);paint.lineTo(128,v+128);paint.stroke();
  paint.beginPath();paint.moveTo(0,v);paint.lineTo(128,v-128);paint.stroke();
 }
 const tx=new T.CanvasTexture(card);tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;disposables.push(tx);
 const meshFence=new T.MeshStandardMaterial({name:'Construction wire mesh',map:tx,alphaTest:.36,side:T.DoubleSide,roughness:1});
 const fenceVertices=[],fenceUv=[],samples=[],poles=[];
 let span=0;
 for(const [a,b] of edges){
  const edge=terrainEdgeSamples(terrain,a,b);
  for(let i=1;i<edge.length;i++){
   const [x,y,z]=edge[i-1],[dx,dy,dz]=edge[i],n=Math.max(1,Math.ceil(Math.hypot(dx-x,dz-z)/2.5)),
       length=Math.hypot(dx-x,dz-z)/n;
   if(length<.001)continue;
   for(let j=0;j<n;j++){
    const p0=[x+(dx-x)*j/n,y+(dy-y)*j/n,z+(dz-z)*j/n];
    const p1=[x+(dx-x)*(j+1)/n,y+(dy-y)*(j+1)/n,z+(dz-z)*(j+1)/n];
    const a0=[p0[0],p0[1]+.15,p0[2]],a1=[p0[0],p0[1]+1.91,p0[2]],
          b0=[p1[0],p1[1]+.15,p1[2]],b1=[p1[0],p1[1]+1.91,p1[2]];
    fenceVertices.push(...a0,...b0,...a1,...a1,...b0,...b1);
    const [u,w]=[span/1.76,(span+length)/1.76];
    fenceUv.push(u,0,w,0,u,1,u,1,w,0,w,1);span+=length;
    poles.push(p0);
    samples.push([a1,b1]);
   }
  }
 }
 const fenceGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(fenceVertices,3));
 fenceGeo.setAttribute('uv',new T.Float32BufferAttribute(fenceUv,2));fenceGeo.computeVertexNormals();
 const fence=new T.Mesh(fenceGeo,meshFence);fence.name='Haggett temporary chain-link fencing';
 const place=[...places.values()].find(p=>p.buildingId===id);
 fence.userData.surface={kind:'building',id,placeId:place?.id||id};pickables.push(fence);group.add(fence);
 const single=new T.Object3D(),ports=new T.InstancedMesh(new T.BoxGeometry(.053,2.12,.053),steel,poles.length);
 for(const [i,[x,y,z]] of poles.entries()){single.position.set(x,y+.99,z);single.updateMatrix();ports.setMatrixAt(i,single.matrix);}
 ports.name='Haggett galvanized fence posts';group.add(ports);
 const bar=new T.InstancedMesh(new T.BoxGeometry(1,.045,.045),steel,samples.length);
 for(const [i,[a,b]] of samples.entries()){
  const delta=new T.Vector3(...b).sub(new T.Vector3(...a));
  single.position.set(...a.map((v,k)=>(v+b[k])*.5));
  single.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),delta.clone().normalize());
  single.scale.set(delta.length(),1,1);single.updateMatrix();bar.setMatrixAt(i,single.matrix);
 }
 bar.name='Haggett galvanized top rails';group.add(bar);
 return {group,extension,dirt,fence,span,postCount:poles.length};
}

