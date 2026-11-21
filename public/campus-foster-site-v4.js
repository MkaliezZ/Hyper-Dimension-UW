import {terrainHeight} from './terrain-surface.js';
import {FOSTER_SITE as data} from './campus-foster-site-data-v4.js';

const inside=(x,z,ring)=>{
  let hit=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const [a,b]=ring[j],[c,d]=ring[i];
    if((b>z)!==(d>z)&&x<a+(c-a)*(z-b)/(d-b))hit=!hit;
  }
  return hit;
};
const distance=(x,z,[a,b],[c,d])=>{
  const u=c-a,v=d-b,t=Math.min(1,Math.max(0,((x-a)*u+(z-b)*v)/(u*u+v*v)));
  return Math.hypot(x-a-u*t,z-b-v*t);
};
const [left,from,right,to]=data.terrain.bounds;
const [u,v]=data.axes,[ox,oz]=data.origin;
const fromLocal=(a,b)=>[ox+u[0]*a+v[0]*b,oz+u[1]*a+v[1]*b];
const local=(x,z)=>[(x-ox)*u[0]+(z-oz)*u[1],(x-ox)*v[0]+(z-oz)*v[1]];
const cache=new WeakMap();
const sidewalk=[[68.58,23.82],[70.85,23.82],[70.85,29.08],[68.58,29.08]];
const sidewalkRise=.07;

export function fosterSite(campus){
  if(cache.has(campus))return cache.get(campus);
  if(campus.geometryHash!==data.geometryHash||data.bodies.some(b=>!campus.buildings.some(p=>p.id===b.id)))return;
  function ground(x,z){
    if(x<left||x>right||z<from||z>to)return;
    return terrainHeight(data.terrain,x,z);
  }
  const main=data.mainSteps,entry=data.dempseyThreshold;
  const slopeToe=a=>terrainHeight(campus.terrain,...fromLocal(a,main.toeV))+.025;
  function stairFloor(a,b){
    if(a<main.minX||a>main.maxX||b<main.topV||b>main.toeV)return;
    if(b<=main.firstV){
      const step=Math.max(1,Math.min(main.stepCount,Math.floor((main.firstV-b)/main.depth)+1));
      return main.lowY+(main.highY-main.lowY)*step/main.stepCount;
    }
    const width=(main.maxX-main.minX)/9,cell=Math.min(8,Math.floor((a-main.minX)/width));
    const west=main.minX+cell*width,east=west+width;
    const f=(a-west)/width,g=(b-main.firstV)/(main.toeV-main.firstV);
    const l=slopeToe(west),r=slopeToe(east),h=main.apronHighY;
    if(f>=g)return h+(r-h)*g;
    return h+(l-h)*g+(r-l)*f;
  }
  function floor(x,z){
    const [a,b]=local(x,z);
    const stairs=stairFloor(a,b);
    if(stairs!==undefined)return stairs;
    if(a>=entry.minX&&a<=entry.maxX&&b>=entry.minV&&b<=entry.maxV)return entry.top;
    const y=ground(x,z);
    if(y===undefined)return;
    const step=data.landingSteps.find(p=>a>=p.u0&&a<p.u1&&b>=p.v0&&b<=p.v1);
    if(step)return step.y;
    if(inside(a,b,sidewalk))return y+sidewalkRise;
    if(!inside(a,b,data.paving.pavedRing))return;
    const [p,q,c]=data.paving.plane;
    return p*a+q*b+c;
  }
  function blocked(x,z,radius){
    const [a,b]=local(x,z);
    if(b>main.railSpan[0]-radius&&b<main.railSpan[1]+radius&&main.rails.some(r=>Math.abs(r-a)<radius+.045))return true;
    if(x<left||x>right||z<from||z>to)return false;
    return data.planters.some(r=>inside(a,b,r)||r.some((p,i)=>distance(a,b,p,r[(i+1)%r.length])<radius));
  }
  const trees=Object.values(data.relativeTreeAdjustments);
  const treeLevels=new Map(trees.map(row=>[row.at.join(","),row.ground]));
  const treeGround=(x,z)=>treeLevels.get([x,z].join(","));
  const value={ground,floor,blocked,keepBench:id=>!data.stairBenchIds.includes(id),treeGround,treeFit:id=>data.relativeTreeAdjustments[id],
    mainEntrance:fromLocal(...data.mainEntrance),
    terrain:data.terrain,cells:data.originalCells,
    pathId:data.sitePath,sidewalk:sidewalk.map(p=>fromLocal(...p)),sidewalkRise,
    steps:data.landingSteps,fromLocal,lowerDoor:fromLocal(...data.lowerDoor),
    courtAccess:fromLocal(...data.courtAccess)};
  cache.set(campus,value);
  return value;
}

export function fosterTerrainGeometry(T,site){
  const t=site.terrain,[x0,z0,x1,z1]=t.bounds;
  const pos=[],uv=[],indices=[];
  for(let j=0;j<t.height;j++)for(let i=0;i<t.width;i++){
    const x=x0+(x1-x0)*i/(t.width-1),z=z0+(z1-z0)*j/(t.height-1),n=j*t.width+i;
    pos.push(x,t.heights[n],z);
    uv.push(x/5,z/5);
    if(i&&j)indices.push(n-t.width-1,n-1,n-t.width,n-t.width,n-1,n);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function keepTerrainOutsideFoster(site,indices,width){
  const [left,right,top,bottom]=site.cells;
  const kept=[];
  for(let i=0;i<indices.length;i+=3){
    const a=indices[i],b=indices[i+1],c=indices[i+2];
    const row=Math.floor(Math.min(a,b,c)/width),col=Math.min(a%width,b%width,c%width);
    if(row>=top&&row<bottom&&col>=left&&col<right)continue;
    kept.push(a,b,c);
  }
  return kept;
}

export function fosterLandingGeometry(T,site){
  const points=[],uv=[];
  for(const step of site.steps){
    const flat=[[step.u0,step.v0],[step.u0,step.v1],[step.u1,step.v1],[step.u1,step.v0]];
    const bottom=step.y-.22;
    for(const [face,heights] of [
      [[0,1,2,0,2,3],[step.y,step.y,step.y,step.y]],
      [[0,1,1,0,1,0],[bottom,bottom,step.y,step.y,bottom,step.y]],
      [[3,0,0,3,0,3],[bottom,bottom,step.y,step.y,bottom,step.y]],
      [[1,2,2,1,2,1],[bottom,bottom,step.y,step.y,bottom,step.y]],
    ]){
      for(const [i,key] of face.entries()){
        const [x,z]=site.fromLocal(...flat[key]);
        const y=heights.length===4?step.y:heights[i];
        points.push(x,y,z);
        uv.push(x/3,z/3);
      }
    }
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(points,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.computeVertexNormals();
  return g;
}

