import {configureLibraryGlazing} from './campus-building-glazing.js';
import * as T from './art-v0120/vendor/three/three.module.js';
import {repairBuildingRoof} from './campus-building-roof.js';
import {configureBuildingTextureSampling} from './campus-building-sampling.js';
import {terrainEdgeSamples} from './terrain-surface.js';
import {createAllenOpenArcade} from './art-v0130/structures/allen-open-arcade-v1.js';
import {createSuzzalloStairHallRoof} from './art-v0130/structures/suzzallo-stair-hall-roof-v2.js';

export function disposeComplex(root){
 const gs=new Set(),ms=new Set(),ts=new Set();
 root?.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){ms.add(m);for(const t of Object.values(m))if(t?.isTexture)ts.add(t);}});
 for(const g of gs)g.dispose();for(const m of ms)m.dispose();for(const t of ts){t.dispose();t.source?.data?.close?.();}root?.removeFromParent();
}
export function placeComplexComponent(raw,row,{far=false,roofTexture=null,anisotropy=1}={}){
 const p=row.placement,f=row.sourceNormalization;
 if(![p.x,p.z,p.groundY,p.width,p.height,p.depth,f.x,f.y,f.z,f.width,f.height,f.depth].every(Number.isFinite)||[p.width,p.height,p.depth,f.width,f.height,f.depth].some(n=>n<=0))throw Error('Invalid complex component placement '+row.id);
 raw.updateMatrixWorld(true);const meshes=[],inner=new T.Group();
 const norm=far?new T.Matrix4():new T.Matrix4().makeScale(1/f.width,1/f.height,1/f.depth).multiply(new T.Matrix4().makeRotationY(f.yaw||0)).multiply(new T.Matrix4().makeTranslation(-f.x,-f.y,-f.z));
 raw.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(const mesh of meshes){mesh.geometry.applyMatrix4(mesh.matrixWorld).applyMatrix4(norm);mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);inner.add(mesh);}
 configureBuildingTextureSampling(inner,anisotropy);
 if(row.roofRepair&&roofTexture)repairBuildingRoof(inner,row.roofRepair,p,roofTexture);
 if(row.glazingRepair)configureLibraryGlazing(inner);
 inner.rotation.y=(p.sourceQuarter||0)*Math.PI/2;
 const group=new T.Group();group.name=row.id;group.userData.complexComponent=row.id;group.userData.componentBinding=row;group.add(inner);
 group.scale.set(p.width,p.height,p.depth);group.rotation.y=p.angle||0;group.position.set(p.x,p.groundY,p.z);return group;
}
// The middle model is already normalized in the same component frame as
// the existing far model. Placement stays with the validated complex plan.
export async function loadComplexMiddleComponent(fallback, url, {loader, anisotropy}) {
 const binding = fallback?.userData.componentBinding;
 if (!binding || binding.roofRepair || binding.glazingRepair) {
  throw Error('Middle component requires a supported material setup');
 }
 const raw = (await loader.loadAsync(url)).scene;
 try {
  return placeComplexComponent(raw, binding, {far:true, anisotropy});
 } catch (error) {
  disposeComplex(raw);
  throw error;
 }
}

export function buildComplexGroundworks(plan,terrain,{stoneMap=null,roofMap=null}={}){
 const root=new T.Group();root.name='Library terrain foundations and registered joints';
 const stone=new T.MeshStandardMaterial({name:'Library sandstone base',map:stoneMap,color:'#c7beb0',roughness:.94,side:T.DoubleSide});
 const roof=new T.MeshStandardMaterial({name:'Library seam flashing',map:roofMap,color:'#bcb9b2',roughness:.98,side:T.DoubleSide});
 function add(name,positions,uv,material){
  if(!positions.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const mesh=new T.Mesh(g,material);mesh.name=name;root.add(mesh);
 }
 for(const f of plan.foundations){
  const verts=[],uv=[];
  for(let i=1;i<f.ring.length;i++){
   const samples=terrainEdgeSamples(terrain,f.ring[i-1],f.ring[i]);
   for(let k=1;k<samples.length;k++){
    const A=samples[k-1],B=samples[k],ya=Math.min(f.topY,A[1]-.18),yb=Math.min(f.topY,B[1]-.18);
    if(f.topY-Math.min(ya,yb)<.04)continue;
    for(const p of [[A[0],ya,A[2]],[B[0],yb,B[2]],[A[0],f.topY,A[2]],[B[0],yb,B[2]],[B[0],f.topY,B[2]],[A[0],f.topY,A[2]]]){verts.push(...p);uv.push((p[0]+p[2])/2.8,p[1]/2.8);}
   }
  }
  add(f.id+' terrain plinth',verts,uv,stone);
 }
 for(const j of plan.joints){
  const verts=[],uv=[];
  for(let i=1;i<j.ring.length;i++){
   const a=j.ring[i-1],b=j.ring[i];
   for(const p of [[a[0],j.bottomY,a[1]],[b[0],j.bottomY,b[1]],[a[0],j.topY,a[1]],[b[0],j.bottomY,b[1]],[b[0],j.topY,b[1]],[a[0],j.topY,a[1]]]){verts.push(...p);uv.push((p[0]+p[2])/2.8,p[1]/2.8);}
  }
  add(j.id+' seam',verts,uv,stone);
  const g=new T.ShapeGeometry(new T.Shape(j.ring.map(([x,z])=>new T.Vector2(x,-z))));
  g.rotateX(-Math.PI/2);g.translate(0,j.topY,0);const p=g.attributes.position;
  for(let i=0;i<p.count;i++)g.attributes.uv.setXY(i,p.getX(i)/3.6,p.getZ(i)/3.6);
  const mesh=new T.Mesh(g,roof);mesh.name=j.id+' flat flashing';root.add(mesh);
 }
 return root;
}

export async function loadBuildingComplex(url,{loader,terrain,anisotropy=1,far=false,expectedGeometryHash,expectedBuildingId}){
 const response=await fetch(url);if(!response.ok)throw Error('Complex manifest unavailable');const definition=await response.json();
 if(definition.schema!=='uw.building-complex/v1'||!Array.isArray(definition.components)||!definition.components.length||definition.components.length>8)throw Error('Invalid building complex');
 if((expectedGeometryHash&&definition.geometryHash!==expectedGeometryHash)||(expectedBuildingId&&definition.buildingId!==expectedBuildingId))throw Error('Complex belongs to a different campus/building');
 const root=new T.Group();root.name=definition.code+' '+(far?'distant':'detailed')+' assembly';root.userData.complex=definition.buildingId;
 const textures=new Map();const tile=async path=>{if(textures.has(path))return textures.get(path);const t=await new T.TextureLoader().loadAsync(path);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=anisotropy;textures.set(path,t);return t;};
 const json=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Complex plan unavailable');return r.json();};
 try{
  for(const row of definition.components){
   const raw=(await loader.loadAsync(far?row.far:row.source)).scene;
   try{const roofTexture=row.roofRepair?await tile(row.roofRepair.texture):null;root.add(placeComplexComponent(raw,row,{far,roofTexture,anisotropy}));}
   catch(e){disposeComplex(raw);throw e;}
  }
  const arcade=await createAllenOpenArcade(await json(definition.arcade.plan),{anisotropy});arcade.position.y+=definition.arcade.groundY;root.add(arcade);
  const hall=await createSuzzalloStairHallRoof(await json(definition.stairHall.plan),{anisotropy});hall.position.y+=definition.stairHall.groundY;root.add(hall);
  const groundPlan=await json(definition.groundworks);
  const gravel=await tile('/art-v0130/materials/mineral-flat-roof-v1.png');
  const stoneMap=hall.getObjectByName('Octagonal low terrace').material.map;
  root.add(buildComplexGroundworks(groundPlan,terrain,{stoneMap,roofMap:gravel}));
  root.updateMatrixWorld(true);return root;
 }catch(e){disposeComplex(root);for(const t of textures.values())t.dispose();throw e;}
}
