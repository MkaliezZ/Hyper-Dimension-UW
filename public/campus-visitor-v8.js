import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {buildVisitorBodyV8} from './campus-avatar-body-v8.js';
import {textureCampusAvatar,preloadAvatarTextures} from './campus-avatar-materials-v8.js';
import {VISITOR_HAIR_FITS,hairFitTransform} from './campus-avatar-hair-v8.js';
import {preloadGarmentsV8,attachGarmentV8} from './campus-avatar-garment-v8.js';
import {preloadBottomsV8,attachBottomV8} from './campus-avatar-bottom-v8.js';
let template,pending,eyeTexture;const hairTemplates=new Map(),hairPending=new Map();
function clearEyeTexture(){
  if(eyeTexture)return eyeTexture;const canvas=document.createElement('canvas');canvas.width=128;canvas.height=160;const c=canvas.getContext('2d');
  c.fillStyle='#fff8ed';c.fillRect(0,0,128,160);
  const gradient=c.createRadialGradient(60,68,4,64,81,65);gradient.addColorStop(0,'#a17c4d');gradient.addColorStop(.65,'#735132');gradient.addColorStop(1,'#392a21');
  c.fillStyle=gradient;c.beginPath();c.ellipse(62,83,43,70,0,0,Math.PI*2);c.fill();c.fillStyle='#201b18';c.beginPath();c.ellipse(62,80,27,54,0,0,Math.PI*2);c.fill();
  c.fillStyle='#fffaf3';c.beginPath();c.ellipse(49,48,11,15,-.2,0,Math.PI*2);c.fill();c.fillStyle='#dbc7a2';c.beginPath();c.ellipse(78,112,4,6,0,0,Math.PI*2);c.fill();
  eyeTexture=new T.CanvasTexture(canvas);eyeTexture.colorSpace=T.SRGBColorSpace;eyeTexture.anisotropy=4;return eyeTexture;
}
export function preloadVisitorV8(recipe){
  const parts=recipe?.parts||{hair:'hair-sidepart',top:'top-varsity',bottom:'bottom-trousers'};
  pending??=new GLTFLoader().loadAsync('/art-v0130/models/visitor-bald-head-v1/model.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Detailed modular head texture unavailable');});template=g.scene;}).catch(e=>{pending=null;throw e;});
  const id=parts.hair.replace('hair-','');if(!VISITOR_HAIR_FITS[id])throw Error('Unknown visitor hairstyle');
  if(!hairPending.has(id))hairPending.set(id,new GLTFLoader().loadAsync('/art-v0130/models/visitor-hair-'+id+'-v1-fit-v2/model.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Detailed hair texture unavailable');});hairTemplates.set(parts.hair,g.scene);}).catch(e=>{hairPending.delete(id);throw e;}));
  return Promise.all([pending,hairPending.get(id),preloadAvatarTextures(),preloadGarmentsV8(parts.top),preloadBottomsV8(parts.bottom)]);
}
function recolor(material,color,isHair){material.color.set('#fff');material.flatShading=false;material.roughness=.93;material.metalness=0;material.roughnessMap=null;material.metalnessMap=null;material.onBeforeCompile=shader=>{shader.uniforms.visitorTint={value:new T.Color(color)};shader.fragmentShader='uniform vec3 visitorTint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nvec3 originalFace=diffuseColor.rgb;float faceLight=dot(originalFace,vec3(.2126,.7152,.0722));\n${isHair?'diffuseColor.rgb=visitorTint*(.38+faceLight*2.2);':'float skinRegion=smoothstep(.015,.085,originalFace.r-originalFace.g)*smoothstep(.025,.09,faceLight);diffuseColor.rgb=mix(originalFace,visitorTint*(.55+faceLight),skinRegion);'}`);};material.customProgramCacheKey=()=>isHair?'visitor-v8-hair-tint':'visitor-v8-face-tint';}
export function buildVisitorV8(recipe,skins){
  if(!template)throw Error('Preload v8 visitor assets before constructing a character');
  const root=buildVisitorBodyV8(T,recipe,skins),head=root.userData.headJoint,hairTemplate=hairTemplates.get(recipe.parts.hair),removed=[...root.userData.faceMeshes,...(hairTemplate?root.userData.hairMeshes:[])];for(const o of removed){o.removeFromParent();o.traverse(m=>m.geometry?.dispose());}
  // The continuous head and standalone wigs avoid face seams and forehead/brow
  // fragments from the rejected AutoSplit experiment. Current v7 remains intact.
  const detailed=new T.Group(),ownedMaterials=[],ownedGeometry=[];detailed.name='v8-detailed-head';head.add(detailed);
  const face=template.clone(true);face.name='v8-continuous-face';face.scale.setScalar(.38);face.position.set(0,-.02,0);face.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material=mesh.material.clone();ownedMaterials.push(mesh.material);mesh.userData.detailFace=true;mesh.castShadow=mesh.receiveShadow=true;mesh.material.normalMap=null;recolor(mesh.material,skins[recipe.skin],false);});detailed.add(face);
  // Clear original eye geometry follows the measured face surface. It covers
  // noisy generated iris highlights while preserving the textured facial model.
  head.updateWorldMatrix(true,true);const ray=new T.Raycaster(),direction=new T.Vector3(0,0,-1).transformDirection(head.matrixWorld);
  function eyePatch(x,y,rx,ry,color,layer,name){
    const positions=[],uvs=[],vertices=[],indices=[],segments=32,rings=6;
    const point=(px,py)=>{const origin=head.localToWorld(new T.Vector3(px,py,1));ray.set(origin,direction);const hit=ray.intersectObject(face,true)[0];if(!hit)throw Error('Visitor face surface missing under eye');const local=head.worldToLocal(hit.point.clone());return [px,py,local.z+.016];};
    vertices.push(point(x,y));
    for(let j=1;j<=rings;j++)for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2;vertices.push(point(x+Math.cos(a)*rx*j/rings,y+Math.sin(a)*ry*j/rings));}
    for(let i=0;i<segments;i++)indices.push(0,1+i,1+(i+1)%segments);
    for(let j=1;j<rings;j++)for(let i=0;i<segments;i++){const a=1+(j-1)*segments+i,b=1+(j-1)*segments+(i+1)%segments,c=1+j*segments+i,d=1+j*segments+(i+1)%segments;indices.push(a,c,b,b,c,d);}
    for(const i of indices){positions.push(...vertices[i]);uvs.push((vertices[i][0]-x)/rx*.5+.5,(vertices[i][1]-y)/ry*.5+.5);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();const m=new T.MeshBasicMaterial({map:clearEyeTexture()}),mesh=new T.Mesh(g,m);mesh.name=name;mesh.userData.detailFace=true;detailed.add(mesh);ownedGeometry.push(g);ownedMaterials.push(m);
  }
  for(const side of [-1,1])eyePatch(side*.115,.003,.070,.085,null,0,'v8-clear-eye');
  if(hairTemplate){const mesh=hairTemplate.clone(true),box=new T.Box3().setFromObject(mesh),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),fit=hairFitTransform(recipe.parts.hair.replace('hair-',''),box),scale=fit.scale;mesh.traverse(m=>{if(!m.isMesh)return;m.material=m.material.clone();ownedMaterials.push(m.material);m.userData.detailFace=true;m.castShadow=m.receiveShadow=true;recolor(m.material,recipe.colors.hair,true);});mesh.scale.setScalar(scale);mesh.position.set(...fit.offset);detailed.add(mesh);}
  root.userData.assetKind='v8-textured-modular-visitor';root.userData.assetPath='/art-v0130/models/visitor-bald-head-v1/model.glb';root.userData.partsImplementation={face:'Meshy continuous textured head with original clear surface-fitted eyes',hair:hairTemplate?'Meshy standalone textured wig':'original fitted parametric part',garments:'original rounded jointed geometry and fabric textures'};
  const garment=attachGarmentV8(root,recipe),lower=attachBottomV8(root,recipe);if(garment)root.userData.partsImplementation.garments='Meshy textured garments with existing shoulder/elbow and thigh/knee action joints';root.userData.garmentAsset=garment?.asset||null;root.userData.bottomAsset=lower?.asset||null;root.userData.materialReady=textureCampusAvatar(root,recipe);const dispose=root.userData.dispose;root.userData.dispose=()=>{garment?.dispose();lower?.dispose();detailed.removeFromParent();ownedGeometry.forEach(g=>g.dispose());ownedMaterials.forEach(m=>m.dispose());dispose();};return root;
}

