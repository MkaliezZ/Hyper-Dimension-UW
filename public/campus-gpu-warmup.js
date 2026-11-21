// Every WebGL context owns its texture uploads and shader programs. A texture
// shown in the wardrobe is not yet ready in the separate campus renderer.
export function createCampusGpuWarmup(renderer, nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve))){
  const uploaded=new WeakMap();
  return async function warm(root,camera,scene,isCurrent=()=>true){
    await root.userData?.materialReady;
    const textures=new Set();
    root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);});
    let count=0;
    for(const texture of textures){
      if(!isCurrent())return null;
      if(uploaded.get(texture)===texture.version)continue;
      renderer.initTexture(texture);uploaded.set(texture,texture.version);count++;
      // Split large PBR uploads across loading frames, before the actor can move.
      await nextFrame();
    }
    if(!isCurrent())return null;
    await renderer.compileAsync(root,camera,scene);
    return isCurrent()?{textures:count,compiled:true}:null;
  };
}

// A tiny offscreen draw also uploads vertex, skin and bone buffers. Compiling
// a skinned actor's materials alone leaves that work until its first walk-by.
export async function drawWarmActors(T,renderer,scene,actors,nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve)),{reveal,batchSize=1}={}){
  const target=new T.WebGLRenderTarget(8,8,{depthBuffer:true}),priorTarget=renderer.getRenderTarget(),priorShadow=renderer.shadowMap.needsUpdate;
  const camera=new T.PerspectiveCamera(40,1,.1,10),layers=new Map(),actorEntries=new Set(actors);camera.layers.set(31);
  const enable=o=>{if(!layers.has(o))layers.set(o,o.layers.mask);o.layers.enable(31);};
  scene.traverse(o=>{if(o.isLight)enable(o);});
  try{
    renderer.shadowMap.needsUpdate=false;
    const size=Math.max(1,Math.min(8,Math.floor(batchSize)||1));
    for(let offset=0;offset<actors.length;offset+=size){
      const batch=actors.slice(offset,offset+size),actor=batch[0],meshes=[],frusta=new Map(),seen=new Set();
      const collect=o=>{if(!o.isMesh||seen.has(o))return;seen.add(o);enable(o);meshes.push(o);frusta.set(o,o.frustumCulled);o.frustumCulled=false;};
      // Building callers already pass a flat mesh list. Traversing a wall here
      // also visits its repaired roof, then a second roof list item would restore
      // that same layer twice (the second restore used a deleted saved value).
      // Group actors still include their meshes; each mesh is restored once.
      for(const item of batch)item.traverse(o=>{if(o===item||!actorEntries.has(o))collect(o);});
      const p=actor.position;camera.position.set(p.x,p.y+.9,p.z+3);camera.lookAt(p.x,p.y+.85,p.z);camera.updateMatrixWorld();
      const visible=reveal?.visible;
      try{if(reveal)reveal.visible=true;renderer.setRenderTarget(target);renderer.render(scene,camera);}
      finally{if(reveal)reveal.visible=visible;renderer.setRenderTarget(priorTarget);for(const mesh of meshes){mesh.layers.mask=layers.get(mesh);layers.delete(mesh);mesh.frustumCulled=frusta.get(mesh);}}
      await nextFrame();
    }
  }finally{
    renderer.setRenderTarget(priorTarget);renderer.shadowMap.needsUpdate=priorShadow;
    for(const [object,mask]of layers)object.layers.mask=mask;
    target.dispose();
  }
}
