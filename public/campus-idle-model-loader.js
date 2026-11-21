// Downloading may finish after a visitor starts walking. Keep synchronous GLB
// parsing out of that interval, including every component of a large building.
export function createIdleModelLoader(loader,{ready,fetchModel=fetch,signal,onPhase=()=>{}}){
  return {async loadAsync(url){
    signal?.throwIfAborted();onPhase('downloading',url);
    const response=await fetchModel(url,signal?{signal}:undefined);
    if(!response.ok)throw Error('Building model unavailable: '+response.status);
    const bytes=await response.arrayBuffer();
    signal?.throwIfAborted();onPhase('downloaded',url);
    if(!await ready())throw Object.assign(Error('Building request superseded'),{name:'AbortError'});
    signal?.throwIfAborted();onPhase('decoding',url);
    return loader.parseAsync(bytes,url.slice(0,url.lastIndexOf('/')+1));
  }};
}
