import {terrainHeight,terrainPatchGeometry} from './terrain-surface.js';

function clip(poly,value){
  const out=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],x=value(a),y=value(b);
    if(x>=-1e-9)out.push(a);
    if(x*y<0){const t=x/(x-y);out.push(a.map((v,k)=>v+(b[k]-v)*t));}
  }
  return out;
}

// A display-only apron supports whole buildings at the edge of the cropped
// campus. It borrows the actual grass material and UV phase. Walking bounds,
// DEM samples, building identities and the navigation graph stay authoritative.
export function buildingApronGeometry(T,terrain,{edge,ring,extension}){
  if(edge==='east')return measuredEastGroundGeometry(T,terrain,extension);
  if(edge==='southwest')return measuredSouthwestGroundGeometry(T,terrain,extension);
  if(edge==='west')return measuredWestGroundGeometry(T,terrain,extension);
  if(!['south','north'].includes(edge))throw Error('Only reviewed north/south-edge aprons are supported');
  if(!Array.isArray(ring)||ring.length<3||ring.length>128||!ring.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))throw Error('Invalid building apron polygon');
  const[x0,z0,x1,z1]=terrain.bounds,sign=edge==='south'?1:-1,boundary=edge==='south'?z1:z0;
  if(ring.some(p=>sign*(p[1]-boundary)>100||p[0]<x0||p[0]>x1))throw Error('Building apron exceeds its bounded display area');
  const step=(x1-x0)/(terrain.width-1),positions=[],uv=[];
  for(const ids of T.ShapeUtils.triangulateShape(ring.map(p=>new T.Vector2(...p)),[])){
    const tri=clip(ids.map(i=>ring[i]),p=>sign*(p[1]-boundary)+.02);if(tri.length<3)continue;
    const lo=Math.max(0,Math.floor((Math.min(...tri.map(p=>p[0]))-x0)/step)),hi=Math.min(terrain.width-2,Math.floor((Math.max(...tri.map(p=>p[0]))-x0)/step));
    for(let col=lo;col<=hi;col++){
      const left=x0+col*step,right=left+step;
      const poly=clip(clip(tri,p=>p[0]-left),p=>right-p[0]);
      for(let i=1;i<poly.length-1;i++){
        const q=[poly[0],poly[i],poly[i+1]];
        const area=(q[1][0]-q[0][0])*(q[2][1]-q[0][1])-(q[1][1]-q[0][1])*(q[2][0]-q[0][0]);
        if(Math.abs(area)<1e-8)continue;if(area>0)q.reverse();
        for(const[x,z]of q){positions.push(x,terrainHeight(terrain,x,z)-.005,z);uv.push(x/5,z/5);}
      }
    }
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  return geometry;
}

// A separately sampled east- or west-edge DEM continues the canonical triangle lattice.
// Only the seam column is shared; interior canonical heights/navigation remain
// unchanged. Extending a clamped border is not suitable for the downhill site.
export function measuredEastGroundGeometry(T,canonical,extension){
  return measuredSideGroundGeometry(T,canonical,extension,'east');
}

export function measuredWestGroundGeometry(T,canonical,extension){
  return measuredSideGroundGeometry(T,canonical,extension,'west');
}

function measuredSideGroundGeometry(T,canonical,extension,edge){
  const east=edge==='east';
  const t=extension;
  if(!t||!Array.isArray(t.bounds)||t.bounds.length!==4||!t.bounds.every(Number.isFinite)||!Number.isInteger(t.width)||!Number.isInteger(t.height)||t.width<2||t.height<2||t.width>32||t.height>64||!Array.isArray(t.heights)||t.heights.length!==t.width*t.height||!t.heights.every(Number.isFinite))throw Error('Invalid measured terrain grid');
  const [cx0,cz0,cx1,cz1]=canonical.bounds,[x0,z0,x1,z1]=t.bounds;
  const dx=(cx1-cx0)/(canonical.width-1),dz=(cz1-cz0)/(canonical.height-1);
  const seamX=east?cx1:cx0,seamCol=east?0:t.width-1;
  if(Math.abs((east?x0:x1)-seamX)>1e-7||x1<=x0||x1-x0>64||z0<cz0||z1>cz1||z1<=z0||z1-z0>200)throw Error('Measured terrain exceeds reviewed display bounds');
  if(Math.abs((x1-x0)/(t.width-1)-dx)>1e-7||Math.abs((z1-z0)/(t.height-1)-dz)>1e-7||Math.abs((z0-cz0)/dz-Math.round((z0-cz0)/dz))>1e-7)throw Error('Measured terrain must continue the existing DEM lattice');
  if(t.referenceElevation!==canonical.referenceElevation||t.verticalExaggeration!==canonical.verticalExaggeration)throw Error('Measured terrain datum/scale does not match campus');
  for(let j=0;j<t.height;j++)if(Math.abs(t.heights[j*t.width+seamCol]-terrainHeight(canonical,seamX,z0+j*dz))>1e-5)throw Error('Measured terrain seam differs from campus');
  const positions=[],uv=[];
  for(let j=0;j<t.height-1;j++)for(let i=0;i<t.width-1;i++){
    const corners=[[i,j],[i+1,j],[i,j+1],[i+1,j+1]];
    for(const k of[0,2,1,1,2,3]){
      const [col,row]=corners[k],x=x0+col*dx,z=z0+row*dz;
      positions.push(x,t.heights[row*t.width+col]-.005,z);uv.push(x/5,z/5);
    }
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  return geometry;
}

export function addBuildingApron(T,scene,terrain,material,options){
  if(!material)throw Error('The shared campus grass material is required');
  const geometry=buildingApronGeometry(T,terrain,options),mesh=new T.Mesh(geometry,material);
  mesh.name='Reviewed building edge apron';mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.visualOnly=true;scene.add(mesh);
  const paths=options.edge==='southwest'?installCornerPavement(T,scene,options.extension,options.paving):null;
  return {mesh,dispose(){paths?.dispose();geometry.dispose();mesh.removeFromParent();}};
}

// Continue the measured surface across the two touching edges of a corner.
export function measuredSouthwestGroundGeometry(T,canonical,t){
  if(!t||!Array.isArray(t.bounds)||t.bounds.length!==4||!t.bounds.every(Number.isFinite)||
    !Number.isInteger(t.width)||!Number.isInteger(t.height)||t.width<3||t.height<3||t.width>40||t.height>64||
    !Array.isArray(t.heights)||t.heights.length!==t.width*t.height||!t.heights.every(Number.isFinite))throw Error('Invalid corner DEM');
  const [cx0,cz0,cx1,cz1]=canonical.bounds,[x0,z0,x1,z1]=t.bounds;
  const dx=(cx1-cx0)/(canonical.width-1),dz=(cz1-cz0)/(canonical.height-1);
  const col=t.westSeamColumn,row=t.southSeamRow;
  if(!Number.isInteger(col)||col<=0||col>=t.width-1||!Number.isInteger(row)||row<=0||row>=t.height-1||
    x0>=cx0||x1<=cx0||x1>cx1||z0<cz0||z0>=cz1||z1<=cz1||cx0-x0>130||z1-cz1>130||
    Math.abs(x0+col*dx-cx0)>1e-7||Math.abs(z0+row*dz-cz1)>1e-7||
    Math.abs(x0+(t.width-1)*dx-x1)>1e-7||Math.abs(z0+(t.height-1)*dz-z1)>1e-7||
    t.referenceElevation!==canonical.referenceElevation||t.verticalExaggeration!==canonical.verticalExaggeration)
    throw Error('Corner DEM must meet the canonical terrain lattice and datum');
  const requireVertex=(i,j)=>{
    const x=x0+i*dx,z=z0+j*dz;
    if(Math.abs(t.heights[j*t.width+i]-terrainHeight(canonical,x,z))>1e-5)
      throw Error('Corner DEM height differs at a shared vertex');
  };
  for(let j=0;j<=row;j++)requireVertex(col,j);
  for(let i=col+1;i<t.width;i++)requireVertex(i,row);
  const positions=[],uv=[];
  for(let j=0;j<t.height-1;j++)for(let i=0;i<t.width-1;i++){
    if(i>=col&&j<row)continue;
    const corners=[[i,j],[i+1,j],[i,j+1],[i+1,j+1]];
    for(const k of [0,2,1,1,2,3]){
      const [xIndex,zIndex]=corners[k],x=x0+xIndex*dx,z=z0+zIndex*dz;
      positions.push(x,t.heights[zIndex*t.width+xIndex]-.005,z);uv.push(x/5,z/5);
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}


function installCornerPavement(T,scene,extension,patches){
  if(!Array.isArray(patches)||!patches.length||patches.length>8)throw Error('Invalid reviewed corner pavement');
  const [x0,z0,x1,z1]=extension.bounds;
  const groups=[],pixels=new Uint8Array(64*64*4);
  for(let i=0;i<4096;i++){
    const line=i%64===0||i<64,noise=(i*1850261+i%23*73)%9-4;
    pixels.set([191+noise-(line?22:0),184+noise-(line?21:0),170+noise-(line?19:0),255],i*4);
  }
  const tile=new T.DataTexture(pixels,64,64);
  tile.colorSpace=T.SRGBColorSpace;tile.wrapS=tile.wrapT=T.RepeatWrapping;
  tile.magFilter=T.LinearFilter;tile.minFilter=T.LinearMipmapLinearFilter;tile.generateMipmaps=true;tile.needsUpdate=true;
  const material=new T.MeshStandardMaterial({map:tile,roughness:.95});
  for(const {id,ring} of patches){
    if(typeof id!=='string'||!Array.isArray(ring)||ring.length<3||ring.length>16||!ring.every(p=>
      Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=x0&&p[0]<=x1&&p[1]>=z0&&p[1]<=z1))
      throw Error('Invalid corner pavement ring');
    const geometry=terrainPatchGeometry(T,extension,ring,.029),part=new T.Mesh(geometry,material);
    const attr=geometry.attributes.position,uv=[];
    for(let i=0;i<attr.count;i++)uv.push(attr.getX(i)/1.2,attr.getZ(i)/1.2);
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    part.receiveShadow=true;part.userData.visualOnly=true;part.name='FOEGE plaza '+id;
    scene.add(part);groups.push(part);
  }
  return {dispose(){for(const g of groups){g.geometry.dispose();g.removeFromParent();}tile.dispose();material.dispose();}};
}
