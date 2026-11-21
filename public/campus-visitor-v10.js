import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {buildVisitorBodyV10 as buildVisitorBodyV8} from './campus-avatar-body-v10.js';
import {textureCampusAvatar,preloadAvatarTextures} from './campus-avatar-materials-v8.js';
import {VISITOR_HAIR_FITS,hairFitTransform} from './campus-avatar-hair-v8.js';
import {preloadGarmentsV8,attachGarmentV8} from './campus-avatar-garment-v8.js';
import {preloadBottomsV8,attachBottomV8} from './campus-avatar-bottom-v8.js';
let template,pending;const anatomy=new Map();let anatomyPending;const hairTemplates=new Map(),hairPending=new Map();
export function preloadVisitorV10(recipe){
  const parts=recipe?.parts||{hair:'hair-sidepart',top:'top-varsity',bottom:'bottom-trousers'};
  pending??=new GLTFLoader().loadAsync('/art-v0130/models/visitor-npc-quality-head-v2/model.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Detailed modular head texture unavailable');});template=g.scene;}).catch(e=>{pending=null;throw e;});
  const id=parts.hair.replace('hair-','');if(!VISITOR_HAIR_FITS[id])throw Error('Unknown visitor hairstyle');
  if(!hairPending.has(id))hairPending.set(id,new GLTFLoader().loadAsync('/art-v0130/models/visitor-hair-'+id+'-v1-fit-v2/model.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Detailed hair texture unavailable');});hairTemplates.set(parts.hair,g.scene);}).catch(e=>{hairPending.delete(id);throw e;}));
  anatomyPending??=Promise.all(['hand','shoe','hair-root'].map(async kind=>{const g=await new GLTFLoader().loadAsync('/art-v0130/models/visitor-'+kind+(kind==='hair-root'?'-v10':'-v9')+'/model.glb');anatomy.set(kind,g.scene);}));
  return Promise.all([anatomyPending,pending,hairPending.get(id),preloadAvatarTextures(),preloadGarmentsV8(parts.top),preloadBottomsV8(parts.bottom)]);
}
function recolor(material,color,isHair){material.color.set('#fff');material.flatShading=false;material.roughness=.93;material.metalness=0;material.roughnessMap=null;material.metalnessMap=null;material.onBeforeCompile=shader=>{shader.uniforms.visitorTint={value:new T.Color(color)};shader.fragmentShader='uniform vec3 visitorTint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nvec3 originalFace=diffuseColor.rgb;float faceLight=dot(originalFace,vec3(.2126,.7152,.0722));\n${isHair?'diffuseColor.rgb=visitorTint*(.38+faceLight*2.2);':'float skinRegion=smoothstep(.02,.12,originalFace.r-originalFace.b)*smoothstep(.025,.10,faceLight);vec3 sourceSkin=vec3(.735,.445,.280);vec3 skinRatio=clamp(visitorTint/sourceSkin,vec3(.15),vec3(1.7));diffuseColor.rgb=mix(originalFace,originalFace*skinRatio,skinRegion);'}`);};material.customProgramCacheKey=()=>isHair?'visitor-v9-hair-tint':'visitor-v9-face-tint';}
export function buildVisitorV10(recipe,skins){
  if(!template)throw Error('Preload v9 visitor assets before constructing a character');
  const root=buildVisitorBodyV8(T,recipe,skins),head=root.userData.headJoint,hairTemplate=hairTemplates.get(recipe.parts.hair),removed=[...root.userData.faceMeshes,...(hairTemplate?root.userData.hairMeshes:[])];for(const o of removed){o.removeFromParent();o.traverse(m=>m.geometry?.dispose());}
  // The continuous head and standalone wigs avoid face seams and forehead/brow
  // fragments from the rejected AutoSplit experiment. Current v7 remains intact.
  head.scale.setScalar(.90);head.position.y=.38;const detailed=new T.Group(),ownedMaterials=[],ownedGeometry=[],anatomyGroups=[];detailed.name='v8-detailed-head';head.add(detailed);
  const face=template.clone(true);face.name='v8-continuous-face';face.scale.setScalar(.38);face.position.set(0,-.02,0);face.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material=mesh.material.clone();ownedMaterials.push(mesh.material);mesh.userData.detailFace=true;mesh.castShadow=mesh.receiveShadow=true;mesh.material.roughness=.8;mesh.material.metalness=0;mesh.material.normalScale.setScalar(.35);if(recipe.skin!=='light')recolor(mesh.material,skins[recipe.skin],false);});detailed.add(face);
  if(hairTemplate){const mesh=hairTemplate.clone(true),box=new T.Box3().setFromObject(mesh),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),fit=hairFitTransform(recipe.parts.hair.replace('hair-',''),box),scale=fit.scale;mesh.traverse(m=>{if(!m.isMesh)return;m.material=m.material.clone();ownedMaterials.push(m.material);m.userData.detailFace=true;m.castShadow=m.receiveShadow=true;recolor(m.material,recipe.colors.hair,true);});mesh.scale.setScalar(scale);mesh.position.set(...fit.offset);detailed.add(mesh);}
  const cap=anatomy.get('hair-root').clone(true);cap.name='v10-textured-hair-foundation';cap.traverse(o=>{if(o.isMesh){o.material=o.material.clone();ownedMaterials.push(o.material);recolor(o.material,recipe.colors.hair,true);o.userData.detailFace=true;}});detailed.add(cap);
  for(const [side,sign]of [['left',-1],['right',1]]){
    const fore=root.userData.joints[side+'Forearm'];fore.traverse(o=>{if(o.userData.legacyHand)o.visible=false;});
    // The source thumb projects toward +X. Mirror it toward the torso on each wrist.
    const hand=anatomy.get('hand').clone(true);hand.name='v9-anatomical-hand-'+side;hand.scale.set(-sign*.83,.83,.83);hand.position.set(0,-.105,.006);hand.rotation.y=0;fore.add(hand);anatomyGroups.push(hand);
    hand.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();ownedMaterials.push(o.material);o.userData.detailFace=true;o.castShadow=o.receiveShadow=true;o.material.roughness=.8;o.material.metalness=0;o.material.normalScale.setScalar(.35);if(recipe.skin!=='light')recolor(o.material,skins[recipe.skin],false);});
    if(['shoes-sneakers','shoes-high'].includes(recipe.parts.shoes)){
      const foot=root.userData.joints[side+'Foot'];for(const c of foot.children)c.visible=false;
      const shoe=anatomy.get('shoe').clone(true);shoe.name='v9-textured-sneaker-'+side;shoe.scale.set(.9,recipe.parts.shoes==='shoes-high'?1.25:1,.82);shoe.position.set(0,-.046,.04);foot.add(shoe);anatomyGroups.push(shoe);shoe.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();o.material.color.set(recipe.colors.shoes);o.material.roughness=.85;o.material.metalness=0;o.material.normalScale.setScalar(.5);o.userData.detailFace=true;o.castShadow=o.receiveShadow=true;ownedMaterials.push(o.material);});
    }
  }
  root.userData.assetKind='v10-textured-modular-visitor';root.userData.assetPath='/art-v0130/models/visitor-npc-quality-head-v2/model.glb';root.userData.partsImplementation={face:'Complete NPC-style textured head with closed scalp, original eye geometry and full PBR; no facial overlays',hair:hairTemplate?'Meshy standalone textured wig':'original fitted parametric part',garments:'original rounded jointed geometry and fabric textures'};
  const garment=attachGarmentV8(root,recipe),lower=attachBottomV8(root,recipe);if(garment)root.userData.partsImplementation.garments='Meshy textured garments with existing shoulder/elbow and thigh/knee action joints';root.userData.garmentAsset=garment?.asset||null;root.userData.bottomAsset=lower?.asset||null;root.userData.materialReady=textureCampusAvatar(root,recipe);const dispose=root.userData.dispose;root.userData.dispose=()=>{garment?.dispose();lower?.dispose();detailed.removeFromParent();anatomyGroups.forEach(g=>g.removeFromParent());ownedGeometry.forEach(g=>g.dispose());ownedMaterials.forEach(m=>m.dispose());dispose();};return root;
}

