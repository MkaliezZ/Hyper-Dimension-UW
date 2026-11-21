// Original rounded campus vegetation. Metres are assigned by the unchanged landscape adapter.
export function buildQTreeGeometry(T,merge,kind,variant=0,lod=0){
  const parts=[],sides=[16,10,6][lod],rings=[12,7,4][lod],tile=kind==='cherry'?[0,0]:kind==='conifer'?[1,0]:[1,1];
  function add(g,position=[0,0,0],scale=[1,1,1],wood=false,tint=1,rotation){
    const matrix=new T.Matrix4().compose(new T.Vector3(...position),rotation||new T.Quaternion(),new T.Vector3(...scale));g.applyMatrix4(matrix);const uv=g.attributes.uv,[x,y]=wood?[0,1]:tile;for(let i=0;i<uv.count;i++)uv.setXY(i,x*.5+.015+uv.getX(i)*.47,1-(y*.5+.015+uv.getY(i)*.47));const color=[];for(let i=0;i<g.attributes.position.count;i++)color.push(tint,tint,tint);g.setAttribute('color',new T.Float32BufferAttribute(color,3));if(g.index)g=g.toNonIndexed();parts.push(g);
  }
  function blob(x,y,z,w,h,d,tint=1){const g=new T.SphereGeometry(1,sides,rings),p=g.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),f=1+.035*Math.sin(a*5+variant)*Math.max(0,1-Math.abs(p.getY(i)));p.setXYZ(i,p.getX(i)*f,p.getY(i),p.getZ(i)*f);}g.computeVertexNormals();add(g,[x,y,z],[w,h,d],false,tint);}
  function branch(a,b,r1,r2){const from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize());add(new T.CylinderGeometry(r2,r1,delta.length(),Math.max(5,sides/2|0),1),from.add(to).multiplyScalar(.5).toArray(),[1,1,1],true,1,q);}
  const lean=[-.035,.02,.045,-.02][variant],trunkTop=kind==='conifer'?.8:kind==='cherry'?.48:.55;
  branch([0,0,0],[lean,trunkTop,0],.06,.024);for(let i=0;i<4;i++){const a=i*Math.PI/2+.25;branch([0,.12,0],[Math.cos(a)*.11,0,Math.sin(a)*.11],.025,.013);}
  if(kind==='conifer'){
    for(let layer=0;layer<4;layer++){const y=.42+layer*.16,r=.40-layer*.085;blob(lean,y,0,r,.19-layer*.02,r*.9,.94+layer*.025);for(let i=0;i<3;i++){const a=i/3*Math.PI*2+variant*.4+layer*.5;blob(lean+Math.cos(a)*r*.48,y-.035,Math.sin(a)*r*.46,r*.64,.13,r*.62,.97);}}
    blob(lean,1.015,0,.095,.12,.10,1.02);
  }else{
    const spread=variant===1?.78:variant===2?1.1:1,raise=variant===1?.08:variant===3?-.05:0,n=kind==='cherry'?7:5;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+variant*.35,r=(kind==='cherry'?.31:.23)*spread,x=lean+Math.cos(a)*r,z=Math.sin(a)*r*.9,y=(kind==='cherry'?.69:.73)+raise+Math.sin(i*2.1+variant)*.045;branch([lean,trunkTop*.65,0],[x,y,z],.024,.009);blob(x,y,z,(kind==='cherry'?.23:.255)*spread,kind==='cherry'?.175:.23,.23*spread,.94+(i%3)*.035);}
    blob(lean,.86+raise,0,.29*spread,.235,.28*spread,1.015);
    if(variant===2)blob(lean-.21,.91,0,.21,.19,.22,1.025);
  }
  const g=merge(parts,false);parts.forEach(g=>g.dispose());g.computeBoundingBox();const box=g.boundingBox,size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());g.translate(-center.x,-box.min.y,-center.z);g.scale(1/size.x,1/size.y,1/size.z);return g;
}
