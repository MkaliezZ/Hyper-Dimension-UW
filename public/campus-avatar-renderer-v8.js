import {buildCampusVisitor as buildV7,preloadPremiumAvatar as preloadV7} from './campus-premium-avatar.js';
import {buildVisitorV8,preloadVisitorV8} from './campus-visitor-v8.js';
const isV8=recipe=>recipe?.generatorVersion==='uw-chibi-modular3d-2.0.0';
export const preloadPremiumAvatar=recipe=>isV8(recipe)?preloadVisitorV8(recipe):preloadV7();
export const buildCampusVisitor=(recipe,skins,options)=>isV8(recipe)?buildVisitorV8(recipe,skins):buildV7(recipe,skins,options);
