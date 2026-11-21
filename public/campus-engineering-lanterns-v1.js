import {mergeGeometries} from './art-v0120/vendor/three/addons/utils/BufferGeometryUtils.js';

// The four lantern positions are registered to the entry paving. Modelled
// shades carry daylight colour and do not add real-time lights or shadows
// beyond the scene's existing sun.
export function addEngineeringLanterns(T,scene,lanterns){
 const plinth=new T.MeshStandardMaterial({name:'Lantern stone base',color:'#747167',roughness:.94});
 const metal=new T.MeshStandardMaterial({name:'Lantern painted iron',color:'#393a36',metalness:.38,roughness:.69});
 const glass=new T.MeshStandardMaterial({name:'Lantern frosted panes',color:'#d4d0b6',roughness:.48});
 for(const {id,position,height} of lanterns){
  const group=new T.Group();
  group.name=id;
  group.position.set(...position);
  const add=(geometry,material)=>{
   const mesh=new T.Mesh(geometry,material);
   mesh.castShadow=true;
   mesh.receiveShadow=true;
   group.add(mesh);
  };
  const octagon=(top,bottom,h,y)=>new T.CylinderGeometry(top,bottom,h,8).translate(0,y,0);
  const stone=new T.CylinderGeometry(.126,.181,.265,4,1,false,Math.PI/4).translate(0,.131,0);
  add(stone,plinth);
  const shadeH=.38,shadeBottom=height-shadeH-.10;
  const panes=octagon(.108,.113,shadeH,shadeBottom+shadeH/2);
  add(panes,glass);
  const iron=[
   octagon(.061,.077,.055,.278),
   octagon(.047,.058,shadeBottom-.27,(shadeBottom+.27)*.5),
   octagon(.115,.052,.084,shadeBottom-.036),
   octagon(.121,.119,.045,height-.095),
   octagon(.049,.121,.073,height-.040),
  ];
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   const mullion=new T.BoxGeometry(.017,shadeH+.015,.018).rotateY(a);
   iron.push(mullion.translate(.107*Math.sin(a),shadeBottom+shadeH/2,.107*Math.cos(a)));
  }
  const frame=mergeGeometries(iron);
  for(const piece of iron)piece.dispose();
  add(frame,metal);
  scene.add(group);
 }
}

