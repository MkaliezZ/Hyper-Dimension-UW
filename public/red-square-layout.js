// Photo-calibrated art props; rendering and walking consume the same footprints.
// Existing GIS building geometry and the registered plaza boundary are unchanged.
export const RED_PLATFORM_CENTER=[-129.5,46.5];
export const RED_SEATING=[[-138,38],[-121,38],[-121,55],[-138,55]].map(([x,z])=>({x,z,collisionRadius:5.2,angle:Math.atan2(x-RED_PLATFORM_CENTER[0],RED_PLATFORM_CENTER[1]-z)}));
// Three parallel brick slabs form a close cluster: two foreground pylons and
// the third recessed between them. Plaza views therefore often show two faces.
export const RED_TOWERS=[
  {x:-149.5,z:9.2,height:36.6,banner:'For passion. For possibility.'},
  {x:-146,z:5.8,height:39.6,banner:null},
  {x:-142.5,z:9.2,height:42.7,banner:'BE BOUNDLESS'},
].map(p=>({...p,width:5.8,depth:1.8,angle:0,collisionRadius:3.1}));
export const RED_OBELISK={x:-70,z:12,height:7.92,collisionRadius:3};
