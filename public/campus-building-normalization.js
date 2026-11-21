// glTF material primitives may share the same POSITION/NORMAL accessors.
// Transform independent referenced subsets so one primitive cannot rescale
// another, and avoid copying the entire building buffer for every small trim.
export function normalizeBuildingRoot(T,root,frame){
  root.updateMatrixWorld(true);
  const matrix=new T.Matrix4().makeScale(1/frame.width,1/frame.height,1/frame.depth).multiply(new T.Matrix4().makeRotationY(frame.yaw)).multiply(new T.Matrix4().makeTranslation(-frame.x,-frame.y,-frame.z));
  const meshes=[],counts=new Map();root.traverse(o=>{if(o.isMesh){meshes.push(o);const p=o.geometry.attributes.position;counts.set(p,(counts.get(p)||0)+1);}});
  const result=new T.Group(),old=new Set();
  for(const mesh of meshes){
    const input=mesh.geometry;
    if(counts.get(input.attributes.position)>1){
      if(Object.keys(input.morphAttributes).length)throw Error('Static architecture normalization cannot discard morph targets');
      const used=[],lookup=new Map(),indices=[];
      for(let i=0,n=input.index?.count??input.attributes.position.count;i<n;i++){
        const source=input.index?input.index.getX(i):i;
        if(!lookup.has(source)){lookup.set(source,used.length);used.push(source);}
        indices.push(lookup.get(source));
      }
      const geometry=new T.BufferGeometry();
      for(const [name,attribute]of Object.entries(input.attributes)){
        const values=new Float32Array(used.length*attribute.itemSize);
        for(let i=0;i<used.length;i++)for(let c=0;c<attribute.itemSize;c++)values[i*attribute.itemSize+c]=attribute.getComponent(used[i],c);
        geometry.setAttribute(name,new T.BufferAttribute(values,attribute.itemSize));
      }
      geometry.setIndex(indices);geometry.groups=input.groups.map(group=>({...group}));geometry.userData={...input.userData};mesh.geometry=geometry;old.add(input);
    }
    mesh.geometry.applyMatrix4(mesh.matrixWorld).applyMatrix4(matrix);
    mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
    mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);result.add(mesh);
  }
  for(const geometry of old)geometry.dispose();
  return result;
}
