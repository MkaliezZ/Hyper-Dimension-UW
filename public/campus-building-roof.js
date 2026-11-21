import * as T from '/art-v0120/vendor/three/three.module.js';
import {partitionRoof} from './campus-building-roof-shape.js';

// Keeps every paid source vertex, original facade UV and PBR texture unchanged.
// The separate roof triangles use continuous metric UVs across old atlas seams.
export function repairBuildingRoof(root,profile,placement,texture){
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});let roofTriangles=0;
  for(const mesh of meshes){
    if(Array.isArray(mesh.material))throw Error('Review multi-material roof separately');
    const source=mesh.geometry,p=source.attributes.position,indices=source.index?.array||Array.from({length:p.count},(_,i)=>i),parts=partitionRoof({positions:p.array,indices,scale:[placement.width,placement.height,placement.depth],...profile});
    if(!parts.roof.length)continue;
    const body=source.clone();body.setIndex(parts.body);mesh.geometry=body;
    const roof=new T.BufferGeometry();
    for(const name of ['position','normal']){const a=source.attributes[name],values=new Float32Array(parts.roof.length*a.itemSize);for(let i=0;i<parts.roof.length;i++)for(let k=0;k<a.itemSize;k++)values[i*a.itemSize+k]=a.array[parts.roof[i]*a.itemSize+k];roof.setAttribute(name,new T.BufferAttribute(values,a.itemSize));}
    roof.setAttribute('uv',new T.Float32BufferAttribute(parts.uv,2));
    const m=new T.MeshStandardMaterial({name:'Reviewed slate roof with metric UV',map:texture,color:profile.tint||'#ffffff',roughness:.97,metalness:0,side:mesh.material.side}),roofMesh=new T.Mesh(roof,m);
    roofMesh.name=mesh.name+'-roof-uv-repair';roofMesh.userData.roofRepair=true;mesh.add(roofMesh);source.dispose();roofTriangles+=parts.roof.length/3;
  }
  return {roofTriangles};
}
