// Shared, explicit fitting profiles for the candidate v8 wardrobe. Current v7
// receipts and renderer remain separate until the explicit upgrade is accepted.
export const VISITOR_HAIR_FITS=Object.freeze({
  sidepart:{width:.73,crown:.445,z:-.035},
  curly:{width:.76,crown:.39,z:-.035},
  short:{width:.72,crown:.37,z:-.025},
  bob:{width:.76,crown:.39,z:-.035},
  ponytail:{width:.73,crown:.46,z:-.045,faceCut:.16},
  long:{width:.88,crown:.39,z:-.04},
  braids:{width:.76,crown:.39,z:-.035},
  bun:{width:.72,crown:.63,z:-.035,faceCut:.20},
});
export function hairFitTransform(style,box){
  const p=VISITOR_HAIR_FITS[style];if(!p)throw Error('Unknown v8 hairstyle');
  const span=box.max.x-box.min.x;if(!(span>0&&Number.isFinite(span)))throw Error('Invalid hair bounds');
  const scale=p.width/span,offset=[-(box.min.x+box.max.x)/2*scale,p.crown-box.max.y*scale,-(box.min.z+box.max.z)/2*scale+p.z];
  return {...p,scale,offset};
}
