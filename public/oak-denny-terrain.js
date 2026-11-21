import {terrainPatchGeometry} from './terrain-surface.js';

function makeNorthTerrain(T,data,native,ref,grass){
  const {width,height,heights,bounds}=data, [west,north,east,south]=bounds;
  const positions=[],uv=[],indices=[];
  for(let j=0;j<height;j++){
    for(let i=0;i<width;i++){
      const x=west+i/(width-1)*(east-west),z=north+j/(height-1)*(south-north);
      const at=j*width+i;
      positions.push(x,heights[at],z);
      uv.push(x/5,z/5);
      if(i&&j)indices.push(at-width-1,at-1,at-width,at-width,at-1,at);
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setIndex(indices);
  g.computeVertexNormals();
  const n=g.getAttribute('normal');
  const original=ref.getAttribute('normal'),a=new T.Vector3(),b=new T.Vector3();
  const dx=(native.bounds[2]-native.bounds[0])/(native.width-1);
  for(let i=0;i<width;i++){
    const fx=(positions[(width*(height-1)+i)*3]-native.bounds[0])/dx;
    const column=Math.floor(fx);
    a.fromBufferAttribute(original,column);
    b.fromBufferAttribute(original,column+1);
    a.lerp(b,fx-column).normalize();
    n.setXYZ(width*(height-1)+i,a.x,a.y,a.z);
  }
  const mesh=new T.Mesh(g,grass);
  mesh.name='Oak Hall north terrain';
  mesh.receiveShadow=true;
  return mesh;
}


function siteMap(T,site){
  const mapCanvas=document.createElement('canvas');
  const [x0,z0,x1,z1]=site.terrain.bounds;
  mapCanvas.width=Math.ceil((x1-x0)*8);
  mapCanvas.height=Math.ceil((z1-z0)*8);
  const paint=mapCanvas.getContext('2d');
  const scaleX=mapCanvas.width/(x1-x0),scaleZ=mapCanvas.height/(z1-z0);
  paint.setTransform(scaleX,0,0,scaleZ,-x0*scaleX,-z0*scaleZ);
  const colors=new Map([
    ['turf-edge','#8b8976'],
    ['field-turf','#42694d'],
    ['perimeter-mark','#d4ddd1'],
    ['concrete-walk','#a7a59b'],
    ['paved-court','#8d7970'],
  ]);
  for(const [role,fill] of colors){
    paint.fillStyle=fill;
    paint.beginPath();
    for(const layer of site.zones.filter(z=>z.terrain==='north'&&z.role===role)){
      for(const [a,b,c]of layer.triangulated){
        paint.moveTo(...a);paint.lineTo(...b);paint.lineTo(...c);paint.closePath();
      }
    }
    // Paint the complete path once so a shared interior triangulation edge stays opaque.
    paint.fill('nonzero');
  }
  const next=new T.CanvasTexture(mapCanvas);
  next.flipY=false;
  next.colorSpace=T.SRGBColorSpace;
  next.anisotropy=4;
  return {next,extent:new T.Vector4(x0,z0,x1-x0,z1-z0)};
}

function groundMaterial(T,grass,ready,site){
  const {next,extent}=siteMap(T,site);
  const material=grass.clone();
  material.name='Denny Field and north campus paving';
  material.onBeforeCompile=shader=>{
    shader.uniforms.oakSiteMap={value:next};
    shader.uniforms.oakSiteExtent={value:extent};
    shader.vertexShader='varying vec2 vOakSiteXZ;\n'+shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvOakSiteXZ=position.xz;'
    );
    shader.fragmentShader='varying vec2 vOakSiteXZ;\nuniform sampler2D oakSiteMap;\nuniform vec4 oakSiteExtent;\n'+shader.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\nvec2 oakUV=(vOakSiteXZ-oakSiteExtent.xy)/oakSiteExtent.zw;\n'+
      'vec4 oakSurface=texture2D(oakSiteMap,oakUV);\n'+
      'float grain=sin(vOakSiteXZ.x*27.6+cos(vOakSiteXZ.y*38.5))*0.014;\n'+
      'diffuseColor.rgb=mix(diffuseColor.rgb,oakSurface.rgb*(1.0+grain),oakSurface.a);'
    );
  };
  material.customProgramCacheKey=()=>'oak-denny-terrain';
  ready.then(()=>{
    material.map=grass.map;
    material.color.copy(grass.color);
    material.needsUpdate=true;
  });
  return {material,overlayMap:next};
}

export function mountOakDennySite(T,campus,baseGeometry,baseGrass,scene,site,grassReady){
  if(campus.geometryHash!==site.geometryHash ||
     !site.originalCampusBounds.every((v,i)=>v===campus.bounds[i])){
    throw Error('Oak site geometry sources differ');
  }
  const {material:surface,overlayMap}=groundMaterial(T,baseGrass,grassReady,site);
  const north=makeNorthTerrain(T,site.terrain,campus.terrain,baseGeometry,surface);
  scene.add(north);
  const campusGeometry=[];
  for(const zone of site.zones.filter(z=>z.terrain==='campus')){
    const material=new T.MeshStandardMaterial({color:'#a7a59b',name:zone.role,roughness:.96});
    const positions=[];
    for(const tri of zone.triangulated){
      const fragment=terrainPatchGeometry(T,campus.terrain,tri,zone.offset);
      positions.push(...fragment.getAttribute('position').array);
      fragment.dispose();
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,material);
    mesh.receiveShadow=true;
    scene.add(mesh);
    campusGeometry.push(mesh);
  }
  return {dispose(){overlayMap.dispose();}};
}

const siteWorld='e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d';

export async function loadOakDennySite(T,campus,baseGeometry,baseGrass,scene,grassReady,isDisposed){
  if(campus.geometryHash!==siteWorld)return null;
  const response=await fetch('/art-v0130/terrain/oak-denny-site-v1.json');
  if(!response.ok)throw Error('North Campus terrain unavailable');
  const site=await response.json();
  const terrain=site.terrain;
  if(site.schema!=='uw.oak-denny-runtime-site/v1'||!terrain||
     !Number.isInteger(terrain.width)||!Number.isInteger(terrain.height)||
     terrain.width<2||terrain.width>256||terrain.height<2||terrain.height>180||
     terrain.heights.length!==terrain.width*terrain.height||!terrain.heights.every(Number.isFinite)){
    throw Error('Invalid North Campus terrain');
  }
  if(isDisposed())return null;
  return mountOakDennySite(T,campus,baseGeometry,baseGrass,scene,site,grassReady);
}
