import * as T from './art-v0120/vendor/three/three.module.js';
const maps=new Map();let pending;
export function preloadAccessoryMaterialsV11(){
  return pending??=new T.TextureLoader().loadAsync('/art-v0130/materials/visitor-accessories-v11.png').then(atlas=>{
    for(const[name,x,y]of[['leather',0,0],['smooth',1,0],['canvas',0,1],['knit',1,1]]){
      const c=document.createElement('canvas');c.width=c.height=512;
      c.getContext('2d').drawImage(atlas.image,x*atlas.image.width/2,y*atlas.image.height/2,atlas.image.width/2,atlas.image.height/2,0,0,512,512);
      const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);maps.set(name,t);
    }
    atlas.dispose();
  }).catch(error=>{pending=null;throw error;});
}
export function accessoryMaterialsV11(){
  if(maps.size!==4)throw Error('Accessory material atlas is not ready');
  const owned=new Set(),cache=new Map();
  return {get(kind,color,metalness=0,roughness=.83){
    const key=[kind,color,metalness,roughness].join(':');if(cache.has(key))return cache.get(key);
    const map=maps.get(kind);const m=new T.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='knit'?.0016:.0007,roughness,metalness});owned.add(m);cache.set(key,m);return m;
  },lens(){const m=new T.MeshPhysicalMaterial({color:'#d4edf1',transparent:true,opacity:.13,roughness:.08,metalness:0,clearcoat:1,depthWrite:false,side:T.DoubleSide});owned.add(m);return m;},dispose(){for(const m of owned)m.dispose();}};
}
