import {buildVisitorV10,preloadVisitorV10} from './campus-visitor-v10.js';
import {buildVisitorV11,preloadVisitorV11} from './campus-visitor-v11.js';
import {buildCampusVisitor as buildV7,preloadPremiumAvatar as preloadV7} from './campus-premium-avatar.js';
import {buildVisitorV8,preloadVisitorV8} from './campus-visitor-v8.js';
import {buildVisitorV9,preloadVisitorV9} from './campus-visitor-v9.js';
const generation=recipe=>recipe?.generatorVersion;
export const preloadPremiumAvatar=recipe=>generation(recipe)==='uw-chibi-modular3d-5.0.0'?preloadVisitorV11(recipe):generation(recipe)==='uw-chibi-modular3d-4.0.0'?preloadVisitorV10(recipe):generation(recipe)==='uw-chibi-modular3d-3.0.0'?preloadVisitorV9(recipe):generation(recipe)==='uw-chibi-modular3d-2.0.0'?preloadVisitorV8(recipe):preloadV7();
export const buildCampusVisitor=(recipe,skins,options)=>generation(recipe)==='uw-chibi-modular3d-5.0.0'?buildVisitorV11(recipe,skins):generation(recipe)==='uw-chibi-modular3d-4.0.0'?buildVisitorV10(recipe,skins):generation(recipe)==='uw-chibi-modular3d-3.0.0'?buildVisitorV9(recipe,skins):generation(recipe)==='uw-chibi-modular3d-2.0.0'?buildVisitorV8(recipe,skins):buildV7(recipe,skins,options);
