import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {baseRoot,projectRoot,protocol} from './base.mjs';

const original=await import(pathToFileURL(join(baseRoot,'src/avatar/catalog-m2-v2.mjs')).href);
const version='uw-visitors-13',generator='uw-chibi-modular3d-7.0.0';
const historical=async file=>protocol.digest(await readFile(join(projectRoot,'compat/3d-v052/public',file),'utf8'));
const legacy={version:'uw-visitors-1',generator:'uw-studio-1.0.0',rendererHash:await historical('visitor-model-v1.js')};
const paper={version:'uw-visitors-2',generator:'uw-paper-2.0.0',rendererHash:await historical('visitor-paper-model.js')};
const rounded={version:'uw-visitors-3',generator:'uw-campus-3.0.0',rendererHash:await historical('visitor-chibi-model.js')};
const adapt=(r,v=version,g=generator)=>({...structuredClone(r),catalogVersion:v,generatorVersion:g});
const rasterSource=await readFile(join(projectRoot,'public/pixel-raster.js'),'utf8');
const pixel={version:'uw-visitors-4',generator:'uw-pixel-1.0.0',rendererHash:protocol.digest({avatar:await readFile(join(projectRoot,'public/pixel-avatar.js'),'utf8'),raster:rasterSource})};
const detailed={version:'uw-visitors-5',generator:'uw-pixel-2.0.0',rendererHash:protocol.digest({avatar:await readFile(join(projectRoot,'public/pixel-avatar-v2.js'),'utf8'),raster:rasterSource})};
const pixelV6={version:'uw-visitors-6',generator:'uw-pixel-3.0.0',rendererHash:protocol.digest({avatar:await readFile(join(projectRoot,'public/pixel-avatar-v3.js'),'utf8'),raster:rasterSource})};
const v7RendererHash=protocol.digest({avatar:await readFile(join(projectRoot,'public/campus-avatar-3d.js'),'utf8'),materials:await readFile(join(projectRoot,'public/campus-avatar-materials.js'),'utf8'),premium:await readFile(join(projectRoot,'public/campus-premium-avatar.js'),'utf8'),style:'live-3d-modular-q-v1'});
const liveV7={version:'uw-visitors-7',generator:'uw-chibi-live3d-1.0.0',rendererHash:v7RendererHash};
const v8Sources=['campus-visitor-v8.js','campus-avatar-renderer.js','campus-avatar-body-v8.js','campus-avatar-hair-v8.js','campus-avatar-materials-v8.js','campus-avatar-garment-v8.js','campus-avatar-garment-fit-v8.js','campus-avatar-bottom-v8.js','campus-avatar-bottom-fit-v8.js','art-v0130/visitor-v8-assets.json'];
const v8RendererHash=protocol.digest(Object.fromEntries(await Promise.all(v8Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file==='campus-avatar-renderer.js'?'campus-avatar-renderer-v8.js':file),'utf8')]))));
const liveV8={version:'uw-visitors-8',generator:'uw-chibi-modular3d-2.0.0',rendererHash:v8RendererHash};
const v9Sources=[...v8Sources.filter(f=>!['campus-visitor-v8.js','campus-avatar-body-v8.js','art-v0130/visitor-v8-assets.json'].includes(f)),'campus-visitor-v9.js','campus-avatar-body-v9.js','art-v0130/visitor-v9-assets.json'];
const v9RendererHash=protocol.digest(Object.fromEntries(await Promise.all(v9Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file==='campus-avatar-renderer.js'?'campus-avatar-renderer-v9.js':file),'utf8')]))));
const liveV9={version:'uw-visitors-9',generator:'uw-chibi-modular3d-3.0.0',rendererHash:v9RendererHash};
const v10Sources=[...v9Sources.filter(f=>!['campus-visitor-v9.js','campus-avatar-body-v9.js','art-v0130/visitor-v9-assets.json'].includes(f)),'campus-visitor-v10.js','campus-avatar-body-v10.js','art-v0130/visitor-v10-assets.json'];
const liveV10={version:'uw-visitors-10',generator:'uw-chibi-modular3d-4.0.0',rendererHash:protocol.digest(Object.fromEntries(await Promise.all(v10Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file==='campus-avatar-renderer.js'?'campus-avatar-renderer-v10.js':file),'utf8')]))))};
const v11Sources=[...v10Sources,'campus-visitor-v11.js','campus-accessory-geometry-v11.js','campus-accessory-materials-v11.js','art-v0130/visitor-v11-assets.json'];
const liveV11={version:'uw-visitors-11',generator:'uw-chibi-modular3d-5.0.0',rendererHash:protocol.digest(Object.fromEntries(await Promise.all(v11Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file==='campus-avatar-renderer.js'?'campus-avatar-renderer-v11.js':file),'utf8')]))))};
const v12Sources=[...v11Sources,'campus-visitor-v12.js','art-v0130/visitor-v12-assets.json'];
const liveV12={version:'uw-visitors-12',generator:'uw-chibi-modular3d-6.0.0',rendererHash:protocol.digest(Object.fromEntries(await Promise.all(v12Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file==='campus-avatar-renderer.js'?'campus-avatar-renderer-v12.js':file),'utf8')]))))};
const v13Sources=[...v12Sources,'campus-avatar-renderer-v12.js','campus-visitor-v13.js'];
const rendererHash=protocol.digest(Object.fromEntries(await Promise.all(v13Sources.map(async file=>[file,await readFile(join(projectRoot,'public',file),'utf8')]))));
const versions=[{version,generator,rendererHash},liveV12,liveV11,liveV10,liveV9,liveV8,liveV7,pixelV6,detailed,pixel,rounded,paper,legacy];
export const visitorCatalog={
  version,generator,rendererHash,skeletonVersion:original.SKELETON,
  defaultRecipe:adapt(original.defaultRecipe),skins:original.skins,
  parts:original.parts.map(({id,slot,label})=>({id,slot,label,preview:'/art-v0130/wardrobe-thumbnails-v12/'+id+'.jpg'})),
  incompatible:original.incompatible,
  presets:original.presets.map(({id,label,recipe})=>({id,label,recipe:adapt(recipe)})),
  author:'Hyper Campus · modular Q character',license:'Code MIT; generated models carry per-asset provenance',
  scope:'signed-browser-visitor',style:'live-3d-modular-q',styleLabel:'Q版三维搭配',frame:{width:48,height:64,sourcePixelRatio:2,directions:8},legacy,previous:paper,rounded,pixel,detailed,pixelV6,liveV7,liveV8,liveV9,liveV10,liveV11,versions,
};
Object.assign(visitorCatalog.defaultRecipe.colors,{top:'#8b79b3',bottom:'#556780',hair:'#51414b',shoes:'#eee7dc'});
const presetColors={everyday:{top:'#8270a5',bottom:'#556480',hair:'#55454a',shoes:'#eee7dc'},library:{top:'#c2957b',bottom:'#708580',hair:'#624c50',shoes:'#e5dac8'},sports:{top:'#7b9d8b',bottom:'#65778b',hair:'#5c4547',shoes:'#eee7dc'},creative:{top:'#8c7e9b',bottom:'#5e6c81',hair:'#4f3f49',shoes:'#d6bda7'}};
for(const p of visitorCatalog.presets)Object.assign(p.recipe.colors,presetColors[p.id]||presetColors.everyday);
visitorCatalog.defaultRecipe.parts.accessory='accessory-none';
visitorCatalog.defaultRecipe.skin='light';
const conceptRecipe=structuredClone(visitorCatalog.defaultRecipe);
Object.assign(conceptRecipe.parts,{hair:'hair-curly',top:'top-hoodie',bottom:'bottom-jeans',glasses:'glasses-none',accessory:'accessory-none'});
Object.assign(conceptRecipe.colors,presetColors.everyday);
conceptRecipe.skin='light';
visitorCatalog.presets.unshift({id:'concept-student',label:'参考图 · Q版卫衣',recipe:conceptRecipe});
visitorCatalog.hash=protocol.digest(visitorCatalog);
export function validateVisitorRecipe(input){
  const selected=versions.find(v=>v.version===input?.catalogVersion&&v.generator===input?.generatorVersion);
  if(!selected)
    protocol.fail('avatar_version','人物素材版本不匹配，请刷新后重试。',409);
  try{return adapt(original.validateM2({...input,catalogVersion:original.CATALOG,generatorVersion:original.GENERATOR}),selected.version,selected.generator);}
  catch(e){protocol.fail('avatar_recipe',e.code==='avatar_incompatible_parts'?'这些部件有穿插，请更换发型或配饰。':'人物搭配无效，请从当前素材目录选择。',400);}
}
export function createVisitorAvatars(store,spaceId){
  const key=p=>protocol.digest([p.id,spaceId]);
  const read=p=>{protocol.authorize(p,spaceId);return store.read().uwVisitorAvatars?.[key(p)]||null;};
  const history=p=>{protocol.authorize(p,spaceId);return store.read().uwVisitorAvatarHistory?.[key(p)]||[];};
  // Presentation is a read-only new-style projection; it never rewrites saved recipes/receipts.
  const presentation=p=>{const saved=read(p);if(!saved)return null;const recipe=adapt(saved.recipe);return {...saved,recipe,rendererHash,modelHash:protocol.digest({recipe,rendererHash}),savedModelHash:saved.modelHash,previewOnly:saved.recipe.generatorVersion!==generator};};
  return {read,history,presentation,async save(principal,input){
    protocol.authorize(principal,spaceId);
    protocol.fields(input,['requestId','expectedRevision','displayName','recipe'],'visitor avatar');
    protocol.identifier(input.requestId);
    if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<0)protocol.fail('avatar_revision','存档版本无效。',400);
    if(typeof input.displayName!=='string'||!input.displayName.trim()||input.displayName.trim().length>32||/[\x00-\x1f\x7f]/.test(input.displayName))protocol.fail('avatar_name','请输入 1–32 字的访客称呼。',400);
    const recipe=validateVisitorRecipe(input.recipe);
    return store.command(principal,spaceId,input.requestId,input,d=>{
      const previous=d.uwVisitorAvatars?.[key(principal)];
      if((previous?.revision||0)!==input.expectedRevision)protocol.fail('avatar_conflict','形象已在另一页面修改，请重新载入后再保存。',409);
      const activeRendererHash=versions.find(v=>v.generator===recipe.generatorVersion).rendererHash;
      const saved={displayName:input.displayName.trim(),recipe,revision:(previous?.revision||0)+1,
        modelHash:protocol.digest({recipe,rendererHash:activeRendererHash}),rendererHash:activeRendererHash,catalogHash:visitorCatalog.hash,updatedAt:new Date().toISOString()};
      if(previous){d.uwVisitorAvatarHistory||={};d.uwVisitorAvatarHistory[key(principal)]||=[];d.uwVisitorAvatarHistory[key(principal)].push(structuredClone(previous));}
      d.uwVisitorAvatars||={};d.uwVisitorAvatars[key(principal)]=saved;return saved;
    });
  }};
}
