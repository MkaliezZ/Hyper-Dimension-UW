// Offscreen preparation must yield to interaction, but a throttled animation
// frame must not leave a fully downloaded building on its distant atlas for
// minutes. The bounded timer advances only an active, finite loading task.
export function nextBuildingLoadFrame({requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 return new Promise(resolve=>{let done=false,frame,timer;const finish=()=>{if(done)return;done=true;if(frame!==undefined)cancelFrame(frame);if(timer!==undefined)clearTimer(timer);resolve();};frame=requestFrame(finish);if(!done)timer=setTimer(finish,50);});
}
