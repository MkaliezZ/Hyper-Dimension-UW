import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {decodeGlb} from './building-mesh.mjs';
import {verifyGlbBufferRanges} from './glb-buffer-ranges.mjs';
import {previewBuildingBindings} from '../public/campus-building-shape.js';

const app=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,app)));
const {siteCount,buildingIds:activeBuildingIds,openGroundIds:correctedTerrainIds}=await read('data/art-coverage.json');
assert.equal(siteCount,74);
assert.equal(activeBuildingIds.length,72);
assert.equal(correctedTerrainIds.length,2);
const ref={activeBuildingIds,correctedTerrainIds};
const campus=await read('data/campus.json');
const registry=await read('public/art-v0130/building-integration.json');
const sorted=rows=>[...rows].sort();
const unique=array=>assert.equal(new Set(array).size,array.length);
assert.equal(campus.buildings.length,74);
assert.equal(registry.geometryHash,campus.geometryHash);
assert.equal(registry.limits.detailedModels,4);
const active=previewBuildingBindings(registry);
assert.equal(active.length,registry.buildings.length);
assert(active.every(row=>row.replaceWholeBuilding===true));
const activeIds=active.map(b=>b.id);
unique(activeIds);
assert.deepEqual(sorted(activeIds),sorted(ref.activeBuildingIds));
const campusIds=campus.buildings.map(b=>b.id),terrain=ref.correctedTerrainIds;
assert.equal(terrain.length,2);
assert.deepEqual(sorted(campusIds),sorted([...activeIds,...terrain]));
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
const results=[],failures=[];
for(const row of active){
 for(const [role,key] of [['source','sourceSha256'],['far','farSha256']]){
  try {
   assert(/^\/art-v01[23]0\/models\/(?:[-_a-z0-9.]+\/)*[-_a-z0-9.]+\.glb$/i.test(row[role]),row[role]);
   const asset=new URL('public'+row[role],app);
   assert(asset.href.startsWith(new URL('public/',app).href),'Outside the staged asset root');
   const bytes=await readFile(asset);
   assert.equal(sha(bytes),row[key]);
   const {primitives}=verifyGlbBufferRanges(bytes),{json,bin}=decodeGlb(bytes);
   assert(primitives>0);
   const used=new Set();
   const bound=(json.meshes||[]).flatMap(m=>m.primitives).flatMap(p=>{
    const m=json.materials[p.material]||{};
    const features=[m.pbrMetallicRoughness?.baseColorTexture,m.pbrMetallicRoughness?.metallicRoughnessTexture,m.normalTexture,m.occlusionTexture,m.emissiveTexture].filter(Boolean);
    for(const feature of features){
     const tex=json.textures[feature.index],src=tex.extensions?.KHR_texture_basisu?.source??tex.source;
     const uv=feature.extensions?.KHR_texture_transform?.texCoord??feature.texCoord??0;
     assert(Number.isInteger(p.attributes['TEXCOORD_'+uv]),'Texture is not bound to its UV channel');
     used.add(src);
    }
    return features;
   });
   assert(bound.length>0&&used.size>0,'No mapped exterior texture');
   for(const index of used){
    const image=json.images[index],range=json.bufferViews[image.bufferView];
    assert(range&&range.byteLength>=8&&!image.uri,'Texture must be embedded and non-empty');
    const start=range.byteOffset||0,signature=bin.subarray(start,start+8);
    const mime=image.mimeType;
    if(mime==='image/png')assert.equal(signature.toString('hex'),'89504e470d0a1a0a');
    else if(mime==='image/jpeg')assert.equal(signature.subarray(0,3).toString('hex'),'ffd8ff');
    else if(mime==='image/ktx2')assert.equal(signature.toString('hex'),'ab4b5458203230bb');
    else if(mime==='image/webp')assert.equal(signature.subarray(0,4).toString('ascii'),'RIFF');
    else throw Error('Unexpected image type '+mime);
   }
   results.push({id:row.id,code:row.code,role,sha256:row[key],primitives,textureImages:used.size,bytes:bytes.length});
  }catch(error){
   failures.push({id:row.id,code:row.code,role,reason:error.message});
  }
 }
}
const report={scope:'model identity, byte integrity and embedded texture binding',version:(await read('package.json')).version,
  campusSites:campusIds.length,buildingBindings:activeIds.length,associatedTerrain:terrain,verified:results.length,results,failures};
const resultPath=process.argv[2]; if(resultPath)await writeFile(resultPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({campus:campusIds.length,buildings:activeIds.length,assets:results.length,failures}));
assert.deepEqual(failures,[]);
assert.equal(results.length,144);

