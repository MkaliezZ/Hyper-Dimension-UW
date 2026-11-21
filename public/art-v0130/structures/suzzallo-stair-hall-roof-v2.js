import * as T from '/art-v0120/vendor/three/three.module.js';

// Roof-level addition only. The 1925/1935 facade meshes and their atlases remain
// untouched. The octagonal form follows the official CUCAC aerial site plan.
export async function createSuzzalloStairHallRoof(plan,{anisotropy=1}={}){
 const loader=new T.TextureLoader(),[atlas,slate,gravel]=await Promise.all([
  loader.loadAsync('/art-v0120/materials/campus-materials.png'),
  loader.loadAsync('/art-v0130/materials/slate-roof-v1.png'),
  loader.loadAsync('/art-v0130/materials/mineral-flat-roof-v1.png')]);
 const tile=document.createElement('canvas');tile.width=tile.height=1024;
 tile.getContext('2d').drawImage(atlas.image,atlas.image.width/2,0,atlas.image.width/2,atlas.image.height/2,0,0,1024,1024);
 const stone=new T.CanvasTexture(tile);atlas.dispose();
 return buildSuzzalloStairHallRoof(plan,{stoneMap:stone,slateMap:slate,gravelMap:gravel,anisotropy});
}

export function buildSuzzalloStairHallRoof(plan,{stoneMap,slateMap,gravelMap,anisotropy=1}={}){
 const root=new T.Group();root.name='Suzzallo octagonal Grand Stair Hall roof';
 const {terraceRadius,drumRadius,capRadius,baseY,terraceY,eaveY,ridgeY}=plan;
 if(![terraceRadius,drumRadius,capRadius,baseY,terraceY,eaveY,ridgeY].every(v=>Number.isFinite(v)&&v>0)||!(terraceRadius>drumRadius&&drumRadius>capRadius&&baseY<terraceY&&terraceY<eaveY&&eaveY<ridgeY))throw Error('Invalid reviewed stair-hall roof profile');
 for(const t of[stoneMap,slateMap,gravelMap]){t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=anisotropy;}
 const stone=new T.MeshStandardMaterial({name:'Stair hall sandstone',map:stoneMap,color:'#e5d5c1',roughness:.92});
 const roof=new T.MeshStandardMaterial({name:'Stair hall slate',map:slateMap,color:'#ffffff',roughness:.95});
 const terrace=new T.MeshStandardMaterial({name:'Stair hall flat roof',map:gravelMap,color:'#ffffff',roughness:.98});
 const trim=new T.MeshStandardMaterial({name:'Stair hall limestone coping',color:'#d0bfa6',roughness:.9});
 const phase=Math.PI/8+(plan.yaw||0);
 const ring=(r,y)=>Array.from({length:8},(_,i)=>[r*Math.cos(phase+i*Math.PI/4),y,r*Math.sin(phase+i*Math.PI/4)]);
 function shell(name,r0,r1,y0,y1,material,{top=false}={}){
  const lower=ring(r0,y0),upper=ring(r1,y1),positions=[],uv=[];
  const tri=(a,b,c,ua,ub,uc)=>{positions.push(...a,...b,...c);uv.push(...ua,...ub,...uc);};
  for(let i=0;i<8;i++){
   const j=(i+1)%8,a=lower[i],b=lower[j],c=upper[j],d=upper[i],span=Math.hypot(b[0]-a[0],b[2]-a[2]),rise=Math.hypot(y1-y0,r1-r0),tile=material===stone?2.8:3.6;
   // Separate UV frames on each physical roof slope; no diagonal atlas seams.
   tri(a,c,b,[0,0],[span/tile,rise/tile],[span/tile,0]);
   tri(a,d,c,[0,0],[0,rise/tile],[span/tile,rise/tile]);
   if(top)tri([0,y1,0],upper[j],upper[i],[0,0],[upper[j][0]/tile,upper[j][2]/tile],[upper[i][0]/tile,upper[i][2]/tile]);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const m=new T.Mesh(g,material);m.name=name;root.add(m);return m;
 }
 shell('Octagonal low terrace',terraceRadius,terraceRadius,baseY,terraceY,stone);
 const topRing=ring(terraceRadius,terraceY+.015),topPosition=[],topUV=[];
 for(let i=0;i<8;i++)for(const p of [[0,terraceY+.015,0],topRing[(i+1)%8],topRing[i]]){topPosition.push(...p);topUV.push(p[0]/3.6,p[2]/3.6);}
 const tg=new T.BufferGeometry();tg.setAttribute('position',new T.Float32BufferAttribute(topPosition,3));tg.setAttribute('uv',new T.Float32BufferAttribute(topUV,2));tg.computeVertexNormals();
 const top=new T.Mesh(tg,terrace);top.name='Mineral aggregate flat terrace';root.add(top);
 shell('Terrace coping',terraceRadius+.12,terraceRadius+.12,terraceY-.15,terraceY+.1,trim);
 shell('Octagonal masonry drum',drumRadius,drumRadius,terraceY-.15,eaveY,stone);
 shell('Lower drum string course',drumRadius+.1,drumRadius+.1,terraceY+.1,terraceY+.28,trim);
 shell('Roof cornice',drumRadius+.24,drumRadius+.24,eaveY-.24,eaveY,trim);
 shell('Eight hipped slate slopes',drumRadius+.35,capRadius,eaveY,ridgeY,roof,{top:true});
 // Raised ridge flashings make the eight roof planes legible from campus view.
 const low=ring(drumRadius+.35,eaveY),high=ring(capRadius,ridgeY);
 for(let i=0;i<8;i++){
  const a=new T.Vector3(...low[i]),b=new T.Vector3(...high[i]),g=new T.CylinderGeometry(.055,.055,a.distanceTo(b),5),m=new T.Mesh(g,trim);
  m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());m.name='Octagonal roof hip flashing';root.add(m);
 }
 root.position.set(plan.center[0],0,plan.center[1]);
 root.userData={assemblyModule:'suzzallo-stair-hall-roof',scope:'candidate',center:plan.center,ridgeY,source:plan.source,materials:'project-bound sandstone, slate and flat mineral aggregate; physical UVs',geometry:'octagonal low terrace, drum and eight hipped slopes'};
 return root;
}
