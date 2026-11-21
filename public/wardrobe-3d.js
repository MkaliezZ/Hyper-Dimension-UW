import {animateCampusVisitor} from './campus-locomotion.js';
import * as T from './art-v0120/vendor/three/three.module.js';
import {buildCampusVisitor,preloadPremiumAvatar} from './campus-avatar-renderer.js';
import {buildCampusNpc,preloadCampusNpcAvatars} from './campus-npc-avatars.js';
export function wardrobe3D(canvas){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,20);camera.position.set(0,1,3.9);camera.lookAt(0,.80,0);scene.add(new T.HemisphereLight(0xf0f3ff,0x8b9b73,2.4));const light=new T.DirectionalLight(0xffead1,2.5);light.position.set(-3,5,4);scene.add(light);let model;
  const rotations={south:0,southwest:Math.PI/4,west:Math.PI/2,northwest:Math.PI*.75,north:Math.PI,northeast:Math.PI*1.25,east:Math.PI*1.5,southeast:Math.PI*1.75};
  let generation=0,lastKey;
  async function update(recipe,skins,options={}){const key=JSON.stringify([options.npcId||null,recipe]);if(key===lastKey&&model)return model.userData.materialReady;const ticket=++generation;await (options.npcId?preloadCampusNpcAvatars():preloadPremiumAvatar(recipe));if(ticket!==generation)return;const next=options.npcId?buildCampusNpc(options.npcId):buildCampusVisitor(recipe,skins,options);if(model){scene.remove(model);model.userData.dispose();}model=next;lastKey=key;scene.add(model);canvas.dataset.renderMode=model.userData.assetKind;canvas.dataset.modelAsset=model.userData.assetPath||'';return model.userData.materialReady;}
  function draw(time,direction,action){const r=canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}if(model){model.rotation.y=rotations[direction]||0;animateCampusVisitor(model,time/1000,action,{speed:action==='walk'?7.8:0});}renderer.render(scene,camera);}
  return {update,draw,dispose(){generation++;model?.userData.dispose();renderer.dispose();}};
}
