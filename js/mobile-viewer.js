/*
 * JUAN PROJECT WORKSPACE — mobile-viewer.js
 * ---------------------------------------------------------------
 * v1.1.1
 * Mobile Viewer navigation + read-only guard.
 *
 * IMPORTANT FIX:
 * app.js declares `const app = ...` in the page's global lexical scope.
 * A top-level `const` is NOT available as `window.app`, so v1.1.0's
 * `if (!window.app) return` made the mobile nav buttons do nothing.
 * This module now resolves the app safely through the `app` identifier.
 */
(function(){
  const PHONE_QUERY = '(max-width: 820px)';
  const allowedMobileViews = new Set([
    'my-works','assistant','projects','project-details','clients',
    'payments','reports','calendar','settings'
  ]);

  function getWorkspaceApp(){
    try {
      if (typeof app !== 'undefined' && app && typeof app.navigateTo === 'function') return app;
    } catch (_) {}
    if (window.app && typeof window.app.navigateTo === 'function') return window.app;
    return null;
  }

  function icon(path){
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  }

  const nav = [
    ['my-works','Home',icon('<path d="M3 10.5 12 3l9 7.5V21H4V10.5Z"/><path d="M9 21v-7h6v7"/>')],
    ['projects','Projects',icon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h7"/>')],
    ['assistant','AI',icon('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 13V9a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>')],
    ['payments','Finance',icon('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>')],
    ['settings','More',icon('<circle cx="12" cy="12" r="2.5"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M17 7l1.5-1.5M5.5 18.5 7 17M17 17l1.5 1.5M5.5 5.5 7 7"/>')]
  ];

  function isPhone(){
    return window.matchMedia(PHONE_QUERY).matches;
  }

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function buildShell(){
    if (!document.querySelector('.mobile-topbar')) {
      const top = document.createElement('header');
      top.className = 'mobile-topbar';
      top.innerHTML = `
        <div class="mobile-brand-lockup">
          <img class="mobile-brand-mark" src="./assets/icon-192.png" alt="JUAN PROJECT">
          <div class="mobile-brand-copy">
            <div class="mobile-brand-name">JUAN PROJECT</div>
            <div class="mobile-brand-mode">Mobile Workspace</div>
          </div>
        </div>
        <span class="mobile-viewer-badge">Viewer</span>`;
      document.body.prepend(top);
    }

    if (!document.querySelector('.mobile-bottom-nav')) {
      const bottom = document.createElement('nav');
      bottom.className = 'mobile-bottom-nav';
      bottom.setAttribute('aria-label','Mobile navigation');
      bottom.innerHTML = nav.map(([view,label,svg]) =>
        `<button class="mobile-nav-item" data-mobile-view="${view}" type="button" aria-label="${label}">${svg}<span>${label}</span></button>`
      ).join('');
      document.body.appendChild(bottom);

      /*
       * Use pointerup rather than relying only on click. This feels immediate
       * on touchscreens while still allowing standard click/keyboard access.
       */
      let handledPointer = false;
      bottom.addEventListener('pointerup', event => {
        if (event.pointerType === 'mouse') return;
        const btn = event.target.closest('[data-mobile-view]');
        if (!btn) return;
        handledPointer = true;
        activateMobileView(btn.dataset.mobileView);
        setTimeout(() => { handledPointer = false; }, 50);
      });

      bottom.addEventListener('click', event => {
        const btn = event.target.closest('[data-mobile-view]');
        if (!btn || handledPointer) return;
        event.preventDefault();
        activateMobileView(btn.dataset.mobileView);
      });
    }
  }

  function activateMobileView(view){
    const workspace = getWorkspaceApp();
    if (!workspace) {
      showMobileNotice('Workspace loading','Try again in a moment.');
      return;
    }

    workspace.navigateTo(view);
    syncActive(view);

    /* Start each main mobile destination at the top for lower friction. */
    try { window.scrollTo({top:0, behavior:'instant'}); }
    catch (_) { window.scrollTo(0,0); }
  }

  function currentView(){
    const active = document.querySelector('.view.active');
    return active ? active.id.replace(/^view-/,'') : 'my-works';
  }

  function syncActive(view=currentView()){
    document.body.classList.toggle('mobile-on-assistant', view === 'assistant');
    document.querySelectorAll('.mobile-nav-item').forEach(button => {
      const selected = button.dataset.mobileView === view ||
        (view === 'project-details' && button.dataset.mobileView === 'projects');
      button.classList.toggle('active', selected);
      button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
  }

  function blockMutations(){
    document.addEventListener('click', function(event){
      if (!document.body.classList.contains('mobile-viewer-mode')) return;
      const element = event.target.closest('[onclick]');
      if (!element) return;

      const call = element.getAttribute('onclick') || '';
      const allowed = /handleProfilePhotoUpload|removeProfilePhoto|updateOwner|setThemeMode|setDashboardTheme|exportDataBackup|importDataBackup|closeModal|onCropZoomChange|confirmCroppedImage|navigateTo|openProjectDetails|openProjectData|switchProjectTab|setProjectFilter|setPaymentFilter|changeCalendarMonth|resetCalendarToToday|openOverviewListModal|openRevenueMilestone|shareRevenueMilestone|copyRevenueMilestone/.test(call);
      const mutating = /new-order|toggleDeliverable|RecordPayment|saveProject|delete|MarkAsDelivered|saveCatalog|openCatalog(Category|Service|Package)Modal|addToCart|addPackageToCart|confirmAndCreateOrder|updateTaskStatus|saveTask/.test(call);

      if (mutating && !allowed) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showMobileNotice('Viewer mode','Use the desktop workspace to edit this item.');
      }
    }, true);
  }

  function showMobileNotice(title,message){
    let notice = document.getElementById('mobileViewerNotice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'mobileViewerNotice';
      notice.style.cssText = [
        'position:fixed',
        'left:14px',
        'right:14px',
        'bottom:calc(68px + env(safe-area-inset-bottom, 0px))',
        'z-index:5200',
        'padding:11px 13px',
        'border-radius:14px',
        'background:rgba(20,20,22,.94)',
        'color:white',
        'box-shadow:0 8px 24px rgba(0,0,0,.18)',
        'font:13px -apple-system,BlinkMacSystemFont,sans-serif',
        'transition:opacity .18s ease',
        'pointer-events:none'
      ].join(';');
      document.body.appendChild(notice);
    }

    notice.innerHTML = `<strong style="display:block;margin-bottom:2px">${title}</strong><span style="opacity:.78">${message}</span>`;
    notice.style.opacity = '1';
    clearTimeout(notice._t);
    notice._t = setTimeout(() => notice.style.opacity = '0', 1900);
  }

  function applyMode(){
    const phone = isPhone();
    document.body.classList.toggle('mobile-viewer-mode', phone);
    document.body.classList.toggle('mobile-standalone', phone && isStandalone());

    if (!phone) return;

    buildShell();
    syncActive();

    const view = currentView();
    const workspace = getWorkspaceApp();
    if (!allowedMobileViews.has(view) && workspace) workspace.navigateTo('my-works');
  }

  function init(){
    buildShell();
    blockMutations();
    applyMode();

    const observer = new MutationObserver(() => syncActive());
    document.querySelectorAll('.view').forEach(view => {
      observer.observe(view,{attributes:true,attributeFilter:['class']});
    });

    const phoneMedia = window.matchMedia(PHONE_QUERY);
    if (phoneMedia.addEventListener) phoneMedia.addEventListener('change',applyMode);
    else if (phoneMedia.addListener) phoneMedia.addListener(applyMode);

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    if (standaloneMedia.addEventListener) standaloneMedia.addEventListener('change',applyMode);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
