/*
 * JUAN PROJECT WORKSPACE — Mobile Companion v1.1.2
 * ------------------------------------------------
 * Mobile is intentionally limited to three read-first destinations:
 * Overview, AI, and Finance Report.
 * Project details are viewed through JUAN Assistant rather than a
 * dedicated Projects screen.
 */
(function(){
  const PHONE_QUERY='(max-width: 820px)';
  const allowedMobileViews=new Set(['my-works','assistant','reports']);
  let redirecting=false;

  function getWorkspaceApp(){
    try{if(typeof app!=='undefined'&&app&&typeof app.navigateTo==='function')return app}catch(_){}
    if(window.app&&typeof window.app.navigateTo==='function')return window.app;
    return null;
  }
  function icon(path){return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`}
  const nav=[
    ['my-works','Overview',icon('<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>')],
    ['assistant','AI',icon('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 13V9a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>')],
    ['reports','Finance',icon('<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h20"/>')]
  ];
  const isPhone=()=>window.matchMedia(PHONE_QUERY).matches;
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;

  function buildShell(){
    if(!document.querySelector('.mobile-topbar')){
      const top=document.createElement('header');
      top.className='mobile-topbar';
      top.innerHTML=`<div class="mobile-brand-lockup"><img class="mobile-brand-mark" src="./assets/icon-192.png" alt=""><div><div class="mobile-brand-name">JUAN PROJECT</div><div class="mobile-brand-mode">Companion</div></div></div>`;
      document.body.prepend(top);
    }
    if(!document.querySelector('.mobile-bottom-nav')){
      const bottom=document.createElement('nav');
      bottom.className='mobile-bottom-nav';
      bottom.setAttribute('aria-label','Mobile companion navigation');
      bottom.innerHTML=nav.map(([view,label,svg])=>`<button class="mobile-nav-item" data-mobile-view="${view}" type="button">${svg}<span>${label}</span></button>`).join('');
      document.body.appendChild(bottom);
      bottom.addEventListener('click',e=>{const btn=e.target.closest('[data-mobile-view]');if(!btn)return;e.preventDefault();activate(btn.dataset.mobileView)});
    }
  }
  function currentView(){const active=document.querySelector('.view.active');return active?active.id.replace(/^view-/,''):'my-works'}
  function syncActive(view=currentView()){
    document.body.classList.toggle('mobile-on-assistant',view==='assistant');
    document.body.classList.toggle('mobile-on-finance',view==='reports');
    document.querySelectorAll('.mobile-nav-item').forEach(b=>{const on=b.dataset.mobileView===view;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
  }
  function activate(view){const workspace=getWorkspaceApp();if(!workspace)return;workspace.navigateTo(view);syncActive(view);try{window.scrollTo({top:0,behavior:'instant'})}catch(_){window.scrollTo(0,0)}}
  function enforce(){if(!isPhone()||redirecting)return;const view=currentView();if(allowedMobileViews.has(view))return;const workspace=getWorkspaceApp();if(!workspace)return;redirecting=true;workspace.navigateTo('assistant');setTimeout(()=>{redirecting=false;syncActive('assistant');if(window.juanAI?.home)window.juanAI.home(true)},0)}
  function blockMutations(){
    document.addEventListener('click',e=>{
      if(!document.body.classList.contains('mobile-companion-mode'))return;
      const el=e.target.closest('[onclick]');if(!el)return;
      const call=el.getAttribute('onclick')||'';
      const safe=/navigateTo\('(my-works|assistant|reports)'\)|juanAI\.(home|newChat|topicDeadlines|showToday|showDueToday|showDueSoon|showOverdue|showFinanceSummary|showPendingPayments|viewProjectPicker|viewProjectSummary|finish)|closeModal/.test(call);
      if(!safe){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  }
  function applyMode(){
    const phone=isPhone();
    document.body.classList.toggle('mobile-companion-mode',phone);
    document.body.classList.toggle('mobile-standalone',phone&&isStandalone());
    if(!phone)return;
    buildShell();syncActive();enforce();
  }
  function init(){buildShell();blockMutations();applyMode();const obs=new MutationObserver(()=>{syncActive();enforce()});document.querySelectorAll('.view').forEach(v=>obs.observe(v,{attributes:true,attributeFilter:['class']}));const mq=window.matchMedia(PHONE_QUERY);mq.addEventListener?.('change',applyMode)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
