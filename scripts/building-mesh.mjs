import * as T from '../base/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../base/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {footprintFrame} from '../public/campus-building-assets.js';
export function decodeGlb(b){const n=b.readUInt32LE(12);return {json:JSON.parse(b.toString('utf8',20,20+n)),bin:b.subarray(28+n)};}
export async function readBuildingGeometry(b){
  const {json:original,bin}=decodeGlb(b),g=structuredClone(original);if(g.skins?.length)throw Error('Architecture cannot contain a character rig');
  delete g.images;delete g.textures;delete g.materials;for(const m of g.meshes)for(const p of m.primitives)delete p.material;
  const js=Buffer.from(JSON.stringify(g)),json=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,32)]),out=Buffer.alloc(28+json.length+bin.length);out.write('glTF');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(bin.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);bin.copy(out,28+json.length);
  const asset=await new GLTFLoader().parseAsync(out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength),'');asset.scene.updateMatrixWorld(true);const meshes=[];asset.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
  if(meshes.length!==1||original.meshes.length!==1||original.meshes[0].primitives.length!==1)throw Error('A multi-material building needs explicit material-preserving handling');
  const geometry=meshes[0].geometry.clone().applyMatrix4(meshes[0].matrixWorld);geometry.boundingBox=new T.Box3();const point=new T.Vector3();for(const i of geometry.index.array)geometry.boundingBox.expandByPoint(point.fromBufferAttribute(geometry.attributes.position,i));return {geometry,json:original,bin};
}
export function hullXZ(points){
  const unique=[...new Map(points.map(p=>[p.map(n=>n.toFixed(5)).join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const lower=[],upper=[];for(const p of unique){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(const p of unique.toReversed()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}return [...lower.slice(0,-1),...upper.slice(0,-1)];
}
export function normalizationFrame(geometry,kind='body-frame'){
  const box=geometry.boundingBox,size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
  if(kind==='legacy-box')return {x:center.x,z:center.z,y:box.min.y,width:size.x,depth:size.z,height:size.y,yaw:0,kind};
  const p=geometry.attributes.position,points=[];for(let i=0;i<p.count;i++)if(p.getY(i)>box.min.y+size.y*.08&&p.getY(i)<box.min.y+size.y*.7)points.push([p.getX(i),p.getZ(i)]);
  const hull=hullXZ(points);if(hull.length<3)throw Error('Missing building body footprint');const f=footprintFrame([...hull,hull[0]]);let yaw=-f.angle;while(yaw>Math.PI/2)yaw-=Math.PI;while(yaw<=-Math.PI/2)yaw+=Math.PI;
  return {x:f.x,z:f.z,y:box.min.y,width:f.width,depth:f.depth,height:size.y,yaw,kind};
}
export function normalizationMatrix(f){return new T.Matrix4().makeScale(1/f.width,1/f.height,1/f.depth).multiply(new T.Matrix4().makeRotationY(f.yaw)).multiply(new T.Matrix4().makeTranslation(-f.x,-f.y,-f.z));}
export function encodeFarGlb(geometry,albedo,factor=[1,1,1,1]){
  const chunks=[],views=[],accessors=[],attributes={};let offset=0;
  function append(array,target,type,size){const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength),pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}const view=views.push({buffer:0,byteOffset:offset,byteLength:b.length,target})-1;chunks.push(b);offset+=b.length;const record={bufferView:view,componentType:array instanceof Float32Array?5126:5125,count:array.length/size,type};return accessors.push(record)-1;}
  for(const [name,gltf]of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0'],['color','COLOR_0']]){const a=geometry.getAttribute(name);if(name==='color'&&!a)continue;attributes[gltf]=append(a.array,34962,a.itemSize===2?'VEC2':'VEC3',a.itemSize);if(name==='position'){const box=geometry.boundingBox;accessors.at(-1).min=box.min.toArray();accessors.at(-1).max=box.max.toArray();}}
  const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}const imageView=views.push({buffer:0,byteOffset:offset,byteLength:albedo.length})-1;chunks.push(albedo);offset+=albedo.length;
  const indices=append(new Uint32Array(geometry.index.array),34963,'SCALAR',1),raw=Buffer.concat(chunks),bin=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4)]),g={asset:{version:'2.0',generator:'Hyper Campus UV-preserving LOD; original source preserved'},buffers:[{byteLength:raw.length}],bufferViews:views,accessors,images:[{bufferView:imageView,mimeType:'image/jpeg'}],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],textures:[{source:0,sampler:0}],materials:[{name:'Source albedo LOD',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:factor,baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:.98}}],meshes:[{primitives:[{attributes,indices,material:0}]}],nodes:[{mesh:0}],scenes:[{nodes:[0]}],scene:0},text=Buffer.from(JSON.stringify(g)),json=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]),out=Buffer.alloc(28+json.length+bin.length);out.write('glTF');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(bin.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);bin.copy(out,28+json.length);return out;
}
