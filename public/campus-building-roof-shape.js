// Roof repair is opt-in per reviewed asset. Classify in metric dimensions rather
// than distorted normalized model coordinates; never select vertical facades.
export function partitionRoof({positions,indices,scale,minHeight=.72,minNormalY=.72,tileMeters=3.6}){
  if(!scale?.every(v=>Number.isFinite(v)&&v>0)||!Number.isFinite(minHeight)||minHeight<0||minHeight>1||!Number.isFinite(minNormalY)||minNormalY<=0||minNormalY>1||!(tileMeters>0))throw Error('Invalid reviewed roof profile');
  const body=[],roof=[],uv=[];
  for(let n=0;n<indices.length;n+=3){
    const ids=[indices[n],indices[n+1],indices[n+2]],p=ids.map(i=>[positions[i*3]*scale[0],positions[i*3+1]*scale[1],positions[i*3+2]*scale[2]]);
    const ab=p[1].map((v,i)=>v-p[0][i]),ac=p[2].map((v,i)=>v-p[0][i]),normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],length=Math.hypot(...normal),y=p.reduce((s,v)=>s+v[1],0)/3/scale[1];
    if(length>1e-10&&normal[1]/length>=minNormalY&&y>=minHeight){
      roof.push(...ids);const endSlope=Math.abs(normal[0])>Math.abs(normal[2]);
      for(const v of p)uv.push((endSlope?v[2]:v[0])/tileMeters,(endSlope?v[0]:v[2])/tileMeters);
    }else body.push(...ids);
  }
  return {body,roof,uv};
}
