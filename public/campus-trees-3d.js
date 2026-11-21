import {pdlCrownPlan,fitPdlMapleCrown} from './pdl-crown-clearance-v43.js';
import {mcmCrownPlan,fitMcmCrown} from './mcm-bridge-trees-v57.js';
import * as T from './art-v0120/vendor/three/three.module.js';
import {GLTFLoader} from './art-v0120/vendor/three/addons/loaders/GLTFLoader.js';
import {createTreeSlots,treeLod} from './campus-tree-stream.js';
import {drawWarmActors} from './campus-gpu-warmup.js';

export const TREE_ASSETS={cherry:'q-cherry-v1',conifer:'q-conifer-v1',broadleaf:'q-broadleaf-v1'};
import {treeShape} from './campus-tree-variants.js';
export {treeShape} from './campus-tree-variants.js';
export async function addCampusTrees(scene,trees,height){
  const loader=new GLTFLoader(),dummy=new T.Object3D(),groups=[],buckets=[];
  await Promise.all(Object.entries(TREE_ASSETS).map(async([kind,id])=>{
    const [{scene:source},lodData]=await Promise.all([loader.loadAsync('/art-v0120/models/'+id+'/model.glb'),fetch('/art-v0120/models/'+id+'/lods.json').then(r=>{if(!r.ok)throw Error('Tree LOD missing');return r.json();})]);source.updateMatrixWorld(true);
    const box=new T.Box3().setFromObject(source),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    const normalization=new T.Matrix4().makeScale(1/size.x,1/size.y,1/size.z).multiply(new T.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
    source.traverse(o=>{if(!o.isMesh)return;if(!o.material.map?.image)throw Error('Tree texture missing: '+id);
      for(let variant=0;variant<4;variant++){
        const all=trees.filter(p=>p.kind===kind&&treeShape(p.id).shape===variant);if(!all.length)continue;
        const plans=new Map(all.flatMap(row=>{const pdl=pdlCrownPlan(row);if(pdl)return [[row.id,{...pdl,site:"pdlCrown"}]];const mcm=mcmCrownPlan(row,treeShape(row.id),height(row.x,row.z));return mcm?[[row.id,{...mcm,site:"mcmCrown"}]]:[];}));
        const standard=all.filter(row=>!plans.has(row.id));
        for(const rows of [standard,...all.filter(row=>plans.has(row.id)).map(row=>[row])].filter(row=>row.length)){
        const records=rows.map(p=>{const form=treeShape(p.id),h=p.height*form.heightFactor;dummy.position.set(p.x,height(p.x,p.z)-.12,p.z);dummy.rotation.set(0,form.angle,0);dummy.scale.set(p.crownWidth*form.widthFactor,h,p.crownWidth*form.depthFactor);dummy.updateMatrix();return {matrix:dummy.matrix.clone(),center:new T.Vector3(p.x,dummy.position.y+h/2,p.z),radius:Math.max(h,p.crownWidth)/1.5};});
        const plan=rows.length===1?plans.get(rows[0].id):null;
        const levels=lodData.variants[variant].levels.map((level,lod)=>{
          const geo=new T.BufferGeometryLoader().parse(level.geometry);
          const correctCrown=plan?.site==="pdlCrown"?fitPdlMapleCrown:fitMcmCrown;
          const corrected=plan?correctCrown(T,geo,records[0].matrix,plan):0;
          const material=o.material.clone();material.roughness=.95;material.side=T.DoubleSide;
          const instances=new T.InstancedMesh(geo,material,rows.length);instances.instanceMatrix.setUsage(T.DynamicDrawUsage);instances.name='UWTree-'+kind+'-shape-'+variant+'-lod-'+lod;instances.castShadow=lod===0;instances.receiveShadow=true;instances.frustumCulled=false;instances.count=0;
          if(plan)instances.userData[plan.site]={id:plan.id,origin:plan.origin,matrix:records[0].matrix,lod,modifiedVertices:corrected};
          scene.add(instances);groups.push(instances);return instances;
        });
        for(const mesh of levels)mesh.setMatrixAt(0,records[0].matrix);buckets.push({levels,records,slots:levels.map(mesh=>createTreeSlots(mesh,records)),lods:new Int8Array(records.length).fill(-1)});
        }
      }
    });
  }));
  const frustum=new T.Frustum(),viewProjection=new T.Matrix4(),sphere=new T.Sphere(),streaming={checks:0,uploads:0,skippedUploads:0,slotsWritten:0};let last=0;
  return {streaming,async warmup(renderer,camera,warm){
    const counts=groups.map(m=>m.count);
    try{for(const mesh of groups){mesh.count=Math.max(1,mesh.count);await warm(mesh,camera,scene);}await drawWarmActors(T,renderer,scene,groups);}
    finally{groups.forEach((mesh,i)=>mesh.count=counts[i]);}
    return {levels:groups.length,compiled:true};
  },metrics:{instances:trees.length,baseModels:3,style:'rounded-Q-painted',texturedGLB:true,branchPoses:12,lodLevels:3,minHeight:Math.min(...trees.map(p=>p.height*treeShape(p.id).heightFactor)),maxHeight:Math.max(...trees.map(p=>p.height*treeShape(p.id).heightFactor)),positions:'unchanged-public-GIS-snapshot',heights:'designed-variation-not-surveyed'},update(camera,now,force=false){
    if(!force&&now-last<100)return;last=now;camera.updateMatrixWorld();frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    streaming.checks++;
    for(const bucket of buckets){const {records,slots,lods}=bucket,next=[[],[],[]];
      for(let i=0;i<records.length;i++){const row=records[i];sphere.center.copy(row.center);sphere.radius=row.radius+(lods[i]<0?4:16);const d=camera.position.distanceTo(row.center);if(d>1800||!frustum.intersectsSphere(sphere)){lods[i]=-1;continue;}const lod=treeLod(d,lods[i]);lods[i]=lod;next[lod].push(i);}
      slots.forEach((slot,lod)=>{const result=slot.sync(next[lod]);if(result.changed){streaming.uploads++;streaming.slotsWritten+=result.slotsWritten;}else streaming.skippedUploads++;});
    }
  }};
}
