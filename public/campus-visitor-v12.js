import * as T from './art-v0120/vendor/three/three.module.js';
import{buildVisitorV10,preloadVisitorV10}from'./campus-visitor-v10.js';
import{preloadAccessoryMaterialsV11,accessoryMaterialsV11}from'./campus-accessory-materials-v11.js';
import{hairFitTransform}from'./campus-avatar-hair-v8.js';
import{GLTFLoader}from'./art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import{decorateVisitorV11}from'./campus-accessory-geometry-v11.js';
let pony,ponyPending;
const preloadPony=()=>ponyPending??=new GLTFLoader().loadAsync('/art-v0130/models/visitor-hair-ponytail-clean-v12/model.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Ponytail texture unavailable');});pony=g.scene;}).catch(e=>{ponyPending=null;throw e;});
export const preloadVisitorV12=recipe=>Promise.all([preloadVisitorV10(recipe?.parts.hair==='hair-ponytail'?{...recipe,parts:{...recipe.parts,hair:'hair-sidepart'}}:recipe),preloadAccessoryMaterialsV11(),recipe?.parts.hair==='hair-ponytail'?preloadPony():Promise.resolve()]);
function replacePony(root,recipe){
 if(recipe.parts.hair!=='hair-ponytail')return()=>{};if(!pony)throw Error('Preload clean ponytail first');
 const detailed=root.getObjectByName('v8-detailed-head'),old=detailed.children.find(o=>!['v8-continuous-face','v10-textured-hair-foundation'].includes(o.name));
 if(!old)throw Error('Existing hair attachment missing');const next=pony.clone(true),materials=[];next.name='v12-reviewed-ponytail';const fit=hairFitTransform('ponytail',new T.Box3().setFromObject(pony));next.position.set(...fit.offset);next.quaternion.copy(old.quaternion);next.scale.setScalar(fit.scale);
 next.traverse(o=>{if(!o.isMesh)return;o.material=o.material.clone();const m=o.material;materials.push(m);m.color.set('#fff');m.flatShading=false;m.roughness=.93;m.metalness=0;m.roughnessMap=null;m.metalnessMap=null;m.onBeforeCompile=shader=>{shader.uniforms.visitorTint={value:new T.Color(recipe.colors.hair)};shader.fragmentShader='uniform vec3 visitorTint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat hairLight=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=visitorTint*(.38+hairLight*2.2);');};m.customProgramCacheKey=()=>'visitor-v12-hair-tint';o.userData.detailFace=true;o.castShadow=o.receiveShadow=true;});old.removeFromParent();detailed.add(next);root.userData.partsImplementation.hair='Source-PBR ponytail with reviewed forehead/nape cleanup;original saved model retained';return()=>materials.forEach(m=>m.dispose());
}
export function buildVisitorV12(recipe,skins){
  const base=structuredClone(recipe);base.parts.glasses='glasses-none';base.parts.accessory='accessory-none';
  if(['shoes-loafers','shoes-boots'].includes(base.parts.shoes))base.parts.shoes='shoes-sneakers';
  if(base.parts.hair==='hair-ponytail')base.parts.hair='hair-sidepart';
  const root=buildVisitorV10(base,skins);root.userData.recipe=structuredClone(recipe);const disposePony=replacePony(root,recipe);
  if(recipe.parts.accessory==='accessory-cap'){
    const detailed=root.getObjectByName('v8-detailed-head'),head=root.userData.headJoint;
    const wig=detailed.children.find(o=>!['v8-continuous-face','v10-textured-hair-foundation'].includes(o.name));
    root.updateMatrixWorld(true);const inverse=head.matrixWorld.clone().invert(),p=new T.Vector3();let envelope=1;
    wig?.traverse(o=>{if(!o.isMesh)return;const transform=inverse.clone().multiply(o.matrixWorld),a=o.geometry.attributes.position;
      for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(transform);if(p.y<.225||(recipe.parts.hair==='hair-ponytail'&&p.z<-.15))continue;envelope=Math.max(envelope,(p.x/.357)**2+((p.y-.225)/.285)**2+((p.z+.015)/.335)**2);}});
    root.userData.capClearance=Math.sqrt(envelope)*1.025;
  }
  if(recipe.parts.accessory==='accessory-bow'){
    const detailed=root.getObjectByName('v8-detailed-head'),head=root.userData.headJoint;
    const wig=detailed.children.find(o=>!['v8-continuous-face','v10-textured-hair-foundation'].includes(o.name));
    root.updateMatrixWorld(true);const origin=head.localToWorld(new T.Vector3(.25,.18,2)),direction=new T.Vector3(0,0,-1).transformDirection(head.matrixWorld);
    const hit=wig?new T.Raycaster(origin,direction,0,4).intersectObject(wig,true)[0]:null;
    root.userData.bowMount=[.25,.18,hit?head.worldToLocal(hit.point.clone()).z+.025:.27];
  }
  const details=decorateVisitorV11(T,root,recipe,accessoryMaterialsV11()),dispose=root.userData.dispose;
  root.userData.assetKind='v12-textured-modular-visitor';root.userData.partsImplementation.accessories=details.diagnostics.implementation;
  root.userData.dispose=()=>{details.dispose();disposePony();dispose();};return root;
}
