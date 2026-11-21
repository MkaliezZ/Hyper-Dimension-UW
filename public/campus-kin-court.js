export function addKincaidTrailFixture(T,scene,data,extents,concrete){
  const group=new T.Group();
  group.name='Kincaid trail-side screened canopy';
  scene.add(group);
  const [u0,v0,u1,v1]=data.roofBoundsUV;
  const world=(u,v,y)=>new T.Vector3(extents.originXZ[0]+extents.u[0]*u+extents.v[0]*v,y,
    extents.originXZ[1]+extents.u[1]*u+extents.v[1]*v);
  const evalPlane=([u,v,c],x,z)=>u*x+v*z+c;
  const top=(u,v)=>evalPlane(data.roofPlane,u,v);
  const ground=(u,v)=>evalPlane(data.groundPlane,u,v);
  const side=T.DoubleSide;
  const baseMetal=new T.MeshStandardMaterial({color:'#424947',metalness:.48,roughness:.54,side});
  const screenMetal=new T.MeshStandardMaterial({color:'#555552',metalness:.35,roughness:.72,side});
  const underside=new T.MeshStandardMaterial({color:'#727775',metalness:.22,roughness:.76,side});
  const concreteTone=concrete;
  // Rolled enamel seams and subtle roughness in authored, repeating material.
  const dim=128, dataPixels=new Uint8Array(dim*dim*4);
  for(let z=0;z<dim;z++)for(let x=0;x<dim;x++){
    const seam=x===0?-24:x===1?-12:x===127?18:0;
    const variation=(x*19+z*11+(x*z)%17)%11-5;
    const i=(z*dim+x)*4;
    dataPixels.set([112+seam+variation,117+seam+variation,114+seam+variation,255],i);
  }
  const enamel=new T.DataTexture(dataPixels,dim,dim);
  enamel.colorSpace=T.SRGBColorSpace;
  enamel.wrapS=enamel.wrapT=T.RepeatWrapping;
  enamel.generateMipmaps=true;
  enamel.minFilter=T.LinearMipmapLinearFilter;
  enamel.magFilter=T.LinearFilter;
  enamel.anisotropy=8;
  enamel.needsUpdate=true;
  const roofMat=new T.MeshStandardMaterial({map:enamel,side,metalness:.34,roughness:.64});
  const plan=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
  function quad(points,tex,material,label){
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(p=>p.toArray()),3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(tex.flat(),2));
    geo.setIndex([0,1,2,0,2,3]);
    geo.computeVertexNormals();
    const part=new T.Mesh(geo,material);
    part.name=label;
    part.castShadow=part.receiveShadow=true;
    group.add(part);
    return part;
  }
  const upper=plan.map(([u,v])=>world(u,v,top(u,v)));
  const lower=plan.map(([u,v])=>world(u,v,top(u,v)-data.roofThickness));
  const roofUV=plan.map(([u,v])=>[(u-u0)/.65,(v-v0)/1.5]);
  quad(upper,roofUV,roofMat,'Surveyed metal roof cap');
  quad([...lower].reverse(),[...roofUV].reverse(),underside,'Cap underside');
  for(let i=0;i<4;i++){
    const j=(i+1)%4;
    quad([lower[i],lower[j],upper[j],upper[i]],[[0,0],[1,0],[1,1],[0,1]],baseMetal,'Continuous eave edge');
  }
  const yaw=-Math.atan2(extents.u[1],extents.u[0]);
  function box(u,v,y,length,height,depth,mat,name){
    const part=new T.Mesh(new T.BoxGeometry(length,height,depth),mat);
    part.rotation.y=yaw;
    part.position.copy(world(u,v,y));
    part.castShadow=part.receiveShadow=true;
    part.name=name;
    group.add(part);
    return part;
  }
  for(const [u,v] of data.postsUV){
    const bottom=ground(u,v),height=top(u,v)-data.roofThickness-bottom;
    box(u,v,bottom+height*.5,.137,height,.137,baseMetal,'Steel support');
    box(u,v,bottom+.037,.214,.074,.216,concreteTone,'Grounded post shoe');
  }
  const [a,b,v]=data.screenUV,centre=(a+b)*.5,base=ground(centre,v);
  for(const u of [a,centre,b])box(u,v,base+1.32,.058,2.04,.070,baseMetal,'Screen stile');
  for(let i=0;i<12;i++){
    const y=base+.36+i*.177;
    box(centre,v,y,b-a,.018,.041,screenMetal,'Open metal screen strip');
  }
  box(centre,v,base+.25,b-a,.062,.056,baseMetal,'Screen lower edge');
  box(centre,v,base+2.38,b-a,.064,.056,baseMetal,'Screen upper edge');
  return {group,materials:[baseMetal,screenMetal,underside,roofMat],enamel};
}

