export const GARMENT_FITS={
 'top-hoodie':{asset:'visitor-top-hoodie-v1',width:.73,height:.65,depth:.39,bottom:-.24,separationY:-.08},
 'top-varsity':{asset:'visitor-top-varsity-v1',width:.73,height:.50,depth:.34,bottom:-.23,separationY:-.03},
 'top-tee':{asset:'visitor-top-tee-v1',width:.70,height:.45,depth:.32,bottom:-.215,separationY:.02,shortSleeves:true},
 'top-polo':{asset:'visitor-top-polo-v1',width:.70,height:.45,depth:.32,bottom:-.215,separationY:-.03,shortSleeves:true},
 'top-cardigan':{asset:'visitor-top-cardigan-v1',width:.73,height:.50,depth:.34,bottom:-.23,separationY:-.04,forearmDepthScale:.45},
 'top-vest':{asset:'visitor-top-vest-v1',width:.70,height:.47,depth:.33,bottom:-.215,separationY:-.03,shortSleeves:true},
};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
// Existing action-joint order: chest, left arm/forearm, right arm/forearm.
export function garmentWeights(x,y,influence=null){
 if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Non-finite garment position');
 if(influence!==null&&(!Number.isFinite(influence)||influence<0||influence>1))throw Error('Invalid sleeve influence');
 const arm=influence??smooth(.225,.265,Math.abs(x))*(1-smooth(.15,.25,y)),fore=1-smooth(-.11,-.035,y),side=x<0?1:3;
 return {indices:[0,side,side+1,0],weights:[1-arm,arm*(1-fore),arm*fore,0]};
}
export function garmentDepth(z,y,influence,fit){const fore=1-smooth(-.11,-.035,y);return z*(1+((fit.forearmDepthScale??1)-1)*influence*fore);}
