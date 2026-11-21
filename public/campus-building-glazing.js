// Scoped to the modern library's glazed bays. The paid atlas/UVs and stone
// geometry remain intact. Per-pixel material classification avoids the old
// per-triangle tint boundaries on broad panes.
export function configureLibraryGlazing(root){
 root.traverse(mesh=>{
  if(!mesh.isMesh||mesh.userData.roofRepair)return;
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   material.vertexColors=false;
   const previous=material.onBeforeCompile;
   material.onBeforeCompile=shader=>{
    previous.call(material,shader);
    shader.vertexShader='varying float libraryUp; varying float libraryHeight;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nlibraryUp=abs(normal.y);libraryHeight=position.y;');
    shader.fragmentShader='varying float libraryUp; varying float libraryHeight;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     float high=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
     float low=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
     float spread=(high-low)/max(high,0.0001);
     float warmth=(diffuseColor.r-diffuseColor.b)/max(high,0.0001);
     float luminance=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));
     float neutral=(1.0-smoothstep(0.18,0.30,warmth))*(1.0-smoothstep(0.33,0.50,spread));
     float glass=neutral*(1.0-smoothstep(0.30,0.40,luminance))*(1.0-smoothstep(0.25,0.45,libraryUp));
     glass*=smoothstep(0.08,0.14,libraryHeight)*(1.0-smoothstep(0.90,0.95,libraryHeight));
     vec3 pane=vec3(0.022,0.034,0.039)*(0.96+0.08*clamp(luminance/0.30,0.0,1.0));
     diffuseColor.rgb=mix(diffuseColor.rgb,pane,glass);
    `);
   };
   material.customProgramCacheKey=()=> 'library-pixel-glazing-v1';material.needsUpdate=true;
  }
 });
}
