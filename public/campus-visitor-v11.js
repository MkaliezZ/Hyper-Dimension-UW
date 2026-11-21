import * as T from './art-v0120/vendor/three/three.module.js';
import{buildVisitorV10,preloadVisitorV10}from'./campus-visitor-v10.js';
import{preloadAccessoryMaterialsV11,accessoryMaterialsV11}from'./campus-accessory-materials-v11.js';
import{decorateVisitorV11}from'./campus-accessory-geometry-v11.js';
export const preloadVisitorV11=recipe=>Promise.all([preloadVisitorV10(recipe),preloadAccessoryMaterialsV11()]);
export function buildVisitorV11(recipe,skins){
  const base=structuredClone(recipe);base.parts.glasses='glasses-none';base.parts.accessory='accessory-none';
  if(['shoes-loafers','shoes-boots'].includes(base.parts.shoes))base.parts.shoes='shoes-sneakers';
  const root=buildVisitorV10(base,skins);root.userData.recipe=structuredClone(recipe);
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
  root.userData.assetKind='v11-textured-modular-visitor';root.userData.partsImplementation.accessories=details.diagnostics.implementation;
  root.userData.dispose=()=>{details.dispose();dispose();};return root;
}
