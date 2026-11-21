import {CPG_ENTRY} from './campus-cpg-entry-data-v1.js';
import {chemicalConstructionFor} from './campus-chemical-construction-v2.js';
import {reviewedCanopyPlaces} from './campus-canopy-sites-v1.js';
import {campusBikeHouse} from './campus-bike-houses.js';
// Derived public-place catalog. GIS geometry and existing landmark IDs stay intact.
import {PLACE_COPY} from './place-copy.js';
export function campusPlaces(campus){
  const landmarks=campus.landmarks||[],known=new Set(landmarks.map(p=>p.buildingId).filter(Boolean));
  const haggett='sea-36455-0';
  const garage=campus.geometryHash===CPG_ENTRY.geometryHash?CPG_ENTRY.id:null;
  const garageCopy='中央停车库从 NE 41st Street 进入。椭圆混凝土构筑物位于车道上方，北侧楼梯连接校园人行道。';
  const chemical=chemicalConstructionFor(campus,0);
  return [...landmarks.map(p=>({...p,...(PLACE_COPY[p.id]?{description:PLACE_COPY[p.id]}:{})})),...(campus.buildings||[]).filter(b=>!known.has(b.id)).map(b=>({
    id:b.id,buildingId:b.id,name:b.id===haggett?'Haggett Hall':b.id==='sea-79960-0'?'Foster Library Skylight':b.name||'校园建筑 · '+b.sourceObjectId,nameZh:b.id===haggett?'哈格特宿舍':b.id==='sea-79960-0'?'福斯特图书馆采光庭院':(b.code||''),
    ...campusBikeHouse(campus,b.id),
    ...reviewedCanopyPlaces(campus)[b.id],
    ...(chemical?.id===b.id?chemical.place:{}),
    ...(b.id===garage?{name:'Central Plaza Garage entrance',nameZh:'中央停车库入口'}:{}),
    category:'building',subtitle:'校园地点 · '+(b.code||b.sourceObjectId),
    description:(chemical?.id===b.id?chemical.place.description:undefined)??(b.id===garage?garageCopy:null)??reviewedCanopyPlaces(campus)[b.id]?.description??campusBikeHouse(campus,b.id)?.description??(b.id===haggett?'北校区的 Haggett Hall 正在重建，新宿舍设有开放式门厅与庭院。导览停靠点在施工围栏外。':'在这里留下你的校园记忆、查看社区活动，或通过接待了解已发布的校园资料。'),
    point:[b.centroid[0],b.baseY,b.centroid[1]],sourceIds:[b.labelSource||'seattle-outlines','campus-map'],
  }))];
}
