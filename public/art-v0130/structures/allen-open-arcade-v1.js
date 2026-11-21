import * as T from '/art-v0120/vendor/three/three.module.js';

// Explicit open passage: all cross-passage construction stays above 7 metres.
// Coordinates and heights are tied to the reviewed North/South assembly plan.
export async function createAllenOpenArcade(plan,{anisotropy=1}={}){
 const loader=new T.TextureLoader();
 const [brickMap,roofMap]=await Promise.all([
  loader.loadAsync('/art-v0130/materials/allen-arcade-brick-v1.png'),
  loader.loadAsync('/art-v0130/materials/standing-seam-zinc-v1.png')]);
 return buildAllenOpenArcade(plan,{brickMap,roofMap,anisotropy});
}

export function buildAllenOpenArcade(plan,{brickMap,roofMap,anisotropy=1}){
 const root=new T.Group();root.name='Allen North open arcade';
 if(![plan.lengthMeters,plan.widthMeters,plan.roofEaveMeters,plan.ridgeMeters,plan.minimumGroundClearanceMeters,plan.portalClearHeightMeters].every(v=>Number.isFinite(v)&&v>0))throw Error('Invalid reviewed arcade dimensions');
 if(!(plan.minimumGroundClearanceMeters<plan.portalClearHeightMeters&&plan.portalClearHeightMeters<plan.roofEaveMeters&&plan.roofEaveMeters<plan.ridgeMeters))throw Error('Invalid clearance sequence');
 for(const map of[brickMap,roofMap]){map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=anisotropy;}
 const brick=new T.MeshStandardMaterial({name:'Allen warm brick',map:brickMap,color:'#ffffff',roughness:.9});
 const roof=new T.MeshStandardMaterial({name:'Allen standing seam roof',map:roofMap,roughness:.85,metalness:.08,side:T.DoubleSide});
 const stone=new T.MeshStandardMaterial({name:'Warm limestone trim',color:'#d8c6ac',roughness:.95});
 const copper=new T.MeshStandardMaterial({name:'Patinated green frames',color:'#47746e',roughness:.65,metalness:.3});
 const glass=new T.MeshStandardMaterial({name:'Dark glazed bridge',color:'#2b403f',roughness:.22,metalness:.3});
 const [a,b]=plan.axisEndpoints,u=new T.Vector2(b[0]-a[0],b[1]-a[1]).normalize(),n=new T.Vector2(-u.y,u.x),L=plan.lengthMeters,W=plan.widthMeters,E=plan.roofEaveMeters,R=plan.ridgeMeters;
 root.position.set(a[0]-n.x*W/2,0,a[1]-n.y*W/2);root.rotation.y=-Math.atan2(u.y,u.x);
 function box(name,x,y,z,w,h,d,mat){
  const g=new T.BoxGeometry(w,h,d),p=g.attributes.position,N=g.attributes.normal,uv=g.attributes.uv;
  if(mat===brick)for(let i=0;i<p.count;i++){const useZ=Math.abs(N.getX(i))>.5;uv.setXY(i,(useZ?p.getZ(i):p.getX(i))/1.4,p.getY(i)/2.8);}
  const m=new T.Mesh(g,mat);m.name=name;m.position.set(x,y,z);root.add(m);return m;
 }
 function bar(name,start,end,width,depth,mat){const A=new T.Vector3(...start),B=new T.Vector3(...end),m=box(name,...A.clone().add(B).multiplyScalar(.5).toArray(),width,A.distanceTo(B),depth,mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return m;}
 // Slender piers frame the sides; their inner faces retain an 8.9m clear route.
 for(let i=0;i<=8;i++)for(const z of[-W/2,W/2]){
  const x=i/8*L;box('Masonry side pier',x,E/2,z,.65,E,.75,brick);
  box('Stone pier base',x,.45,z,.9,.9,1.05,stone);
  for(const y of[7,13,19,E])box('Pier stone band',x,y,z,.76,.16,.86,stone);
  box('Eave pier capital',x,E-.25,z,.9,.5,1,stone);
 }
 for(const z of[-W/2,W/2]){
  box('Masonry eave beam',L/2,E-.45,z,L+.5,.9,.7,brick);
  box('Continuous eave trim',L/2,E,z,L+.8,.2,.85,stone);
 }
 // Two sloping roof panels. UVs retain a physical 0.6m standing-seam spacing.
 for(const sign of[-1,1]){
  const y=E,z=sign*(W/2+.3),verts=[[-.35,R,0],[L+.35,R,0],[L+.35,y,z],[-.35,y,z]],g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(verts.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,(L+.7)/4.8,0,(L+.7)/4.8,Math.hypot(R-E,z)/4.8,0,Math.hypot(R-E,z)/4.8],2));g.setIndex(sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);g.computeVertexNormals();const m=new T.Mesh(g,roof);m.name='Continuous pitched metal roof';root.add(m);
 }
 // Each end has a genuine round aperture, not a dark disk over a solid wall.
 for(const x of[0,L]){
  const shape=new T.Shape();shape.moveTo(-W/2,plan.portalClearHeightMeters);shape.lineTo(W/2,plan.portalClearHeightMeters);shape.lineTo(W/2,E);shape.lineTo(0,R);shape.lineTo(-W/2,E);shape.closePath();
  const hole=new T.Path();hole.absarc(0,23.4,1.65,0,Math.PI*2,true);shape.holes.push(hole);
  const g=new T.ExtrudeGeometry(shape,{depth:.45,bevelEnabled:false,curveSegments:40}),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/1.4,p.getY(i)/2.8);
  g.applyMatrix4(new T.Matrix4().makeRotationY(Math.PI/2));const panel=new T.Mesh(g,brick);panel.name='Open gable with circular window';panel.position.x=x-.225;root.add(panel);
  const ring=new T.Mesh(new T.TorusGeometry(1.72,.13,8,48),stone);ring.rotation.y=Math.PI/2;ring.position.set(x,23.4,0);ring.name='Circular stone window surround';root.add(ring);
  box('Round window mullion',x,23.4,0,.36,3.27,.09,copper);
  bar('Gable left stone coping',[x,E,-W/2],[x,R,0],.25,.32,stone);bar('Gable right stone coping',[x,R,0],[x,E,W/2],.25,.32,stone);
  box('Open portal lintel',x,plan.portalClearHeightMeters-.15,0,.75,.3,W,stone);
 }
 // The glazed connecting room spans overhead. No geometry seals the floor.
 const bridgeX=L*.5,bridgeWidth=4.8,bottom=plan.minimumGroundClearanceMeters,top=11;
 box('Overhead bridge floor',bridgeX,bottom+.2,0,bridgeWidth,.4,W,stone);
 box('Overhead bridge roof',bridgeX,top+.15,0,bridgeWidth+.3,.3,W,roof);
 for(const side of[-1,1]){
  const x=bridgeX+side*bridgeWidth/2;
  box('Bridge lower brick panel',x,bottom+.7,0,.28,1,W,brick);
  box('Bridge glazing',x,bottom+2.5,0,.12,2.6,W-.3,glass);
  for(let z=-W/2;z<=W/2;z+=1)box('Bridge green mullion',x,bottom+2.5,z,.22,2.6,.08,copper);
  for(const y of[bottom+1.2,top])box('Bridge frame rail',x,y,0,.25,.12,W,copper);
 }
 root.userData={assemblyModule:'allen-open-arcade',scope:'candidate',length:L,width:W,groundRouteClearWidth:W-1.1,minimumOverheadClearance:bottom,roofEave:E,roofRidge:R,portalClearHeight:plan.portalClearHeightMeters,roundApertures:2,materialSources:['allen-arcade-brick-v1.png','standing-seam-zinc-v1.png']};
 return root;
}
