/**
 * JUAN PROJECT WORKSPACE — assistant.js
 * Gemini-first assistant engine.
 * One delegated event layer, no guided/pre-scripted assistant flow.
 */
(function(){
  'use strict';

  const CHAT_KEY='JUAN_AI_GEMINI_CHAT_V1';
  const BUBBLE_KEY='JUAN_ASSISTANT_BUBBLE_ENABLED';
  const NUDGE_DISMISS_KEY='JUAN_ASSISTANT_NUDGE_DISMISSED';
  const MAX_HISTORY=16;
  let busy=false;
  let csrfToken='';
  let geminiConfigured=false;
  let authenticated=false;
  let messages=[];

  const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const readJSON=(key,fallback=[])=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}};
  const readProjects=()=>{const v=readJSON('JUAN_PROJECTS_LOCAL',[]);return Array.isArray(v)?v:[]};
  const readClients=()=>{const v=readJSON('JUAN_CLIENTS_LOCAL',[]);return Array.isArray(v)?v:[]};
  const activeProjects=()=>readProjects().filter(p=>!p.deleted&&p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at);
  const projectRef=p=>`JP-${String(Number(p.project_number||0)).padStart(3,'0')}`;
  const currency=n=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:2}).format(Number(n||0));

  function loadChat(){
    try{
      const saved=JSON.parse(sessionStorage.getItem(CHAT_KEY)||'[]');
      messages=Array.isArray(saved)?saved.filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').slice(-MAX_HISTORY):[];
    }catch{messages=[]}
  }
  function saveChat(){
    try{sessionStorage.setItem(CHAT_KEY,JSON.stringify(messages.slice(-MAX_HISTORY)))}catch{}
  }
  function addToHistory(role,content){
    messages.push({role,content:String(content||'').slice(0,8000)});
    messages=messages.slice(-MAX_HISTORY);
    saveChat();
  }

  function appendMessage(text,role='assistant',{ephemeral=false,error=false}={}){
    const box=document.getElementById('assistantPageMessages');
    if(!box)return null;
    const el=document.createElement('div');
    el.className=`assistant-page-message ${role}${error?' is-error':''}${ephemeral?' is-ephemeral':''}`;
    if(role==='assistant'){
      const label=document.createElement('strong');label.textContent='JUAN AI';el.appendChild(label);
    }
    const span=document.createElement('span');span.textContent=String(text||'');el.appendChild(span);
    box.appendChild(el);box.scrollTop=box.scrollHeight;
    return el;
  }
  function renderChat(){
    const box=document.getElementById('assistantPageMessages');
    if(!box)return;
    box.innerHTML='';
    if(!messages.length){
      appendMessage('Hi! I’m JUAN AI. Ask me anything about your workspace, projects, clients, deadlines, payments, or general creative work.','assistant',{ephemeral:true});
      return;
    }
    messages.forEach(m=>appendMessage(m.content,m.role));
  }

  function setMode(status,title,text){
    const pill=document.getElementById('assistantModePill');
    const titleEl=document.getElementById('assistantConnectionTitle');
    const textEl=document.getElementById('assistantConnectionText');
    const card=document.querySelector('.assistant-ai-connection-card');
    const normalized=['ready','checking','error','offline'].includes(status)?status:'offline';
    if(pill){pill.dataset.status=normalized;pill.textContent=status==='ready'?'GEMINI · READY':status==='checking'?'CHECKING…':status==='error'?'GEMINI · ERROR':'CONNECT GEMINI';}
    if(titleEl)titleEl.textContent=title;
    if(textEl)textEl.textContent=text;
    if(card)card.dataset.status=normalized;
  }

  async function sessionStatus(){
    try{
      const r=await fetch('/api/session',{method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
      const body=await r.json().catch(()=>({}));
      authenticated=!!body.authenticated;
      csrfToken=String(body.csrfToken||'');
      return authenticated;
    }catch{
      authenticated=false;csrfToken='';return false;
    }
  }

  async function checkStatus(){
    setMode('checking','Checking Gemini…','Validating server configuration and secure session');
    try{
      const r=await fetch('/api/gemini',{method:'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
      const body=await r.json().catch(()=>({}));
      geminiConfigured=!!body.configured;
      authenticated=!!body.authenticated;
      if(authenticated)await sessionStatus();
      if(!geminiConfigured){setMode('error','Gemini is not configured','Add GEMINI_API_KEY in Vercel, then redeploy');return false;}
      if(!authenticated){setMode('offline','Gemini needs a secure session','Connect Cloud with your workspace password');return false;}
      setMode('ready','Gemini is ready','Server-secured API connection active');return true;
    }catch(error){
      setMode('error','Gemini endpoint unavailable',String(error?.message||'Check the Vercel deployment'));return false;
    }
  }

  function workspaceContext(){
    const projects=readProjects().filter(p=>!p.deleted).slice(-30);
    const clients=readClients().slice(-40);
    const today=localDate();
    const projectRows=projects.map(p=>{
      const paid=(p.payments||[]).reduce((s,x)=>s+Number(x.amount_paid||x.amount||0),0);
      const total=Number(p.total_amount||0);
      return {
        id:projectRef(p),title:p.title||'',client:p.client_name||'',status:p.status||'',deliveryStatus:p.delivery_status||'',deadline:p.deadline_date||'',priority:!!p.priority,total:currency(total),paid:currency(paid),balance:currency(Math.max(0,total-paid)),items:(p.project_items||[]).map(i=>i.name).filter(Boolean).slice(0,12),deliverables:(p.deliverables||[]).filter(d=>!d.is_group).map(d=>({name:d.name||d.item_name||'',completed:!!d.completed})).slice(0,20)
      };
    });
    const clientRows=clients.map(c=>({id:c.id||'',name:c.name||'',email:c.email||'',phone:c.phone||''}));
    return JSON.stringify({today,projects:projectRows,clients:clientRows});
  }

  function syncComposer(){
    const input=document.getElementById('assistantPageInput');
    const send=document.getElementById('assistantSendBtn');
    if(!input||!send)return;
    send.disabled=busy||!input.value.trim();
    input.disabled=busy;
    input.style.height='auto';
    input.style.height=`${Math.min(180,Math.max(54,input.scrollHeight))}px`;
    const hint=document.getElementById('assistantComposerHint');
    if(hint)hint.textContent=busy?'JUAN AI is thinking…':'Gemini can use your workspace context when securely connected.';
  }

  async function send(){
    if(busy)return;
    const input=document.getElementById('assistantPageInput');
    if(!input)return;
    const content=input.value.trim();
    if(!content)return;

    const ready=await checkStatus();
    if(!ready){
      if(!geminiConfigured){appendMessage('Gemini is not configured on the server yet. Check GEMINI_API_KEY in Vercel and redeploy.','assistant',{ephemeral:true,error:true});return;}
      appendMessage('Connect Cloud first so I can open a secure Gemini session. Your message is still here.','assistant',{ephemeral:true});
      app.openCloudLogin?.();
      return;
    }

    input.value='';
    appendMessage(content,'user');
    addToHistory('user',content);
    busy=true;syncComposer();
    const typing=appendMessage('Thinking…','assistant',{ephemeral:true});
    typing?.classList.add('is-typing');
    try{
      const history=messages.slice(-MAX_HISTORY).map(m=>({role:m.role,content:m.content}));
      const r=await fetch('/api/gemini',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify({messages:history,workspaceContext:workspaceContext()})});
      const body=await r.json().catch(()=>({}));
      typing?.remove();
      if(!r.ok){
        if(r.status===401||r.status===403){authenticated=false;csrfToken='';setMode('offline','Gemini needs a secure session','Connect Cloud with your workspace password');app.openCloudLogin?.();}
        throw new Error(body.error||`Gemini request failed (HTTP ${r.status})`);
      }
      const answer=String(body.text||'').trim()||'I did not receive a text response. Please try again.';
      appendMessage(answer,'assistant');addToHistory('assistant',answer);
    }catch(error){
      typing?.remove();
      appendMessage(String(error?.message||'JUAN AI could not complete that request.'),'assistant',{ephemeral:true,error:true});
    }finally{busy=false;syncComposer();input.focus();}
  }

  function newChat(){
    messages=[];saveChat();renderChat();
    const input=document.getElementById('assistantPageInput');if(input){input.value='';input.focus();}syncComposer();checkStatus();
  }

  function openConnect(){
    if(authenticated&&geminiConfigured){checkStatus();return;}
    app.openCloudLogin?.();
  }

  function setBubbleEnabled(v){localStorage.setItem(BUBBLE_KEY,v?'true':'false');refreshBubble()}
  function dismissNudge(e){e?.stopPropagation();sessionStorage.setItem(NUDGE_DISMISS_KEY,localDate());const n=document.getElementById('assistantDeadlineNudge');if(n)n.hidden=true}
  function refreshBubble(){
    const enabled=localStorage.getItem(BUBBLE_KEY)!=='false',wrap=document.getElementById('assistantBubbleWrap'),toggle=document.getElementById('assistantBubbleToggle'),badge=document.getElementById('assistantFabBadge'),nudge=document.getElementById('assistantDeadlineNudge'),t=localDate(),count=activeProjects().filter(p=>String(p.deadline_date||'')===t).length,dismissed=sessionStorage.getItem(NUDGE_DISMISS_KEY)===t;
    if(toggle)toggle.checked=enabled;if(wrap)wrap.style.display=enabled?'flex':'none';if(badge){badge.hidden=!count;badge.textContent=count}
    if(nudge){nudge.hidden=!count||dismissed;nudge.innerHTML=count?`<button class="assistant-nudge-close" type="button" aria-label="Close reminder" data-ai-action="dismiss-nudge">×</button><span class="assistant-nudge-title">Deadline reminder</span><span class="assistant-nudge-copy">${count} project${count===1?' is':'s are'} due today.</span>`:''}
  }

  window.juanAI={send,newChat,checkStatus,refreshBubble,setBubbleEnabled,dismissNudge,message:appendMessage};

  // Preserve navigation behavior without resetting the conversation every time the Assistant view opens.
  if(window.app?.navigateTo){
    const previousNavigate=app.navigateTo.bind(app);
    app.navigateTo=function(view){
      previousNavigate(view);
      if(view==='assistant')setTimeout(()=>{renderChat();checkStatus();syncComposer();document.getElementById('assistantPageInput')?.focus();},60);
      setTimeout(refreshBubble,80);
    };
  }
  const previousOverview=app.renderOverviewDashboard?.bind(app);
  if(previousOverview)app.renderOverviewDashboard=function(){const r=previousOverview();setTimeout(refreshBubble,0);return r};

  // Local OCR — receipt reference number suggestion. Requires bundled Tesseract assets.
  window.localOCR={
    worker:null,
    status(text,cls=''){const el=document.getElementById('paymentOcrStatus');if(!el)return;el.className=`receipt-ocr-status ${cls}`;el.textContent=text},
    async prepare(file){const bmp=await createImageBitmap(file),maxW=1500,scale=Math.min(1,maxW/bmp.width),w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bmp,0,0,w,h);const img=x.getImageData(0,0,w,h),d=img.data;for(let i=0;i<d.length;i+=4){const g=.299*d[i]+.587*d[i+1]+.114*d[i+2],v=Math.max(0,Math.min(255,(g-128)*1.28+128));d[i]=d[i+1]=d[i+2]=v}x.putImageData(img,0,0);bmp.close?.();return c},
    reference(text){const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);for(const line of lines){if(/ref(?:erence)?|transaction\s*(?:id|no)/i.test(line)){const m=line.match(/(?:ref(?:erence)?(?:\s*(?:no\.?|number))?|transaction\s*(?:id|no\.?))\s*[:#-]?\s*([A-Z0-9][A-Z0-9\s-]{6,28})/i);if(m){const v=m[1].replace(/[^A-Z0-9]/gi,'');if(v.length>=7&&v.length<=24)return v}}}const digits=String(text||'').match(/\b\d(?:[\s-]?\d){9,17}\b/g)||[];return digits.map(x=>x.replace(/\D/g,'')).find(x=>x.length>=10&&x.length<=18)||''},
    async getWorker(){if(this.worker)return this.worker;if(!window.Tesseract)throw new Error('Offline OCR engine is not installed.');this.worker=await Tesseract.createWorker('eng',1,{workerPath:'./ocr/worker.min.js',corePath:'./ocr/core',langPath:'./ocr/lang',logger:m=>{if(m.status==='recognizing text')this.status(`Scanning receipt locally… ${Math.round((m.progress||0)*100)}%`,'is-working')}});return this.worker},
    async handle(file){if(!file)return;if(!String(file.type||'').startsWith('image/')){this.status('Reference detection works with image receipts. PDF can still be attached manually.');return}try{this.status('Preparing receipt for local OCR…','is-working');const canvas=await this.prepare(file),worker=await this.getWorker(),res=await worker.recognize(canvas),ref=this.reference(res?.data?.text||'');if(ref){const input=document.getElementById('paymentRefInput');if(input&&!input.value.trim())input.value=ref;this.status(`Reference detected: ${ref}`,'is-success')}else this.status('No reference number detected. You can enter it manually.')}catch(e){console.warn('Local OCR unavailable:',e);this.status('OCR unavailable. You can enter the reference number manually.','is-error')}},
    bind(){const input=document.getElementById('paymentReceiptInput');if(!input||input.dataset.ocrBound)return;input.dataset.ocrBound='1';input.addEventListener('change',()=>this.handle(input.files?.[0]||null))}
  };

  let booted=false;
  function bootAssistant(){
    if(booted)return;booted=true;loadChat();renderChat();refreshBubble();syncComposer();localOCR.bind();checkStatus();
    document.addEventListener('click',e=>{
      const target=e.target.closest('[data-ai-action]');if(!target)return;
      const action=target.dataset.aiAction;
      if(action==='send'){e.preventDefault();send();}
      else if(action==='new-chat'){e.preventDefault();newChat();}
      else if(action==='connect'){e.preventDefault();openConnect();}
      else if(action==='dismiss-nudge'){e.preventDefault();dismissNudge(e);}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target?.id==='assistantPageInput'){e.preventDefault();send();}});
    document.addEventListener('input',e=>{if(e.target?.id==='assistantPageInput')syncComposer();});
    window.addEventListener('juan:cloud-connected',()=>checkStatus());
    window.addEventListener('juan:cloud-disconnected',()=>checkStatus());
    window.addEventListener('juan:cloud-status',e=>{if(e.detail?.status==='connected')checkStatus();});
    window.addEventListener('online',()=>checkStatus());
    window.addEventListener('offline',()=>setMode('offline','You are offline','Gemini requires an internet connection'));
    window.addEventListener('storage',e=>{if(e.key===BUBBLE_KEY||e.key==='JUAN_PROJECTS_LOCAL')refreshBubble();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootAssistant,{once:true});else bootAssistant();
})();
