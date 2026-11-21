// Measure the visible, near-plane-clipped building box in CSS pixels. Center
// distance alone can leave a large facade on its distant atlas after zooming.
export function buildingScreenSize(T,camera,p,{width,height}){
 if(!(width>0&&height>0))return{width:0,height:0,pixels:0,area:0};
 const c=Math.cos(p.angle||0),s=Math.sin(p.angle||0),corners=[];
 for(const x of[-p.width/2,p.width/2])for(const y of[0,p.height])for(const z of[-p.depth/2,p.depth/2])corners.push(new T.Vector3(p.x+c*x+s*z,p.groundY+y,p.z-s*x+c*z).applyMatrix4(camera.matrixWorldInverse));
 const plane=-Math.max(.001,camera.near),points=corners.filter(p=>p.z<=plane).map(p=>p.clone());
 for(let i=0;i<8;i++)for(const bit of[1,2,4]){const j=i^bit;if(j<i)continue;const a=corners[i],b=corners[j];if((a.z<=plane)===(b.z<=plane))continue;points.push(a.clone().lerp(b,(plane-a.z)/(b.z-a.z)));}
 if(!points.length)return{width:0,height:0,pixels:0,area:0};
 const ndc=points.map(p=>p.applyMatrix4(camera.projectionMatrix)),clamp=n=>Math.max(-1,Math.min(1,n)),w=Math.max(0,clamp(Math.max(...ndc.map(p=>p.x)))-clamp(Math.min(...ndc.map(p=>p.x))))*width/2,h=Math.max(0,clamp(Math.max(...ndc.map(p=>p.y)))-clamp(Math.min(...ndc.map(p=>p.y))))*height/2;
 return w>0&&h>0?{width:w,height:h,pixels:Math.max(w,h),area:w*h}:{width:0,height:0,pixels:0,area:0};
}
