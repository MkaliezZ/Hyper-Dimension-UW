import {RED_TOWERS} from './red-square-layout.js';

// Wording and whole-line orientation follow the photographed UW banner pair:
// "For passion. For possibility." / "BE BOUNDLESS". This replaces the older
// GEAR UP Summer Institute event edition, not a permanent tower inscription.
// Render actual text, including spaces/punctuation, instead of letter stacks.
export function createRedSquareBannerTexture(T,text) {
  const c=document.createElement('canvas');c.width=256;c.height=2048;
  const ctx=c.getContext('2d');ctx.fillStyle='#f8f7f0';ctx.fillRect(0,0,c.width,c.height);
  const brand=text==='BE BOUNDLESS',family=brand?'Arial, sans-serif':'Georgia, serif';
  let size=brand?178:144;
  const setFont=()=>{ctx.font=(brand?'bold ':'italic ')+size+'px '+family;};setFont();
  while(ctx.measureText(text).width>1640&&size>24){size--;setFont();}
  ctx.fillStyle='#352568';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.save();ctx.translate(128,920);ctx.rotate(-Math.PI/2);ctx.fillText(text,0,0);ctx.restore();
  ctx.fillStyle='#352568';ctx.fillRect(0,1788,256,260);
  ctx.fillStyle='#fff';ctx.font='bold 172px Georgia, serif';ctx.fillText('W',128,1923);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=8;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;
  texture.name='Red Square banner: '+text;
  texture.userData={text,layout:'whole-line-bottom-to-top',reference:'red-square-banners-v59.json'};
  return texture;
}
export function addRedSquareTowers(T,{scene,material,height,mesh}) {
  const textures=[];
  function banner(text) {
    const texture=createRedSquareBannerTexture(T,text);textures.push(texture);return texture;
  }
  const roots=[];
  for(const [i,p]of RED_TOWERS.entries()){
    const surface={kind:'pylon',id:'red-square-pylon-'+i,placeId:'red-square'},root=new T.Group();
    root.position.set(p.x,height(p.x,p.z),p.z);root.rotation.y=p.angle||0;scene.add(root);roots.push(root);
    const geometry=new T.BoxGeometry(p.width,p.height,p.depth),pos=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv;
    // A brick course keeps its physical size along the forty-metre shafts.
    // BoxGeometry's default 0..1 UV would stretch one tile over the whole tower.
    for(let k=0;k<pos.count;k++){
      const horizontal=Math.abs(normals.getX(k))>.5?pos.getZ(k):pos.getX(k);
      uv.setXY(k,horizontal/1.4,(Math.abs(normals.getY(k))>.5?pos.getZ(k):pos.getY(k))/.7);
    }
    const body=mesh(geometry,material,root,surface);body.position.y=p.height/2;
    const cap=mesh(new T.BoxGeometry(p.width+.07,.16,p.depth+.07),new T.MeshStandardMaterial({color:'#70726c',roughness:.9}),root,surface);cap.position.y=p.height;
    if(!p.banner)continue;
    const mat=new T.MeshStandardMaterial({map:banner(p.banner),roughness:.96,metalness:0,side:T.DoubleSide});
    for(const side of [-1,1]){
      const sign=mesh(new T.PlaneGeometry(1.7,18),mat,root,surface);
      sign.position.set(0,15.8,side*(p.depth/2+.035));if(side<0)sign.rotation.y=Math.PI;
    }
  }
  return {roots,textures,count:RED_TOWERS.length,banners:RED_TOWERS.filter(p=>p.banner).length};
}
