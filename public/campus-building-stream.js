import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {loadBuildingComplex,loadComplexMiddleComponent} from './campus-building-complex.js';
import {repairBuildingRoof} from './campus-building-roof.js';
import {configureBuildingTextureSampling} from './campus-building-sampling.js';
import {terrainHeight} from './terrain-surface.js';
import {drawWarmActors} from './campus-gpu-warmup.js';
import {createIdleModelLoader} from './campus-idle-model-loader.js';
import {normalizeBuildingRoot} from './campus-building-normalization.js';
import {buildingScreenSize} from './campus-building-projection.js';
import {nextBuildingLoadFrame} from './campus-loading-yield.js';
import {addBuildingApron} from './campus-building-grounds.js';
import {chooseDetailedBuildings,placementContains,previewBuildingBindings} from './campus-building-shape.js';

// Only near models carry full 2k PBR. Far geometry retains UV seams and bounded
// source albedo, so the campus never holds dozens of full PBR texture sets.
const tick=()=>nextBuildingLoadFrame();
function release(root){const geometries=new Set(),materials=new Set(),textures=new Set();root?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture&&!v.userData.sharedCampusMask&&!v.userData.sharedCampusRoof)textures.add(v);}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures){t.dispose();t.source?.data?.close?.();}root?.removeFromParent();}
function maskFor(rings,margin){const points=rings.flat(),x=Math.min(...points.map(p=>p[0]))-margin-1,z=Math.min(...points.map(p=>p[1]))-margin-1,w=Math.max(...points.map(p=>p[0]))-x+margin+1,d=Math.max(...points.map(p=>p[1]))-z+margin+1,canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,512,512);ctx.fillStyle=ctx.strokeStyle='#fff';ctx.setTransform(512/w,0,0,512/d,-x*512/w,-z*512/d);ctx.beginPath();for(const ring of rings){ring.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.closePath();}ctx.fill('evenodd');if(margin){ctx.lineWidth=margin*2;ctx.stroke();}const texture=new T.CanvasTexture(canvas);texture.flipY=false;texture.minFilter=texture.magFilter=T.LinearFilter;texture.userData.sharedCampusMask=true;return {texture,bounds:new T.Vector4(x,z,w,d)};}
function clipMaterial(material,{mask,placement,inverse=false,key='footprint'}){const previous=material.onBeforeCompile,oldKey=material.customProgramCacheKey.bind(material);material.onBeforeCompile=shader=>{previous.call(material,shader);shader.uniforms.campusMask={value:mask.texture};shader.uniforms.campusMaskBounds={value:mask.bounds};shader.uniforms.campusRect={value:new T.Vector4(placement?.x||0,placement?.z||0,placement?.width||0,placement?.depth||0)};shader.uniforms.campusAngle={value:placement?.angle||0};shader.vertexShader='varying vec2 campusXZ;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 campusWorld=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\ncampusWorld=instanceMatrix*campusWorld;\n#endif\ncampusXZ=(modelMatrix*campusWorld).xz;');shader.fragmentShader='varying vec2 campusXZ; uniform sampler2D campusMask; uniform vec4 campusMaskBounds; uniform vec4 campusRect; uniform float campusAngle;\n'+shader.fragmentShader;const test=inverse?'if(campusInside && all(lessThanEqual(abs(campusLocal),campusRect.zw*0.5))) discard;':'if(!campusInside) discard;';shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nvec2 campusUV=(campusXZ-campusMaskBounds.xy)/campusMaskBounds.zw;\nbool campusInside=all(greaterThanEqual(campusUV,vec2(0.0)))&&all(lessThanEqual(campusUV,vec2(1.0)))&&texture2D(campusMask,campusUV).r>0.5;\nvec2 campusDelta=campusXZ-campusRect.xy;float ca=cos(campusAngle),sa=sin(campusAngle);vec2 campusLocal=vec2(ca*campusDelta.x-sa*campusDelta.y,sa*campusDelta.x+ca*campusDelta.y);\n'+test);};material.customProgramCacheKey=()=>oldKey()+'-campus-mask-'+key;material.needsUpdate=true;}
function applyClip(mesh,options){for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])clipMaterial(m,options);mesh.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});mesh.customDistanceMaterial=new T.MeshDistanceMaterial({side:T.DoubleSide});clipMaterial(mesh.customDepthMaterial,options);clipMaterial(mesh.customDistanceMaterial,options);}
function normalize(root,f){return normalizeBuildingRoot(T,root,f);}

// Complete models own their facade. Remove every generated window instance
// of those buildings by identity, including the portions just outside a
// footprint edge. Compact the remaining instances into the same draw calls.
function cullReplacedBuildingWindows(meshes, owners, complete){
  if(meshes.some(mesh=>mesh.count!==owners.length))throw Error('Campus window ownership is out of sync');
  const matrix=new T.Matrix4();
  let saved=0;
  for(const [index, owner] of owners.entries()){
    if(complete.has(owner))continue;
    if(saved!==index)for(const mesh of meshes){
      mesh.getMatrixAt(index,matrix);
      mesh.setMatrixAt(saved,matrix);
    }
    saved++;
  }
  for(const mesh of meshes){
    mesh.count=saved;
    mesh.instanceMatrix.needsUpdate=true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }
}

export async function createBuildingStream({scene,renderer,camera,campus,groups,pickables,places,softenArchitecture,windowMeshes=[],windowOwnerIds,omitFoundationEdge,canvas,terrainMaterial}){
  const grounds=[];
  const response=await fetch('/art-v0130/building-integration.json');if(!response.ok)throw Error('Building art manifest unavailable');const manifest=await response.json();if(manifest.geometryHash!==campus.geometryHash)throw Error('Building art and walking geometry differ');const activeRows=previewBuildingBindings(manifest),loader=new GLTFLoader(),states=new Map(),masks=[],roofTextures=new Map(),frustum=new T.Frustum(),projection=new T.Matrix4();let disposed=false,loading=false,last=0,motionUntil=0,shadowRevision=0,wanted=new Set(),middleWanted=null,currentSelectedId=null,lastQualityKey='',movementActive=false;const qualityEvents=[];const limits=manifest.limits;const isMoving=()=>movementActive||performance.now()<motionUntil;
  function publish(){
    if(disposed)return;
    const focusState=states.get(currentSelectedId)||states.get([...wanted][0]),focus=focusState?{code:focusState.row.code,name:focusState.row.name,lod:focusState.level||'far',stage:focusState.phase||'distant',wanted:desiredLevel(focusState)!==null,projectedPixels:Math.round(focusState.screen?.pixels||0)}:null;
    const report={far:states.size,detailed:[...states.values()].filter(s=>s.level==='near').map(s=>s.row.code),middle:[...states.values()].filter(s=>s.level==='middle').map(s=>s.row.code),loading:[...states.values()].filter(s=>s.pending).map(s=>s.row.code),errors:[...states.values()].flatMap(s=>Object.entries(s.errors).map(([level,error])=>({code:s.row.code,level,error}))),limit:limits.detailedModels,motionDeferred:isMoving(),wanted:[...wanted].map(id=>states.get(id).row.code),focus,quality:[...states.values()].map(s=>({code:s.row.code,stage:s.phase||'distant',pixels:Math.round(s.screen?.pixels||0),wanted:desiredLevel(s)!==null})),events:qualityEvents};
    canvas.dataset.buildingStream=JSON.stringify(report);
    const key=JSON.stringify(focus);if(key!==lastQualityKey){lastQualityKey=key;canvas.dispatchEvent(new CustomEvent('building-quality',{detail:{focus}}));}
  }
  function phase(s,value){if(s.phase===value)return;s.phase=value;qualityEvents.push({code:s.row.code,stage:value,at:Math.round(performance.now()),moving:isMoving()});if(qualityEvents.length>50)qualityEvents.shift();publish();}
  // Full-detail demand keeps its existing four-slot budget. The middle
  // model is reserved for one visible facade that has dropped out of it.
  function desiredLevel(state){
    if(wanted.has(state.row.id))return 'near';
    return state.row.id===middleWanted?'middle':null;
  }
  function requestStillWanted(state){
    return !disposed&&desiredLevel(state)===state.pending&&!state.controller.signal.aborted;
  }
  async function idleFor(s,nextPhase){
    if(isMoving())phase(s,'waiting-idle');
    while(requestStillWanted(s)&&isMoving())await tick();
    if(!requestStillWanted(s))return false;
    retireDistant();phase(s,nextPhase);return true;
  }

  function prepare(root,s,far){configureBuildingTextureSampling(root,renderer.capabilities.getMaxAnisotropy());const {row,mask}=s,p=row.placement;if(!far&&!row.complex)root=normalize(root,row.sourceNormalization);if(s.roofTexture)repairBuildingRoof(root,row.roofRepair,p,s.roofTexture);const quarter=new T.Group();quarter.rotation.y=row.complex?0:p.sourceQuarter*Math.PI/2;quarter.add(root);const wrapper=new T.Group();wrapper.add(quarter);if(!row.complex){wrapper.scale.set(p.width,p.height,p.depth);wrapper.rotation.y=p.angle;wrapper.position.set(p.x,p.groundY,p.z);}softenArchitecture(root);const place=[...places.values()].find(p=>p.buildingId===row.id);root.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;o.userData.surface={kind:'building',id:row.id,placeId:place?.id||row.id};if(mask&&!row.complex){o.userData.campusFootprint=s.building.rings;o.userData.footprintMargin=row.footprintMargin;applyClip(o,{mask,key:'footprint'});}pickables.push(o);});scene.add(wrapper);shadowRevision++;return wrapper;}
  async function loadRoot(s,level){
    const far=level==='far';
    const activeLoader=far?loader:createIdleModelLoader(loader,{signal:s.controller.signal,onPhase:value=>phase(s,value),ready:()=>idleFor(s,'decoding')});
    if (s.row.complex && level === 'middle') {
      const name = s.row.middle.component;
      const fallback = name && s.far.getObjectByName(name);
      if (!fallback || fallback.userData.complexComponent !== name) {
        throw Error('Middle component does not belong to the loaded complex');
      }
      const root = await loadComplexMiddleComponent(fallback, s.row.middle.url, {
        loader: activeLoader,
        anisotropy: renderer.capabilities.getMaxAnisotropy(),
      });
      s.middleFallback = fallback;
      return root;
    }
    return s.row.complex?loadBuildingComplex(s.row.complex,{loader:activeLoader,terrain:campus.terrain,anisotropy:renderer.capabilities.getMaxAnisotropy(),far,expectedGeometryHash:campus.geometryHash,expectedBuildingId:s.row.id}):(await activeLoader.loadAsync(far?s.row.far:level==='middle'?s.row.middle.url:s.row.source)).scene;
  }

  function forget(root){if(!root)return;shadowRevision++;root.traverse(o=>{const i=pickables.indexOf(o);if(i>=0)pickables.splice(i,1);o.customDepthMaterial?.dispose();o.customDistanceMaterial?.dispose();});release(root);}
  function showFar(state){
    forget(state.detail);state.detail=null;state.level=null;state.far.visible=true;
    if (state.middleFallback) state.middleFallback.visible = true;
    if(!state.pending)phase(state,'distant');
  }
  function retireDistant(){
    for(const state of states.values()){
      const level=desiredLevel(state);
      if(state.detail&&(!level||state.errors[level]))showFar(state);
    }
  }
  function foundation(s){
    // Surveyed outlines use centimeter campus coordinates. Preserve the wall
    // skirt where that rounding puts a perimeter segment just past the model box.
    const p=s.row.placement,pos=[];
    const outlineTolerance=s.row.foundationMode==='registered-outline' ? .005 : 0;for(const ring of s.building.rings)for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let j=0;j<n;j++){const u=j/n,v=(j+1)/n,x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,xx=a[0]+(b[0]-a[0])*v,zz=a[1]+(b[1]-a[1])*v;if(!placementContains(p,(x+xx)/2,(z+zz)/2,outlineTolerance)||omitFoundationEdge?.(s.row.id,(x+xx)/2,(z+zz)/2))continue;const y=Math.min(p.groundY,terrainHeight(campus.terrain,x,z)-.2),yy=Math.min(p.groundY,terrainHeight(campus.terrain,xx,zz)-.2);if(p.groundY-Math.min(y,yy)<.05)continue;pos.push(x,y,z,xx,yy,zz,x,p.groundY+.08,z,xx,yy,zz,xx,p.groundY+.08,zz,x,p.groundY+.08,z);}}if(!pos.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({color:'#aa9681',roughness:1,side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);s.foundation=m;}
  // Far models are small and loaded serially; a failed required source blocks the
  // candidate rather than silently claiming that generic architecture is finished.
  for(const row of activeRows){const building=campus.buildings.find(b=>b.id===row.id);if(!building)throw Error('Unknown building '+row.id);const mask=row.clipFootprint?maskFor(building.rings,row.footprintMargin):null;if(mask)masks.push(mask.texture);const s={row,building,mask,far:null,detail:null,level:null,middleFallback:null,pending:null,errors:{}};states.set(row.id,s);if(row.roofRepair){const r=row.roofRepair;if(r.sourceSha256!==row.sourceSha256)throw Error('Roof repair source changed; review required');let texture=roofTextures.get(r.texture);if(!texture){texture=await new T.TextureLoader().loadAsync(r.texture);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.userData.sharedCampusRoof=true;roofTextures.set(r.texture,texture);}s.roofTexture=texture;}s.far=prepare(await loadRoot(s,'far'),s,true);if(row.replaceWholeBuilding){s.generic=groups.get(row.id);s.genericVisible=s.generic?.visible;if(s.generic)s.generic.visible=false;}if(mask){const generic=groups.get(row.id),cover={...row.placement,width:row.placement.width+5,depth:row.placement.depth+5};generic?.traverse(o=>{if(!o.isMesh)return;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material])m.userData.softPainted=false;softenArchitecture(o);o.userData.campusHiddenPlacement=cover;o.userData.campusFootprint=building.rings;o.userData.footprintMargin=row.footprintMargin;applyClip(o,{mask,placement:cover,inverse:true,key:'inverse-rect'});});foundation(s);}else if(row.replaceWholeBuilding&&!row.complex&&row.foundationMode!=='terrain-fitted-posts')foundation(s);await tick();}
  // Keep all repeated windows in the original two draw calls. A single static
  // world mask removes only facade fragments replaced by new individual wings.
  const complete=new Set(activeRows.filter(row=>row.replaceWholeBuilding).map(row=>row.id));
  if(windowOwnerIds)cullReplacedBuildingWindows(windowMeshes,windowOwnerIds,complete);
  const newRows=[...states.values()].filter(state=>windowOwnerIds
    ? state.mask&&!complete.has(state.row.id) : state.mask||state.row.replaceWholeBuilding);if(newRows.length){const [x,z,xx,zz]=campus.bounds,c=document.createElement('canvas');c.width=c.height=2048;const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,2048,2048);for(const s of newRows){ctx.save();if(!s.row.replaceWholeBuilding){ctx.translate((s.row.placement.x-x)/(xx-x)*2048,(s.row.placement.z-z)/(zz-z)*2048);ctx.scale(2048/(xx-x),2048/(zz-z));ctx.rotate(-s.row.placement.angle);ctx.beginPath();ctx.rect(-s.row.placement.width/2-2.5,-s.row.placement.depth/2-2.5,s.row.placement.width+5,s.row.placement.depth+5);ctx.clip();}ctx.setTransform(2048/(xx-x),0,0,2048/(zz-z),-x*2048/(xx-x),-z*2048/(zz-z));ctx.fillStyle='#fff';ctx.beginPath();for(const ring of s.building.rings){ring.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.closePath();}ctx.fill('evenodd');ctx.restore();}const texture=new T.CanvasTexture(c);texture.flipY=false;texture.userData.sharedCampusMask=true;masks.push(texture);for(const m of windowMeshes){m.material=m.material.clone();applyClip(m,{mask:{texture,bounds:new T.Vector4(x,z,xx-x,zz-z)},placement:{x:(x+xx)/2,z:(z+zz)/2,width:xx-x,depth:zz-z,angle:0},inverse:true,key:'window-union'});}}
  async function pump(){
    if(disposed||loading)return;
    const middle=states.get(middleWanted);
    const nearQueue=[...wanted].map(id=>states.get(id));
    // Keep the selected facade ahead of unrelated detail requests. Finish
    // a near-to-middle replacement before taking another near slot.
    const prioritizeMiddle=middle&&(middle.level==='near'||middle.row.id===currentSelectedId);
    const queue=prioritizeMiddle?[middle,...nearQueue]:[...nearQueue,middle];
    const next=queue.find(state=>{
      if(!state)return false;
      const level=desiredLevel(state);
      return level&&state.level!==level&&!state.errors[level];
    });
    if(!next)return;
    const level=desiredLevel(next);
    loading=true;next.pending=level;next.controller=new AbortController();
    phase(next,'downloading');publish();
    let root,prepared;
    try{
      // Network I/O can overlap walking; parsing, GPU uploads and activation
      // still wait for an idle frame so sharper art does not add walking stalls.
      root=await loadRoot(next,level);
      if(!await idleFor(next,'preparing')){release(root);root=null;return;}
      configureBuildingTextureSampling(root,renderer.capabilities.getMaxAnisotropy());
      const textures=new Set();root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const v of Object.values(m))if(v?.isTexture)textures.add(v);});
      for(const texture of textures){
        if(!await idleFor(next,'uploading')){release(root);root=null;return;}
        renderer.initTexture(texture);await tick();
      }
      if(!await idleFor(next,'preparing')){release(root);root=null;return;}
      const detail=prepare(root,next,level==='middle');prepared=detail;root=null;detail.visible=false;
      if(renderer.compileAsync)await renderer.compileAsync(detail,camera,scene);
      if(!await idleFor(next,'warming')){forget(detail);prepared=null;return;}
      const meshes=[];detail.traverse(o=>{if(o.isMesh)meshes.push(o);});
      await drawWarmActors(T,renderer,scene,meshes,async()=>{await tick();if(!await idleFor(next,'warming'))throw Object.assign(Error('Building request superseded'),{name:'AbortError'});},{reveal:detail,batchSize:8});
      if(!await idleFor(next,'activating')){forget(detail);prepared=null;return;}
      if(level==='middle'){
        for(const state of states.values())if(state!==next&&state.level==='middle')showFar(state);
      }
      forget(next.detail);
      const replacePart = level === 'middle' && !!next.middleFallback;
      if (next.middleFallback) next.middleFallback.visible = !replacePart;
      next.far.visible = replacePart;
      detail.visible=true;next.detail=detail;next.level=level;
      // The hidden model can finish warming after the previous shadow pass.
      shadowRevision++;
      phase(next,level);
    }catch(e){
      if(root)release(root);if(prepared)forget(prepared);
      if(e.name!=='AbortError'){next.errors[level]=e.message;phase(next,'error');console.error('Building detail load failed',next.row.code,e);}
    }finally{
      next.pending=null;next.controller=null;loading=false;if(!next.detail&&!next.errors[level])phase(next,'distant');publish();if(!disposed)void pump();
    }
  }
  function update(now,selectedId,{moving=false}={}){
    movementActive=moving;if(moving)motionUntil=now+250;if(disposed||now-last<250)return;last=now;currentSelectedId=selectedId;
    camera.updateMatrixWorld();frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const viewport={width:canvas.clientWidth,height:canvas.clientHeight},rows=[...states.values()].map(s=>{const p=s.row.placement,center=new T.Vector3(p.x,p.groundY+p.height/2,p.z);s.screen=buildingScreenSize(T,camera,p,viewport);return{id:s.row.id,cost:s.row.detailedCost||1,detailed:s.level==='near',distance:camera.position.distanceTo(center),visible:frustum.intersectsSphere(new T.Sphere(center,Math.hypot(p.width,p.depth,p.height)/2)),projectedPixels:s.screen.pixels,projectedArea:s.screen.area};});
    const enterPixels=Math.min(280,Math.max(160,viewport.width*.45));
    wanted=new Set(chooseDetailedBuildings(rows,{max:limits.detailedModels,enter:limits.enterDistance,leave:limits.leaveDistance,enterPixels,leavePixels:enterPixels*.78,selectedId}));
    middleWanted=rows
      .filter(r=>{
        const state=states.get(r.id);
        if(!state.row.middle||state.errors.middle||!r.visible||wanted.has(r.id))return false;
        const selected=r.id===selectedId, retained=state.level==='middle'||state.pending==='middle';
        const enter=selected?88:118, leave=selected?70:94;
        return r.projectedPixels>=(retained?leave:enter);
      })
      .sort((a,b)=>Number(b.id===selectedId)-Number(a.id===selectedId)
        || b.projectedArea*(states.get(b.id).level==='middle'?1.2:1)-a.projectedArea*(states.get(a.id).level==='middle'?1.2:1))[0]?.id||null;
    const selected=states.get(selectedId);
    const selectedLevel=selected&&desiredLevel(selected);
    for(const state of states.values()){
      if(!state.pending)continue;
      const backgroundDownload=state!==selected&&state.phase==='downloading';
      const urgentSelection=selectedLevel&&selected.level!==selectedLevel&&!selected.errors[selectedLevel];
      if(!requestStillWanted(state)||(backgroundDownload&&urgentSelection))state.controller.abort();
    }
    if(isMoving()){publish();void pump();return;}
    retireDistant();
    publish();void pump();
  }

  for(const row of activeRows)if(row.visualGround)grounds.push(addBuildingApron(T,scene,campus.terrain,terrainMaterial,row.visualGround));
  publish();return {update,get shadowRevision(){return shadowRevision;},placements:new Map(activeRows.map(b=>[b.id,b.placement])),manifest:{...manifest,buildings:activeRows},candidateCount:manifest.buildings.length,dispose(){disposed=true;for(const g of grounds)g.dispose();for(const s of states.values()){s.controller?.abort();forget(s.detail);forget(s.far);release(s.foundation);if(s.generic)s.generic.visible=s.genericVisible;}for(const t of masks)t.dispose();for(const t of roofTextures.values()){t.dispose();t.source?.data?.close?.();}}};
}
