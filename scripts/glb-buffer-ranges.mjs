// Check actual GLB byte ranges before accepting geometric/texture diagnostics.
// A truncated typed-array slice can otherwise make an invalid last material
// appear to pass an offline geometry check while the browser loader rejects it.
import{decodeGlb}from'./building-mesh.mjs';
export function verifyGlbBufferRanges(bytes){
 if(bytes.length<28||bytes.toString('utf8',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB header/length');
 const jsonLength=bytes.readUInt32LE(12),binaryHeader=20+jsonLength;
 if(binaryHeader+8>bytes.length||bytes.readUInt32LE(16)!==0x4e4f534a||bytes.readUInt32LE(binaryHeader+4)!==0x004e4942||binaryHeader+8+bytes.readUInt32LE(binaryHeader)!==bytes.length)throw Error('Invalid GLB chunks');
 const{json,bin}=decodeGlb(bytes),sizes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},dimensions={SCALAR:[1,1],VEC2:[2,1],VEC3:[3,1],VEC4:[4,1],MAT2:[2,2],MAT3:[3,3],MAT4:[4,4]};
 if(json.buffers?.length!==1||json.buffers[0].uri||json.buffers[0].byteLength>bin.length)throw Error('Unsupported or truncated GLB buffer');
 const integer=(v,min=0)=>Number.isSafeInteger(v)&&v>=min;
 for(const[v,view]of(json.bufferViews||[]).entries())if(view.buffer!==0||!integer(view.byteOffset||0)||!integer(view.byteLength,1)||(view.byteOffset||0)+view.byteLength>json.buffers[0].byteLength)throw Error('Invalid bufferView '+v);
 function range(viewId,offset,count,element,stride,label,alignment){
  const view=json.bufferViews?.[viewId];if(!view||!integer(offset)||offset%alignment||((view.byteOffset||0)+offset)%alignment||!integer(count,1)||!integer(stride,element)||offset+(count-1)*stride+element>view.byteLength)throw Error('Out-of-range '+label);
 }
 for(const[i,a]of(json.accessors||[]).entries()){
  const size=sizes[a.componentType],shape=dimensions[a.type];if(!size||!shape||!integer(a.count,1))throw Error('Invalid accessor '+i);
  const element=shape[1]>1?Math.ceil(shape[0]*size/4)*4*shape[1]:shape[0]*size;
  if(a.bufferView!==undefined)range(a.bufferView,a.byteOffset||0,a.count,element,json.bufferViews?.[a.bufferView]?.byteStride||element,'accessor '+i,size);
  else if(!a.sparse)throw Error('Accessor has no storage '+i);
  if(a.sparse){const s=a.sparse,indexSize=sizes[s.indices?.componentType];if(![5121,5123,5125].includes(s.indices?.componentType)||!integer(s.count,1)||s.count>a.count)throw Error('Invalid sparse accessor '+i);range(s.indices.bufferView,s.indices.byteOffset||0,s.count,indexSize,indexSize,'sparse indices '+i,indexSize);range(s.values.bufferView,s.values.byteOffset||0,s.count,element,element,'sparse values '+i,size);}
 }
 for(const mesh of json.meshes||[])for(const p of mesh.primitives||[]){const index=json.accessors[p.indices];if(p.indices!==undefined&&(!index||index.type!=='SCALAR'||!([5121,5123,5125].includes(index.componentType))||((p.mode??4)===4&&index.count%3)))throw Error('Invalid primitive index accessor');const position=json.accessors[p.attributes?.POSITION];if(!position)throw Error('Missing primitive positions');for(const i of Object.values(p.attributes))if(!json.accessors[i]||json.accessors[i].count!==position.count)throw Error('Mismatched vertex attribute count');}
 return{accessors:json.accessors?.length||0,bufferViews:json.bufferViews?.length||0,primitives:(json.meshes||[]).reduce((n,m)=>n+m.primitives.length,0)};
}
