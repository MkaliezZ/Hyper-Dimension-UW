// Fixed school NPC identities. User wardrobe recipes remain a separate, signed contract.
export const NPC_MODEL_IDS=Object.freeze(['maya','leo','jordan','sam','aiko','alex']);
export const NPC_MODEL_ASSETS=Object.freeze(Object.fromEntries(NPC_MODEL_IDS.map(id=>[id,Object.freeze({
  id,path:id==='sam'?'/art-v0120/models/campus-student-premium-v1/model.glb':'/art-v0130/models/npc-'+id+'-rig-v1/model.glb',
  concept:id==='sam'?'/art-v0120/concepts/campus-student-q-front.png':'/art-v0130/concepts/npc-'+id+'.png',
  height:1.55,stationary:false,mobility:'station-patrol',
})])));
