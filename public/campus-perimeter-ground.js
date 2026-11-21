const sourcePath='/art-v0130/campus-perimeter-ground-v2.json';
const campusGeometryHash='e77afd817acd8f7912598ec09feb7900329830c228580cfc593115a26a1dfe3d';

export async function loadCampusPerimeterGround(T,campus,material){
  if(campus.geometryHash!==campusGeometryHash)return null;
  const response=await fetch(sourcePath);
  if(!response.ok)throw new Error('Campus perimeter terrain could not load');
  const {geometryHash,positions,indices}=await response.json();
  const vertexCount=positions?.length/3;
  if(geometryHash!==campus.geometryHash||!Number.isInteger(vertexCount)||vertexCount<3||vertexCount>25000||
     !positions.every(Number.isFinite)||!Array.isArray(indices)||!indices.length||indices.length%3||
     indices.some(index=>!Number.isInteger(index)||index<0||index>=vertexCount)){
    throw new Error('Invalid campus perimeter terrain');
  }
  const textureCoords=new Float32Array(vertexCount*2);
  for(let i=0;i<vertexCount;i++){
    textureCoords[2*i]=positions[3*i]/5;
    textureCoords[2*i+1]=positions[3*i+2]/5;
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.BufferAttribute(textureCoords,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh=new T.Mesh(geometry,material);
  mesh.name='Continuous campus perimeter terrain';
  mesh.receiveShadow=true;
  mesh.userData.visualOnly=true;
  mesh.userData.campusLandscapeExtension=true;
  return mesh;
}
