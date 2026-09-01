/** JUAN PROJECT WORKSPACE — PWA/network synchronization coordinator */
(function(){
  let syncing=false;
  async function requestCloudSync(){
    if(syncing||!navigator.onLine)return;
    syncing=true;
    try{await app.initSupabase?.({silent:true});}
    catch(e){console.warn('Reconnect sync failed:',e)}
    finally{syncing=false;}
  }
  function setNetworkState(){
    if(navigator.onLine){
      navigator.serviceWorker?.controller?.postMessage({type:'NETWORK_ONLINE'});
      requestCloudSync();
    }else{
      app.updateConnectionStatus?.('offline','OFFLINE · LOCAL','No internet connection. Local workspace data remains available.');
    }
  }
  if('serviceWorker'in navigator){
    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./service-worker.js');
        if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
      }catch(err){console.warn('Service worker registration failed:',err)}
    });
    navigator.serviceWorker.addEventListener('message',e=>{
      if(e.data?.type==='SYNC_REQUESTED'||e.data?.type==='SW_READY')requestCloudSync();
    });
  }
  window.addEventListener('online',setNetworkState);
  window.addEventListener('offline',setNetworkState);
  window.addEventListener('focus',()=>{if(navigator.onLine)requestCloudSync()});
})();
