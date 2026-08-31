/*
 * JUAN PROJECT WORKSPACE — Mobile Companion v1.1.3
 * -------------------------------------------------
 * Mobile is a companion, not the full management system.
 *
 * Mobile destinations:
 *   1. Overview — deadlines, status, project progress
 *   2. AI       — guided project lookup and workspace questions
 *   3. Finance  — receivables, revenue and recent payments
 *
 * The center + button is the only primary write action on mobile:
 * Record Payment -> attach receipt -> local OCR -> swipe to confirm.
 *
 * Desktop behavior is intentionally untouched.
 */
(function(){
  const PHONE_QUERY='(max-width: 820px)';
  const allowedMobileViews=new Set(['my-works','assistant','reports']);
  let redirecting=false;
  let receiptFile=null;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const money=n=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:2}).format(Number(n||0));
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const today=()=>{const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  const projectRef=p=>`JP-${String(Number(p?.project_number||0)).padStart(3,'0')}`;
  const isPhone=()=>window.matchMedia(PHONE_QUERY).matches;
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

  function getWorkspaceApp(){
    try{if(typeof app!=='undefined'&&app&&typeof app.navigateTo==='function')return app}catch(_){}
    if(window.app&&typeof window.app.navigateTo==='function')return window.app;
    return null;
  }
  function readProjects(){try{return JSON.parse(localStorage.getItem('JUAN_PROJECTS_LOCAL')||'[]')||[]}catch(_){return []}}
  function activeProjects(){return readProjects().filter(p=>!p.deleted&&p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at)}
  function paymentsFor(p){return Array.isArray(p?.payments)?p.payments:[]}
  function paid(p){return paymentsFor(p).reduce((s,x)=>s+Number(x.amount_paid||x.amount||0),0)}
  function total(p){return Number(p?.total_amount||0)+Number(p?.system_maintenance_charge||0)}
  function balance(p){return Math.max(0,total(p)-paid(p))}
  function realDeliverables(p){return (p?.deliverables||[]).filter(d=>!d.is_group)}
  function progress(p){const ds=realDeliverables(p);if(!ds.length)return {done:0,total:0,pct:0};const done=ds.filter(d=>d.completed).length;return {done,total:ds.length,pct:Math.round(done/ds.length*100)}}
  function dateLabel(v){if(!v)return 'On hold';const d=new Date(`${String(v).slice(0,10)}T00:00:00`);if(Number.isNaN(d.getTime()))return 'On hold';return d.toLocaleDateString('en-PH',{month:'short',day:'numeric'})}
  function daysFromToday(v){if(!v)return null;const d=new Date(`${String(v).slice(0,10)}T00:00:00`),n=new Date(`${today()}T00:00:00`);if(Number.isNaN(d.getTime()))return null;return Math.round((d-n)/86400000)}
  function urgency(p){const n=daysFromToday(p.deadline_date);if(n===null)return {label:'ON HOLD',cls:'neutral'};if(n<0)return {label:'OVERDUE',cls:'danger'};if(n===0)return {label:'TODAY',cls:'danger'};if(n===1)return {label:'TOMORROW',cls:'warning'};if(n<=7)return {label:`${n} DAYS`,cls:'warning'};return {label:dateLabel(p.deadline_date).toUpperCase(),cls:'neutral'}}
  function paymentStatus(p){const b=balance(p),x=paid(p);return b<=0&&total(p)>0?'PAID':x>0?'DOWNPAYMENT':'PENDING'}
  function icon(path){return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`}

  function buildShell(){
    if(!$('.mobile-topbar')){
      const top=document.createElement('header');top.className='mobile-topbar';
      top.innerHTML=`<div class="mobile-brand-lockup"><img class="mobile-brand-mark" src="./assets/icon-192.png" alt=""><div><div class="mobile-brand-name">JUAN PROJECT</div><div class="mobile-brand-mode">Mobile Companion</div></div></div>`;
      document.body.prepend(top);
    }
    if(!$('.mobile-bottom-nav')){
      const bottom=document.createElement('nav');bottom.className='mobile-bottom-nav';bottom.setAttribute('aria-label','JUAN mobile navigation');
      bottom.innerHTML=`
        <button class="mobile-nav-item" data-mobile-view="my-works" type="button">${icon('<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>')}<span>Overview</span></button>
        <button class="mobile-nav-item" data-mobile-view="assistant" type="button">${icon('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 13V9a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>')}<span>AI</span></button>
        <button class="mobile-payment-fab" id="mobilePaymentFab" type="button" aria-label="Record payment">${icon('<path d="M12 5v14M5 12h14"/>')}</button>
        <button class="mobile-nav-item" data-mobile-view="reports" type="button">${icon('<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h20"/>')}<span>Finance</span></button>`;
      document.body.appendChild(bottom);
      bottom.addEventListener('click',e=>{const btn=e.target.closest('[data-mobile-view]');if(btn){e.preventDefault();activate(btn.dataset.mobileView)}});
      $('#mobilePaymentFab',bottom)?.addEventListener('click',openQuickPayment);
    }
    buildProjectViewer();
    buildQuickPaymentSheet();
  }

  function currentView(){const active=$('.view.active');return active?active.id.replace(/^view-/,''):'my-works'}
  function syncActive(view=currentView()){
    document.body.classList.toggle('mobile-on-assistant',view==='assistant');
    document.body.classList.toggle('mobile-on-finance',view==='reports');
    $$('.mobile-nav-item').forEach(b=>{const on=b.dataset.mobileView===view;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
  }
  function activate(view){const workspace=getWorkspaceApp();if(!workspace)return;workspace.navigateTo(view);syncActive(view);if(view==='my-works')renderMobileOverview();if(view==='reports')renderMobileFinance();try{window.scrollTo({top:0,behavior:'instant'})}catch(_){window.scrollTo(0,0)}}
  function enforce(){if(!isPhone()||redirecting)return;const view=currentView();if(allowedMobileViews.has(view))return;const workspace=getWorkspaceApp();if(!workspace)return;redirecting=true;workspace.navigateTo('assistant');setTimeout(()=>{redirecting=false;syncActive('assistant');window.juanAI?.home?.(true)},0)}

  function renderMobileOverview(){
    if(!isPhone())return;
    const host=$('#overviewDashboard');if(!host)return;
    let mobile=$('#mobileOverviewCompanion');if(!mobile){mobile=document.createElement('div');mobile.id='mobileOverviewCompanion';mobile.className='mobile-companion-screen';host.parentNode.insertBefore(mobile,host)}
    const active=activeProjects();
    const deadlines=active.filter(p=>p.deadline_date).sort((a,b)=>String(a.deadline_date).localeCompare(String(b.deadline_date))).slice(0,4);
    const unfinished=active.reduce((s,p)=>s+realDeliverables(p).filter(d=>!d.completed).length,0);
    const overdue=active.filter(p=>(daysFromToday(p.deadline_date)??0)<0).length;
    const projectRows=active.sort((a,b)=>{const ad=daysFromToday(a.deadline_date),bd=daysFromToday(b.deadline_date);return (ad??9999)-(bd??9999)||Number(b.priority)-Number(a.priority)||Number(a.project_number)-Number(b.project_number)}).slice(0,12);
    mobile.innerHTML=`
      <section class="m-section m-deadlines-section">
        <div class="m-section-head"><div><span class="m-eyebrow">UPCOMING</span><h2>Deadlines</h2></div><span class="m-count">${deadlines.length}</span></div>
        <div class="m-deadline-strip">${deadlines.length?deadlines.map(p=>{const u=urgency(p);return `<button class="m-deadline-card" data-open-project="${esc(p.id)}" type="button"><span class="m-deadline-date">${dateLabel(p.deadline_date)}</span><strong>${esc(p.title||'Untitled')}</strong><small>${projectRef(p)}</small><span class="m-status ${u.cls}">${u.label}</span></button>`}).join(''):'<div class="m-empty">No upcoming deadlines.</div>'}</div>
      </section>
      <section class="m-summary-card">
        <div><span>Active</span><strong>${active.length}</strong></div>
        <div><span>Remaining</span><strong>${unfinished}</strong></div>
        <div><span>Overdue</span><strong class="${overdue?'danger-text':''}">${overdue}</strong></div>
      </section>
      <section class="m-section">
        <div class="m-section-head"><div><span class="m-eyebrow">WORK</span><h2>Current Projects</h2></div></div>
        <div class="m-project-list">${projectRows.length?projectRows.map(p=>{const pr=progress(p),u=urgency(p);return `<button class="m-project-card" data-open-project="${esc(p.id)}" type="button"><div class="m-project-top"><span class="m-project-ref">${projectRef(p)}</span><span class="m-status ${u.cls}">${u.label}</span></div><strong class="m-project-title">${esc(p.title||'Untitled Project')}</strong><span class="m-project-client">${esc(p.client_email||p.client_name||'')}</span><div class="m-project-meta"><span>${pr.total?`${pr.done}/${pr.total} complete`:'No deliverables'}</span><strong>${money(balance(p))} balance</strong></div><div class="m-progress"><i style="width:${pr.pct}%"></i></div></button>`}).join(''):'<div class="m-empty">No active projects.</div>'}</div>
      </section>`;
    mobile.onclick=e=>{const btn=e.target.closest('[data-open-project]');if(btn)openProjectViewer(btn.dataset.openProject)};
  }

  function buildProjectViewer(){
    if($('#mobileProjectViewer'))return;
    const el=document.createElement('div');el.id='mobileProjectViewer';el.className='m-sheet-backdrop';el.innerHTML=`<section class="m-sheet m-project-viewer" role="dialog" aria-modal="true"><header class="m-sheet-head"><button class="m-sheet-close" type="button" aria-label="Close">×</button><div><span id="mProjectRef"></span><h2 id="mProjectTitle">Project</h2></div></header><div class="m-segmented"><button class="active" data-mtab="deliverables" type="button">Deliverables</button><button data-mtab="invoice" type="button">Invoice</button></div><div id="mProjectBody" class="m-sheet-body"></div></section>`;document.body.appendChild(el);
    $('.m-sheet-close',el).onclick=()=>closeSheet(el);
    el.addEventListener('click',e=>{if(e.target===el)closeSheet(el);const tab=e.target.closest('[data-mtab]');if(tab){$$('[data-mtab]',el).forEach(x=>x.classList.toggle('active',x===tab));renderProjectTab(el.dataset.projectId,tab.dataset.mtab)}});
  }
  function openProjectViewer(id){const p=readProjects().find(x=>String(x.id)===String(id));if(!p)return;const el=$('#mobileProjectViewer');el.dataset.projectId=id;$('#mProjectRef').textContent=projectRef(p);$('#mProjectTitle').textContent=p.title||'Project';$$('[data-mtab]',el).forEach((x,i)=>x.classList.toggle('active',i===0));renderProjectTab(id,'deliverables');openSheet(el)}
  function renderProjectTab(id,tab){const p=readProjects().find(x=>String(x.id)===String(id)),body=$('#mProjectBody');if(!p||!body)return;const pr=progress(p);
    if(tab==='deliverables'){
      const ds=realDeliverables(p);body.innerHTML=`<div class="m-project-progress-card"><div><span>Overall Progress</span><strong>${pr.done}/${pr.total||0}</strong></div><div class="m-progress large"><i style="width:${pr.pct}%"></i></div></div><div class="m-deliverable-list">${ds.length?ds.map(d=>`<div class="m-deliverable-row"><span class="m-check ${d.completed?'done':''}">${d.completed?'✓':''}</span><div><strong>${esc(d.name||d.item_name||'Deliverable')}</strong>${d.package_name?`<small>${esc(d.package_name)}</small>`:''}</div><span>${d.completed?'Completed':'Pending'}</span></div>`).join(''):'<div class="m-empty">No deliverables recorded.</div>'}</div>`;
    }else{
      const b=balance(p),x=paid(p),t=total(p);body.innerHTML=`<div class="m-invoice-hero"><span>Balance</span><strong>${money(b)}</strong><small>${paymentStatus(p)}</small></div><div class="m-invoice-lines"><div><span>Invoice</span><strong>${esc(p.invoice_number||`${projectRef(p)}-${new Date().getFullYear()}`)}</strong></div><div><span>Project Total</span><strong>${money(t)}</strong></div><div><span>Paid</span><strong>${money(x)}</strong></div><div class="emphasis"><span>Balance Due</span><strong>${money(b)}</strong></div><div><span>Deadline</span><strong>${p.deadline_date?dateLabel(p.deadline_date):'On hold'}</strong></div></div>`;
    }
  }

  function renderMobileFinance(){
    if(!isPhone())return;const view=$('#view-reports');if(!view)return;let mobile=$('#mobileFinanceCompanion');if(!mobile){mobile=document.createElement('div');mobile.id='mobileFinanceCompanion';mobile.className='mobile-companion-screen';view.appendChild(mobile)}
    const projects=readProjects().filter(p=>!p.deleted),receivable=projects.reduce((s,p)=>s+total(p),0),collected=projects.reduce((s,p)=>s+paid(p),0),outstanding=Math.max(0,receivable-collected);
    const rows=projects.flatMap(p=>paymentsFor(p).map(x=>({p,x}))).sort((a,b)=>String(b.x.payment_date||b.x.created_at||'').localeCompare(String(a.x.payment_date||a.x.created_at||''))).slice(0,8);
    mobile.innerHTML=`<section class="m-finance-hero"><span>Outstanding</span><strong>${money(outstanding)}</strong><small>${projects.filter(p=>balance(p)>0).length} projects with balance</small></section><section class="m-finance-pair"><div><span>Collected</span><strong>${money(collected)}</strong></div><div><span>Receivables</span><strong>${money(receivable)}</strong></div></section><section class="m-section"><div class="m-section-head"><div><span class="m-eyebrow">ACTIVITY</span><h2>Recent Payments</h2></div></div><div class="m-payment-list">${rows.length?rows.map(({p,x})=>`<div class="m-payment-row"><span class="m-payment-icon">${icon('<path d="M4 7h16v10H4z"/><path d="M7 12h4"/>')}</span><div><strong>${esc(p.title||'Project')}</strong><small>${projectRef(p)} · ${esc(x.payment_method||'Payment')} · ${dateLabel(x.payment_date||x.created_at)}</small></div><strong>+${money(x.amount_paid||x.amount||0)}</strong></div>`).join(''):'<div class="m-empty">No payments recorded.</div>'}</div></section>`;
  }

  function buildQuickPaymentSheet(){
    if($('#mobileQuickPayment'))return;
    const el=document.createElement('div');el.id='mobileQuickPayment';el.className='m-sheet-backdrop';
    el.innerHTML=`<section class="m-sheet m-payment-sheet" role="dialog" aria-modal="true"><header class="m-sheet-head"><button class="m-sheet-close" type="button" aria-label="Close">×</button><div><span>QUICK ACCESS</span><h2>Record Payment</h2></div></header><div class="m-sheet-body"><label class="m-field"><span>Project</span><select id="mPayProject"></select></label><label class="m-field"><span>Amount</span><div class="m-money-input"><b>₱</b><input id="mPayAmount" inputmode="decimal" type="number" min="0" step="0.01" placeholder="0.00"></div></label><div class="m-field-grid"><label class="m-field"><span>Method</span><select id="mPayMethod"><option>GCash</option><option>Bank Transfer</option></select></label><label class="m-field"><span>Date</span><input id="mPayDate" type="date"></label></div><label class="m-field"><span>Reference Number</span><input id="mPayRef" type="text" inputmode="numeric" placeholder="Auto-detect from receipt"></label><div class="m-receipt-block"><div><span>Receipt</span><small id="mOcrStatus">Add a receipt to scan the reference number.</small></div><div class="m-receipt-actions"><button id="mTakeReceipt" type="button">Take Photo</button><button id="mChooseReceipt" type="button">Choose Photo</button></div><img id="mReceiptPreview" alt="Receipt preview" hidden><input id="mReceiptCamera" type="file" accept="image/*" capture="environment" hidden><input id="mReceiptLibrary" type="file" accept="image/*" hidden></div><div class="m-swipe" id="mSwipe"><div class="m-swipe-text">Swipe to Record Payment</div><button class="m-swipe-thumb" type="button" aria-label="Swipe to record payment">${icon('<path d="m8 5 7 7-7 7"/><path d="m13 5 7 7-7 7"/>')}</button></div></div></section>`;
    document.body.appendChild(el);
    $('.m-sheet-close',el).onclick=()=>closeSheet(el);el.addEventListener('click',e=>{if(e.target===el)closeSheet(el)});
    $('#mTakeReceipt').onclick=()=>$('#mReceiptCamera').click();$('#mChooseReceipt').onclick=()=>$('#mReceiptLibrary').click();
    $('#mReceiptCamera').onchange=e=>handleReceipt(e.target.files?.[0]);$('#mReceiptLibrary').onchange=e=>handleReceipt(e.target.files?.[0]);
    setupSwipe();
  }
  function openQuickPayment(){
    receiptFile=null;const el=$('#mobileQuickPayment'),select=$('#mPayProject');if(!el||!select)return;
    const rows=readProjects().filter(p=>!p.deleted&&balance(p)>0).sort((a,b)=>Number(a.project_number||0)-Number(b.project_number||0));
    select.innerHTML=`<option value="">Select project…</option>${rows.map(p=>`<option value="${esc(p.id)}">${projectRef(p)} — ${esc(p.title||'Untitled')} · ${money(balance(p))}</option>`).join('')}`;
    $('#mPayAmount').value='';$('#mPayMethod').value='GCash';$('#mPayDate').value=today();$('#mPayRef').value='';$('#mOcrStatus').textContent='Add a receipt to scan the reference number.';$('#mReceiptPreview').hidden=true;$('#mReceiptPreview').removeAttribute('src');resetSwipe();openSheet(el);
  }
  function openSheet(el){el.classList.add('active');document.body.classList.add('m-sheet-open')}
  function closeSheet(el){el.classList.remove('active');if(!$('.m-sheet-backdrop.active'))document.body.classList.remove('m-sheet-open')}

  async function handleReceipt(file){
    if(!file)return;receiptFile=file;const preview=$('#mReceiptPreview'),status=$('#mOcrStatus');preview.src=URL.createObjectURL(file);preview.hidden=false;status.textContent='Scanning receipt locally…';
    try{
      if(!window.localOCR)throw new Error('OCR module unavailable');
      const canvas=await window.localOCR.prepare(file),worker=await window.localOCR.getWorker(),res=await worker.recognize(canvas),ref=window.localOCR.reference(res?.data?.text||'');
      if(ref){$('#mPayRef').value=ref;status.textContent=`Reference detected: ${ref}`}else status.textContent='No reference detected — enter it manually.';
    }catch(e){console.warn('Mobile receipt OCR:',e);status.textContent='Could not scan automatically — enter the reference manually.'}
  }

  function setupSwipe(){
    const track=$('#mSwipe'),thumb=$('.m-swipe-thumb',track);if(!track||!thumb)return;let dragging=false,startX=0,max=0,current=0;
    const move=x=>{current=Math.max(0,Math.min(max,x-startX));thumb.style.transform=`translateX(${current}px)`;track.style.setProperty('--swipe-progress',`${max?current/max*100:0}%`)};
    const end=()=>{if(!dragging)return;dragging=false;thumb.releasePointerCapture?.(thumb._pid);if(max&&current/max>=.82){thumb.style.transform=`translateX(${max}px)`;track.style.setProperty('--swipe-progress','100%');track.classList.add('complete');setTimeout(recordPaymentFromSheet,120)}else resetSwipe()};
    thumb.addEventListener('pointerdown',e=>{if(track.classList.contains('busy'))return;dragging=true;thumb._pid=e.pointerId;thumb.setPointerCapture?.(e.pointerId);const tr=track.getBoundingClientRect(),br=thumb.getBoundingClientRect();max=Math.max(0,tr.width-br.width-10);startX=e.clientX-current;e.preventDefault()});
    thumb.addEventListener('pointermove',e=>{if(dragging)move(e.clientX)});thumb.addEventListener('pointerup',end);thumb.addEventListener('pointercancel',end);
  }
  function resetSwipe(){const track=$('#mSwipe'),thumb=$('.m-swipe-thumb',track);if(!track||!thumb)return;track.classList.remove('complete','busy');track.style.setProperty('--swipe-progress','0%');thumb.style.transform='translateX(0)';const txt=$('.m-swipe-text',track);if(txt)txt.textContent='Swipe to Record Payment'}
  function setSwipeMessage(msg){const t=$('#mSwipe'),x=$('.m-swipe-text',t);if(x)x.textContent=msg}

  async function recordPaymentFromSheet(){
    const workspace=getWorkspaceApp(),projectId=$('#mPayProject')?.value,amount=Number($('#mPayAmount')?.value||0),date=$('#mPayDate')?.value,method=$('#mPayMethod')?.value,ref=$('#mPayRef')?.value.trim();
    const track=$('#mSwipe');track?.classList.add('busy');
    if(!workspace||!projectId){setSwipeMessage('Choose a project');setTimeout(resetSwipe,900);return}
    if(!Number.isFinite(amount)||amount<=0){setSwipeMessage('Enter a valid amount');setTimeout(resetSwipe,900);return}
    if(!date){setSwipeMessage('Choose a payment date');setTimeout(resetSwipe,900);return}
    try{
      setSwipeMessage('Recording…');
      /* Reuse the desktop payment engine so balances, persistence and Supabase sync stay consistent. */
      workspace.openProjectDetails(projectId);
      workspace.openRecordPaymentModal();
      $('#paymentAmountInput').value=amount;$('#paymentDateInput').value=date;$('#paymentMethodInput').value=method;$('#paymentRefInput').value=ref;$('#paymentNotesInput').value='';
      if(receiptFile){const input=$('#paymentReceiptInput');if(input){try{const dt=new DataTransfer();dt.items.add(receiptFile);input.files=dt.files}catch(_){}}}
      await workspace.submitPaymentRecord();
      /* Swipe itself is the confirmation on mobile; skip the redundant second tap. */
      const started=Date.now();const autoConfirm=setInterval(()=>{const modal=$('#confirmationModal'),btn=$('#confirmModalActionBtn');if(modal?.classList.contains('active')&&btn){clearInterval(autoConfirm);btn.click()}else if(Date.now()-started>2500)clearInterval(autoConfirm)},40);
      closeSheet($('#mobileQuickPayment'));
      setTimeout(()=>{renderMobileOverview();renderMobileFinance();syncActive();},1100);
    }catch(e){console.error('Quick payment failed:',e);setSwipeMessage('Could not record payment');setTimeout(resetSwipe,1000)}
  }

  function applyMode(){
    const phone=isPhone();document.body.classList.toggle('mobile-companion-mode',phone);document.body.classList.toggle('mobile-standalone',phone&&isStandalone());if(!phone)return;buildShell();syncActive();enforce();renderMobileOverview();renderMobileFinance();
  }
  function init(){
    buildShell();applyMode();
    const obs=new MutationObserver(()=>{if(!isPhone())return;syncActive();enforce();if(currentView()==='my-works')renderMobileOverview();if(currentView()==='reports')renderMobileFinance()});
    $$('.view').forEach(v=>obs.observe(v,{attributes:true,attributeFilter:['class']}));
    window.matchMedia(PHONE_QUERY).addEventListener?.('change',applyMode);
    window.addEventListener('storage',()=>{renderMobileOverview();renderMobileFinance()});
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
