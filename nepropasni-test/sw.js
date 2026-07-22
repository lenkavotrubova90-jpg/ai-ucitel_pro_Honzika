const CACHE='nepropasni-shared-v3';
const ASSETS=['./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{await client.navigate(client.url);}catch{}
    }
  })());
});

function repairSharedApp(html){
  return html
    .replace(
      "import { WebrtcProvider } from 'https://esm.sh/y-webrtc@10.3.0?deps=yjs@13.6.31';",
      "import { WebsocketProvider } from 'https://esm.sh/y-websocket@2.1.0?deps=yjs@13.6.31';"
    )
    .replace(
      'provider=new WebrtcProvider(roomName,ydoc,{password:roomCode});',
      "provider=new WebsocketProvider('wss://demos.yjs.dev/ws',roomName,ydoc,{connect:true});"
    )
    .replace(
      "provider.on('status',event=>setStatus(event.status==='connected'?'online':'',event.status==='connected'?'Připojeno':'Propojuji'));",
      "provider.on('status',event=>setStatus(event.status==='connected'?'online':'',event.status==='connected'?'Server připojen':'Připojuji server')); provider.on('sync',isSynced=>{if(isSynced){setStatus('online','Synchronizováno');renderAll();renderMembers();}});"
    )
    .replace(
      'data se přenášejí přímo mezi připojenými telefony a zůstávají v jejich prohlížečích',
      'data se synchronizují přes testovací server a ukládají také v prohlížečích telefonů'
    );
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  if(event.request.mode==='navigate' || event.request.destination==='document'){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(async response=>{
          const html=repairSharedApp(await response.text());
          return new Response(html,{status:response.status,statusText:response.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }))
  );
});
