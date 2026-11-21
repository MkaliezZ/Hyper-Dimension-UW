import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './art-v0120/vendor/three/addons/utils/SkeletonUtils.js';
import {NPC_MODEL_ASSETS,NPC_MODEL_IDS} from './campus-npc-model-registry.js';

const templates=new Map();let pending;
export function preloadCampusNpcAvatars(){return pending??=Promise.all(NPC_MODEL_IDS.map(async id=>{
  const spec=NPC_MODEL_ASSETS[id],g=await new GLTFLoader().loadAsync(spec.path);let rigged=0,textured=0;
  g.scene.traverse(o=>{if(o.isSkinnedMesh){rigged++;if(o.skeleton.bones.length!==28)throw Error('Unexpected NPC rig: '+id);}if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m.map?.image)throw Error('NPC texture missing: '+id);textured++;}}});
  if(!rigged||!textured)throw Error('NPC needs a textured rig: '+id);
  templates.set(id,{scene:g.scene,spec,textured});
}));}

export function buildCampusNpc(id){
  const template=templates.get(id);if(!template)throw Error('NPC art is not loaded: '+id);
  const root=new T.Group(),model=cloneRig(template.scene);root.name='UWTexturedNpc-'+id;root.add(model);
  const meshes=[],materials=new Set(),textures=new Set();model.traverse(o=>{if(o.isMesh){meshes.push(o);o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);m.roughness=Math.max(m.roughness,.78);m.metalness=Math.min(m.metalness,.1);m.normalScale?.multiplyScalar(.65);if(m.map)textures.add(m.map);}o.castShadow=o.receiveShadow=true;}});
  model.updateMatrixWorld(true);const box=new T.Box3().setFromObject(model),height=box.max.y-box.min.y;
  if(!Number.isFinite(height)||height<=0)throw Error('Invalid NPC dimensions: '+id);
  model.position.y-=box.min.y;root.scale.setScalar(template.spec.height/height);
  const bones=Object.fromEntries(meshes.flatMap(m=>m.skeleton?.bones||[]).map(b=>[b.name,b])),base=model.getObjectByName('mixamorigHips'),left=bones.mixamorigLeftArm,right=bones.mixamorigRightArm,fore=bones.mixamorigRightForeArm,head=bones.mixamorigHead;
  let released=false;
  // Cache bind transforms and anatomical axes once. Updating the entire model
  // hierarchy for every joint previously multiplied the six-NPC animation cost.
  model.updateMatrixWorld(true);
  const pose=Object.values(bones).map(b=>({bone:b,position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()}));
  const axes=new Map(),worldX=new T.Vector3(1,0,0),worldZ=new T.Vector3(0,0,1),modelQ=model.getWorldQuaternion(new T.Quaternion());
  for(const b of Object.values(bones)){const inverse=b.getWorldQuaternion(new T.Quaternion()).invert();axes.set(b,{x:worldX.clone().applyQuaternion(modelQ).applyQuaternion(inverse).normalize(),z:worldZ.clone().applyQuaternion(modelQ).applyQuaternion(inverse).normalize()});}
  const q=new T.Quaternion();
  function turn(bone,axis,angle){if(bone)bone.quaternion.multiply(q.setFromAxisAngle(axes.get(bone)[axis],angle));}
  const axisZ='z',swing=(bone,angle)=>turn(bone,'x',angle);
  let previousTime,walkBlend=0,waveBlend=0,gait=0;

  root.userData={assetKind:'textured-q-npc',npcId:id,assetPath:template.spec.path,sharedGeometry:true,materialReady:Promise.resolve(),
    animate(time,action='idle'){
      if(released)return;const dt=previousTime===undefined?1/60:Math.max(0,Math.min(.08,time-previousTime));previousTime=time;const walking=action==='walk'||action==='run';walkBlend+=(Number(walking)-walkBlend)*(1-Math.exp(-dt*9));waveBlend+=(Number(action==='wave')-waveBlend)*(1-Math.exp(-dt*10));gait+=dt*5.5*walkBlend;for(const p of pose){p.bone.position.copy(p.position);p.bone.quaternion.copy(p.quaternion);p.bone.scale.copy(p.scale);}
      turn(left,axisZ,-.70);turn(right,axisZ,.70);
      if(waveBlend>.001){turn(right,axisZ,-2.05*waveBlend);turn(fore,axisZ,(-.28+Math.sin(time*6)*.18)*waveBlend);}
      const phase=NPC_MODEL_IDS.indexOf(id)*1.7,walk=walkBlend>.001,stride=Math.sin(gait)*walkBlend;
      if(walk){for(const [side,sign]of [['Left',1],['Right',-1]]){swing(bones['mixamorig'+side+'UpLeg'],stride*.33*sign);swing(bones['mixamorig'+side+'Leg'],Math.max(0,-stride*sign)*.48);swing(bones['mixamorig'+side+'Arm'],-stride*.26*sign);}}
      else if(action!=='wave'){swing(left,Math.sin(time*.9+phase)*.035);swing(right,-Math.sin(time*.9+phase)*.035);}
      if(head){head.rotation.y+=Math.sin(time*.7+phase)*.10;head.rotation.x+=Math.sin(time*.9+phase)*.018;}
      if(base)base.position.y+=walk?Math.abs(stride)*.012:Math.sin(time*1.8+phase)*.006;
      if(bones.mixamorigSpine2)bones.mixamorigSpine2.rotation.z+=walk?Math.sin(gait)*.015*walkBlend:Math.sin(time*.8+phase)*.016;
    },
    dispose(){if(released)return;released=true;for(const m of materials)m.dispose();},
  };
  root.userData.animate(0);return root;
}
