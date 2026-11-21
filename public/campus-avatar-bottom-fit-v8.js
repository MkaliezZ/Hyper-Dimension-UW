export const BOTTOM_FITS={
 'bottom-trousers':{asset:'visitor-bottom-trousers-v1',width:.44,height:.52,depth:.28,top:.07},
 'bottom-skirt':{asset:'visitor-bottom-skirt-v1',width:.56,height:.32,depth:.39,top:.07,skirt:true},
 'bottom-shorts':{asset:'visitor-bottom-shorts-v1',width:.44,height:.25,depth:.28,top:.07},
 'bottom-jeans':{asset:'visitor-bottom-jeans-v1',width:.44,height:.52,depth:.28,top:.07},
 'bottom-cargo':{asset:'visitor-bottom-cargo-v1',width:.48,height:.52,depth:.30,top:.07},
 'bottom-culottes':{asset:'visitor-bottom-culottes-v1',width:.54,height:.50,depth:.32,top:.07},
};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
// Existing action joints: hips,left thigh,left knee,right thigh,right knee.
export function bottomWeights(x,y,fit){
 if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Non-finite lower garment position');
 const side=x<0?1:3,leg=smooth(.012,.055,Math.abs(x))*(1-smooth(-.16,-.035,y));
 if(fit.skirt)return {indices:[0,side,0,0],weights:[1-leg*.22,leg*.22,0,0]};
 const knee=1-smooth(-.31,-.19,y);
 return {indices:[0,side,side+1,0],weights:[1-leg,leg*(1-knee),leg*knee,0]};
}
