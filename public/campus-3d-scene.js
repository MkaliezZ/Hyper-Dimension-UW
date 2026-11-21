import {siegThurstonApproach} from './campus-sieg-entry-v1.js';
import {centralGarageEntry,cutCentralGarageTerrain} from './campus-cpg-entry-v2.js';
import {chemicalConstructionFor} from './campus-chemical-construction-v2.js';
import {retiredLawnFootprint,retiredTerrainFootprints,reviewedCanopyPlaces,REVIEWED_CANOPY_SITES} from './campus-canopy-sites-v1.js';
import {hubWestYard,addHubWestYard,brickMaterial} from './campus-hub-yard-v1.js';
import {campusBikeHouse} from './campus-bike-houses.js';
import {createHaggettSite,mountHaggettSite} from './campus-haggett-site.js';
import {fosterSite,fosterTerrainGeometry,keepTerrainOutsideFoster,fosterLandingGeometry} from './campus-foster-site-v4.js';
import {engineeringEntry,engineeringEntryGeometry,removeForecourtTerrain} from './campus-engineering-entry-v1.js';
import {addEngineeringLanterns} from './campus-engineering-lanterns-v1.js';
import {kirstenApproach} from './campus-kirsten-approach-v1.js';
import {bagleySite,bagleyPavingGeometry} from './bag-entry-site-v95.js';
import {physicsPlaza,physicsPlazaGeometry} from './campus-pab-plaza-v57.js';
import {guthrieCampusSite} from './guthrie-campus-site-v147.js';
import {intellectualApproach,intellectualApproachGeometry} from './intellectual-approach-runtime-v53.js';
import {installKincaidTerrain} from './campus-site-kin-terrain.js';
import {installPadelfordBridge} from './campus-site-pdl-bridge-v26.js';
import {mcmWestGeometry} from './mcm-west-site-v56.js';
import {loadOakDennySite} from './oak-denny-terrain.js';
import {guaApproachPath} from './campus-site-gua-apron.js';
import {createCampusShadowCache} from './campus-shadow-cache.js';
import {animateCampusVisitor} from './campus-locomotion.js';
import {createVisitorFacing} from './campus-visitor-facing.js';
import {createCampusGpuWarmup,drawWarmActors} from './campus-gpu-warmup.js';
import {sampleNpcPatrol} from './campus-npc-motion.js';
import * as T from './art-v0120/vendor/three/three.module.js';
import {OrbitControls} from './art-v0120/vendor/three/addons/controls/OrbitControls.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './art-v0120/vendor/three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from './art-v0120/vendor/three/addons/utils/BufferGeometryUtils.js';
import {terrainHeight,terrainPatchGeometry} from './terrain-surface.js';
import {campusPlaces} from './campus-places.js';
import {loadCampusPerimeterGround} from './campus-perimeter-ground.js';
import {campusLandscape} from './campus-landscape.js';
import {RED_BOUNDARY,FOUNTAIN} from './campus-layout.js';
import {RED_TOWERS,RED_OBELISK,RED_SEATING} from './red-square-layout.js';
import {addRedSquareTowers} from './red-square-towers.js';
import {buildChibiVisitor} from './campus-avatar-3d.js';
import {preloadAvatarTextures} from './campus-avatar-materials.js';
import {buildCampusVisitor,preloadPremiumAvatar} from './campus-avatar-renderer.js';
import {buildCampusNpc,preloadCampusNpcAvatars} from './campus-npc-avatars.js';
import {addCampusTrees} from './campus-trees-3d.js';
import {BUILDING_ASSETS,inDetailedBuildingWing} from './campus-building-assets.js';
import {labelAwayFromAvatar} from './avatar-view.js';
import {createBuildingStream} from './campus-building-stream.js';
import {pickVisibleBuildingHit} from './campus-building-shape.js';
import {createCampusCameraClearance} from './campus-camera-clearance.js';
import {sitePavingForCampus} from './campus-building-access.js';

export function createCampus3DScene({canvas,campus,onSelect,onPan,onInspect,onNpcSelect}){
  const chemicalSite=chemicalConstructionFor(campus,0);
  const cpg=centralGarageEntry(campus);
  const openLawnId=retiredLawnFootprint(campus);
  const retiredTerrainIds=retiredTerrainFootprints(campus);
  const canopyPlaceOverrides=reviewedCanopyPlaces(campus);
  const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;const shadowCache=createCampusShadowCache(renderer);
  const scene=new T.Scene();scene.background=new T.Color('#c8e1eb');scene.fog=new T.Fog('#c8e1eb',800,2100);
  const camera=new T.PerspectiveCamera(43,1,.15,4000),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=6;controls.maxDistance=1600;controls.maxPolarAngle=Math.PI*.465;controls.minPolarAngle=.12;
  scene.add(new T.HemisphereLight(0xe6f0ff,0x879070,2));const sun=new T.DirectionalLight(0xffebca,2.7);sun.position.set(-180,420,-160);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-140,right:140,top:140,bottom:-140,near:1,far:950});sun.shadow.normalBias=.14;sun.shadow.bias=-.00005;scene.add(sun,sun.target);
  const engineering=engineeringEntry(campus),kirsten=kirstenApproach(campus),sieg=siegThurstonApproach(campus);
  const foster=fosterSite(campus),haggett=createHaggettSite(campus),hubYard=hubWestYard(campus);
  const height=(x,z)=>sieg?.floor(x,z)??foster?.ground(x,z)??terrainHeight(campus.terrain,x,z),places=new Map(campusPlaces(campus).map(p=>[p.id,p])),buildings=new Map(),labels=new Map(),pickables=[],npcModels=new Map(),waterParts=[],disposables=[];
  let buildingStream;
  const cameraClearance=createCampusCameraClearance(campus,()=>buildingStream?.placements||new Map());
  let npcReceivedAt=0,interactingNpc=null,lastFrameTime=0,lastDiagnostics=0;const frameTimes=[],drawTimes=[];let frameSession={frames:0,maxFrame:0,maxDraw:0,over33ms:0};const slowFrames=[];const followDesired=new T.Vector3(),followDelta=new T.Vector3();
  let selected,visitor,profile,skins,npcState,disposed=false,lastLabels=0,lastMini=0,dragStart,loadingError=false,actorsLoaded=false;
  let viewportWidth=1,viewportHeight=1;const compass=document.querySelector('.map-compass b');
  const ray=new T.Raycaster(),mouse=new T.Vector2(),loader=new GLTFLoader(),visitorGroup=new T.Group();scene.add(visitorGroup);
  const visitorFacing=createVisitorFacing();let facingTarget=0;
  const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=64;const contactCtx=contactCanvas.getContext('2d'),contactGradient=contactCtx.createRadialGradient(32,32,3,32,32,32);contactGradient.addColorStop(0,'rgba(25,24,29,.27)');contactGradient.addColorStop(.45,'rgba(25,24,29,.15)');contactGradient.addColorStop(1,'rgba(25,24,29,0)');contactCtx.fillStyle=contactGradient;contactCtx.fillRect(0,0,64,64);const contactTexture=new T.CanvasTexture(contactCanvas),contactGeometry=new T.PlaneGeometry(1,1),contactMaterial=new T.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});disposables.push(contactTexture);const contactShadows=new Map();
  function contactShadow(id){if(!contactShadows.has(id)){const m=new T.Mesh(contactGeometry,contactMaterial);m.rotation.x=-Math.PI/2;m.scale.set(.85,.62,1);m.renderOrder=2;scene.add(m);contactShadows.set(id,m);}return contactShadows.get(id);}

  const floor=new T.Mesh(new T.PlaneGeometry(10000,10000),new T.MeshStandardMaterial({color:'#9dab81',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-35;scene.add(floor);
  function mesh(geometry,material,parent=scene,data){const m=new T.Mesh(geometry,material);m.receiveShadow=true;m.castShadow=true;parent.add(m);if(data){m.userData.surface=data;pickables.push(m);}return m;}
  const mats={stone:new T.MeshStandardMaterial({color:'#d0b99b',roughness:.88,side:T.DoubleSide}),brick:new T.MeshStandardMaterial({color:'#be8b71',roughness:.9,side:T.DoubleSide}),slate:new T.MeshStandardMaterial({color:'#74877a',roughness:.85,side:T.DoubleSide}),copper:new T.MeshStandardMaterial({color:'#62877c',metalness:.3,roughness:.62}),path:new T.MeshStandardMaterial({color:'#d7cbb6',roughness:.94,side:T.DoubleSide}),road:new T.MeshStandardMaterial({color:'#9d9f95',roughness:.95,side:T.DoubleSide}),grass:new T.MeshStandardMaterial({color:'#a5b887',roughness:1,side:T.DoubleSide}),glass:new T.MeshStandardMaterial({color:'#455d66',metalness:.15,roughness:.28}),wood:new T.MeshStandardMaterial({color:'#8e6549',roughness:.88}),iron:new T.MeshStandardMaterial({color:'#4c5857',metalness:.65,roughness:.4})};
  const imageReady=new T.TextureLoader().loadAsync('/art-v0120/materials/campus-materials.png').then(atlas=>{for(const [key,x,y] of [['brick',0,0],['stone',1,0],['slate',0,1],['grass',1,1]]){
    const tile=document.createElement('canvas');tile.width=tile.height=1024;tile.getContext('2d').drawImage(atlas.image,x*atlas.image.width/2,y*atlas.image.height/2,atlas.image.width/2,atlas.image.height/2,0,0,1024,1024);const texture=new T.CanvasTexture(tile);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());mats[key].map=texture;mats[key].color.set('#ffffff');mats[key].needsUpdate=true;disposables.push(texture);
  }atlas.dispose();canvas.dataset.texturesReady='true';});
  function patch(points,mat,offset=.1,data){const g=terrainPatchGeometry(T,campus.terrain,points,offset),p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/3,p.getZ(i)/3);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return mesh(g,mat,scene,data);}
  const t=campus.terrain,[x0,z0,x1,z1]=t.bounds,v=[],uv=[],ix=[];for(let j=0;j<t.height;j++)for(let i=0;i<t.width;i++){const x=x0+i/(t.width-1)*(x1-x0),z=z0+j/(t.height-1)*(z1-z0);v.push(x,t.heights[j*t.width+i],z);uv.push(x/5,z/5);if(i&&j){const n=j*t.width+i;ix.push(n-t.width-1,n-1,n-t.width,n-t.width,n-1,n);}}
  const terrain=new T.BufferGeometry();terrain.setAttribute('position',new T.Float32BufferAttribute(v,3));terrain.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const kincaidSite=installKincaidTerrain(T,campus,{scene,mesh,grass:mats.grass,
    terrain,positions:v,uvs:uv,indices:ix,disposables});
  if(!kincaidSite){terrain.setIndex(ix);terrain.computeVertexNormals();mesh(terrain,mats.grass).castShadow=false;}
  if(foster){
    terrain.setIndex(keepTerrainOutsideFoster(foster,terrain.index.array,t.width));
    terrain.computeVertexNormals();
    const measured=mesh(fosterTerrainGeometry(T,foster),mats.grass);
    measured.name='Foster measured site soil';measured.castShadow=false;
    const apron=mesh(fosterLandingGeometry(T,foster),mats.path);
    apron.name='Executive Education Center lower landing';apron.castShadow=false;
    const walk=mesh(terrainPatchGeometry(T,foster.terrain,foster.sidewalk,foster.sidewalkRise),mats.path);
    walk.name='Foster surveyed lower sidewalk';walk.castShadow=false;
  }
let kirstenPavingReady;
if(kirsten){
  terrain.setIndex(removeForecourtTerrain(terrain.index.array,kirsten.terrainCut));
  terrain.computeVertexNormals();
  const remainder=mesh(engineeringEntryGeometry(T,kirsten.terrainRemainders,false,5),mats.grass);
  remainder.name='Kirsten Wind Tunnel retained soil';remainder.castShadow=false;
  const asphalt=new T.MeshStandardMaterial({color:'#b7b4b0',roughness:.98,side:T.DoubleSide});
  kirstenPavingReady=new T.TextureLoader().loadAsync('/art-v0130/materials/kane-gravel-v2.png').then(map=>{
    map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    asphalt.map=map;
    asphalt.needsUpdate=true;
    disposables.push(map);
  });
  const paving=mesh(engineeringEntryGeometry(T,kirsten.surface,false,1.65),asphalt);
  paving.name='Kirsten Wind Tunnel surveyed entry pavement';paving.castShadow=false;
  const plinth=mesh(engineeringEntryGeometry(T,kirsten.southPlinth,true),mats.stone);
  plinth.name='Kirsten Wind Tunnel south plinth';
}
let siegFinishReady;
if(sieg){
  terrain.setIndex(removeForecourtTerrain(terrain.index.array,sieg.terrainCut));
  terrain.computeVertexNormals();
  const siteGround=mesh(engineeringEntryGeometry(T,[...sieg.terrainRemainders,...sieg.soil],false,5),mats.grass);
  siteGround.name='Sieg Thurston Lane ground tie';
  siteGround.castShadow=false;
  const aggregate=new T.MeshStandardMaterial({roughness:.96});
  siegFinishReady=new T.TextureLoader().loadAsync('/art-v0130/materials/sieg-exposed-aggregate-v1.jpg').then(map=>{
    map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    aggregate.map=map;
    aggregate.needsUpdate=true;
    disposables.push(map);
  });
  const entrance=mesh(engineeringEntryGeometry(T,sieg.surface,false,1.76),aggregate);
  entrance.name='Sieg Thurston Lane entrance pavement';
  entrance.castShadow=false;
}
if(engineering?.forecourt){
  const paving=engineering.forecourt;
  terrain.setIndex(removeForecourtTerrain(terrain.index.array,paving.removedTerrainTriangles));
  terrain.computeVertexNormals();
  const untouched=mesh(engineeringEntryGeometry(T,paving.retainedTerrain,false,5),mats.grass);
  untouched.name='Engineering Library preserved surround';
  untouched.castShadow=false;
}
const strip={"x":[341.49,342.49,343.49,344.49,345.49,346.49,347.49,348.49,349.49,350.49,351.49,352.49,353.49,354.49,355.49,356.49,357.49,358.49,359.49,360.49,361.49,362.49],"z":[-269.7990076335878,-268.8015521628499,-267.80409669211195,-266.80664122137404,-265.8091857506361,-264.8117302798982,-263.8142748091603,-262.81681933842236,-261.81936386768444,-260.8219083969466,-259.82445292620866,-258.82699745547075,-257.8295419847328,-256.8320865139949,-255.834631043257,-254.83717557251907,-253.83972010178115,-252.84226463104324,-251.84480916030532,-250.8473536895674,-249.8498982188295,-248.8524427480916,-247.85498727735367,-246.85753180661578,-245.86007633587786,-244.86262086513995,-243.86516539440203,-242.8677099236641,-241.8702544529262,-240.87279898218827,-239.87534351145035,-238.87788804071243,-237.88043256997454,-236.88297709923663,-235.8855216284987,-234.88806615776082,-233.8906106870229,-232.89315521628498,-231.89569974554706,-230.89824427480914,-229.90078880407125,-228.90333333333334,-227.90587786259542,-226.9084223918575,-225.91096692111958,-224.9135114503817,-223.91605597964377,-222.91860050890585,-221.92114503816794,-220.92368956743002,-219.9262340966921,-218.92877862595418,-217.9313231552163,-216.93386768447837,-215.93641221374045,-214.93895674300254,-213.94150127226462,-212.94404580152673,-211.9465903307888,-210.9491348600509,-209.95167938931297,-208.95422391857505,-207.95676844783713,-206.95931297709922,-205.96185750636133,-204.9644020356234,-203.9669465648855,-202.96949109414757,-201.97203562340965,-200.97458015267176,-199.97712468193384,-198.97966921119593,-197.982213740458,-196.9847582697201,-195.98730279898217,-194.98984732824425,-193.99239185750636,-192.99493638676844,-191.99748091603053,-191.0000254452926,-190.0025699745547,-189.0051145038168,-188.00765903307888,-187.01020356234096,-186.01274809160304],"h":[24.65,24.40182,24.19158,24.03452,23.92302,23.83587,23.76593,23.70289,23.63079,23.55639,23.49588,23.4416,23.38739,23.32117,23.2369,23.1851,23.21838,23.28298,23.33035,23.37191,23.40017,23.40478,24.74833,24.46788,24.24727,24.07713,23.93783,23.81807,23.71882,23.6405,23.56485,23.49265,23.43074,23.3741,23.31546,23.2432,23.15885,23.09263,23.11011,23.18272,23.23749,23.27238,23.29428,23.29704,24.84667,24.62471,24.47382,24.34078,24.17426,23.961,23.75262,23.60918,23.51433,23.43598,23.36763,23.3063,23.23865,23.16565,23.08715,23.00327,22.99532,23.06335,23.1173,23.15212,23.17498,23.17067,24.945,24.86906,24.82648,24.77077,24.61692,24.27985,23.88967,23.63379,23.48562,23.38722,23.315,23.24616,23.17089,23.09442,23.01019,22.91586,22.8888,22.94485,22.99462,23.03377,23.07406,23.07724,25.04333,25.05279,25.05848,25.04564,24.93009,24.58507,24.11974,23.75725,23.50925,23.34759,23.25566,23.18324,23.10579,23.01892,22.92266,22.82949,22.78949,22.82196,22.85895,22.88803,22.92916,22.94937,25.14167,25.20342,25.22809,25.21436,25.11653,24.83711,24.40789,23.96865,23.59307,23.33202,23.19605,23.11763,23.03205,22.93936,22.8465,22.75702,22.69915,22.71338,22.75396,22.77275,22.79686,22.81111,25.24,25.33929,25.38074,25.37276,25.29534,25.04449,24.62659,24.16688,23.71859,23.35289,23.14632,23.04954,22.9609,22.86469,22.76906,22.67574,22.60106,22.59611,22.64233,22.66994,22.6896,22.70132,25.3,25.45436,25.52852,25.53892,25.46739,25.21986,24.8128,24.3622,23.88629,23.42772,23.12331,22.98593,22.89909,22.80749,22.7028,22.59614,22.50211,22.46683,22.51015,22.55616,22.57916,22.58627,25.36,25.5581,25.67134,25.70656,25.63329,25.39789,25.02015,24.57779,24.07086,23.52392,23.11607,22.92763,22.8365,22.74738,22.64592,22.53746,22.42215,22.35763,22.3965,22.44971,22.45577,22.43046,25.42,25.63845,25.79416,25.85131,25.77561,25.57499,25.24698,24.81544,24.28774,23.65461,23.12914,22.88176,22.78699,22.7031,22.60222,22.49075,22.36507,22.27445,22.29955,22.35937,22.34897,22.29379,25.48,25.73415,25.92087,25.98811,25.91159,25.7259,25.45074,25.07096,24.55858,23.85601,23.19315,22.85424,22.74192,22.66661,22.56515,22.44732,22.31461,22.2,22.20073,22.26306,22.25022,22.18147,25.54,25.84641,26.05973,26.14126,26.07549,25.87595,25.60644,25.25366,24.74403,24.02844,23.28659,22.83796,22.67652,22.6022,22.51586,22.40552,22.27623,22.15057,22.10939,22.14757,22.14355,22.07213,25.6,25.92954,26.15302,26.24968,26.20887,26.0174,25.73026,25.37955,24.89441,24.17977,23.38652,22.85494,22.63484,22.54269,22.4618,22.36288,22.24687,22.12303,22.02573,22.00135,22.00935,21.96729,25.575,25.93945,26.17889,26.2994,26.29341,26.13982,25.83987,25.43813,24.96741,24.31082,23.52158,22.92407,22.63225,22.51038,22.41657,22.31699,22.21586,22.09691,21.96661,21.87628,21.86045,21.8462,25.55,25.9213,26.1582,26.28756,26.30881,26.19849,25.90211,25.47187,25.02188,24.44362,23.67921,22.9954,22.61673,22.47039,22.3772,22.2729,22.16835,22.05216,21.92064,21.78861,21.70818,21.69162,25.525,25.84737,26.06895,26.19223,26.21788,26.15086,25.9233,25.54129,25.11801,24.58678,23.84377,23.08797,22.6165,22.43332,22.34283,22.23432,22.11851,22.00747,21.88605,21.7353,21.59186,21.5334,25.5,25.79408,26.00206,26.11794,26.12084,26.02584,25.83815,25.53923,25.16243,24.68216,23.99964,23.22079,22.64466,22.39108,22.29399,22.19118,22.07611,21.97127,21.85191,21.70233,21.55292,21.43763,25.475,25.77354,25.98178,26.07048,25.99743,25.83336,25.65959,25.44606,25.15472,24.73973,24.1133,23.33921,22.68734,22.35824,22.24268,22.15347,22.05376,21.94528,21.82115,21.68399,21.54911,21.41146,25.45,25.74055,25.93957,26.01682,25.91465,25.70728,25.50278,25.30141,25.08093,24.75082,24.19059,23.44919,22.75007,22.34825,22.20425,22.11488,22.02159,21.91427,21.79313,21.66068,21.52542,21.39123,25.46833,25.7299,25.90245,25.9678,25.86537,25.65606,25.44125,25.22594,25.0186,24.73558,24.21574,23.51698,22.81812,22.34237,22.14921,22.06019,21.97353,21.87171,21.75832,21.63513,21.50923,21.37923,25.48667,25.72502,25.87123,25.92329,25.82012,25.61272,25.39759,25.183,25.00035,24.77575,24.28922,23.57479,22.861,22.34543,22.10324,22.00926,21.93384,21.84157,21.73975,21.62619,21.50737,21.3765,25.505,25.72526,25.8427,25.87842,25.77394,25.56911,25.35407,25.14498,25.00277,24.82886,24.38497,23.68409,22.95061,22.38724,22.0852,21.97181,21.90332,21.81868,21.71813,21.60747,21.4916,21.37004,25.52333,25.73427,25.8194,25.83379,25.72661,25.5248,25.31013,25.11734,25.0251,24.88296,24.47208,23.81429,23.10382,22.51073,22.1089,21.93379,21.86654,21.79071,21.68994,21.57823,21.46438,21.35019,25.54167,25.74467,25.79999,25.7886,25.6767,25.47758,25.2644,25.10684,25.06911,24.93562,24.54613,23.94033,23.26152,22.675,22.19303,21.92056,21.83198,21.7627,21.665,21.55448,21.44239,21.32469,25.56,25.73855,25.78115,25.74768,25.63135,25.43515,25.22873,25.12083,25.12987,24.98467,24.60276,24.04803,23.39847,22.82402,22.30975,21.94346,21.79451,21.71664,21.62506,21.52468,21.42036,21.30446,25.585,25.70369,25.75078,25.70436,25.5844,25.3914,25.20379,25.15745,25.20003,25.03102,24.64717,24.13951,23.52621,22.95539,22.44017,22.00928,21.77656,21.67634,21.5877,21.48952,21.38711,21.27724,25.61,25.63922,25.69357,25.65516,25.53509,25.34748,25.19739,25.21642,25.26942,25.07214,24.68493,24.21704,23.64704,23.08493,22.57602,22.10988,21.78719,21.63579,21.5475,21.44937,21.34311,21.2364,25.635,25.57384,25.61043,25.59912,25.4852,25.30968,25.2172,25.29844,25.34185,25.11385,24.72005,24.28358,23.76513,23.23067,22.7482,22.25488,21.8215,21.59809,21.50248,21.41003,21.31037,21.20483,25.66,25.52449,25.52351,25.53491,25.43834,25.28909,25.26012,25.3842,25.40809,25.15238,24.75191,24.33128,23.85839,23.37082,22.91118,22.40655,21.91266,21.60435,21.46272,21.37194,21.27532,21.16485,25.685,25.48797,25.44306,25.45942,25.3929,25.28886,25.324,25.47032,25.46812,25.18822,24.78456,24.36818,23.91447,23.4387,22.96135,22.46553,21.98913,21.63827,21.4477,21.34356,21.24297,21.13033,25.71,25.45833,25.36682,25.37542,25.34755,25.31298,25.40917,25.56036,25.52797,25.22724,24.82155,24.38225,23.88529,23.37909,22.90847,22.45127,22.02401,21.6854,21.45632,21.32429,21.22439,21.11062,25.69167,25.43606,25.31124,25.30541,25.31766,25.36307,25.50604,25.655,25.59804,25.28129,24.85213,24.34906,23.81301,23.32026,22.8774,22.45484,22.07525,21.77201,21.51313,21.33252,21.2198,21.10684,25.67333,25.45921,25.30182,25.26173,25.30766,25.4275,25.61417,25.75937,25.67311,25.30743,24.81853,24.30468,23.80824,23.34976,22.8915,22.45495,22.11264,21.85132,21.59308,21.36953,21.22466,21.1099,25.655,25.48023,25.32064,25.24199,25.28725,25.45042,25.69186,25.83492,25.68366,25.2521,24.74902,24.30746,23.88434,23.42809,22.92862,22.47204,22.14723,21.92789,21.71693,21.46306,21.24773,21.10521,25.63667,25.46644,25.32075,25.21926,25.22246,25.38803,25.66854,25.80068,25.60729,25.1899,24.73237,24.35584,23.98003,23.49427,22.96599,22.52199,22.19271,21.97847,21.8135,21.5682,21.30359,21.12304,25.61833,25.44685,25.30656,25.17709,25.1225,25.24902,25.51115,25.66124,25.50236,25.12372,24.70044,24.3359,23.97957,23.51157,23.0032,22.57782,22.24431,22.0267,21.87617,21.66782,21.39256,21.1602,25.6,25.43743,25.30382,25.14896,24.97735,25.01478,25.26548,25.46663,25.39289,25.04663,24.6336,24.24522,23.88737,23.48445,23.03969,22.6466,22.3185,22.07089,21.90239,21.73541,21.47074,21.19104,25.60167,25.43999,25.30711,25.14645,24.85124,24.70855,24.94921,25.245,25.26389,24.99461,24.61088,24.203,23.82682,23.47149,23.09471,22.72319,22.38652,22.11154,21.91628,21.76837,21.51803,21.2126,25.60333,25.44241,25.31026,25.1536,24.82886,24.45073,24.49722,24.90879,25.12835,24.98601,24.64189,24.22195,23.81585,23.46777,23.13644,22.79066,22.44695,22.15514,21.94231,21.77334,21.50423,21.19226,25.605,25.4448,25.31318,25.16051,24.84371,24.37254,24.08938,24.37261,24.86295,24.91726,24.57405,24.12955,23.75046,23.4397,23.13091,22.81172,22.48761,22.18421,21.9267,21.68207,21.39826,21.14363,25.60667,25.44713,25.316,25.16711,24.8585,24.37944,23.90229,23.82656,24.26541,24.43564,24.05924,23.60399,23.31857,23.14694,22.90878,22.63662,22.36528,22.08784,21.8247,21.5546,21.30941,21.12513,25.60833,25.44952,25.31892,25.17383,24.87352,24.39862,23.86829,23.46936,23.51834,23.51679,23.1381,22.79476,22.60982,22.50762,22.35463,22.18776,22.02551,21.83922,21.64549,21.4508,21.27068,21.1099,25.61,25.45195,25.32192,25.18067,24.88893,24.41797,23.88709,23.36634,23.0176,22.72687,22.41222,22.22848,22.12069,22.02807,21.93142,21.83244,21.74068,21.64213,21.52953,21.40956,21.26923,21.10853,25.61333,25.45521,25.32519,25.18722,24.90366,24.43658,23.90576,23.37703,22.85288,22.44171,22.24228,22.15315,22.06857,21.98063,21.89154,21.79538,21.70202,21.61269,21.51886,21.41217,21.27612,21.11115,25.61667,25.45843,25.32843,25.19358,24.91792,24.45464,23.92345,23.39833,22.86301,22.42979,22.2329,22.15784,22.07578,21.98199,21.8934,21.80679,21.71771,21.62928,21.53225,21.41943,21.27759,21.10527,25.62,25.4617,25.33174,25.20004,24.93187,24.47259,23.94225,23.41788,22.89328,22.46609,22.25653,22.16782,22.08116,21.98867,21.8988,21.81298,21.72552,21.62687,21.52171,21.41822,21.28583,21.11768,25.62333,25.46503,25.33515,25.2066,24.94586,24.49086,23.96173,23.43747,22.91548,22.49086,22.27918,22.18588,22.09301,21.99844,21.90406,21.81131,21.72406,21.62165,21.51645,21.42424,21.29489,21.12427,25.62667,25.46823,25.33837,25.21268,24.95897,24.5082,23.98038,23.45655,22.93453,22.50304,22.28921,22.19959,22.10537,22.01075,21.91482,21.81835,21.72895,21.63458,21.54049,21.44503,21.3064,21.13326,25.63,25.47147,25.34163,25.21867,24.97188,24.52539,23.99889,23.4762,22.9614,22.55008,22.35822,22.29357,22.21654,22.11461,22.01163,21.91587,21.80844,21.69657,21.60509,21.49876,21.34105,21.17285,25.65,25.48415,25.34914,25.22557,24.98464,24.54283,24.01804,23.50084,23.03023,22.70848,22.56371,22.49368,22.42019,22.32231,22.21674,22.1173,21.96647,21.78767,21.66844,21.55858,21.38303,21.19869,25.67,25.49698,25.35683,25.23232,24.99717,24.5606,24.03949,23.55278,23.19752,22.99162,22.85472,22.74966,22.65484,22.55694,22.45462,22.32735,22.11534,21.88073,21.73556,21.60175,21.40555,21.21317,25.69,25.50974,25.36434,25.23854,25.00866,24.57761,24.07231,23.68072,23.46029,23.30493,23.14739,23.0224,22.90737,22.79306,22.68299,22.50932,22.24086,21.97305,21.79688,21.62991,21.42238,21.23036,25.71,25.52252,25.37189,25.24466,25.02006,24.59974,24.158,23.91212,23.7794,23.62012,23.44664,23.30091,23.17072,23.0346,22.88261,22.65119,22.34581,22.05574,21.8396,21.64155,21.43019,21.23277,25.73,25.53537,25.37955,25.25053,25.03317,24.6569,24.35916,24.23786,24.10947,23.93484,23.75539,23.59217,23.44669,23.28461,23.07064,22.79491,22.47519,22.1445,21.8626,21.62759,21.40311,21.18663,25.75,25.54826,25.38736,25.25661,25.06319,24.81806,24.69277,24.60969,24.45129,24.27247,24.09032,23.91167,23.73042,23.49715,23.21264,22.93786,22.63062,22.23305,21.84785,21.55439,21.31603,21.11031,25.77833,25.56813,25.40072,25.26805,25.13808,25.05081,25.00703,24.89457,24.71899,24.53615,24.34812,24.14778,23.90312,23.59297,23.2607,22.95122,22.62607,22.2356,21.82669,21.4823,21.23292,21.0464,25.80667,25.5992,25.42937,25.29547,25.21794,25.19579,25.15776,25.04231,24.87955,24.70834,24.52025,24.27002,23.95508,23.62548,23.2824,22.94,22.61048,22.231,21.80394,21.42891,21.17074,20.99243,25.835,25.63464,25.45803,25.32414,25.26898,25.26332,25.24991,25.1879,25.06828,24.9197,24.72414,24.39667,24.01147,23.66564,23.31136,22.97412,22.65033,22.2356,21.76708,21.37277,21.10798,20.93515,25.86333,25.64391,25.45945,25.35473,25.33688,25.33772,25.33954,25.34684,25.30765,25.20111,25.00354,24.64324,24.19584,23.75584,23.32914,22.9503,22.56759,22.14479,21.72979,21.35345,21.06949,20.89368,25.89167,25.64704,25.47852,25.40802,25.40888,25.38132,25.32935,25.35002,25.40587,25.39636,25.24801,24.87187,24.34706,23.80899,23.31466,22.90809,22.52626,22.12976,21.7287,21.35646,21.06592,20.87545,25.92,25.67419,25.5293,25.4734,25.48025,25.46422,25.3561,25.2657,25.29834,25.39419,25.34943,24.96592,24.38976,23.80813,23.28006,22.869,22.50182,22.10103,21.69832,21.33946,21.04124,20.8361,25.92667,25.71066,25.59562,25.54426,25.55293,25.57186,25.47641,25.30112,25.17798,25.18475,25.18984,24.86271,24.27331,23.70013,23.20767,22.81407,22.46964,22.099,21.71267,21.34871,21.04541,20.83869,25.93333,25.75838,25.66081,25.60524,25.61786,25.66316,25.60123,25.42387,25.24136,25.11036,24.99617,24.67636,24.13843,23.61646,23.15544,22.75992,22.45667,22.18673,21.84152,21.45257,21.11975,20.88064,25.94,25.80371,25.71353,25.66017,25.68113,25.74513,25.71822,25.55886,25.35969,25.18367,24.99535,24.64244,24.1345,23.6468,23.19135,22.77181,22.43906,22.14813,21.8159,21.46621,21.14964,20.89652,25.94667,25.84084,25.7585,25.71494,25.74639,25.81992,25.82381,25.69197,25.49,25.29201,25.06896,24.69979,24.21017,23.73817,23.27569,22.8355,22.44946,22.06635,21.69379,21.37901,21.09956,20.87343,25.95333,25.87012,25.80031,25.77336,25.81744,25.89664,25.93062,25.83383,25.63958,25.42649,25.16092,24.7647,24.28505,23.80276,23.33404,22.92889,22.51904,22.05115,21.63041,21.30173,21.03871,20.85514,25.96,25.89508,25.84036,25.83115,25.88666,25.96768,26.02254,25.96224,25.78396,25.55463,25.2517,24.84399,24.37147,23.86481,23.38464,22.99724,22.54623,22.01594,21.57539,21.24463,21.00759,20.85354,25.98833,25.93055,25.88508,25.88941,25.95243,26.0338,26.10285,26.07755,25.91664,25.65809,25.32206,24.91998,24.46084,23.95747,23.46059,23.01546,22.53163,21.99564,21.5317,21.19937,20.98833,20.85591,26.01667,25.96753,25.93366,25.95331,26.02272,26.10379,26.18003,26.18612,26.03698,25.73987,25.37012,24.96255,24.51305,24.03723,23.57118,23.10607,22.60739,22.07576,21.57191,21.20674,20.99247,20.86397,26.045,26.00493,25.9853,26.02032,26.09422,26.17509,26.25473,26.28535,26.13538,25.79561,25.39194,24.96682,24.51884,24.0688,23.63308,23.1512,22.59826,22.04684,21.55872,21.20497,21.00175,20.88501,26.07333,26.04146,26.03729,26.08649,26.16393,26.24386,26.31892,26.35216,26.20444,25.84983,25.42258,24.97417,24.49718,24.0179,23.56662,23.08677,22.54312,21.99621,21.53458,21.21902,21.02476,20.89758,26.10167,26.07859,26.09017,26.14998,26.22506,26.29144,26.34163,26.36403,26.23872,25.88938,25.43996,24.97815,24.50027,23.99741,23.49705,23.00475,22.48669,21.98659,21.5627,21.24241,21.03051,20.89764,26.13,26.11834,26.14523,26.2053,26.25563,26.28583,26.30488,26.31746,26.22484,25.91707,25.47656,25.0039,24.50921,23.97243,23.4218,22.91649,22.43459,21.97877,21.57952,21.26589,21.06507,20.94037,26.10333,26.12539,26.16515,26.20336,26.22197,26.23053,26.23891,26.25382,26.20849,25.96439,25.52061,25.00652,24.47898,23.92496,23.36918,22.87348,22.43034,22.00828,21.62276,21.32241,21.12717,20.98602,26.07667,26.10983,26.14177,26.16929,26.19011,26.20154,26.20774,26.2103,26.14958,25.90206,25.45761,24.93533,24.41102,23.89271,23.39102,22.92358,22.47616,22.06304,21.6932,21.38265,21.16118,20.99903,26.05,26.08596,26.11738,26.14956,26.17687,26.19684,26.21051,26.21107,26.10431,25.79355,25.34417,24.85403,24.35766,23.87719,23.40874,22.94765,22.49647,22.09268,21.73017,21.40843,21.1761,21.01641,26.02333,26.05586,26.07117,26.09686,26.15091,26.20403,26.23161,26.20646,26.03563,25.69561,25.26691,24.79959,24.31719,23.8539,23.41208,22.97062,22.53331,22.1348,21.76879,21.44589,21.20921,21.04803,25.99667,25.98876,25.97947,26.01621,26.09329,26.1377,26.13079,26.05928,25.87626,25.57158,25.18977,24.75344,24.28294,23.83837,23.43096,23.01365,22.59001,22.20436,21.82426,21.48321,21.25134,21.09743,25.97,25.93183,25.91162,25.94035,25.98343,25.98139,25.9297,25.82922,25.66101,25.41165,25.09365,24.69563,24.24108,23.80595,23.42928,23.05476,22.63147,22.22146,21.82243,21.48942,21.28763,21.12863,25.905,25.84823,25.81837,25.82407,25.8263,25.792,25.72056,25.60233,25.42747,25.2009,24.93681,24.5946,24.16676,23.74013,23.3754,23.02172,22.6094,22.18938,21.80739,21.51492,21.3271,21.15448,25.84,25.78127,25.71804,25.6967,25.68182,25.63148,25.53845,25.38817,25.19042,24.95929,24.6999,24.38849,24.02801,23.66674,23.30676,22.92597,22.51959,22.11338,21.75404,21.50673,21.33369,21.1639,25.775,25.73161,25.66563,25.6048,25.5359,25.45628,25.35609,25.20198,24.98956,24.74705,24.48097,24.17649,23.87686,23.55621,23.17414,22.77827,22.38204,22.0057,21.70001,21.48988,21.32418,21.17034,25.71,25.67609,25.60829,25.51023,25.4017,25.31255,25.21185,25.05564,24.83053,24.57802,24.31432,24.01143,23.70181,23.3682,22.98906,22.60412,22.23076,21.90287,21.65739,21.48663,21.33057,21.18194,25.645,25.60213,25.51801,25.41429,25.28954,25.17759,25.05361,24.88382,24.66481,24.43755,24.1937,23.87522,23.52334,23.18015,22.82819,22.45834,22.11545,21.85036,21.64891,21.49144,21.34694,21.2254,25.58,25.51718,25.42566,25.32527,25.18039,25.02698,24.88822,24.71926,24.53954,24.36072,24.10399,23.73883,23.36273,23.0326,22.69078,22.32964,22.03527,21.837,21.67513,21.52717,21.39993,21.30587],"geometryHash":"e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d","oldRowStart":15,"subdivisions":6,"podium":[8.95,-27.7,40.93,29.07]};
let eastExtension;
if(campus.geometryHash===strip.geometryHash){
  const positions=[],uv=[],indices=[];
  const cols=strip.x.length;
  for(const [j,z] of strip.z.entries())for(const [i,x] of strip.x.entries()){
    const at=j*cols+i;
    positions.push(x,strip.h[at],z);
    uv.push(x/5,z/5);
    if(i&&j)indices.push(at-cols-1,at-1,at-cols,at-cols,at-1,at);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const normals=geo.getAttribute('normal'),nativeNormals=terrain.getAttribute('normal');
  const from=new T.Vector3(),to=new T.Vector3();
  for(let j=0;j<strip.z.length;j++){
    const nativeIndex=strip.oldRowStart+Math.floor(j/strip.subdivisions);
    const alpha=(j%strip.subdivisions)/strip.subdivisions;
    from.fromBufferAttribute(nativeNormals,(nativeIndex+1)*t.width-1);
    to.fromBufferAttribute(nativeNormals,(nativeIndex+2)*t.width-1);
    from.lerp(to,alpha).normalize();
    normals.setXYZ(j*cols,from.x,from.y,from.z);
  }
  eastExtension=mesh(geo,mats.grass);
  eastExtension.castShadow=false;
  eastExtension.name='MCM registered eastern terrain';
}
  if(cpg)cutCentralGarageTerrain(T,terrain,cpg);
  const northTerrainReady=loadOakDennySite(T,campus,terrain,mats.grass,scene,imageReady,()=>disposed).then(layer=>{
    if(!layer)return;
    disposables.push(layer);
    canvas.dataset.northTerrain='oak-denny';
  });

  function ribbon(points,width,material,offset=.2){const pos=[],tex=[],idx=[];let length=0;const dense=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/3));for(let k=0;k<n;k++)dense.push(a.map((v,j)=>v+(b[j]-v)*k/n));}dense.push(points.at(-1));for(let i=0;i<dense.length;i++){const p=dense[i],a=dense[Math.max(0,i-1)],b=dense[Math.min(dense.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1,nx=-dz/len*width/2,nz=dx/len*width/2;if(i)length+=Math.hypot(p[0]-dense[i-1][0],p[2]-dense[i-1][2]);for(const s of [-1,1]){const x=p[0]+nx*s,z=p[2]+nz*s;pos.push(x,height(x,z)+offset,z);tex.push((s+1)/2,length/3);}if(i){const n=i*2;idx.push(n-2,n-1,n,n-1,n+1,n);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(tex,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,material);}
  const pdlBridge=installPadelfordBridge(T,{campus,scene,pathMaterial:mats.path});
  const intSite=intellectualApproach(campus);
  const guthrie=guthrieCampusSite(campus);
  function drawGuthriePaving(data,coords,title){
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(data.flat(),3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(coords.flat(),2));
    geo.computeVertexNormals();
    const pavement=mesh(geo,mats.path);pavement.name=title;pavement.castShadow=false;
    return pavement;
  }
  function drawGuthrieSkirt(sides,title){
    const points=sides.flat();
    return drawGuthriePaving(points,points.map(([x,y,z])=>[x/3,y/3+z/3]),title);
  }
  const pabPlaza=physicsPlaza(campus);
  const pabReady=pabPlaza ? (async()=>{
    const paving=new T.MeshStandardMaterial({color:'#ffffff',roughness:.96});
    const map=await new T.TextureLoader().loadAsync(pabPlaza.albedo);
    map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    disposables.push(map,paving);paving.map=map;
    const plaza=mesh(physicsPlazaGeometry(T,pabPlaza.measured),paving);
    plaza.name='McDermott Plaza surveyed pavers';plaza.castShadow=false;
    const stubs=mesh(physicsPlazaGeometry(T,pabPlaza.retainedSidewalks),mats.path);
    stubs.name='Physics plaza retained sidewalk connections';stubs.castShadow=false;
  })() : undefined;
  const bag=bagleySite(campus);
  if(bag){
    const apron=mesh(bagleyPavingGeometry(T,bag.apron),mats.path);
    apron.name='Bagley surveyed lower entrance paving';apron.castShadow=false;
    const sidewalk=mesh(bagleyPavingGeometry(T,bag.retained),mats.path);
    sidewalk.name='Bagley clipped sidewalk connections';sidewalk.castShadow=false;
  }
  if(haggett)mountHaggettSite(T,campus,{scene,grass:mats.grass,disposables,pickables,places},haggett);
  if(hubYard)addHubWestYard(T,campus,hubYard,{paving:mats.path,mesh,disposables});
  if(engineering){
    const clay=brickMaterial(T,disposables);clay.side=T.DoubleSide;
    const paving=mesh(engineeringEntryGeometry(T,engineering.surface,false),clay);
    paving.name='Engineering Library surveyed entrance paving';paving.castShadow=false;
    if(engineering.forecourt){
      const lower=mesh(engineeringEntryGeometry(T,engineering.forecourt.surface,false),clay);
      lower.name='Engineering Library surveyed west forecourt';lower.castShadow=false;
    }
    const returns=mesh(engineeringEntryGeometry(T,engineering.retainers,true),mats.brick);
    returns.name='Engineering Library ramp edges and stair risers';
    if(engineering.lanterns)addEngineeringLanterns(T,scene,engineering.lanterns);
  }
  let westWalkway;const pathBatches=new Map();for(const p of campus.paths){
  if(sieg&&Object.hasOwn(sieg.retainedPaths,p.id)){
    const remaining=sieg.retainedPaths[p.id];
    if(remaining.length){
      const tie=mesh(engineeringEntryGeometry(T,remaining,false,3),mats.path);
      tie.name='Sieg existing sidewalk tie '+p.id;
      tie.castShadow=false;
    }
    continue;
  }
  if(p.id===kirsten?.pathId){
    const tie=mesh(engineeringEntryGeometry(T,kirsten.sidewalkRemainder,false,3),mats.path);
    tie.name='Kirsten Wind Tunnel retained sidewalk tie';tie.castShadow=false;
    continue;
  }
  if(p.id===engineering?.pathId)continue;
  if(engineering?.forecourt&&Object.hasOwn(engineering.forecourt.retainedPaths,p.id)){
    const triangles=engineering.forecourt.retainedPaths[p.id];
    if(triangles.length){
      const connector=mesh(engineeringEntryGeometry(T,triangles,false),mats.path);
      connector.name='Engineering Library existing street tie '+p.id;connector.castShadow=false;
    }
    continue;
  }
  if(p.id===foster?.pathId||haggett?.closedPathIds.includes(p.id))continue;
   if(cpg?.drivePathIds.includes(p.id))continue;
  if(chemicalSite&&Object.hasOwn(chemicalSite.paths,p.id)){
    for(const line of chemicalSite.paths[p.id])ribbon(line,3.1,mats.path,.28).castShadow=false;
    continue;
  }
  const clipped=hubYard?.clippedInheritedPaths[p.id];
  if(clipped){
   for(const line of clipped)ribbon(line,3.1,mats.path,.28).castShadow=false;
   continue;
  }
  if(pabPlaza?.replacedPathIds.has(p.id)||bag?.excluded.has(p.id)||bag?.clipRenderPaths.has(p.id))continue;
  if(p.id===guthrie?.south.pathId){
    drawGuthriePaving(guthrie.south.geometry,guthrie.south.uv,'Guthrie south paved courtyard');
    drawGuthrieSkirt(guthrie.south.skirts,'Guthrie paving edge returns');
    continue;
  }
  if(p.id===guthrie?.east.pathId){
    drawGuthriePaving(guthrie.east.draw,guthrie.east.uv,'Guthrie east entrance apron');
    drawGuthrieSkirt(guthrie.east.skirts,'Guthrie east paving edge');
    ribbon(guthrie.east.retainedNorth,3.1,mats.path,.28);
    continue;
  }
  if(p.id===intSite?.pathId){
  const apron=mesh(intellectualApproachGeometry(T,intSite,'top'),mats.path);
  apron.name='Intellectual House entrance path';apron.castShadow=false;
  const edge=mesh(intellectualApproachGeometry(T,intSite,'edge'),mats.path);
  edge.name='Intellectual House paving edge';edge.castShadow=false;
  continue;
 }if(p.id===kincaidSite?.originalPathId)continue;const entry=mcmWestGeometry(T,campus,p.id);if(entry){westWalkway=mesh(entry,mats.path);westWalkway.name='McMahon verified local entrance paving';continue;}const mat=p.kind==='road'?mats.road:mats.path,m=(()=>{const patch=guaApproachPath(campus,p.id);
    if(pdlBridge?.pathId===p.id)return ribbon(p.points.slice(1),3.1,mat,.28);
    if(!patch)return ribbon(p.points,p.kind==='road'?7:3.1,mat,p.kind==='road'?.15:.28);
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(patch.positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(patch.uv,2));
    geometry.setIndex(Array.from({length:patch.positions.length/3},(_,i)=>i));
    geometry.computeVertexNormals();
    return mesh(geometry,mat);
  })();scene.remove(m);if(!pathBatches.has(mat))pathBatches.set(mat,[]);pathBatches.get(mat).push(m.geometry);}for(const [mat,geometries]of pathBatches){mesh(mergeGeometries(geometries,false),mat).castShadow=false;geometries.forEach(g=>g.dispose());}
  if(retiredTerrainIds.size){
    const targetMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:T.DoubleSide});
    disposables.push(targetMaterial);
    for(const b of campus.buildings){
      if(!retiredTerrainIds.has(b.id))continue;
      const place=[...places.values()].find(p=>p.buildingId===b.id);
      const target=patch(b.rings[0].slice(0,-1),targetMaterial,.035,{kind:'landscape',id:b.id,placeId:place?.id||b.id});
      target.castShadow=false;
      target.receiveShadow=false;
    }
  }
  patch(RED_BOUNDARY,mats.brick,.57,{kind:'plaza',id:'red-square',placeId:'red-square'});
  const circle=(x,z,r)=>Array.from({length:96},(_,i)=>[x+Math.cos(i/96*Math.PI*2)*r,z+Math.sin(i/96*Math.PI*2)*r]);
  for(const paving of sitePavingForCampus(campus)){
    const landing=patch(paving.ring,paving.material==='asphalt'?mats.road:mats.path,paving.offset);
    landing.name=paving.code?'Surveyed canopy paving '+paving.code:'Surveyed building entrance paving';
  }
  if(openLawnId){
    const paint=new T.MeshStandardMaterial({color:'#c9bd91',roughness:.94});
    disposables.push(paint);
    for(const stripe of REVIEWED_CANOPY_SITES.markings){const m=patch(stripe,paint,.079);m.castShadow=false;m.name='MolES aerial parking marking';}
  }
  patch(circle(FOUNTAIN.x,FOUNTAIN.z,FOUNTAIN.promenadeRadius),mats.path,.47,{kind:'fountain',id:'fountain',placeId:'fountain'});
  const poolY=height(FOUNTAIN.x,FOUNTAIN.z)+.65,water=new T.MeshStandardMaterial({color:'#327b87',roughness:.2,metalness:.3,transparent:true,opacity:.9,side:T.DoubleSide});const pool=mesh(new T.CircleGeometry(FOUNTAIN.waterRadius,96),water,scene,{kind:'fountain',id:'fountain',placeId:'fountain'});pool.rotation.x=-Math.PI/2;pool.position.set(FOUNTAIN.x,poolY,FOUNTAIN.z);pool.castShadow=false;
  const rim=mesh(new T.TorusGeometry((FOUNTAIN.waterRadius+FOUNTAIN.rimRadius)/2,.55,10,96),mats.stone);rim.rotation.x=Math.PI/2;rim.position.set(FOUNTAIN.x,poolY,FOUNTAIN.z);
  const sprayMat=new T.MeshStandardMaterial({color:'#edfaff',transparent:true,opacity:.52,roughness:.2,depthWrite:false});for(let i=0;i<8;i++){const a=i/8*Math.PI*2,pts=Array.from({length:17},(_,j)=>{const q=j/16,r=17*(1-q);return new T.Vector3(FOUNTAIN.x+Math.cos(a)*r,poolY+Math.sin(q*Math.PI)*5,FOUNTAIN.z+Math.sin(a)*r);});waterParts.push(mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.11,5,false),sprayMat));}const plume=mesh(new T.ConeGeometry(.8,FOUNTAIN.jetHeight,12),sprayMat);plume.position.set(FOUNTAIN.x,poolY+FOUNTAIN.jetHeight/2,FOUNTAIN.z);plume.castShadow=false;
  const redTowers=addRedSquareTowers(T,{scene,material:mats.brick,height,mesh});canvas.dataset.redSquareTowers=JSON.stringify({count:redTowers.count,banners:redTowers.banners,layout:RED_TOWERS});
  const ob=new T.Group();ob.position.set(RED_OBELISK.x,height(RED_OBELISK.x,RED_OBELISK.z),RED_OBELISK.z);scene.add(ob);const bronze=new T.MeshStandardMaterial({color:'#664b3a',metalness:.5,roughness:.72}),base=mesh(new T.ConeGeometry(3,3.4,4),bronze,ob,{kind:'obelisk',id:'broken-obelisk',placeId:'red-square'});base.position.y=1.7;const inverted=mesh(new T.ConeGeometry(1.15,2.7,4),bronze,ob,{kind:'obelisk',id:'broken-obelisk',placeId:'red-square'});inverted.rotation.z=Math.PI;inverted.position.y=4.75;const shaft=mesh(new T.BoxGeometry(1.62,1.8,1.62),bronze,ob,{kind:'obelisk',id:'broken-obelisk',placeId:'red-square'});shaft.position.y=7;
  for(const p of RED_SEATING){const m=mesh(new T.BoxGeometry(8,.8,5),mats.stone);m.position.set(p.x,height(p.x,p.z)+.4,p.z);m.rotation.y=p.angle;}
  const landscape=campusLandscape(campus),dummy=new T.Object3D();let treeLayers;
const treesReady=addCampusTrees(scene,landscape.trees.filter(tree=>!haggett?.inside(tree.x,tree.z)&&hubYard?.floor(tree.x,tree.z)===undefined&&!chemicalSite?.clearedGround(tree.x,tree.z)).map(tree=>{
  const fit=foster?.treeFit(tree.id);
  if(fit)return {...tree,height:fit.height,crownWidth:fit.crownWidth};
  const id=Number(tree.id.split('-').at(-1));
  if(id<3995752||id>3995771||tree.species!=='Acer circinatum')return tree;
  return {...tree,height:2.45+(tree.sourceHeight-8)*.25,crownWidth:2.35+(tree.sourceHeight-8)*.28};
}),(x,z)=>foster?.treeGround(x,z)??height(x,z)).then(layers=>{treeLayers=layers;canvas.dataset.treeMetrics=JSON.stringify(layers.metrics);});
  const benchBatches=new Map();for(const p of landscape.benches){if(chemicalSite?.inside(...p.point)||haggett?.inside(...p.point)||foster&&!foster.keepBench(p.id))continue;const rootMatrix=new T.Matrix4().compose(new T.Vector3(p.point[0],engineering?.forecourtFloor(...p.point)??height(...p.point),p.point[1]),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-p.angle),new T.Vector3(1,1,1));for(const [mat,x,y,z,w,h,d]of [[p.material==='Stone'?mats.stone:mats.wood,0,.48,0,p.length,.12,.58],[mats.wood,0,.75,-.26,p.length,.42,.08],[mats.iron,-.65,.24,0,.07,.45,.5],[mats.iron,.65,.24,0,.07,.45,.5]]){dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();const m=rootMatrix.clone().multiply(dummy.matrix);if(!benchBatches.has(mat))benchBatches.set(mat,[]);benchBatches.get(mat).push(m);}}for(const [mat,matrices]of benchBatches){const m=new T.InstancedMesh(new T.BoxGeometry(1,1,1),mat,matrices.length);matrices.forEach((x,i)=>m.setMatrixAt(i,x));m.castShadow=m.receiveShadow=true;scene.add(m);}
  const architectureReady=fetch('/art-v0120/architecture.json').then(r=>r.json()).then(data=>{if(data.geometryHash!==campus.geometryHash)throw Error('Architecture and navigation geometry differ');for(const b of data.buildings){if(retiredTerrainIds.has(b.id))continue;const parent=new T.Group();parent.userData.buildingId=b.id;scene.add(parent);buildings.set(b.id,parent);const p=[...places.values()].find(p=>p.buildingId===b.id);for(const row of b.groups){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(row.positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(row.uv,2));g.computeVertexNormals();mesh(g,mats[row.material],parent,{kind:'building',id:b.id,placeId:p?.id||b.id});}softenArchitecture(parent);}});
  // Repeated facade details share geometry and draw calls; footprints stay authoritative.
  const windows=[];for(const b of campus.buildings)if(b.id!==engineering?.id&&(!haggett||b.id!==haggett.id)&&!campusBikeHouse(campus,b.id)&&!(hubYard&&b.id==='sea-97005-0')&&b.id!=='sea-97010-0'&&!canopyPlaceOverrides[b.id]&&b.id!==chemicalSite?.id&&b.id!=='sea-17829-0'&&b.id!=='sea-20342-0'&&b.id!==cpg?.id)for(const ring of b.rings)for(let i=0;i<ring.length-1;i++){const a=ring[i],q=ring[i+1],dx=q[0]-a[0],dz=q[1]-a[1],len=Math.hypot(dx,dz);if(len<4||inDetailedBuildingWing(b.code,(a[0]+q[0])/2,(a[1]+q[1])/2)||b.code==='SUZ'&&(a[0]+q[0])/2<-25)continue;const wallHeight=b.code==='SUZ'?13.1:b.height-(b.code==='DEN'?8:5),cols=Math.floor(len/3.6),levels=Math.max(1,Math.floor((wallHeight-2)/3.7));for(let level=0;level<levels;level++)for(let k=0;k<cols;k++){const f=(k+.5)/cols,x=a[0]+dx*f,z=a[1]+dz*f,y=b.baseY+2.4+level*3.7;if(y<height(x,z)+1.3)continue;windows.push({buildingId:b.id,x,z,y,angle:-Math.atan2(dz,dx),nx:dz/len*.06,nz:-dx/len*.06});}}
  const glazing=new T.InstancedMesh(new T.PlaneGeometry(1.25,1.95),new T.MeshStandardMaterial({color:'#526d72',roughness:.32,metalness:.25,side:T.DoubleSide}),windows.length),frames=new T.InstancedMesh(new T.PlaneGeometry(1.48,2.18),mats.stone,windows.length);
  windows.forEach((p,i)=>{dummy.position.set(p.x+p.nx,p.y,p.z+p.nz);dummy.rotation.set(0,p.angle,0);dummy.scale.set(1,1,1);dummy.updateMatrix();frames.setMatrixAt(i,dummy.matrix);dummy.position.set(p.x+p.nx*1.6,p.y,p.z+p.nz*1.6);dummy.updateMatrix();glazing.setMatrixAt(i,dummy.matrix);});dummy.rotation.set(0,0,0);scene.add(frames,glazing);
  function softenArchitecture(root){root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.softPainted)return;m.userData.softPainted=true;m.roughness=.98;m.metalness=0;m.normalScale?.multiplyScalar(.18);const previousShader=m.onBeforeCompile,previousKey=m.customProgramCacheKey.bind(m);m.onBeforeCompile=shader=>{previousShader.call(m,shader);shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=diffuseColor.rgb*.78+vec3(.12,.11,.09);');};m.customProgramCacheKey=()=> previousKey()+'-campus-soft-painted-v1';}});}
  function annex(b,{x,z,width,depth,height:wallHeight,angle}){
    const parent=new T.Group();parent.position.set(x,b.baseY-.5,z);parent.rotation.y=angle;scene.add(parent);architectureReady.then(()=>{const generic=buildings.get(b.id);if(generic)generic.add(parent);},()=>{});const place=[...places.values()].find(p=>p.buildingId===b.id),data={kind:'building',id:b.id,placeId:place?.id||b.id};
    const shell=mesh(new T.BoxGeometry(width,wallHeight,depth),b.code==='DEN'?mats.stone:mats.brick,parent,data);shell.position.y=wallHeight/2;
    const roof=mesh(new T.ConeGeometry(1,3,4),mats.slate,parent,data);roof.rotation.y=Math.PI/4;roof.scale.set(width/Math.SQRT2+1,1,depth/Math.SQRT2+1);roof.position.y=wallHeight+1.5;
    for(const side of [-1,1])for(let level=0;level<Math.floor(wallHeight/3.4);level++)for(let i=0;i<Math.floor(width/3.2);i++){
      const frame=mesh(new T.BoxGeometry(1.5,2.25,.18),mats.stone,parent),window=mesh(new T.PlaneGeometry(1.18,1.9),mats.glass,parent);const q=-width/2+(i+.5)*width/Math.floor(width/3.2),y=2.3+level*3.4;frame.position.set(q,y,side*(depth/2+.03));window.position.set(q,y,side*(depth/2+.14));if(side<0)window.rotation.y=Math.PI;
    }
  }
  annex(campus.buildings.find(b=>b.code==='DEN'),{x:-90,z:-261,width:17,depth:22,height:11,angle:.778});
  annex(campus.buildings.find(b=>b.code==='SAV'),{x:-48,z:-77,width:18,depth:34,height:13,angle:.77764});
  const streamedBuildingsReady=Promise.all([architectureReady,northTerrainReady]).then(async()=>{buildingStream=await createBuildingStream({scene,renderer,camera,campus,groups:buildings,pickables,places,softenArchitecture,windowMeshes:[frames,glazing],windowOwnerIds:windows.map(window=>window.buildingId),omitFoundationEdge:kirsten?.removeSkirt,canvas,terrainMaterial:mats.grass});});
  let profileGeneration=0;const warmActor=createCampusGpuWarmup(renderer);
  const actorReady=preloadCampusNpcAvatars().then(()=>{actorsLoaded=true;if(npcState)setNpcState(npcState);});
  async function setProfile(value,palette){const ticket=++profileGeneration;await preloadPremiumAvatar(value.recipe);if(disposed||ticket!==profileGeneration)return;const next=buildCampusVisitor(value.recipe,palette);next.traverse(o=>{if(o.isMesh){o.userData.actor='visitor';o.castShadow=false;}});let prepared;try{prepared=await warmActor(next,camera,scene,()=>!disposed&&ticket===profileGeneration);}catch(error){next.userData.dispose?.();throw error;}if(!prepared){next.userData.dispose?.();return;}profile=value;skins=palette;if(visitor){visitorGroup.remove(visitor);visitor.userData.dispose?.();}visitor=next;visitorGroup.add(visitor);contactShadow('visitor');canvas.dataset.visitorGpuReady=JSON.stringify(prepared);canvas.dataset.visitorAsset=visitor.userData.assetKind;canvas.dataset.visitorGenerator=value.recipe.generatorVersion;}
  function setNpcState(value){npcReceivedAt=performance.now();npcState=value;if(!actorsLoaded)return;for(const p of value?.npcs||[]){let m=npcModels.get(p.id);if(!m){m=buildCampusNpc(p.id);m.traverse(o=>{if(o.isMesh){o.castShadow=false;o.userData.npc=p.id;pickables.push(o);}});scene.add(m);npcModels.set(p.id,m);contactShadow(p.id);}if(!m.userData.positioned){m.position.set(...p.position);m.userData.positioned=true;}}canvas.dataset.npcModelAssets=JSON.stringify(Object.fromEntries([...npcModels].map(([id,m])=>[id,m.userData.assetPath])));}
  async function warmNpcs(){const actors=[...npcModels.values()];for(const actor of actors)await warmActor(actor,camera,scene,()=>!disposed);if(disposed)return;await drawWarmActors(T,renderer,scene,actors);canvas.dataset.npcGpuReady=String(actors.length);if(treeLayers&&!disposed)canvas.dataset.treeGpuReady=JSON.stringify(await treeLayers.warmup(renderer,camera,warmActor));}
  let selection;function select(id,{outline=true}={}){selected=id;if(selection){selection.removeFromParent();selection.geometry.dispose();selection.material.dispose();selection=null;}if(!outline)return;const p=places.get(id),b=campus.buildings.find(b=>b.id===(p?.buildingId||id));if(b){const points=haggett&&b.id===haggett.id?haggett.ring.slice(0,-1).map(([x,z])=>new T.Vector3(x,terrainHeight(haggett.terrain,x,z)+.061,z)):(b.id==='sea-27601-0'?[[96.30919184411056,178.1789728035751],[96.54344244999619,178.0661603324462],[95.94466856477347,176.82283019351476],[105.29667352282301,172.3190092307525],[105.89544740804574,173.56233936968394],[106.68829561258173,173.1805125443245],[106.13291113933167,172.02727879227214],[108.772735274889,170.75596902147316],[109.32811974813906,171.90920277352552],[122.8786163347542,165.38343521283724],[128.5582903619756,177.17705225531012],[101.98886587133195,189.97258984604798],[96.30919184411056,178.1789728035751]].map(([x,z])=>new T.Vector3(x,height(x,z)+.07,z)):(kincaidSite?.buildingId===b.id?kincaidSite.outline(height):b.rings[0].map(([x,z])=>new T.Vector3(x,height(x,z)+.75,z))));selection=new T.LineLoop(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#dfba5d',depthTest:true,transparent:true,opacity:.8}));scene.add(selection);}}
  function screenPoint(point){const p=new T.Vector3(...point).project(camera);return {x:(p.x*.5+.5)*viewportWidth,y:(-.5*p.y+.5)*viewportHeight,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1};}
  function actorBox(point){const foot=screenPoint(point),head=screenPoint([point[0],point[1]+1.75,point[2]]),h=Math.abs(foot.y-head.y),w=Math.max(8,h*.5);return {left:head.x-w/2,right:head.x+w/2,top:Math.min(head.y,foot.y),bottom:Math.max(head.y,foot.y)};}
  function focus(point,zoom=1){
    const place=places.get(selected),b=campus.buildings.find(b=>b.id===(place?.buildingId||selected)),detail=buildingStream?.placements.get(b?.id)||BUILDING_ASSETS[b?.code],distance=125/zoom;
    if(detail){const a=detail.angle+(detail.inspectionYawOffset||0),y=Number.isFinite(detail.groundY)?detail.groundY:height(detail.x,detail.z),framingDistance=Math.max(distance,Math.hypot(detail.width,detail.depth)*.95)*(detail.inspectionDistanceScale||1);controls.target.set(detail.x,y+(Number.isFinite(detail.groundY)?detail.height:Math.max(b.height,detail.height||0))*.42,detail.z);camera.position.set(detail.x+(Math.sin(a)+Math.cos(a)*.3)*framingDistance,y+framingDistance*.48,detail.z+(Math.cos(a)-Math.sin(a)*.3)*framingDistance);controls.update();treeLayers?.update(camera,performance.now(),true);return;}
    const suzzallo=Math.hypot(point[0]+12.34,point[2]-50.39)<1,target=suzzallo?[-48,0,40]:point,y=height(target[0],target[2]);controls.target.set(target[0],y+(suzzallo?11:6),target[2]);camera.position.set(target[0]-distance*(suzzallo?.95:.62),y+distance*(suzzallo?.45:.72),target[2]+distance*(suzzallo?.2:.7));controls.update();treeLayers?.update(camera,performance.now(),true);
  }
  function focusActor(point){const view=cameraClearance.actorCamera(point);if(!view)return;controls.target.set(...view.target);camera.position.set(...view.position);controls.update();canvas.dataset.actorCamera=JSON.stringify(view);treeLayers?.update(camera,performance.now(),true);}
  function follow(point,immediate=false){if(immediate||camera.position.length()<1)focus(point,3.8);}
  function overview(){const b=campus.bounds;focus([(b[0]+b[2])/2,0,(b[1]+b[3])/2],.2);}
  const mini=document.getElementById('campus-minimap'),miniToggle=document.getElementById('minimap-toggle');function drawMini(position){if(!mini||mini.hidden)return;const ctx=mini.getContext('2d'),b=campus.bounds,w=mini.width,h=mini.height,to=([x,z])=>[(x-b[0])/(b[2]-b[0])*w,(z-b[1])/(b[3]-b[1])*h];ctx.fillStyle='#e2e8d5';ctx.fillRect(0,0,w,h);ctx.fillStyle='#969a89';for(const r of campus.buildings){if(retiredTerrainIds.has(r.id))continue;ctx.beginPath();r.rings[0].forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...to(p)));ctx.fill();}ctx.fillStyle='#694e7c';ctx.beginPath();ctx.arc(...to([position[0],position[2]]),3,0,Math.PI*2);ctx.fill();}
  const miniClick=e=>{const r=mini.getBoundingClientRect(),b=campus.bounds;onPan?.();focus([b[0]+(e.clientX-r.left)/r.width*(b[2]-b[0]),0,b[1]+(e.clientY-r.top)/r.height*(b[3]-b[1])],1);};const miniCollapse=()=>{mini.hidden=!mini.hidden;miniToggle.setAttribute('aria-expanded',String(!mini.hidden));miniToggle.textContent=mini.hidden?'展开小地图':'北向小地图 · 收起';};mini?.addEventListener('click',miniClick);miniToggle?.addEventListener('click',miniCollapse);
  controls.addEventListener('start',()=>onPan?.());
  const down=e=>{dragStart=[e.clientX,e.clientY];},up=e=>{if(!dragStart||Math.hypot(e.clientX-dragStart[0],e.clientY-dragStart[1])>6)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const hit=pickVisibleBuildingHit(ray.intersectObjects(pickables,false));if(hit){const data=hit.object.userData;if(data.npc)return onNpcSelect?.(data.npc);if(data.surface?.placeId)onSelect(data.surface.placeId,true,data.surface);else if(data.surface)onInspect?.(data.surface);}};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();viewportWidth=r.width;viewportHeight=r.height;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();});resize.observe(canvas);
  const perimeterReady=loadCampusPerimeterGround(T,campus,mats.grass).then(ground=>{
    if(!ground)return;
    if(disposed)ground.geometry.dispose();
    else scene.add(ground);
  });
  const ready=Promise.all([imageReady,perimeterReady,siegFinishReady,pabReady,kirstenPavingReady,kincaidSite?.ready,architectureReady,streamedBuildingsReady,actorReady,treesReady,pdlBridge?.ready,preloadAvatarTextures()]).then(()=>{canvas.dataset.renderMode='three-live-textured-campus';canvas.dataset.assetsReady='true';canvas.dataset.renderMetrics=JSON.stringify({webgl:true,liveThreeEngine:true,buildingCount:campus.buildings.length,sourceGeometryHash:campus.geometryHash,meshyAssets:[...buildingStream.manifest.buildings.map(b=>b.assetId),'campus-student-premium-v1'],streamedBuildingCount:buildingStream.manifest.buildings.length,vegetationAssets:['q-cherry-v1','q-conifer-v1','q-broadleaf-v1'],textured:true});}).catch(e=>{loadingError=true;throw e;});
  return {ready,art:{metrics:{}},setProfile,setNpcState,warmNpcs,setNpcInteraction(id){interactingNpc=id;},select,label(id,node){labels.set(id,node);},focus,focusActor,follow,overview,suspend(){if(lastFrameTime){lastFrameTime=0;frameTimes.length=drawTimes.length=0;frameSession={frames:0,maxFrame:0,maxDraw:0,over33ms:0};}},zoom(factor){camera.position.sub(controls.target).multiplyScalar(1/factor).add(controls.target);controls.update();},screenDirection(x,y){const f=new T.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new T.Vector3(-f.z,0,f.x),v=r.multiplyScalar(x).add(f.multiplyScalar(y)).normalize();return [v.x,v.z];},
    draw(now,position,options={}){if(disposed||loadingError)return {visible:false,npcs:[]};const frameStart=performance.now(),dt=Math.min(.08,options.delta||.016);if(lastFrameTime){const gap=now-lastFrameTime;frameTimes.push(gap);frameSession.maxFrame=Math.max(frameSession.maxFrame,gap);if(gap>33.4)frameSession.over33ms++;}lastFrameTime=now;frameSession.frames++;visitorGroup.position.set(...position);contactShadows.get('visitor')?.position.set(position[0],position[1]+.015,position[2]);if(options.worldFacing)facingTarget=Math.atan2(options.worldFacing[0],options.worldFacing[1]);const facingPose=visitorFacing.advance(facingTarget,dt),turn=facingPose.turn;visitorGroup.rotation.y=facingPose.angle;animateCampusVisitor(visitor,now/1000,options.moving?'walk':'idle',{speed:options.speed,turn});if(options.follow){followDesired.set(position[0],position[1]+1,position[2]);followDelta.copy(followDesired).sub(controls.target).multiplyScalar(1-Math.exp(-dt*9));controls.target.add(followDelta);camera.position.add(followDelta);}const sx=Math.round(controls.target.x/24)*24,sz=Math.round(controls.target.z/24)*24;
      controls.update();if(cameraClearance.inside(camera.position.toArray()))focusActor(position);buildingStream?.update(now,places.get(selected)?.buildingId||selected,{moving:options.moving});treeLayers?.update(camera,now);if(compass){compass.textContent='↑';compass.style.transform='rotate('+Math.atan2(-camera.matrixWorld.elements[2],-camera.matrixWorld.elements[6])+'rad)';compass.parentElement.setAttribute('aria-label','北向指示');}for(const p of npcState?.npcs||[]){const m=npcModels.get(p.id);if(!m)continue;const time=(npcState.serverTime||Date.now())+Math.max(0,now-npcReceivedAt),sample=p.patrol?sampleNpcPatrol(p.patrol,time):{position:p.position,action:'idle',yaw:0};
      contactShadows.get(p.id)?.position.set(m.position.x,m.position.y+.015,m.position.z);const near=Math.hypot(m.position.x-position[0],m.position.z-position[2])<2.7,talk=p.phase==='talking'||interactingNpc===p.id,stop=near||talk;
      let moved=0,moveYaw=sample.yaw;if(!stop){const target=new T.Vector3(...sample.position),delta=target.sub(m.position),distance=delta.length();moved=Math.min(distance,dt*.72);if(distance>.002)moveYaw=Math.atan2(delta.x,delta.z);m.position.addScaledVector(delta,distance>0?moved/distance:0);}
      const moving=moved>.002,yaw=stop?Math.atan2(position[0]-m.position.x,position[2]-m.position.z):moveYaw,angle=Math.atan2(Math.sin(yaw-m.rotation.y),Math.cos(yaw-m.rotation.y));m.rotation.y+=angle*(1-Math.exp(-dt*5));m.userData.animate(now/1000,talk?'wave':moving?'walk':'idle');
      }water.opacity=.85+Math.sin(now*.001)*.04;sprayMat.opacity=.45+Math.sin(now*.003)*.07;if(shadowCache.update(sx,sz,buildingStream?.shadowRevision,treeLayers?.streaming.uploads,{moving:options.moving,now})){sun.target.position.set(sx,controls.target.y,sz);sun.position.set(sx-180,controls.target.y+420,sz-160);}renderer.render(scene,camera);const drawDuration=performance.now()-frameStart;drawTimes.push(drawDuration);frameSession.maxDraw=Math.max(frameSession.maxDraw,drawDuration);if(drawDuration>20){slowFrames.push({now,draw:drawDuration,moving:!!options.moving,shadows:shadowCache.stats.updates,stream:canvas.dataset.buildingStream,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures});if(slowFrames.length>10)slowFrames.shift();canvas.dataset.slowFrames=JSON.stringify(slowFrames);}if(now-lastDiagnostics>1000){lastDiagnostics=now;const percentile=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))]||0;canvas.dataset.frameMetrics=JSON.stringify({samples:frameTimes.length,frameP50:percentile(frameTimes,.5),frameP95:percentile(frameTimes,.95),drawP50:percentile(drawTimes,.5),drawP95:percentile(drawTimes,.95),frameP99:percentile(frameTimes,.99),frameMax:Math.max(0,...frameTimes),over33ms:frameTimes.filter(t=>t>33.4).length});frameTimes.length=drawTimes.length=0;canvas.dataset.frameSession=JSON.stringify(frameSession);canvas.dataset.visitorLocomotion=JSON.stringify(visitor?.userData.locomotion||null);canvas.dataset.treeStreaming=JSON.stringify(treeLayers?.streaming||null);canvas.dataset.shadowCache=JSON.stringify(shadowCache.stats);canvas.dataset.gpuTextures=String(renderer.info.memory.textures);canvas.dataset.gpuGeometries=String(renderer.info.memory.geometries);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.liveTriangles=String(renderer.info.render.triangles);}
      if(now-lastLabels>40){lastLabels=now;for(const [id,node]of labels){const p=places.get(id),feature=id==='broken-obelisk'?RED_OBELISK:id.startsWith('red-square-pylon-')?RED_TOWERS[Number(id.split('-').at(-1))]:null,point=p?.point||(feature?[feature.x,height(feature.x,feature.z)+feature.height,feature.z]:null);if(!point){node.hidden=true;continue;}const pos=screenPoint([point[0],point[1]+4,point[2]]);node.hidden=!pos.visible||options.hideUI;node.style.left=pos.x+'px';node.style.top=pos.y+'px';node.classList.toggle('selected',id===selected);}}
      if(now-lastMini>100){lastMini=now;drawMini(position);}const mark=screenPoint([position[0],position[1]+2,position[2]]),npcScreens=(npcState?.npcs||[]).map(p=>{const point=npcModels.get(p.id)?.position.toArray()||p.position,pos=screenPoint([point[0],point[1]+2,point[2]]);return {id:p.id,...pos,bodyBox:actorBox(point),labelY:pos.y-10,visible:pos.visible&&!options.hideUI};});let nameSpot={x:mark.x,y:mark.y-8};for(const p of npcScreens.filter(p=>p.visible))nameSpot=labelAwayFromAvatar(nameSpot.x,nameSpot.y,(profile?.displayName?.length||4)*14+18,24,p.bodyBox,viewportHeight);nameSpot=labelAwayFromAvatar(nameSpot.x,nameSpot.y,(profile?.displayName?.length||4)*14+18,24,actorBox(position),viewportHeight);return {...mark,labelX:nameSpot.x,labelY:nameSpot.y,hiddenRatio:0,npcs:npcScreens};},
    dispose(){pdlBridge?.dispose();disposed=true;buildingStream?.dispose();controls.dispose();resize.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);mini?.removeEventListener('click',miniClick);miniToggle?.removeEventListener('click',miniCollapse);scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});for(const t of disposables)t.dispose();renderer.dispose();}
  };
}
