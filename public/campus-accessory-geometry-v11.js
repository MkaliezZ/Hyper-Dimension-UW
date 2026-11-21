// Original Q-style accessory models. Metres in the existing action-joint frame.
// Faces/hair/garments are reused byte-for-byte; these parts add UV-mapped PBR
// surfaces, actual rims/straps/stitches and ankle deformation without new slots.
export const ACCESSORY_DETAIL_IDS_V11=['shoes-loafers','shoes-boots','glasses-round','glasses-square','glasses-oval','accessory-satchel','accessory-backpack','accessory-scarf','accessory-cap','accessory-headphones','accessory-bow'];
export function decorateVisitorV11(T,root,recipe,materials){
  const {joints,headJoint:head}=root.userData,groups=[],geometries=new Set(),skeletons=[];const ids=[];
  const mat=(k,c,m=0,r=.83)=>materials.get(k,c,m,r);
  function group(parent,name){const g=new T.Group();g.name=name;parent.add(g);groups.push(g);return g;}
  function mesh(parent,g,m,name){geometries.add(g);const o=new T.Mesh(g,m);o.name=name||'';o.userData.detailFace=true;o.castShadow=false;o.receiveShadow=true;parent.add(o);return o;}
  function roundBox(w,h,d,r=.025){
    const g=new T.BoxGeometry(w,h,d,5,5,5),p=g.attributes.position,n=g.attributes.normal,inner=new T.Vector3(w/2-r,h/2-r,d/2-r),v=new T.Vector3(),q=new T.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);q.copy(v).clamp(inner.clone().negate(),inner);const normal=v.clone().sub(q).normalize();v.copy(q).addScaledVector(normal,r);p.setXYZ(i,...v.toArray());n.setXYZ(i,...normal.toArray());}return g;
  }
  function box(p,w,h,d,m,pos,r=.02,name){const o=mesh(p,roundBox(w,h,d,Math.min(r,w/3,h/3,d/3)),m,name);o.position.set(...pos);return o;}
  function tube(p,points,r,m,name,closed=false){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)),closed),Math.max(10,points.length*2),r,5,closed),m,name);}
  function ball(p,size,m,pos,name){const o=mesh(p,new T.SphereGeometry(1,16,12),m,name);o.scale.set(...size);o.position.set(...pos);return o;}
  const leather=mat('leather','#b88b5f'),edge=mat('smooth','#73523b'),thread=mat('canvas','#ead6b3'),gold=mat('smooth','#b9a56e',.6,.33),dark=mat('smooth','#343039'),canvas=mat('canvas','#aab6ac'),knit=mat('knit','#bb8b85');

  // Lens rims follow the rounded face rather than the old, smaller procedural
  // face surface. The bridge, hinges, nose pads and ear hooks are actual meshes.
  if(recipe.parts.glasses!=='glasses-none'){
    ids.push(recipe.parts.glasses);const g=group(head,'v11-'+recipe.parts.glasses),frame=mat('smooth','#51423f',.35,.30),glass=materials.lens();
    const surface=(x,y)=>.325*Math.sqrt(Math.max(.18,1-(x/.34)**2-(y/.40)**2))+.026;
    for(const s of[-1,1]){
      const pts=[],steps=48,cx=s*.126,oval=recipe.parts.glasses==='glasses-oval',square=recipe.parts.glasses==='glasses-square';
      for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,cos=Math.cos(a),sin=Math.sin(a),x=cx+(square?Math.sign(cos)*Math.abs(cos)**.42:cos)*.100,y=.005+(square?Math.sign(sin)*Math.abs(sin)**.42:sin)*(oval?.072:square?.082:.100);pts.push([x,y,surface(x,y)]);}
      tube(g,pts,.0085,frame,'rounded lens rim',true);
      const positions=[],uv=[];for(let i=0;i<steps;i++)for(const p of[[cx,.005,surface(cx,.005)],pts[i],pts[(i+1)%steps]]){positions.push(p[0],p[1],p[2]-.003);uv.push((p[0]-cx)/.21+.5,(p[1]-.005)/.21+.5);}
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();mesh(g,geometry,glass,'clear curved lens').renderOrder=3;
      box(g,.022,.018,.020,gold,[s*.231,.028,.264],.006,'hinge');
      tube(g,[[s*.226,.025,.267],[s*.287,.025,.15],[s*.322,.025,-.035],[s*.314,-.012,-.10]],.0067,frame,'temple and ear hook');
      ball(g,[.010,.017,.007],thread,[s*.030,-.023,.347],'nose pad');
    }
    tube(g,[[-.027,.018,.348],[0,.041,.358],[.027,.018,.348]],.0065,gold,'bridge');
  }

  const accessory=recipe.parts.accessory;
  if(accessory!=='accessory-none')ids.push(accessory);
  if(accessory==='accessory-satchel'){
    const shoulder=group(joints.chest,'v11-satchel-strap'),bag=group(joints.hips,'v11-satchel');
    tube(shoulder,[[-.17,.19,-.09],[-.17,.20,.07],[-.13,.12,.195],[.01,-.055,.190],[.23,-.22,.12]],.014,edge,'front crossbody strap');
    tube(shoulder,[[-.17,.19,-.09],[-.12,.09,-.17],[.07,-.11,-.17],[.23,-.22,.12]],.013,edge,'back crossbody strap');
    box(bag,.225,.205,.112,leather,[.24,.008,.065],.035,'stitched leather bag');box(bag,.234,.085,.035,leather,[.24,.070,.127],.015,'overlapping flap');
    tube(bag,[[.139,.082,.149],[.139,.043,.150],[.341,.043,.150],[.341,.082,.149]],.0017,thread,'flap stitch');
    box(bag,.036,.032,.010,gold,[.24,.035,.151],.006,'clasp');box(bag,.012,.052,.010,edge,[.24,.009,.147],.004,'closure tongue');
    for(const s of[-1,1])box(bag,.010,.055,.035,gold,[.24+s*.118,.092,.068],.003,'strap attachment');
  }
  if(accessory==='accessory-backpack'){
    const g=group(joints.chest,'v11-backpack');
    box(g,.29,.33,.145,canvas,[0,-.016,-.236],.045,'canvas main compartment');box(g,.225,.130,.045,leather,[0,-.080,-.323],.024,'front leather pocket');
    tube(g,[[-.107,-.032,-.350],[0,-.028,-.351],[.107,-.032,-.350]],.0035,gold,'pocket zipper');box(g,.008,.022,.008,gold,[.085,-.040,-.355],.002,'zipper pull');
    for(const s of[-1,1]){
      tube(g,[[s*.100,.139,-.255],[s*.16,.17,-.07],[s*.17,.095,.144],[s*.16,-.07,.142],[s*.11,-.17,-.20]],.015,edge,'padded shoulder strap');
      box(g,.043,.025,.013,gold,[s*.16,-.07,.158],.004,'strap adjuster');box(g,.038,.10,.065,canvas,[s*.158,-.08,-.25],.01,'side pocket');
    }
    tube(g,[[-.05,.15,-.25],[-.05,.205,-.25],[.05,.205,-.25],[.05,.15,-.25]],.011,edge,'carry handle');
    tube(g,[[-.125,-.155,-.312],[-.125,.12,-.312],[.125,.12,-.312],[.125,-.155,-.312]],.0018,thread,'stitched edge');
  }
  if(accessory==='accessory-scarf'){
    const g=group(joints.chest,'v11-knitted-scarf');
    const collar=mesh(g,new T.TorusGeometry(.096,.035,10,48),knit,'knitted collar');collar.rotation.x=Math.PI/2;collar.position.set(0,.24,.012);collar.scale.set(1.25,1,1);
    for(const[x,y,z,a]of[[.058,.095,.177,.16],[-.038,.060,.163,-.12]]){
      const tail=box(g,.082,.27,.027,knit,[x,y,z],.013,'folded scarf tail');tail.rotation.z=a;
      for(let i=0;i<5;i++)tube(g,[[x-.030+i*.015,y-.130,z],[x-.031+i*.015,y-.158,z+.005]],.0023,knit,'scarf fringe');
    }
    tube(g,[[-.09,.24,.075],[0,.226,.117],[.10,.24,.075]],.002,thread,'collar fold seam');
  }
  if(accessory==='accessory-cap'){
    const g=group(head,'v11-six-panel-cap'),fabric=mat('canvas',recipe.colors.top),stitch=mat('canvas','#d5ccba');g.scale.setScalar(root.userData.capClearance||1.06);
    const crownGeometry=new T.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI*.49),cp=crownGeometry.attributes.position,keep=[];
    // A real adjustment opening and fitted front crown leave the trailing
    // ponytail outside the hat without inflating its whole circumference.
    for(let i=0;i<crownGeometry.index.count;i+=3){const ids=[0,1,2].map(k=>crownGeometry.index.getX(i+k)),center=new T.Vector3();for(const id of ids)center.add(new T.Vector3().fromBufferAttribute(cp,id));center.multiplyScalar(1/3);if(center.z<-.82&&center.y<.40&&Math.abs(center.x)<.35)continue;keep.push(...ids);}crownGeometry.setIndex(keep);
    const crown=mesh(g,crownGeometry,fabric,'six-panel crown with rear opening');crown.scale.set(.357,.285,.335);crown.position.set(0,.225,-.015);
    const band=mesh(g,new T.TorusGeometry(.333,.012,6,48),fabric,'fitted hat band');band.rotation.x=Math.PI/2;band.scale.x=1.05;band.position.set(0,.233,-.015);
    // A curved, thick brim with a full UV surface, rather than a flat oval.
    const p=[],u=[],ix=[],cols=24,rows=5;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const a=-1.02+i/cols*2.04,rad=.28+j/rows*.24,x=Math.sin(a)*rad*.78,z=Math.cos(a)*rad-.01,y=.225-.032*(j/rows)+.022*(x/.34)**2;p.push(x,y,z);u.push(i/cols,j/rows);if(i&&j){const n=j*(cols+1)+i;ix.push(n-cols-2,n-1,n-cols-1,n-1,n,n-cols-1);}}
    const brim=new T.BufferGeometry();brim.setAttribute('position',new T.Float32BufferAttribute(p,3));brim.setAttribute('uv',new T.Float32BufferAttribute(u,2));brim.setIndex(ix);brim.computeVertexNormals();const bm=fabric.clone();bm.side=T.DoubleSide;mesh(g,brim,bm,'curved visor');g.userData.extraMaterial=bm;
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,pts=[];for(let j=0;j<15;j++){const t=.06+j/14*1.44;if(k===3&&t>1.13)continue;pts.push([Math.sin(t)*Math.sin(a)*.359,.225+Math.cos(t)*.287,Math.sin(t)*Math.cos(a)*.337-.015]);}tube(g,pts,.0015,stitch,'panel topstitch');}
    box(g,.080,.020,.012,gold,[.04,.234,-.351],.004,'rear adjustment buckle');
    ball(g,[.021,.012,.021],fabric,[0,.518,-.015],'covered crown button');
  }
  if(accessory==='accessory-headphones'){
    const g=group(head,'v11-over-ear-headphones');
    const points=[];for(let i=0;i<=36;i++){const a=i/36*Math.PI;points.push([Math.cos(a)*.375,.008+Math.sin(a)*.45,-.025]);}
    tube(g,points,.027,dark,'padded headband');tube(g,points.map(p=>[p[0],p[1]+.017,p[2]-.007]),.006,gold,'headband trim');
    for(const s of[-1,1]){
      tube(g,[[s*.362,.14,-.025],[s*.390,.08,-.025],[s*.390,-.07,-.025]],.007,gold,'earcup yoke');
      ball(g,[.036,.089,.073],dark,[s*.369,.005,-.018],'soft ear cushion');ball(g,[.020,.076,.062],leather,[s*.404,.005,-.018],'leather outer earcup');
      box(g,.008,.022,.006,gold,[s*.424,-.026,.018],.002,'volume rocker');
    }
  }
  if(accessory==='accessory-bow'){
    const g=group(head,'v11-woven-bow');g.position.set(...(root.userData.bowMount||[.25,.18,.27]));g.rotation.z=-.25;g.rotation.y=.72;
    for(const s of[-1,1]){
      const shape=new T.Shape();shape.moveTo(.008,-.014);shape.bezierCurveTo(.040,-.044,.100,-.050,.110,-.024);shape.bezierCurveTo(.128,.006,.109,.044,.080,.039);shape.bezierCurveTo(.055,.035,.030,.019,.008,.014);shape.closePath();
      const geo=new T.ExtrudeGeometry(shape,{depth:.020,bevelEnabled:true,bevelThickness:.005,bevelSize:.004,bevelSegments:3,curveSegments:10});geo.translate(0,0,-.010);const loop=mesh(g,geo,knit,'folded bow loop');loop.scale.x=s;loop.rotation.y=s*.17;
      tube(g,[[s*.023,-.007,.016],[s*.083,-.019,.014],[s*.030,.010,.016]],.0012,thread,'ribbon fold');
      const tail=box(g,.030,.067,.012,knit,[s*.022,-.047,-.002],.005,'ribbon tail');tail.rotation.z=s*.28;}
    box(g,.030,.050,.041,knit,[0,0,.009],.008,'wrapped knot');
  }

  if(['shoes-loafers','shoes-boots'].includes(recipe.parts.shoes)){
    ids.push(recipe.parts.shoes);const boot=recipe.parts.shoes==='shoes-boots',upper=mat('leather',recipe.colors.shoes),sole=mat('smooth','#'+new T.Color(recipe.colors.shoes).lerp(new T.Color('#5b4a3c'),.65).getHexString()),seam=mat('canvas','#b2a18a');
    for(const side of['left','right']){
      const foot=joints[side+'Foot'];for(const c of foot.children)c.visible=false;const g=group(foot,'v11-'+recipe.parts.shoes+'-'+side);
      const contour=(a,scale=1)=>[Math.sin(a)*.098*scale*(.93+.07*Math.cos(a)),.035+Math.cos(a)*.17*scale];
      function rings(levels,material,name){const p=[],uv=[],index=[],N=40;
        for(let j=0;j<levels.length;j++)for(let k=0;k<=N;k++){const a=k/N*Math.PI*2,[x,z]=contour(a,levels[j].s),y=typeof levels[j].y==='function'?levels[j].y(a):levels[j].y;p.push(x,y,z);uv.push(k/N,j/(levels.length-1));if(j&&k){const n=j*(N+1)+k;index.push(n-N-2,n-N-1,n-1,n-1,n-N-1,n);}}
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();return mesh(g,geo,material,name);
      }
      rings([{s:1,y:-.065},{s:1.055,y:-.054},{s:1.045,y:-.028},{s:1,y:-.020}],sole,'stacked outsole');
      const bottomP=[],bottomUv=[];for(let k=0;k<40;k++)for(const[x,z]of[[0,.035],contour((k+1)/40*Math.PI*2),contour(k/40*Math.PI*2)]){bottomP.push(x,-.065,z);bottomUv.push(x/.22+.5,z/.38+.5);}
      const bottom=new T.BufferGeometry();bottom.setAttribute('position',new T.Float32BufferAttribute(bottomP,3));bottom.setAttribute('uv',new T.Float32BufferAttribute(bottomUv,2));bottom.computeVertexNormals();mesh(g,bottom,sole,'closed outsole tread');
      const topY=a=>(boot?.060:.042)+(.032*(1-Math.cos(a))/2);
      rings([{s:1,y:-.022},{s:1.02,y:a=>.008+.018*(1-Math.cos(a))/2},{s:.91,y:topY}],upper,'shaped leather upper');
      const p=[],uv=[],idx=[],N=40;for(let k=0;k<=N;k++)for(const inner of[false,true]){const a=k/N*Math.PI*2,[x,z]=contour(a,.91);p.push(inner?Math.sin(a)*.057:x,inner?(boot?.102:.085):topY(a),inner?-.052+Math.cos(a)*.076:z);uv.push(k/N,inner?1:0);if(k&&inner){const n=k*2;idx.push(n-2,n,n-1,n-1,n,n+1);}}
      const vamp=new T.BufferGeometry();vamp.setAttribute('position',new T.Float32BufferAttribute(p,3));vamp.setAttribute('uv',new T.Float32BufferAttribute(uv,2));vamp.setIndex(idx);vamp.computeVertexNormals();mesh(g,vamp,upper,'vamp and heel collar');
      const stitch=[];for(let k=0;k<=32;k++){const a=-1.72+k/32*3.44,[x,z]=contour(a,.84);stitch.push([x,topY(a)+.004,z]);}tube(g,stitch,.0016,seam,'moccasin toe stitch');
      if(!boot){box(g,.160,.018,.038,upper,[0,.084,.047],.006,'penny strap');box(g,.041,.005,.011,sole,[0,.095,.049],.002,'penny slot');}
      else {
        const vertices=[],uv=[],indices=[],weights=[],skinIndices=[];const N=32,rows=8;
        for(let j=0;j<=rows;j++)for(let k=0;k<=N;k++){const y=.045+j/rows*.125,a=k/N*Math.PI*2;vertices.push(Math.sin(a)*(.072+j/rows*.008),y,-.030+Math.cos(a)*.071);uv.push(k/N,j/rows);const w=Math.min(1,Math.max(0,(y-.055)/.115));skinIndices.push(0,1,0,0);weights.push(1-w,w,0,0);if(j&&k){const n=j*(N+1)+k;indices.push(n-N-2,n-N-1,n-1,n-1,n-N-1,n);}}
        const leatherFaces=[],elasticFaces=[];for(let i=0;i<indices.length;i+=6){const cell=i/6,j=Math.floor(cell/N)+1,k=cell%N;const panel=j>2&&j<8&&((k>=6&&k<=10)||(k>=22&&k<=26));(panel?elasticFaces:leatherFaces).push(...indices.slice(i,i+6));}
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex([...leatherFaces,...elasticFaces]);geo.addGroup(0,leatherFaces.length,0);geo.addGroup(leatherFaces.length,elasticFaces.length,1);geo.computeVertexNormals();geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geometries.add(geo);
        const bones=[foot,joints[side+'Knee']];root.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones,bones.map(b=>b.matrixWorld.clone().invert())),shaft=new T.SkinnedMesh(geo,[upper,mat('knit','#4c4541')]);shaft.name='ankle-deforming boot shaft';shaft.userData.detailFace=true;g.add(shaft);root.updateMatrixWorld(true);shaft.bind(skeleton,shaft.matrixWorld);shaft.normalizeSkinWeights();skeletons.push(skeleton);
        const cuff=group(joints[side+'Knee'],'v11-boot-cuff-'+side),rim=mesh(cuff,new T.TorusGeometry(.077,.006,6,32),upper,'rounded boot collar');rim.rotation.x=Math.PI/2;rim.scale.y=.92;rim.position.set(0,-.120,0);
        box(cuff,.024,.041,.012,upper,[0,-.100,-.077],.004,'pull tab');
      }
    }
  }
  let triangles=0;for(const g of groups)g.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});
  const diagnostics={ids,triangles,textured:true,implementation:'Original joint-bound UV-mapped Q accessories;four generated PBR material tiles;boot shafts use foot/knee skin weights'};root.userData.accessoryDetails=diagnostics;
  return {diagnostics,dispose(){for(const g of groups){g.removeFromParent();g.userData.extraMaterial?.dispose();}for(const g of geometries)g.dispose();for(const s of skeletons)s.dispose();materials.dispose();}};
}
