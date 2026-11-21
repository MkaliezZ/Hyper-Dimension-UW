import {terrainHeight} from './terrain-surface.js';
import {PDL_BRIDGE} from './pdl-bridge-data-v26.js';

const data=PDL_BRIDGE;
const world=(s,w)=>data.origin.map((v,i)=>v+data.basisU[i]*s+data.basisV[i]*w);
const deckHeight=(s,w)=>data.plane[0]+s*data.plane[1]+(w-1.25)*data.plane[2]+Math.max(0,s-data.railEnd)*data.landingSlopeCorrection;
const railCenter=(s,rail)=>rail.centreW[0]*s+rail.centreW[1];

function horizontalDistance(x,z,a,b){
  const dx=b[0]-a[0], dz=b[2]-a[2];
  const fraction=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));
  return Math.hypot(x-a[0]-fraction*dx,z-a[2]-fraction*dz);
}

export function createPadelfordBridge(campus){
  if(campus.geometryHash!==data.geometryHash||!campus.paths.some(p=>p.id===data.pathId))return null;
  const surface=(s,w,join=false)=>{
    const [x,z]=world(s,w);
    return [x,join?terrainHeight(campus.terrain,x,z)+.28:deckHeight(s,w),z];
  };
  const edges=data.deckStations.map(([s,w0,w1],i)=>[surface(s,w0,i===0),surface(s,w1,i===0)]);
  edges.push(data.portalLandingEnds.map(([s,w])=>surface(s,w)));
  const deck=[];
  for(let i=1;i<edges.length;i++){
    const [a,b]=edges[i-1],[c,d]=edges[i];
    deck.push([a,b,c],[b,d,c]);
  }
  const rails=Object.entries(data.railCohorts).map(([name,rail])=>{
    const span=[data.railStart,data.railEnd].map(s=>{
      const w=railCenter(s,rail);
      return [surface(s,w-data.railHalfWidth),surface(s,w+data.railHalfWidth)];
    });
    return {name,ring:[...span[0],...span[1].reverse()],height:rail.heightAboveDeck};
  });
  function elevation(x,z){
    const relative=[x-data.origin[0],z-data.origin[1]];
    const t=relative[0]*data.basisU[0]+relative[1]*data.basisU[1];
    const w=relative[0]*data.basisV[0]+relative[1]*data.basisV[1];
    if(t<-.00001||t>Math.max(...data.portalLandingEnds.map(pair=>pair[0]))+.00001||w<-2.86||w>3.3)return null;
    for(const [a,b,c] of deck){
      const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2],dx=x-a[0],dz=z-a[2];
      const det=ux*vz-uz*vx;
      const f=(dx*vz-dz*vx)/det,g=(ux*dz-uz*dx)/det;
      if(f>=-1e-7&&g>=-1e-7&&f+g<=1+1e-7)return a[1]+f*(b[1]-a[1])+g*(c[1]-a[1]);
    }
    return null;
  }
  function blocked(x,z,radius){
    const relative=[x-data.origin[0],z-data.origin[1]];
    const s=relative[0]*data.basisU[0]+relative[1]*data.basisU[1];
    const w=relative[0]*data.basisV[0]+relative[1]*data.basisV[1];
    if(s<data.railStart-radius||s>data.railEnd+radius||w<-1||w>4)return false;
    return rails.some(({name,ring})=>{
      const interior=s>=data.railStart&&s<=data.railEnd&&Math.abs(w-railCenter(s,data.railCohorts[name]))<=data.railHalfWidth;
      return interior||ring.some((a,i)=>horizontalDistance(x,z,a,ring[(i+1)%ring.length])<radius);
    });
  }
  return {pathId:data.pathId,edges,deck,rails,elevation,blocked,arrivalXZ:data.arrivalXZ};
}

function geometry(T,faces){
  const positions=faces.flat(2),uv=[];
  for(let i=0;i<positions.length;i+=3)uv.push((positions[i]+positions[i+2]*.1)/2,(positions[i+2]+positions[i+1]*.25)/2);
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}
const shift=(p,dy)=>[p[0],p[1]+dy,p[2]];
const quad=(a,b,c,d)=>[[a,b,c],[a,c,d]];
function prismSides(ring,height){
  return ring.flatMap((start,i)=>{
    const end=ring[(i+1)%ring.length];
    return quad(start,shift(start,height),shift(end,height),end);
  });
}

export function installPadelfordBridge(T,{campus,scene,pathMaterial}){
  const bridge=createPadelfordBridge(campus);
  if(!bridge)return null;
  const group=new T.Group();
  group.name='pdl-c-bridge';
  const castConcrete=new T.MeshStandardMaterial({
    color:0xb8b9ac,map:pathMaterial.map,side:T.DoubleSide,roughness:.98
  });
  const deckMaterial=pathMaterial.clone();
  deckMaterial.name='Padelford C bridge precast concrete';
  const ready=new T.TextureLoader().loadAsync('/pdl-bridge-precast.png').then(texture=>{
    texture.colorSpace=T.SRGBColorSpace;
    texture.wrapS=texture.wrapT=T.RepeatWrapping;
    texture.anisotropy=4;
    deckMaterial.map=castConcrete.map=texture;
    deckMaterial.needsUpdate=castConcrete.needsUpdate=true;
  });
  const grooves=new T.MeshStandardMaterial({color:0x898c80,side:T.DoubleSide,roughness:1});
  const add=(name,faces,mat)=>{
    const mesh=new T.Mesh(geometry(T,faces),mat);
    mesh.name=name;
    mesh.receiveShadow=true;
    mesh.castShadow=name!=='pdl-c-bridge-top';
    group.add(mesh);
  };
  // The station widths and heights drive both route collision and surface mesh.
  add('pdl-c-bridge-top',bridge.deck,deckMaterial);
  const outline=[...bridge.edges.map(pair=>pair[0]),...bridge.edges.map(pair=>pair[1]).reverse()];
  const underside=bridge.deck.map(face=>face.map(p=>shift(p,-.32)).reverse());
  add('pdl-c-bridge-slab',[...prismSides(outline,-.32),...underside],castConcrete);
  for(const rail of bridge.rails){
    const [a,b,c,d]=rail.ring.map(p=>shift(p,rail.height));
    add('pdl-c-bridge-rail-'+rail.name,[...prismSides(rail.ring,rail.height),...quad(a,b,c,d)],castConcrete);
    const slats=[];
    for(let s=data.railStart+.25;s<data.railEnd-.2;s+=.43){
      const center=railCenter(s,data.railCohorts[rail.name]);
      const w=center+(data.railHalfWidth+.002)*(rail.name==='north'?1:-1);
      const [x,z]=world(s,w),[x2,z2]=world(s+.035,w);
      const y=deckHeight(s,w)+.1, y2=deckHeight(s+.035,w)+.1, h=rail.height-.2;
      slats.push(...quad([x,y,z],[x2,y2,z2],[x2,y2+h,z2],[x,y+h,z]));
    }
    add('pdl-c-bridge-rib-shadow-'+rail.name,slats,grooves);
  }
  scene.add(group);
  return {...bridge, group,ready,dispose(){
    group.removeFromParent();
    for(const mesh of group.children)mesh.geometry.dispose();
    deckMaterial.map?.dispose();
    deckMaterial.dispose();
    castConcrete.dispose();
    grooves.dispose();
  }};
}
