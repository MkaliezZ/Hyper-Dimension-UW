import {KINCAID_TERRAIN as site} from './campus-site-kin-elevation.js';
import {addKincaidTrailFixture} from './campus-kin-court.js';
import {addKincaidParkingStencils} from './campus-kin-markings.js';

export function installKincaidTerrain(T,campus,{scene,mesh,grass,terrain,positions,uvs,indices,disposables}){
  if(campus.geometryHash!==site.geometryHash||
     !campus.buildings.some(building=>building.id===site.buildingId)||
     !campus.buildings.some(building=>building.id===site.neighborId))return null;

  function orient(triangle){
    const [a,b,c]=triangle.map(point=>new T.Vector3(...point));
    const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    return {points:normal.y>=0?triangle:[triangle[0],triangle[2],triangle[1]],normal,a,b,c};
  }

  const removed=new Set(site.removed);
  const retainedIndices=indices.filter((_,i)=>!removed.has(Math.floor(i/3)));
  const retainedPositions=[...positions],retainedUvs=[...uvs];
  for(const triangle of site.retainedTerrain){
    for(const [x,y,z] of orient(triangle).points){
      retainedIndices.push(retainedPositions.length/3);
      retainedPositions.push(x,y,z);
      retainedUvs.push(x/5,z/5);
    }
  }
  terrain.setAttribute('position',new T.Float32BufferAttribute(retainedPositions,3));
  terrain.setAttribute('uv',new T.Float32BufferAttribute(retainedUvs,2));
  terrain.setIndex(retainedIndices);
  terrain.computeVertexNormals();
  const base=mesh(terrain,grass);
  base.name='privateKincaidAuditedTerrain';
  base.castShadow=false;

  function addFaces(triangles,material,name){
    const geometry=new T.BufferGeometry(),vertices=[],coordinates=[];
    for(const triangle of triangles){
      const {points,normal,a,b,c}=orient(triangle);
      const wall=Math.abs(normal.y)<.01;
      const alongX=Math.max(Math.abs(b.x-a.x),Math.abs(c.x-a.x))>=Math.max(Math.abs(b.z-a.z),Math.abs(c.z-a.z));
      for(const [x,y,z] of points){
        vertices.push(x,y,z);
        coordinates.push((wall&&!alongX?z:x)/3,(wall?y:z)/3);
      }
    }
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(coordinates,2));
    geometry.computeVertexNormals();
    const surface=mesh(geometry,material);
    surface.name=name;
    surface.castShadow=false;
    return surface;
  }

  const groundMaterial=new T.MeshStandardMaterial({color:'#a9a69c',roughness:.96,side:T.DoubleSide});
  const ready=new T.TextureLoader().loadAsync('/kin-site-concrete.png').then(map=>{
    map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=8;
    groundMaterial.map=map;
    groundMaterial.color.set('#d7d3c8');
    groundMaterial.needsUpdate=true;
    disposables.push(map);
  });
  const apronEnd=site.stairFaceCount+site.apronFaceCount;
  const apron=addFaces(site.pavement.slice(site.stairFaceCount,apronEnd),groundMaterial,'privateKincaidMeasuredApron');
  addFaces(site.pavement.slice(0,site.stairFaceCount),groundMaterial,'Kincaid measured stair treads');
  addFaces(site.pavement.slice(apronEnd),groundMaterial,'Kincaid lower link paving');
  addFaces(site.outsideTerrain,grass,'Kincaid measured outer ground');
  addFaces(site.vertical,groundMaterial,'Kincaid stair risers and retaining sides');
  addFaces(site.pad,groundMaterial,'Measured fixture apron');
  addFaces(site.padSupport,groundMaterial,'Fixture apron terrain closure');
  disposables.push(groundMaterial,...addKincaidParkingStencils(T,scene,site.localFrame,site.markingsPlane));
  const fixture=addKincaidTrailFixture(T,scene,site.fixture,site.localFrame,groundMaterial);
  disposables.push(fixture.enamel,...fixture.materials);

  const railMaterial=new T.MeshStandardMaterial({color:0x727772,metalness:.45,roughness:.54});
  disposables.push(railMaterial);
  function addRail([from,to]){
    const a=new T.Vector3(...from),delta=new T.Vector3(...to).sub(a);
    if(delta.lengthSq()<1e-6)return;
    const rail=mesh(new T.CylinderGeometry(.025,.025,delta.length(),8),railMaterial);
    rail.position.copy(a).addScaledVector(delta,.5);
    rail.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
    rail.name='Kincaid stair guard';
  }
  for(const flight of site.rails){
    addRail(flight.handrail);
    flight.posts.forEach(addRail);
  }

  function outline(height){
    const points=[],ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);
    for(let i=0;i<site.footprint.length;i++){
      const [x,z]=site.footprint[i],[ex,ez]=site.footprint[(i+1)%site.footprint.length];
      const dx=ex-x,dz=ez-z,length=Math.hypot(dx,dz);
      if(length<1e-5)continue;
      const count=Math.ceil(length/.2);
      for(let step=0;step<count;step++){
        const cx=x+dx*step/count+.08*dz/length,cz=z+dz*step/count-.08*dx/length;
        ray.set(new T.Vector3(cx,95,cz),down);
        const hit=ray.intersectObject(apron,false)[0];
        points.push(new T.Vector3(cx,(hit?.point.y??height(cx,cz))+.069,cz));
      }
    }
    return points;
  }
  return {ready,originalPathId:site.originalPathId,buildingId:site.buildingId,outline};
}

