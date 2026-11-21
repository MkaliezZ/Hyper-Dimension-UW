import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './art-v0120/vendor/three/addons/utils/SkeletonUtils.js';
import {buildChibiVisitor} from './campus-avatar-3d.js';
import {textureCampusAvatar} from './campus-avatar-materials.js';

let template,clips,pending;
export function preloadPremiumAvatar(){return pending??=Promise.all([
  new GLTFLoader().loadAsync('/art-v0120/models/campus-student-premium-v1/model.glb'),
  fetch('/art-v0120/models/campus-student-premium-v1/motions.json').then(r=>{if(!r.ok)throw Error('Character motions missing');return r.json();})
]).then(([g,data])=>{
  g.scene.traverse(o=>{if(o.isMesh&&!o.material.map?.image)throw Error('Character base-color texture missing');});template=g.scene;
  clips=data.clips.map(c=>new T.AnimationClip(c.name,-1,c.tracks.map(t=>new (t.property==='quaternion'?T.QuaternionKeyframeTrack:T.VectorKeyframeTrack)(t.node+'.'+t.property,t.times,t.values))));
});}
export function isPremiumRecipe(r){return r.parts.body==='body-regular'&&r.parts.hair==='hair-curly'&&r.parts.top==='top-hoodie'&&r.parts.bottom==='bottom-jeans'&&r.parts.shoes==='shoes-sneakers'&&r.parts.glasses==='glasses-none'&&r.parts.accessory==='accessory-none';}
export function buildCampusVisitor(recipe,skins,{forcePremium=false}={}){
  if(!template||!forcePremium&&!isPremiumRecipe(recipe)){
    const root=buildChibiVisitor(T,recipe,skins);root.userData.materialReady=textureCampusAvatar(root,recipe);root.userData.assetKind='modular-prototype';return root;
  }
  const root=new T.Group(),model=cloneRig(template);root.add(model);root.name='UWTexturedConceptStudent';
  root.userData.assetKind='meshy-premium-reference';root.userData.materialReady=Promise.resolve();
  // A cloned skeleton/material belongs to each actor; geometry/textures are cached and shared.
  model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.castShadow=o.receiveShadow=true;
    const baseline={hair:'#51414b',top:'#8270a5',bottom:'#556480',shoes:'#eee7dc'},changed=Object.keys(baseline).filter(k=>recipe.colors[k]!==baseline[k]);if(recipe.skin!=='light')changed.push('skin');
    if(changed.length)o.material.onBeforeCompile=shader=>{
      const targets={...Object.fromEntries(Object.keys(baseline).map(k=>[k,new T.Color(recipe.colors[k])])),skin:new T.Color(skins[recipe.skin])};
      for(const k of Object.keys(targets)){shader.uniforms['campus_'+k]={value:targets[k]};shader.uniforms['change_'+k]={value:Number(changed.includes(k))};}
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 campusBind;').replace('#include <begin_vertex>','#include <begin_vertex>\ncampusBind=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 campusBind;\n'+Object.keys(targets).map(k=>'uniform vec3 campus_'+k+'; uniform float change_'+k+';').join('\n'));
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        vec3 raw=diffuseColor.rgb; float lum=dot(raw,vec3(.2126,.7152,.0722));
        float shoesMask=1.0-step(.18,campusBind.y);
        float bottomMask=step(.18,campusBind.y)*(1.0-step(.58,campusBind.y));
        float topMask=step(.58,campusBind.y)*(1.0-step(1.04,campusBind.y))*step(raw.g*1.05,raw.b);
        float hairMask=step(1.04,campusBind.y)*(1.0-step(.16,lum));
        float skinMask=step(raw.b*1.16,raw.r)*step(.12,lum)*max(step(1.04,campusBind.y),step(.39,abs(campusBind.x)));
        diffuseColor.rgb=mix(diffuseColor.rgb,campus_shoes*(.65+lum),shoesMask*change_shoes);
        diffuseColor.rgb=mix(diffuseColor.rgb,campus_bottom*(.65+lum),bottomMask*change_bottom);
        diffuseColor.rgb=mix(diffuseColor.rgb,campus_top*(.65+lum),topMask*change_top);
        diffuseColor.rgb=mix(diffuseColor.rgb,campus_hair*(.65+lum),hairMask*change_hair);
        diffuseColor.rgb=mix(diffuseColor.rgb,campus_skin*(.65+lum),skinMask*change_skin);`);
    };o.material.customProgramCacheKey=()=>changed.join(',');
  }});
  root.scale.set(recipe.parts.body==='body-slim'?.94:recipe.parts.body==='body-athletic'?1.07:1,{short:.93,standard:1,tall:1.06}[recipe.height]||1,1);
  const mixer=new T.AnimationMixer(model),actions=Object.fromEntries(clips.map(c=>[c.name,mixer.clipAction(c)]));let active,lastTime;
  root.userData.animate=(time,action='idle')=>{
    const next=action==='walk'||action==='run'?action:null,dt=lastTime===undefined?0:Math.min(.05,Math.max(0,time-lastTime));lastTime=time;
    if(next!==active){if(active)actions[active].fadeOut(.16);if(next)actions[next].reset().fadeIn(.16).play();else{mixer.stopAllAction();model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.pose();});const shoulder=model.getObjectByName('mixamorigLeftArm'),other=model.getObjectByName('mixamorigRightArm');if(shoulder)shoulder.rotation.z-=.70;if(other)other.rotation.z+=.70;}active=next;}
    mixer.update(dt);
    if(!next){
      model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.pose();});
      const left=model.getObjectByName('mixamorigLeftArm'),right=model.getObjectByName('mixamorigRightArm'),forearm=model.getObjectByName('mixamorigRightForeArm');
      if(left)left.rotation.z-=.70;if(right)right.rotation.z+=action==='wave'?-.95:.70;if(action==='wave'&&forearm)forearm.rotation.x=-.65+Math.sin(time*7)*.18;
    }
  };
  // Force an initial relaxed standing pose instead of leaving the production A-pose.
  active='walk';root.userData.animate(0,'idle');
  root.userData.dispose=()=>{mixer.stopAllAction();mixer.uncacheRoot(model);model.traverse(o=>{if(o.isMesh)o.material.dispose();});};
  return root;
}
