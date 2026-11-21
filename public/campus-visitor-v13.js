import * as T from './art-v0120/vendor/three/three.module.js';
import {buildVisitorV12,preloadVisitorV12} from './campus-visitor-v12.js';

export const preloadVisitorV13=preloadVisitorV12;
const smooth=T.MathUtils.smoothstep;
const sourceSkin=new T.Color('#dfab90');

// Work in the measured head-joint frame. The UV, winding and material
// attachments stay on the same vertices, including both baked eyelids.
function shapePart(root,part,kind,owned){
 root.updateMatrixWorld(true);
 const inv=part.parent.matrixWorld.clone().invert(),p=new T.Vector3();
 part.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const geometry=mesh.geometry.clone();
  const a=geometry.getAttribute('position');
  const to=inv.clone().multiply(mesh.matrixWorld),from=to.clone().invert();
  for(let i=0;i<a.count;i++){
   p.fromBufferAttribute(a,i).applyMatrix4(to);
   if(kind==='face'){
    const x0=Math.sign(p.x)*.122,y0=.004;
    const edge=Math.hypot((p.x-x0)/.139,(p.y-y0)/.119);
    const eye=(1-smooth(edge,.28,1.0))*smooth(p.z,.12,.248);
    p.x=x0+(p.x-x0)*(1-.185*eye);
    p.y=y0+(p.y-y0)*(1-.195*eye);
    p.z-=.011*eye;
    const jaw=smooth(-p.y,.06,.28)*(1-smooth(Math.abs(p.x),.23,.325));
    p.x*=1-.074*jaw;
   }else{
    const ear=(1-smooth(Math.abs(p.y+.027),.047,.122))*smooth(Math.abs(p.x),.208,.303);
    const temple=ear*smooth(p.z,-.105,.173);
    if(kind==='foundation'){
     p.x*=1-.36*temple;
     p.z-=.106*temple;
    }else{
     p.z-=.072*temple;
     p.x*=1+.024*temple;
    }
   }
   p.applyMatrix4(from);
   a.setXYZ(i,p.x,p.y,p.z);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  mesh.geometry=geometry;
  owned.push(geometry);
 });
}

function skinFinish(material,hex,light){
 const target=new T.Color(hex);
 const ratio=light?new T.Color().setRGB(1,1,1):new T.Color().setRGB(
  T.MathUtils.clamp(target.r/sourceSkin.r,.16,1.28),
  T.MathUtils.clamp(target.g/sourceSkin.g,.16,1.40),
  T.MathUtils.clamp(target.b/sourceSkin.b,.16,1.51));
 material.color.set('#fff');
 material.roughness=.87;
 material.metalness=0;
 material.normalScale?.setScalar(.31);
 material.onBeforeCompile=shader=>{
  shader.uniforms.skinToneRatio={value:ratio};
  shader.fragmentShader='uniform vec3 skinToneRatio;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec3 source=diffuseColor.rgb;
    float luminance=dot(source,vec3(.2126,.7152,.0722));
    float skin=smoothstep(.037,.16,source.r-source.b)*smoothstep(.09,.30,luminance);
    vec3 toned=mix(vec3(luminance),source,.82)*skinToneRatio*vec3(.975,1.014,1.012);
    diffuseColor.rgb=mix(source,toned,skin);`);
 };
 material.customProgramCacheKey=()=>'uw-modular-skin-finish-v13';
}

export function buildVisitorV13(recipe,skins){
 const root=buildVisitorV12(recipe,skins),head=root.userData.headJoint;
 const detailed=root.getObjectByName('v8-detailed-head');
 const face=detailed.getObjectByName('v8-continuous-face');
 const cap=detailed.getObjectByName('v10-textured-hair-foundation');
 const wig=detailed.children.find(x=>x!==face&&x!==cap);
 if(!face||!cap||!wig)throw Error('Visitor head and fitted hair must be loaded together');
 const geometry=[];
 shapePart(root,face,'face',geometry);
 shapePart(root,cap,'foundation',geometry);
 shapePart(root,wig,'wig',geometry);
 head.scale.multiply(new T.Vector3(.955,.947,.973));
 head.position.y+=.029;
 const skin=skins[recipe.skin];
 for(const part of [face,root.getObjectByName('v9-anatomical-hand-left'),root.getObjectByName('v9-anatomical-hand-right')]){
  part.traverse(mesh=>{if(mesh.isMesh)skinFinish(mesh.material,skin,recipe.skin==='light');});
 }
 // Clothes are separate animated meshes. An inset undershirt joins short
 // hemlines to the lower garment while keeping the modular slot silhouette.
 const waistGeometry=new T.LatheGeometry([
  new T.Vector2(0,-.024),new T.Vector2(.148,-.024),
  new T.Vector2(.145,.044),new T.Vector2(.137,.112),new T.Vector2(0,.112)
 ],24);
 const waistMaterial=new T.MeshStandardMaterial({color:'#30313b',roughness:.96});
 const waist=new T.Mesh(waistGeometry,waistMaterial);
 waist.name='visitor-inset-waist-layer';waist.scale.z=.73;
 waist.castShadow=waist.receiveShadow=true;
 root.userData.joints.hips.add(waist);
 geometry.push(waistGeometry);
 root.userData.assetKind='v13-textured-modular-visitor';
 root.userData.partsImplementation.face='Refitted eye and jaw silhouette with neutral textured skin';
 root.userData.partsImplementation.hair='Scalp and eight textured wigs fitted clear of the temples and ears';
 const dispose=root.userData.dispose;
 root.userData.dispose=()=>{for(const part of geometry)part.dispose();waistMaterial.dispose();dispose();};
 return root;
}

