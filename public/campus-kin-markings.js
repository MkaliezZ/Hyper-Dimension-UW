export function addKincaidParkingStencils(T,scene,frame,plane){
  const size=160, canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#5d7f9e';
  ctx.fillRect(0,0,size,size);
  ctx.strokeStyle='#e6eeee';
  ctx.lineWidth=4;
  ctx.strokeRect(6,6,size-12,size-12);
  ctx.lineWidth=9;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.beginPath();
  ctx.arc(72,97,27,.12,4.72);
  ctx.moveTo(76,55);
  ctx.lineTo(76,83);
  ctx.lineTo(106,83);
  ctx.lineTo(119,115);
  ctx.lineTo(132,109);
  ctx.moveTo(76,67);
  ctx.lineTo(102,67);
  ctx.stroke();
  ctx.fillStyle='#e6eeee';
  ctx.beginPath();
  ctx.arc(76,42,8.5,0,Math.PI*2);
  ctx.fill();
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  map.anisotropy=8;
  const mat=new T.MeshStandardMaterial({map,roughness:.96,side:T.DoubleSide});
  const world=(u,v)=>[frame.originXZ[0]+frame.u[0]*u+frame.v[0]*v,
    u*plane[0]+v*plane[1]+plane[2]+.008,
    frame.originXZ[1]+frame.u[1]*u+frame.v[1]*v];
  const marks=[[-24.02,1.84],[-24.05,7.12]];
  for(const [u,v] of marks){
    const points=[[u+.56,v-.56],[u+.56,v+.56],[u-.56,v+.56],[u-.56,v-.56]].map(([a,b])=>world(a,b));
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    geo.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));
    geo.setIndex([0,1,2,0,2,3]);
    geo.computeVertexNormals();
    const decal=new T.Mesh(geo,mat);
    decal.name='Kincaid paved access stencil';
    decal.receiveShadow=true;
    scene.add(decal);
  }
  return [map,mat];
}

