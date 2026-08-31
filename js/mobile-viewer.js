/*
 * JUAN PROJECT WORKSPACE — mobile-viewer.js
 * ---------------------------------------------------------------
 * Adds a read-first phone shell without changing desktop behavior.
 * The main app remains the source of truth; this module only adapts
 * navigation and protects phone use from accidental write actions.
 */
(function(){
  const PHONE_QUERY = '(max-width: 820px)';
  const allowedMobileViews = new Set([
    'my-works','assistant','projects','project-details','clients',
    'payments','reports','calendar','settings'
  ]);

  function icon(path){return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;}
  const nav = [
    ['my-works','Home',icon('<path d="M3 10.5 12 3l9 7.5V21H4V10.5Z"/><path d="M9 21v-7h6v7"/>')],
    ['projects','Projects',icon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h7"/>')],
    ['assistant','AI',icon('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 13V9a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>')],
    ['payments','Finance',icon('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>')],
    ['settings','More',icon('<circle cx="12" cy="12" r="2.5"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M17 7l1.5-1.5M5.5 18.5 7 17M17 17l1.5 1.5M5.5 5.5 7 7"/>')]
  ];

  function isPhone(){ return window.matchMedia(PHONE_QUERY).matches; }

  function buildShell(){
    if(document.querySelector('.mobile-topbar')) return;
    const top=document.createElement('header');
    top.className='mobile-topbar';
    top.innerHTML=`<div class="mobile-brand-lockup"><img class="mobile-brand-mark" src="./assets/icon-192.png" alt="JUAN PROJECT"><div class="mobile-brand-copy"><div class="mobile-brand-name">JUAN PROJECT</div><div class="mobile-brand-mode">Mobile Workspace</div></div></div><span class="mobile-viewer-badge">Viewer</span>`;
    document.body.prepend(top);

    const bottom=document.createElement('nav');
    bottom.className='mobile-bottom-nav';
    bottom.setAttribute('aria-label','Mobile navigation');
    bottom.innerHTML=nav.map(([view,label,svg])=>`<button class="mobile-nav-item" data-mobile-view="${view}" type="button">${svg}<span>${label}</span></button>`).join('');
    document.body.appendChild(bottom);
    bottom.addEventListener('click',e=>{
      const btn=e.target.closest('[data-mobile-view]');
      if(!btn||!window.app) return;
      window.app.navigateTo(btn.dataset.mobileView);
      syncActive(btn.dataset.mobileView);
    });
  }

  function currentView(){
    const active=document.querySelector('.view.active');
    return active ? active.id.replace(/^view-/,'') : 'my-works';
  }

  function syncActive(view=currentView()){
    document.body.classList.toggle('mobile-on-assistant',view==='assistant');
    document.querySelectorAll('.mobile-nav-item').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===view || (view==='project-details'&&b.dataset.mobileView==='projects')));
  }

  function blockMutations(){
    document.addEventListener('click',function(e){
      if(!document.body.classList.contains('mobile-viewer-mode')) return;
      const el=e.target.closest('[onclick]'); if(!el) return;
      const call=el.getAttribute('onclick')||'';
      const allowed = /handleProfilePhotoUpload|removeProfilePhoto|updateOwner|setThemeMode|setDashboardTheme|exportDataBackup|importDataBackup|closeModal|onCropZoomChange|confirmCroppedImage|navigateTo|openProjectDetails|openProjectData|switchProjectTab|setProjectFilter|setPaymentFilter|changeCalendarMonth|resetCalendarToToday|openOverviewListModal|openRevenueMilestone|shareRevenueMilestone|copyRevenueMilestone/.test(call);
      const mutating = /new-order|toggleDeliverable|RecordPayment|saveProject|delete|MarkAsDelivered|saveCatalog|openCatalog(Category|Service|Package)Modal|addToCart|addPackageToCart|confirmAndCreateOrder|updateTaskStatus|saveTask/.test(call);
      if(mutating && !allowed){
        e.preventDefault(); e.stopImmediatePropagation();
        showMobileNotice('Viewer mode','Editing is available on the desktop workspace.');
      }
    },true);
  }

  function showMobileNotice(title,msg){
    let n=document.getElementById('mobileViewerNotice');
    if(!n){n=document.createElement('div');n.id='mobileViewerNotice';n.style.cssText='position:fixed;left:16px;right:16px;bottom:92px;z-index:2500;padding:12px 14px;border-radius:16px;background:rgba(20,20,22,.92);color:white;box-shadow:0 10px 30px rgba(0,0,0,.2);font:13px -apple-system,BlinkMacSystemFont,sans-serif;transition:.2s;';document.body.appendChild(n);}
    n.innerHTML=`<strong style="display:block;margin-bottom:2px">${title}</strong><span style="opacity:.78">${msg}</span>`;
    n.style.opacity='1'; clearTimeout(n._t); n._t=setTimeout(()=>n.style.opacity='0',2200);
  }

  function applyMode(){
    const phone=isPhone();
    document.body.classList.toggle('mobile-viewer-mode',phone);
    if(phone){ buildShell(); syncActive();
      const v=currentView(); if(!allowedMobileViews.has(v) && window.app) window.app.navigateTo('my-works');
    }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    buildShell(); blockMutations(); applyMode();
    const observer=new MutationObserver(()=>syncActive());
    document.querySelectorAll('.view').forEach(v=>observer.observe(v,{attributes:true,attributeFilter:['class']}));
    window.matchMedia(PHONE_QUERY).addEventListener?.('change',applyMode);
  });
})();
