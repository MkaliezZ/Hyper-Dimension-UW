export function installBuildingQualityStatus(canvas,heading){
 const status=document.createElement('p');status.id='building-detail-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;heading.append(status);
 canvas.addEventListener('building-quality',event=>{const focus=event.detail?.focus,waiting=focus?.wanted&&!['near','middle'].includes(focus.lod),text=waiting?(focus.stage==='error'?'建筑细节暂未载入':'正在载入 '+focus.name+' 的细节…'):'';if(status.textContent!==text)status.textContent=text;status.hidden=!waiting;status.dataset.stage=focus?.stage||'distant';});
 return status;
}
