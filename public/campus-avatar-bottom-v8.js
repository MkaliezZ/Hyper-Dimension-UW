import * as T from './art-v0120/vendor/three/three.module.js';
import{GLTFLoader}from'./art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import{BOTTOM_FITS,bottomWeights}from'./campus-avatar-bottom-fit-v8.js';
const templates=new Map(),pending=new Map();
export function preloadBottomsV8(selected){const ids=selected?[selected]:Object.keys(BOTTOM_FITS);return Promise.all(ids.map(id=>{if(!BOTTOM_FITS[id])throw Error("Unknown wardrobe component");if(!pending.has(id))pending.set(id,(async()=>{const fit=BOTTOM_FITS[id];const g=await new GLTFLoader().loadAsync('/art-v0130/models/'+fit.asset+'/model.glb');let count=0;g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(o.isMesh){count++;if(!o.material.map?.image)throw Error('Detailed lower garment texture unavailable');}});if(count!==1)throw Error('Lower garment requires explicit multi-mesh handling');templates.set(id,g.scene);})().catch(error=>{pending.delete(id);throw error;}));return pending.get(id);}));}
export function attachBottomV8(root,recipe){
 const fit=BOTTOM_FITS[recipe.parts.bottom],template=templates.get(recipe.parts.bottom);if(!fit)return null;if(!template)throw Error('Detailed lower garment not preloaded');
 const bones=['hips','leftLeg','leftKnee','rightLeg','rightKnee'].map(k=>root.userData.joints[k]);if(bones.some(b=>!b))throw Error('Missing lower garment action joints');
 const box=new T.Box3().setFromObject(template),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),matrix=new T.Matrix4().makeTranslation(0,fit.top-fit.height,0).multiply(new T.Matrix4().makeScale(fit.width/size.x,fit.height/size.y,fit.depth/size.z)).multiply(new T.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
 const group=new T.Group();group.name='v8-detailed-bottom';bones[0].add(group);root.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones,bones.map(b=>b.matrixWorld.clone().invert()));
 template.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(matrix),p=geometry.attributes.position,indices=[],weights=[];
 for(let i=0;i<p.count;i++){const w=bottomWeights(p.getX(i),p.getY(i),fit);indices.push(...w.indices);weights.push(...w.weights);}geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
 const material=o.material.clone();material.roughness=.95;material.metalness=0;
 const chosen=new T.Color(recipe.colors.bottom),original=new T.Color('#556780'),ratio=new T.Vector3(Math.min(3,chosen.r/original.r),Math.min(3,chosen.g/original.g),Math.min(3,chosen.b/original.b));
 material.onBeforeCompile=shader=>{shader.uniforms.lowerTint={value:chosen};shader.fragmentShader='uniform vec3 lowerTint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat lowerChroma=max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b)-min(min(diffuseColor.r,diffuseColor.g),diffuseColor.b);float lowerLight=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(diffuseColor.rgb,lowerTint*(.45+lowerLight*1.5),smoothstep(.03,.10,lowerChroma));');};material.customProgramCacheKey=()=> 'visitor-v8-lower-garment-tint';
 const mesh=new T.SkinnedMesh(geometry,material);mesh.name=recipe.parts.bottom+'-textured';mesh.userData.detailGarment=true;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);root.updateMatrixWorld(true);mesh.bind(skeleton,mesh.matrixWorld);mesh.normalizeSkinWeights();
 });
 for(const mesh of root.userData.bottomMeshes)mesh.visible=false;
 return{asset:fit.asset,group,dispose(){group.removeFromParent();group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});skeleton.dispose();}};
}
