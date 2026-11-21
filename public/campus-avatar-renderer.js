import {buildVisitorV13,preloadVisitorV13} from './campus-visitor-v13.js';
import {buildCampusVisitor as buildEarlier,preloadPremiumAvatar as preloadEarlier} from './campus-avatar-renderer-v12.js';

const current=recipe=>recipe?.generatorVersion==='uw-chibi-modular3d-7.0.0';
export const preloadPremiumAvatar=recipe=>current(recipe)?preloadVisitorV13(recipe):preloadEarlier(recipe);
export const buildCampusVisitor=(recipe,skins,options)=>current(recipe)?buildVisitorV13(recipe,skins):buildEarlier(recipe,skins,options);
