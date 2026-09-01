/**
 * JUAN PROJECT WORKSPACE — app.js
 * ------------------------------------------------------------------
 * PURPOSE: Main application engine. Contains state, storage, navigation, project/client/payment/catalog logic, render functions, invoices, reports and most app actions.
 * LOAD ORDER: 1 of 4 local modules (the OCR library may load between modules).
 *
 * MAINTENANCE TIP:
 * - Search for `function <name>` or `app.<action>` to find a feature.
 * - Make one logical change at a time and commit it with Git.
 * - Do not rename stored LocalStorage keys unless you also write a migration.
 */

function formatCurrency(amount) {
      const num = Number(amount || 0);
      return `₱ ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function showToast(message, actionLabel = null, actionCallback = null) {
      const container = document.getElementById("toastContainer");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = "toast";
      
      const messageSpan=document.createElement('span');messageSpan.textContent=String(message??'');toast.appendChild(messageSpan);
      if (actionLabel && actionCallback) {
        const action=document.createElement('button');action.className='btn btn-sm btn-primary';action.style.cssText='padding:2px 8px;font-size:12px;margin-left:8px';action.textContent=String(actionLabel);toast.appendChild(action);
      }

      if (actionLabel && actionCallback) {
        toast.querySelector("button").onclick = () => {
          actionCallback();
          toast.remove();
        };
      }

      container.appendChild(toast);
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 5000);
    }

    function openModal(modalId) {
      const el=document.getElementById(modalId);if(el){el.classList.add('active');setTimeout(()=>refreshSearchableSelects(el),30);}
    }
    function refreshSearchableSelects(root=document){
      root.querySelectorAll('select.form-control').forEach(select=>{if(select.options.length<=5||select.dataset.searchEnhanced==='1')return;select.dataset.searchEnhanced='1';const wrap=document.createElement('div');wrap.className='generic-search-select';select.parentNode.insertBefore(wrap,select);wrap.appendChild(select);select.classList.add('native-search-select');const input=document.createElement('input');input.className='form-control generic-search-select-input';input.placeholder='Type to search…';input.value=select.options[select.selectedIndex]?.text||'';wrap.appendChild(input);const menu=document.createElement('div');menu.className='typeahead-menu generic-search-select-menu';wrap.appendChild(menu);const render=()=>{const q=input.value.trim().toLowerCase(),opts=[...select.options].filter(o=>!q||o.text.toLowerCase().includes(q));menu.innerHTML=opts.map(o=>`<button type="button" class="typeahead-option" data-value="${escapeHtml(o.value)}">${escapeHtml(o.text)}</button>`).join('');menu.classList.add('open');menu.querySelectorAll('button').forEach(btn=>btn.onmousedown=e=>{e.preventDefault();select.value=btn.dataset.value;input.value=select.options[select.selectedIndex]?.text||'';select.dispatchEvent(new Event('change',{bubbles:true}));menu.classList.remove('open');});};input.onfocus=render;input.oninput=render;input.onblur=()=>setTimeout(()=>menu.classList.remove('open'),120);});
    }

    function closeModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.remove("active");
    }

    const DEFAULT_SOLO_SERVICES = [
      { product_code: "SRV-001", name: "STUDIO", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 3000.00, active: true, type: "SOLO" },
      { product_code: "SRV-002", name: "LOWER THIRDS", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 1500.00, active: true, type: "SOLO" },
      { product_code: "SRV-003", name: "LOGO ANIMATION", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER", price: 1500.00, active: true, type: "SOLO" },
      { product_code: "SRV-004", name: "STINGER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-005", name: "HEADLINE TEMPLATE", category: "TV Broadcast Graphics", description: "IMAGE, CANVA", price: 800.00, active: true, type: "SOLO" },
      { product_code: "SRV-006", name: "LIVE BUMPER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-007", name: "UP NEXT BUMPER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-008", name: "CHANNEL IDENT", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-009", name: "STUDIO MONTAGE", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 800.00, active: true, type: "SOLO" },
      { product_code: "SRV-010", name: "STUDIO FLIP", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 800.00, active: true, type: "SOLO" },
      { product_code: "SRV-011", name: "SPORTS/ENTERTAINMENT BUMPER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-012", name: "SPORTS BUMPER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-013", name: "ENTERTAINMENT BUMPER", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 500.00, active: true, type: "SOLO" },
      { product_code: "SRV-014", name: "TITLE CARD / POSTER CARD", category: "TV Broadcast Graphics", description: "IMAGE, CANVA", price: 400.00, active: true, type: "SOLO" },
      { product_code: "SRV-015", name: "TITLE CARD", category: "TV Broadcast Graphics", description: "IMAGE, CANVA", price: 400.00, active: true, type: "SOLO" },
      { product_code: "SRV-016", name: "POSTER CARD", category: "TV Broadcast Graphics", description: "IMAGE, CANVA", price: 400.00, active: true, type: "SOLO" },
      { product_code: "SRV-017", name: "LIVE FRAME", category: "TV Broadcast Graphics", description: "VIDEO, BLENDER, AE", price: 300.00, active: true, type: "SOLO" }
    ];

    function normalizeBroadcastPackageName(name) {
      const value = String(name || "").trim();
      const normalized = value.toUpperCase();

      if (normalized === "BRONZE") return "BRONZE BROADCAST PACKAGE";
      if (normalized === "SILVER") return "SILVER BROADCAST PACKAGE";
      if (normalized === "GOLD") return "GOLD BROADCAST PACKAGE";
      if (normalized === "PLATINUM") return "PLATINUM BROADCAST PACKAGE";

      return value;
    }

    function normalizeBroadcastPackageNames(list) {
      return (Array.isArray(list) ? list : []).map(pkg => ({
        ...pkg,
        name: normalizeBroadcastPackageName(pkg.name)
      }));
    }

    const DEFAULT_PACKAGES = [
      {
        product_code: "PKG-001",
        name: "BRONZE BROADCAST PACKAGE",
        category: "TV Broadcast Graphics",
        description: "Includes:\n• STUDIO\n• LOWER THIRDS\n• LOGO ANIMATION\n• STINGER",
        type: "PACKAGE",
        sellingPrice: 5999.00,
        originalPrice: 6300.00,
        discount: 300.00,
        includedServiceNames: ["STUDIO", "LOWER THIRDS", "LOGO ANIMATION", "STINGER"],
        active: true
      },
      {
        product_code: "PKG-002",
        name: "SILVER BROADCAST PACKAGE",
        category: "TV Broadcast Graphics",
        description: "Includes:\n• STUDIO\n• LOWER THIRDS\n• LOGO ANIMATION\n• HEADLINE TEMPLATE\n• LIVE BUMPER\n• STINGER\n• UP NEXT BUMPER\n• CHANNEL IDENT",
        type: "PACKAGE",
        sellingPrice: 7899.00,
        originalPrice: 8300.00,
        discount: 400.00,
        includedServiceNames: ["STUDIO", "LOWER THIRDS", "LOGO ANIMATION", "HEADLINE TEMPLATE", "LIVE BUMPER", "STINGER", "UP NEXT BUMPER", "CHANNEL IDENT"],
        active: true
      },
      {
        product_code: "PKG-003",
        name: "GOLD BROADCAST PACKAGE",
        category: "TV Broadcast Graphics",
        description: "Includes:\n• STUDIO\n• LOWER THIRDS\n• LOGO ANIMATION\n• STUDIO MONTAGE\n• HEADLINE TEMPLATE\n• LIVE BUMPER\n• STINGER\n• UP NEXT BUMPER\n• CHANNEL IDENT\n• SPORTS/ENTERTAINMENT BUMPER\n• TITLE CARD / POSTER CARD\n• LIVE FRAME",
        type: "PACKAGE",
        sellingPrice: 9999.00,
        originalPrice: 10600.00,
        discount: 600.00,
        includedServiceNames: ["STUDIO", "LOWER THIRDS", "LOGO ANIMATION", "STUDIO MONTAGE", "HEADLINE TEMPLATE", "LIVE BUMPER", "STINGER", "UP NEXT BUMPER", "CHANNEL IDENT", "SPORTS/ENTERTAINMENT BUMPER", "TITLE CARD / POSTER CARD", "LIVE FRAME"],
        active: true
      },
      {
        product_code: "PKG-004",
        name: "PLATINUM BROADCAST PACKAGE",
        category: "TV Broadcast Graphics",
        description: "Includes:\n• STUDIO\n• LOWER THIRDS\n• LOGO ANIMATION\n• STUDIO MONTAGE\n• STUDIO FLIP\n• HEADLINE TEMPLATE\n• LIVE BUMPER\n• STINGER\n• UP NEXT BUMPER\n• CHANNEL IDENT\n• SPORTS BUMPER\n• ENTERTAINMENT BUMPER\n• TITLE CARD\n• POSTER CARD\n• LIVE FRAME",
        type: "PACKAGE",
        sellingPrice: 10799.00,
        originalPrice: 12300.00,
        discount: 1500.00,
        includedServiceNames: ["STUDIO", "LOWER THIRDS", "LOGO ANIMATION", "STUDIO MONTAGE", "STUDIO FLIP", "HEADLINE TEMPLATE", "LIVE BUMPER", "STINGER", "UP NEXT BUMPER", "CHANNEL IDENT", "SPORTS BUMPER", "ENTERTAINMENT BUMPER", "TITLE CARD", "POSTER CARD", "LIVE FRAME"],
        active: true
      }
    ];

    // Editable sample data preloaded from the uploaded Payment Tracker sheet.
    // Blank template rows (055/056) are intentionally not seeded; entry forms stay blank.
    const SAMPLE_DATA_VERSION = "PAYMENT_TRACKER_2025_001_054_CONTINUOUS_V2";
    const LEGACY_SHEET_RECORDS = [{"ref":"2025-001-001","client":"imahemultimediaproductions@gmail.com","project":"FUN AND LAUGH WITH RON","project_type":"Social Media Managing","amount_due":13000.0,"amount_received":13000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-002","client":"yvonnemaedelgado@gmail.com","project":"iREPORT","project_type":"TV Broadcast Package","amount_due":10000.0,"amount_received":10000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-003","client":"trishakayemesana@gmail.com","project":"SIMULCAST","project_type":"TV Broadcast Package","amount_due":10000.0,"amount_received":10000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-004","client":"dkian032@gmail.com","project":"CAMPUS PATROL","project_type":"TV Broadcast Package","amount_due":3000.0,"amount_received":3000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-005","client":"dalumpinesmargaret@gmail.com","project":"THE PULSE NEWS","project_type":"Logo Animation","amount_due":800.0,"amount_received":800.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-006","client":"ramosdenmar03@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":11500.0,"amount_received":11500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-007","client":"ardienjamesgais@gmail.com","project":"DEPED X","project_type":"TV Broadcast Package","amount_due":4300.0,"amount_received":4300.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-008","client":"kztksem88@gmail.com","project":"HORIZON NEWS CENTRAL","project_type":"Blender Workshop","amount_due":1500.0,"amount_received":1500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-009","client":"oliver.villaruel@deped.gov.ph","project":"TUTOK PILIPINAS","project_type":"TV Broadcast Package","amount_due":8300.0,"amount_received":8300.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-010","client":"dimaanolorraine37@gmail.com","project":"BANTAY PILIPINAS","project_type":"TV Broadcast Package","amount_due":7500.0,"amount_received":7500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-011","client":"janellerinn@gmail.com","project":"MASID","project_type":"TV Broadcast Package","amount_due":7500.0,"amount_received":7500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-012","client":"ramosdenmar03@gmail.com","project":"KAMPUS KONEK 2","project_type":"TV Broadcast Package","amount_due":13000.0,"amount_received":13000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-013","client":"nikkazara29@gmail.com","project":"TOP NEWS","project_type":"TV Broadcast Package","amount_due":5000.0,"amount_received":5000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-014","client":"mamadoaalexanderissaiah@gmail.com","project":"ALISTO PUNTO","project_type":"TV Broadcast Package","amount_due":11000.0,"amount_received":11000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-015","client":"earljohnmapa12@gmail.com","project":"CAMPUS PATROL","project_type":"Logo Animation","amount_due":6000.0,"amount_received":6000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-016","client":"annefelicityrufo1@gmail.com","project":"CAMPUS PATROL","project_type":"OBB and CBB","amount_due":1700.0,"amount_received":1700.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-017","client":"sosadanica07@gmail.com","project":"DSPC TV","project_type":"OBB and CBB","amount_due":1700.0,"amount_received":1700.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-018","client":"ashleymaeramos001@gmail.com","project":"RONDA PILIPINAS","project_type":"OBB and CBB","amount_due":1700.0,"amount_received":1700.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-019","client":"leisoriano25@gmail.com","project":"RONDA PILIPINAS","project_type":"Blender Workshop","amount_due":2000.0,"amount_received":2000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-020","client":"bacalaaj@gmail.com","project":"SUBIC","project_type":"Logo Animation","amount_due":2720.0,"amount_received":2720.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-021","client":"oliver.villaruel@deped.gov.ph","project":"KAMPUS KONEK RSPC","project_type":"TV Broadcast Package","amount_due":10000.0,"amount_received":10000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-022","client":"calmorinjareen@gmail.com","project":"STRONGER CHAMPS PATROL","project_type":"TV Broadcast Package","amount_due":12100.0,"amount_received":12100.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-023","client":"danrowey2009@gmail.com","project":"BROADKAST PILIPINAS","project_type":"TV Broadcast Package","amount_due":7950.0,"amount_received":7950.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-024","client":"rapaconnicolo7@gmail.com","project":"CAMPUS PATROL RSPC","project_type":"TV Broadcast Package","amount_due":16450.0,"amount_received":16450.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-025","client":"mamadoaalexanderissaiah@gmail.com","project":"ALISTO PUNTO RSPC","project_type":"TV Broadcast Package","amount_due":10000.0,"amount_received":10000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-026","client":"apriljoy.tabingo@deped.gov.ph","project":"KAMPUS BALITAAN RSPC","project_type":"TV Broadcast Package","amount_due":8550.0,"amount_received":8550.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-027","client":"NATHANIEL VILLEGAS","project":"WATCH","project_type":"Interactive 3D Model","amount_due":6000.0,"amount_received":6000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-028","client":"michaelquinto33@gmail.com","project":"CAMPUS PATROL","project_type":"TV Broadcast Package","amount_due":12200.0,"amount_received":12200.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-029","client":"acunamika67@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":13200.0,"amount_received":13200.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-030","client":"caliaoalthea6@gmail.com","project":"CAMPUS ON SCREEN","project_type":"TV Broadcast Package","amount_due":5075.0,"amount_received":5075.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-031","client":"macarimbangesmail18@gmail.com","project":"THE NEWS AUTHORITY","project_type":"Headline Rundown","amount_due":2000.0,"amount_received":2000.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-032","client":"santos.amielelijah@gmail.com","project":"SINAG BALITA","project_type":"TV Broadcast Package","amount_due":7500.0,"amount_received":7500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-033","client":"annefelicityrufo1@gmail.com","project":"KAMPUS KONEK","project_type":"OBB","amount_due":1200.0,"amount_received":1200.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-034","client":"Name","project":"MEMORIES","project_type":"TV Broadcast Package","amount_due":1200.0,"amount_received":1200.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-035","client":"oliver.villaruel@deped.gov.ph","project":"CAMPUS PATROL","project_type":"TV Broadcast Package","amount_due":6600.0,"amount_received":1200.0,"payment_status":"Downpayment","pending":5400.0},{"ref":"2025-001-036","client":"kyledylan1921@gmail.com","project":"CAMPUS PATROL","project_type":"TV Broadcast Package","amount_due":8300.0,"amount_received":8300.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-037","client":"iannebaristol2005@gmail.com","project":"PICE-MUSC","project_type":"Logo Animation","amount_due":1500.0,"amount_received":1500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-038","client":"jetcastre5@gmail.com","project":"NEWSKO KONEK","project_type":"Logo Animation","amount_due":1200.0,"amount_received":1200.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-039","client":"oliver.villaruel@deped.gov.ph","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":2000.0,"amount_received":0.0,"payment_status":"Pending","pending":2000.0},{"ref":"2025-001-040","client":"sittieazhimagyusoph@gmail.com","project":"NOVARE","project_type":"Logo Animation","amount_due":5150.0,"amount_received":5150.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-041","client":"tjmercado1515@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":13300.0,"amount_received":4800.0,"payment_status":"Downpayment","pending":8500.0},{"ref":"2025-001-042","client":"allieyahbautista@gmail.com","project":"CAMPUS PATROL","project_type":"TV Broadcast Package","amount_due":11500.0,"amount_received":3284.0,"payment_status":"Pending","pending":8216.0},{"ref":"2025-001-043","client":"scharlesleendon@gmail.com","project":"RAMONIAN PULSE","project_type":"TV Broadcast Package","amount_due":7900.0,"amount_received":7900.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-044","client":"tagapulot.brianaziv@gmail.com","project":"ALUBIJID NCHS","project_type":"Logo Animation","amount_due":2500.0,"amount_received":2500.0,"payment_status":"Pending","pending":0.0},{"ref":"2025-001-045","client":"ardienjamesgais@gmail.com","project":"AKSYON PILIPINAS","project_type":"TV Broadcast Package","amount_due":4300.0,"amount_received":4300.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-046","client":"mtyap.pas@gmail.com","project":"ABS MANDIRIGMA","project_type":"TV Broadcast Package","amount_due":7500.0,"amount_received":0.0,"payment_status":"Pending","pending":7500.0},{"ref":"2025-001-047","client":"scharlesleendon@gmail.com","project":"RAMONIAN PULSE","project_type":"Video Editing","amount_due":6500.0,"amount_received":6500.0,"payment_status":"Completed","pending":0.0},{"ref":"2025-001-048","client":"babonmichaelneil@gmail.com","project":"TINIG BAYBAYIN","project_type":"TV Broadcast Package","amount_due":11800.0,"amount_received":10700.0,"payment_status":"Downpayment","pending":1100.0},{"ref":"2025-001-049","client":"caliguirankathleengrace@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":10800.0,"amount_received":5400.0,"payment_status":"Downpayment","pending":5400.0},{"ref":"2025-001-050","client":"brylevicmudo@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":7900.0,"amount_received":4000.0,"payment_status":"Downpayment","pending":3900.0},{"ref":"2025-001-051","client":"sharanfaten9@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":9500.0,"amount_received":4500.0,"payment_status":"Downpayment","pending":5000.0},{"ref":"2025-001-052","client":"mykellpatigayon949@gmail.com","project":"USAPANG NATIONALIAN","project_type":"Logo Animation","amount_due":1500.0,"amount_received":1500.0,"payment_status":"Downpayment","pending":0.0},{"ref":"2025-001-053","client":"ramosdenmar03@gmail.com","project":"KAMPUS KONEK","project_type":"TV Broadcast Package","amount_due":15000.0,"amount_received":0.0,"payment_status":"Downpayment","pending":15000.0},{"ref":"2025-001-054","client":"barejechad05@gmail.com","project":"CAMPUS NEWS","project_type":"TV Broadcast Package","amount_due":8500.0,"amount_received":4100.0,"payment_status":"Downpayment","pending":4400.0}];
    const app = (function() {
      const SYSTEM_MAINTENANCE_FEE = 21;
      const REVISION_FEE_PER_REVISION = 500;
      let supabaseClient = null;
      let cloudProjectSyncTimer = null;
      let cloudHydrating = false;

      let state = {
        supabaseUrl: "",
        supabaseAnonKey: "",
        isConnected: false,

        profilePhoto: localStorage.getItem("JUAN_PROFILE_PHOTO") || "",
        ownerName: localStorage.getItem("JUAN_OWNER_NAME") || "Your Business Name",
        ownerAddress: localStorage.getItem("JUAN_OWNER_ADDRESS") || "Your Address Here",
        ownerPhone: localStorage.getItem("JUAN_OWNER_PHONE") || "Your Phone Number",
        ownerEmail: localStorage.getItem("JUAN_OWNER_EMAIL") || "your.email@example.com",
        themeMode: localStorage.getItem("JUAN_THEME_MODE") || "light",
        dashboardTheme: localStorage.getItem("JUAN_DASHBOARD_THEME") || "standard",

        settings: {
          businessName: "JUAN PROJECT",
          appName: "JUAN PROJECT WORKSPACE",
          ownerName: "Your Business Name",
          email: "your.email@example.com",
          address: "Your Address Here",
          projectPrefix: "PRJ",
          invoicePrefix: "INV"
        },

        clients: [],
        soloServices: DEFAULT_SOLO_SERVICES,
        packagesList: DEFAULT_PACKAGES,
        projects: [],
        tasks: [],
        templates: [],
        
        cart: {
          clientMode: "existing",
          selectedClientId: "",
          projectName: "",
          items: [],
          discountVal: 0,
          discountType: "fixed",
          startDate: (()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})(),
          deadlineDate: (()=>{const d=new Date();d.setDate(d.getDate()+14);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})(),
          deadlineManuallySet: false,
          rushFee: 0,
          workloadRushRate: 0,
          workloadRushFee: 0,
          rushDaysEarly: 0
        },

        activeView: "my-works",
        activeProjectId: null,
        lastDeletedProject: null,
        catalogTab: "SOLO",
        pricelistTab: "SOLO",
        catalogCategories: [],
        catalogManagerCategory: "ALL",
        catalogManagerFilter: "All Items",
        orderShopService: "ALL",
        projectFilter: "Current",
        paymentFilter: "Pending",
        listSorts: {
          projects: "default",
          payments: "default",
          clients: "id",
          catalog: "default",
          overviewProjects: "date",
          overviewDeadlines: "date"
        },
        packageBuilderSelectedNames: [],
        calendarDate: new Date(),
        manualEvents: []
      };

      // Profile Cropping State Variables
      let cropImageObj = null;
      let cropCanvasCtx = null;
      let cropOffset = { x: 0, y: 0 };
      let cropScale = 1;
      let cropBaseScale = 1;
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };

      async function initializeEnvironmentVariables() {
        // Security boundary: no Supabase or Gemini secret is ever exposed to the browser.
        // Cloud access is provided by same-origin /api/session + /api/data serverless proxies.
        state.supabaseUrl = "";
        state.supabaseAnonKey = "";
        try {
          const response = await fetch("/api/session", {method:"GET",cache:"no-store",credentials:"same-origin",headers:{Accept:"application/json"}});
          const payload = await response.json().catch(()=>({}));
          state.csrfToken = String(payload.csrfToken||"");
          state.cloudAuthenticated = !!payload.authenticated;
          return state.cloudAuthenticated;
        } catch (error) {
          console.warn("Secure cloud session unavailable; continuing offline.", error);
          state.cloudAuthenticated = false;
          return false;
        }
      }

      function updateConnectionStatus(status="offline", label="OFFLINE · LOCAL", detail=""){
        const indicator=document.getElementById("connectionStatusIndicator");
        const textEl=document.getElementById("statusText");
        const settingsState=document.getElementById("cloudConnectionState");
        const settingsDetail=document.getElementById("cloudConnectionDetail");
        const normalized=["connected","connecting","error","offline"].includes(status)?status:"offline";
        if(indicator){
          indicator.classList.remove("status-connected","status-connecting","status-error","status-offline");
          indicator.classList.add(`status-${normalized}`);
        }
        if(textEl)textEl.textContent=label;
        if(settingsState){
          settingsState.textContent=label;
          settingsState.dataset.status=normalized;
        }
        if(settingsDetail){
          settingsDetail.textContent=detail || (
            normalized==="connected" ? "Secure Supabase synchronization is active." :
            normalized==="connecting" ? "Authenticating and checking the database…" :
            normalized==="error" ? "Cloud connection needs attention." :
            "Local data remains available. Connect Cloud to enable Supabase and Gemini."
          );
        }
        window.dispatchEvent(new CustomEvent("juan:cloud-status",{detail:{status:normalized,label,detail}}));
      }

      async function initWorkspace() {
        applyTheme(state.themeMode);
        updateProfileDisplay();
        
        const savedCart = localStorage.getItem("JUAN_CART_STATE");
        if (savedCart) {
          try {
            state.cart = { ...state.cart, ...JSON.parse(savedCart) };
            if (typeof state.cart.deadlineManuallySet !== "boolean") {
              const predictedDeadline = addDaysToDateString(state.cart.startDate, standardProductionDaysForCart());
              state.cart.deadlineManuallySet = Boolean(state.cart.deadlineDate && state.cart.deadlineDate !== predictedDeadline);
            }
          } catch(e) {
            console.error("Invalid saved cart data:", e);
          }
        }

        const savedTemplates = localStorage.getItem("JUAN_TEMPLATES");
        if (savedTemplates) {
          try { state.templates = JSON.parse(savedTemplates); } catch(e){}
        }

        const savedSolo = localStorage.getItem("JUAN_SOLO_SERVICES");
        if (savedSolo) {
          try { state.soloServices = JSON.parse(savedSolo); } catch(e){}
        }

        const savedCategories = localStorage.getItem("JUAN_CATALOG_CATEGORIES");
        const derivedCategories = [...new Set((state.soloServices || []).map(x => String(x.category || "SOLO").trim()).filter(Boolean))];
        if (savedCategories) { try { state.catalogCategories = JSON.parse(savedCategories).filter(Boolean); } catch(e){} }
        if (!Array.isArray(state.catalogCategories) || !state.catalogCategories.length) state.catalogCategories = derivedCategories.length ? derivedCategories : ["SOLO"];
        derivedCategories.forEach(cat => { if (!state.catalogCategories.includes(cat)) state.catalogCategories.push(cat); });

        const savedPkgs = localStorage.getItem("JUAN_PACKAGES");
        if (savedPkgs) {
          try { state.packagesList = normalizeBroadcastPackageNames(JSON.parse(savedPkgs)); } catch(e){}
        }
        state.packagesList = normalizeBroadcastPackageNames(state.packagesList);
        localStorage.setItem("JUAN_PACKAGES", JSON.stringify(state.packagesList));

        const savedClients = localStorage.getItem("JUAN_CLIENTS_LOCAL");
        if (savedClients) {
          try { state.clients = JSON.parse(savedClients); } catch(e){}
        }

        try {
          const savedCalendarEvents = localStorage.getItem("JUAN_CALENDAR_EVENTS");
          state.manualEvents = savedCalendarEvents ? JSON.parse(savedCalendarEvents) : [];
          if (!Array.isArray(state.manualEvents)) state.manualEvents = [];
        } catch(e) { state.manualEvents = []; }

        ensureAdditionalFees();
        loadOrderDraftsState();

        const addrInput = document.getElementById("ownerAddressInput");
        const phoneInput = document.getElementById("ownerPhoneInput");
        const emailInput = document.getElementById("ownerEmailInput");
        const themeSelect = document.getElementById("themeModeSelect");
        const dashboardThemeSelect = document.getElementById("dashboardThemeSelect");

        if (addrInput) addrInput.value = state.ownerAddress;
        if (phoneInput) phoneInput.value = state.ownerPhone;
        if (emailInput) emailInput.value = state.ownerEmail;
        if (themeSelect) themeSelect.value = state.themeMode;
        if (dashboardThemeSelect) dashboardThemeSelect.value = state.dashboardTheme;
        applyDashboardTheme(state.dashboardTheme);

        setDefaultOrderDates();
        loadTasksState();

        // Offline-first deployment: localStorage is the primary database.
        seedLegacySheetDataIfNeeded();
        migrateActiveLegacyDatesToCurrent();
        // One continuous Project ID sequence, starting at JP-001 with no exceptions.
        renumberProjectSequence();
        // Normalize the system-defined maintenance rule for restored/older projects too.
        state.projects.forEach(p=>{p.system_maintenance_charge=projectHasPackage(p)?SYSTEM_MAINTENANCE_FEE:0;if(!Number.isFinite(Number(p.revision_count)))p.revision_count=0;if(!Number.isFinite(Number(p.revision_fee_per_revision)))p.revision_fee_per_revision=getFeeAmount('REVISION',REVISION_FEE_PER_REVISION);});ensureContinuousClientIds();persistClientsState();
        persistProjectsState();
        state.isConnected = false;
        updateConnectionStatus("offline", "OFFLINE · LOCAL");
        renderCurrentView();
        renderTemplatesDropdown();
        updateDraftCountBadge();
        startWorkspaceClock();
        // Restore an existing secure HttpOnly session automatically without interrupting offline-first startup.
        setTimeout(async()=>{
          if(!navigator.onLine)return;
          try{
            const authenticated=await initializeEnvironmentVariables();
            if(authenticated)await initSupabase({silent:false});
          }catch(error){console.warn('Automatic cloud restore skipped:',error);}
        },180);
      }


      function normalizeLegacyPaymentStatus(status, amountReceived, amountDue) {
        // The uploaded Payment Tracker is the source of truth for preloaded sample records.
        const s = String(status || "").trim().toLowerCase();
        if (s.includes("completed")) return "Completed";
        if (s.includes("downpayment")) return "Downpayment";
        if (s.includes("pending")) return "Pending";
        if (amountDue > 0 && amountReceived >= amountDue) return "Completed";
        return amountReceived > 0 ? "Downpayment" : "Pending";
      }

      function buildLegacyProject(rec, index) {
        const year = String(rec.ref || "").slice(0, 4) || String(new Date().getFullYear());
        const email = String(rec.client || "").includes("@") ? String(rec.client).trim() : "";
        const paymentStatus = normalizeLegacyPaymentStatus(rec.payment_status, Number(rec.amount_received||0), Number(rec.amount_due||0));
        const projectStatus = paymentStatus === "Completed" ? "Completed" : "In Progress";
        const created = `${year}-01-${String(Math.min(28, (index % 28) + 1)).padStart(2,"0")}T09:00:00`;
        const projectId = `legacy_${String(rec.ref || index).replace(/[^a-zA-Z0-9_-]/g,"_")}`;
        const refMatch = String(rec.ref || "").match(/(\d{3})$/);
        const sheetProjectNumber = refMatch ? Number(refMatch[1]) : index + 1;
        const payment = Number(rec.amount_received || 0) > 0 ? [{
          id: `pay_${projectId}`,
          amount_paid: Number(rec.amount_received || 0),
          amount: Number(rec.amount_received || 0),
          payment_method: "Historical Record",
          payment_date: `${year}-01-${String(Math.min(28, (index % 28) + 1)).padStart(2,"0")}`,
          notes: ""
        }] : [];
      return {
          id: projectId,
          project_number: sheetProjectNumber,
          legacy_reference: rec.ref || "",
          title: rec.project || "Untitled Project",
          project_type: rec.project_type || "Other",
          client_id: `legacy_client_${String(rec.client || "unknown").toLowerCase().replace(/[^a-z0-9]+/g,"_")}`,
          client_name: rec.client || "Unknown Client",
          client_email: email,
          total_amount: Number(rec.amount_due || 0),
          payments: payment,
          payment_status: paymentStatus,
          pending_amount: Number(rec.pending ?? Math.max(0, Number(rec.amount_due||0)-Number(rec.amount_received||0))),
          payment_due_date: "",
          status: projectStatus,
          delivery_status: projectStatus === "Completed" ? "Delivered" : "Pending",
          created_at: created,
          updated_at: created,
          start_date: `${year}-01-01`,
          deadline_date: "",
          deadline_auto: false,
          notes: ``,
          deliverables: [],
          project_items: [{
            name: rec.project_type || "Service",
            qty: 1,
            unit_price: Number(rec.amount_due || 0),
            price: Number(rec.amount_due || 0),
            type: "HISTORY"
          }]
        };
      }

      function migrateActiveLegacyDatesToCurrent(){
        const today=getLocalDateString(new Date());let changed=false;
        state.projects.forEach(p=>{if(p.deleted||p.status==='Completed'||p.delivery_status==='Delivered'||p.archived_at)return;const start=String(p.start_date||'');if(start.startsWith('2025-')){p.start_date=today;p.deadline_date=addDaysToDateString(today,standardProductionDaysForProject(p));p.deadline_auto=true;p.updated_at=new Date().toISOString();changed=true;}});
        if(changed)persistProjectsState();
      }
      function assistantCreateSimpleProject(data={}){
        const fullName=String(data.fullName||'').trim(),address=String(data.address||'').trim(),email=String(data.email||'').trim(),phone=String(data.phone||'').trim(),projectName=String(data.projectName||'').trim();
        if(!fullName||!address||!email||!phone||!projectName)return {ok:false,message:'All five fields are required.'};
        let client=state.clients.find(c=>String(c.email||'').toLowerCase()===email.toLowerCase());
        if(client){client.name=fullName;client.address=address;client.phone=phone;}else{client={id:'client_ai_'+Date.now(),name:fullName,address,email,phone};state.clients.push(client);}persistClientsState();
        const start=getLocalDateString(new Date()),deadline=addDaysToDateString(start,7),num=nextProjectNumber();
        const proj={id:'proj_ai_'+Date.now(),project_number:num,client_id:client.id,client_name:fullName,client_email:email,client_phone:phone,client_address:address,title:projectName,status:'In Progress',delivery_status:'Pending',start_date:start,deadline_date:deadline,deadline_auto:true,payment_due_date:'',total_amount:0,subtotal_amount:0,discount_amount:0,rush_fee:0,workload_rush_rate:0,workload_rush_fee:0,rush_days_early:0,system_maintenance_charge:0,project_type:'',priority:false,project_items:[],deliverables:[],payments:[],notes:'',created_at:new Date().toISOString(),updated_at:new Date().toISOString(),deleted:false};
        state.projects.unshift(proj);persistProjectsState();renderOverviewDashboard();renderProjects();return {ok:true,projectId:proj.id,projectRef:formatProjectId(proj)};
      }

      function seedLegacySheetDataIfNeeded() {
        const existing = localStorage.getItem("JUAN_PROJECTS_LOCAL");
        const currentSampleVersion = localStorage.getItem("JUAN_SAMPLE_DATA_VERSION") || "";
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed) && parsed.length) {
              const containsUserCreated = parsed.some(p => !String(p?.id || "").startsWith("legacy_"));
              // Existing user-created projects always win. Only refresh an older built-in sample set.
              if (containsUserCreated || currentSampleVersion === SAMPLE_DATA_VERSION) {
                state.projects = parsed;
                return;
              }
            }
          } catch(e) {}
        }

        const projects = LEGACY_SHEET_RECORDS.map(buildLegacyProject);
        state.projects = projects;

        const clientMap = new Map();
        projects.forEach(p => {
          if (!clientMap.has(p.client_id)) {
            clientMap.set(p.client_id, {
              id: p.client_id,
              name: p.client_name,
              email: p.client_email || "",
              phone: "",
              address: "",
              notes: ""
            });
          }
        });
        const existingClients = Array.isArray(state.clients) ? state.clients : [];
        existingClients.forEach(c => {
          // Do not let stale legacy-seed clients override the new sheet-derived sample clients.
          if (!String(c?.id || "").startsWith("legacy_client_")) clientMap.set(c.id, c);
        });
        state.clients = Array.from(clientMap.values());

        // Sample records preload the tables only. Entry forms intentionally start blank.
        state.cart.clientMode = "existing";
        state.cart.selectedClientId = "";
        state.cart.projectName = "";
        state.cart.items = [];
        state.cart.discountVal = 0;
        state.cart.startDate = "";
        state.cart.deadlineDate = "";
        state.cart.deadlineManuallySet = false;
        state.cart.rushFee = 0;
        state.cart.rushDaysEarly = 0;
        localStorage.removeItem("JUAN_CART_STATE");
        const blankFormIds = ["orderProjectName","orderClientSearch","orderClientSelect","newClientName","newClientEmail","newClientPhone","newClientAddress","orderStartDate","orderDeadlineDate"];
        blankFormIds.forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});

        persistProjectsState();
        persistClientsState();
        localStorage.setItem("JUAN_LEGACY_SEEDED", "1");
        localStorage.setItem("JUAN_SAMPLE_DATA_VERSION", SAMPLE_DATA_VERSION);
      }

      function parseCSVLine(line) {
        const out = []; let cur = ""; let quoted = false;
        for (let i=0;i<line.length;i++) {
          const ch=line[i];
          if (ch === '"') {
            if (quoted && line[i+1] === '"') { cur += '"'; i++; }
            else quoted = !quoted;
          } else if (ch === ',' && !quoted) { out.push(cur.trim()); cur=""; }
          else cur += ch;
        }
        out.push(cur.trim());
        return out;
      }

      function cleanMoney(value) {
        const n = Number(String(value ?? "").replace(/[^\d.-]/g,""));
        return Number.isFinite(n) ? n : 0;
      }

      function importLegacyRows(rawText) {
        const normalized = String(rawText || "").replace(/\r/g,"").trim();
        if (!normalized) return {added:0, skipped:0};
        const lines = normalized.split("\n").filter(x => x.trim());
        if (lines.length < 2) throw new Error("The import needs a header row and at least one record.");

        const delimiter = lines[0].includes("\t") && !lines[0].includes(",") ? "\t" : ",";
        const split = delimiter === "\t" ? (line => line.split("\t").map(x=>x.trim())) : parseCSVLine;
        const headers = split(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]+/g," ").trim());
        const aliases = {
          ref:["date","reference","invoice","invoice number","record id"],
          client:["client name","client","email","client email"],
          project:["project name","project","title"],
          type:["project type","type","service"],
          due:["amount due","total amount","amount","invoice amount"],
          received:["amount received","received","paid","amount paid"],
          status:["payment status","status"],
          pending:["pending amount","balance","outstanding"]
        };
        const idx = {};
        for (const [key,names] of Object.entries(aliases)) {
          idx[key] = headers.findIndex(h => names.includes(h));
        }
        if (idx.project < 0 || idx.due < 0) throw new Error("Required columns: Project Name and Amount Due.");

        let added=0, skipped=0;
        for (let i=1;i<lines.length;i++) {
          const c=split(lines[i]);
          const ref = idx.ref>=0 ? c[idx.ref] : `IMPORT-${Date.now()}-${i}`;
          const id = `legacy_${String(ref || `row_${i}`).replace(/[^a-zA-Z0-9_-]/g,"_")}`;
          if (state.projects.some(p => p.id===id || (ref && p.legacy_reference===ref))) { skipped++; continue; }
          const due=cleanMoney(idx.due>=0?c[idx.due]:0), received=cleanMoney(idx.received>=0?c[idx.received]:0);
          const rec={
            ref,
            client: idx.client>=0 ? c[idx.client] : "Imported Client",
            project: idx.project>=0 ? c[idx.project] : "Imported Project",
            project_type: idx.type>=0 ? c[idx.type] : "Other",
            amount_due: due,
            amount_received: received,
            payment_status: idx.status>=0 ? c[idx.status] : (received>=due&&due>0?"Completed":received>0?"Downpayment":"Pending"),
            pending: idx.pending>=0 ? cleanMoney(c[idx.pending]) : Math.max(0,due-received)
          };
          const p=buildLegacyProject(rec,state.projects.length+i);
          p.id=id;
          state.projects.push(p);
          if (!state.clients.some(x=>x.id===p.client_id)) {
            state.clients.push({id:p.client_id,name:p.client_name,email:p.client_email||"",phone:"",address:"",notes:""});
          }
          added++;
        }
        persistProjectsState(); persistClientsState(); renderCurrentView();
        return {added, skipped};
      }

      function handleLegacyCSVImport(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = importLegacyRows(reader.result);
            showToast(`Imported ${result.added} records${result.skipped ? ` · ${result.skipped} duplicates skipped` : ""}.`);
          } catch(err) { showToast(err.message || "Could not import records."); }
          event.target.value="";
        };
        reader.readAsText(file);
      }

      function importPastedSheetData() {
        const box=document.getElementById("legacyPasteData");
        if(!box) return;
        try {
          const result=importLegacyRows(box.value);
          showToast(`Imported ${result.added} records${result.skipped ? ` · ${result.skipped} duplicates skipped` : ""}.`);
          if(result.added) box.value="";
        } catch(err) { showToast(err.message || "Could not import pasted records."); }
      }

      function setThemeMode(mode) {
        state.themeMode = mode;
        localStorage.setItem("JUAN_THEME_MODE", mode);
        applyTheme(mode);
        showToast(`Theme changed to ${mode} mode.`);
      }

      function applyTheme(mode) {
        if (mode === 'dark') {
          document.body.classList.add("dark-mode");
        } else {
          document.body.classList.remove("dark-mode");
        }
      }

      function setDashboardTheme(mode) {
        state.dashboardTheme = mode === 'urgency' ? 'urgency' : 'standard';
        localStorage.setItem('JUAN_DASHBOARD_THEME', state.dashboardTheme);
        applyDashboardTheme(state.dashboardTheme);
        renderOverviewDashboard();
        showToast(`Command Center theme changed to ${state.dashboardTheme}.`);
      }

      function applyDashboardTheme(mode) {
        document.body.classList.toggle('dashboard-urgency-theme', mode === 'urgency');
      }

      function loadTasksState() {
        try {
          const saved = localStorage.getItem("JUAN_TASKS_LOCAL");
          state.tasks = saved ? JSON.parse(saved) : [];
          if (!Array.isArray(state.tasks)) state.tasks = [];
        } catch (e) { state.tasks = []; }
      }

      function persistTasksState() {
        localStorage.setItem("JUAN_TASKS_LOCAL", JSON.stringify(state.tasks));
      }

      function loadTaskStateOnce() {
        if (!Array.isArray(state.tasks) || state.tasks.length === 0) loadTasksState();
      }

      function persistProjectsState() {
        localStorage.setItem("JUAN_PROJECTS_LOCAL", JSON.stringify(state.projects));
        scheduleActiveProjectCloudSync();
      }

      function persistCartState() {
        localStorage.setItem("JUAN_CART_STATE", JSON.stringify(state.cart));
      }

      function persistTemplatesState() {
        localStorage.setItem("JUAN_TEMPLATES", JSON.stringify(state.templates));
        renderTemplatesDropdown();
      }

      function persistCatalogState() {
        localStorage.setItem("JUAN_SOLO_SERVICES", JSON.stringify(state.soloServices));
        localStorage.setItem("JUAN_PACKAGES", JSON.stringify(state.packagesList));
        localStorage.setItem("JUAN_CATALOG_CATEGORIES", JSON.stringify(state.catalogCategories || []));
      }

      function persistClientsState() {
        localStorage.setItem("JUAN_CLIENTS_LOCAL", JSON.stringify(state.clients));
      }

      function persistCalendarEvents(){
        localStorage.setItem("JUAN_CALENDAR_EVENTS", JSON.stringify(state.manualEvents || []));
      }

      function normalizePhilippinePhone(value){
        let digits=String(value||'').replace(/\D/g,'');
        if(!digits)return '';
        if(digits.startsWith('0063'))digits=digits.slice(2);
        if(digits.startsWith('63'))digits=digits.slice(2);
        if(digits.startsWith('0'))digits=digits.slice(1);
        digits=digits.slice(0,10);
        if(!digits)return '';
        const a=digits.slice(0,3),b=digits.slice(3,6),c=digits.slice(6,10);
        return `+63 ${a}${b?` ${b}`:''}${c?` ${c}`:''}`.trim();
      }

      function enforceWordLimit(el,maxWords,counterId){
        if(!el)return;const max=Math.max(1,Number(maxWords||1));let words=String(el.value||'').trim().split(/\s+/).filter(Boolean);
        if(words.length>max){words=words.slice(0,max);el.value=words.join(' ');}
        const count=String(el.value||'').trim()?String(el.value||'').trim().split(/\s+/).filter(Boolean).length:0;const counter=document.getElementById(counterId);if(counter)counter.textContent=`${count} / ${max} words`;
      }

      function syncPinBoxes(targetId){
        const target=document.getElementById(targetId),grid=document.querySelector(`.pin-code-grid[data-pin-target="${targetId}"]`);if(!target||!grid)return;target.value=[...grid.querySelectorAll('.pin-digit')].map(x=>String(x.value||'').replace(/\D/g,'').slice(-1)).join('').slice(0,6);
      }
      function clearPinBoxes(targetId){const grid=document.querySelector(`.pin-code-grid[data-pin-target="${targetId}"]`),target=document.getElementById(targetId);if(target)target.value='';if(grid){grid.querySelectorAll('.pin-digit').forEach(x=>{x.value='';x.classList.remove('is-invalid')});setTimeout(()=>grid.querySelector('.pin-digit')?.focus(),60);}}
      function handlePinDigitInput(event,targetId){const input=event.currentTarget;input.value=String(input.value||'').replace(/\D/g,'').slice(-1);syncPinBoxes(targetId);if(input.value)input.nextElementSibling?.classList?.contains('pin-digit')&&input.nextElementSibling.focus();}
      function handlePinDigitKeydown(event,targetId){const input=event.currentTarget;if(event.key==='Backspace'&&!input.value&&input.previousElementSibling?.classList?.contains('pin-digit')){input.previousElementSibling.focus();}if(event.key==='Enter'){event.preventDefault();syncPinBoxes(targetId);targetId==='resetDataPinInput'?confirmResetDataPin():confirmDestructivePin();}}

      function clientFirstProject(client){
        if(!client)return null;
        const matches=state.projects.filter(p=>!p.deleted&&(p.client_id===client.id||(!p.client_id&&p.client_name===client.name)||p.client_name===client.name));
        return matches.sort((a,b)=>projectNumber(a)-projectNumber(b)||new Date(a.created_at||0)-new Date(b.created_at||0))[0]||null;
      }
      function ensureContinuousClientIds(){
        const ordered=state.clients.slice().sort((a,b)=>{
          const an=Number(a.client_number),bn=Number(b.client_number),av=Number.isFinite(an)&&an>0,bv=Number.isFinite(bn)&&bn>0;
          if(av&&bv&&an!==bn)return an-bn; if(av!==bv)return av?-1:1;
          const ap=clientFirstProject(a),bp=clientFirstProject(b),apn=ap?projectNumber(ap):Number.MAX_SAFE_INTEGER,bpn=bp?projectNumber(bp):Number.MAX_SAFE_INTEGER;
          if(apn!==bpn)return apn-bpn;
          const ac=new Date(a.created_at||0).getTime()||0,bc=new Date(b.created_at||0).getTime()||0;if(ac!==bc)return ac-bc;
          return String(a.name||a.email||a.id||'').localeCompare(String(b.name||b.email||b.id||''));
        });
        ordered.forEach((client,index)=>{client.client_number=index+1;});
        return ordered;
      }
      function clientDisplayId(client){
        if(!client)return 'CL-—';
        if(!Number.isFinite(Number(client.client_number))||Number(client.client_number)<1)ensureContinuousClientIds();
        return `CL-${String(Number(client.client_number)||1).padStart(3,'0')}`;
      }

      function updateProfileDisplay() {
        const ownerName = state.ownerName;
        document.getElementById("sidebarUserName").innerText = ownerName;
        const ownerNameInput = document.getElementById("ownerNameInput");
        if (ownerNameInput) ownerNameInput.value = ownerName;

        const sidebarAvatar = document.getElementById("sidebarAvatar");
        const settingsAvatar = document.getElementById("settingsAvatarPreview");

        if (state.profilePhoto) {
          sidebarAvatar.src = state.profilePhoto;
          if (settingsAvatar) settingsAvatar.src = state.profilePhoto;
        } else {
          const initials = ownerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "BD";
          const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' fill='%2319ba75'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-size='22' font-weight='bold'>${initials}</text></svg>`;
          sidebarAvatar.src = defaultAvatar;
          if (settingsAvatar) settingsAvatar.src = defaultAvatar;
        }
      }

      // PROFILE PICTURE CROPPING WORKFLOW
      // The original single-file app had crop logic but no actual crop modal.
      // v1.1.0 completes the workflow and uses a cover-style crop so the image
      // can be dragged/zoomed without exposing blank canvas edges.
      function handleProfilePhotoUpload(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg','image/jpg','image/png','image/webp'];
        if (!validTypes.includes(file.type)) { showToast("Please choose a JPG, PNG, or WEBP image."); e.target.value=''; return; }
        if (file.size > 5 * 1024 * 1024) { showToast("Profile photos must be 5MB or smaller."); e.target.value=''; return; }

        const reader = new FileReader();
        reader.onload = evt => {
          cropImageObj = new Image();
          cropImageObj.onload = () => {
            const canvas=document.getElementById('cropCanvas');
            if(!canvas){ showToast('Photo editor is unavailable.'); return; }
            cropCanvasCtx=canvas.getContext('2d');
            cropBaseScale=Math.max(canvas.width/cropImageObj.naturalWidth,canvas.height/cropImageObj.naturalHeight);
            cropScale=1; cropOffset={x:0,y:0};
            const zoom=document.getElementById('cropZoomRange'); if(zoom) zoom.value='1';
            initCropCanvasInteractions(); drawCropCanvas(); openModal('cropModal');
          };
          cropImageObj.onerror=()=>showToast('That image could not be opened.');
          cropImageObj.src=evt.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value=''; // permits choosing the same file again later
      }

      function clampCropOffset(){
        const canvas=document.getElementById('cropCanvas'); if(!canvas||!cropImageObj) return;
        const scale=cropBaseScale*cropScale;
        const w=cropImageObj.naturalWidth*scale, h=cropImageObj.naturalHeight*scale;
        const maxX=Math.max(0,(w-canvas.width)/2), maxY=Math.max(0,(h-canvas.height)/2);
        cropOffset.x=Math.max(-maxX,Math.min(maxX,cropOffset.x));
        cropOffset.y=Math.max(-maxY,Math.min(maxY,cropOffset.y));
      }

      function initCropCanvasInteractions() {
        const canvas=document.getElementById('cropCanvas'); if(!canvas) return;
        cropCanvasCtx=canvas.getContext('2d');
        const point=e=>({x:e.clientX,y:e.clientY});
        canvas.onpointerdown=e=>{isDragging=true; canvas.setPointerCapture?.(e.pointerId); dragStart={x:e.clientX-cropOffset.x,y:e.clientY-cropOffset.y};};
        canvas.onpointermove=e=>{if(!isDragging)return;cropOffset.x=e.clientX-dragStart.x;cropOffset.y=e.clientY-dragStart.y;clampCropOffset();drawCropCanvas();};
        canvas.onpointerup=canvas.onpointercancel=()=>{isDragging=false;};
      }

      function onCropZoomChange(val) { cropScale=Math.max(1,Number(val)||1); clampCropOffset(); drawCropCanvas(); }

      function drawCropCanvas() {
        if(!cropCanvasCtx||!cropImageObj)return;
        const canvas=document.getElementById('cropCanvas');
        clampCropOffset();
        cropCanvasCtx.clearRect(0,0,canvas.width,canvas.height);
        cropCanvasCtx.fillStyle='#ececf0'; cropCanvasCtx.fillRect(0,0,canvas.width,canvas.height);
        const scale=cropBaseScale*cropScale;
        const w=cropImageObj.naturalWidth*scale, h=cropImageObj.naturalHeight*scale;
        const x=(canvas.width-w)/2+cropOffset.x, y=(canvas.height-h)/2+cropOffset.y;
        cropCanvasCtx.imageSmoothingEnabled=true; cropCanvasCtx.imageSmoothingQuality='high';
        cropCanvasCtx.drawImage(cropImageObj,x,y,w,h);
      }

      function confirmCroppedImage() {
        const canvas=document.getElementById('cropCanvas'); if(!canvas||!cropImageObj)return;
        // Store a compact 512px JPEG rather than a huge original image.
        const output=document.createElement('canvas'); output.width=512; output.height=512;
        output.getContext('2d').drawImage(canvas,0,0,512,512);
        state.profilePhoto=output.toDataURL('image/jpeg',0.9);
        localStorage.setItem('JUAN_PROFILE_PHOTO',state.profilePhoto);
        closeModal('cropModal'); updateProfileDisplay(); showToast('Profile photo updated.');
      }

      function removeProfilePhoto() {requestDestructivePin('Remove Profile Photo','Remove the saved workspace profile photo?',()=>{localStorage.removeItem("JUAN_PROFILE_PHOTO");state.profilePhoto="";updateProfileDisplay();showToast("Profile photo removed.");});}

      function updateOwnerName(val) {
        const name = val.trim();
        if (!name) {
          showToast("Owner name cannot be empty.");
          return;
        }
        state.ownerName = name;
        state.settings.ownerName = name;
        localStorage.setItem("JUAN_OWNER_NAME", name);
        updateProfileDisplay();
        showToast("Profile updated successfully.");
      }

      function updateOwnerAddress(val) {
        state.ownerAddress = val.trim();
        state.settings.address = state.ownerAddress;
        localStorage.setItem("JUAN_OWNER_ADDRESS", state.ownerAddress);
        showToast("Billing address updated.");
      }

      function updateOwnerPhone(val) {
        const phone = normalizePhilippinePhone(val);
        if (phone && !/^[\+\d\s\-\(\)]+$/.test(phone)) {
          showToast("Please enter a valid phone number.");
          return;
        }
        state.ownerPhone = phone;
        localStorage.setItem("JUAN_OWNER_PHONE", phone);
        showToast("Contact phone updated.");
      }

      function updateOwnerEmail(val) {
        const email = val.trim();
        if (email && !email.includes("@")) {
          showToast("Please enter a valid email address.");
          return;
        }
        state.ownerEmail = email;
        state.settings.email = email;
        localStorage.setItem("JUAN_OWNER_EMAIL", email);
        showToast("Email updated successfully.");
      }

      function showConfirmationDialog(title, description, actionBtnLabel, actionCallback) {
        const titleEl=document.getElementById('confirmModalTitle'),descEl=document.getElementById('confirmModalDescription'),actionBtn=document.getElementById('confirmModalActionBtn');if(!titleEl||!descEl||!actionBtn){if(window.confirm(`${title}

${description}`))actionCallback();return;}
        const label=String(actionBtnLabel||'Confirm'),destructive=/delete|remove|discard|reset|permanent|replace|overwrite|exit/i.test(label+' '+title);titleEl.innerText=title;descEl.innerText=description;actionBtn.innerText=label;actionBtn.classList.toggle('btn-danger',destructive);actionBtn.classList.toggle('btn-confirm',!destructive);const modal=document.querySelector('#confirmationModal .compact-validation-modal'),graphic=document.getElementById('confirmModalGraphic');modal?.classList.toggle('destructive-validation',destructive);modal?.classList.toggle('confirm-validation',!destructive);if(graphic)graphic.innerHTML=destructive?`<svg class="icon-svg lg" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>`:`<svg class="icon-svg lg" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>`;actionBtn.onclick=()=>{closeModal('confirmationModal');showActionStatus('Processing','Please wait…',false);setTimeout(()=>{closeModal('actionStatusModal');actionCallback();},320);};openModal('confirmationModal');
      }
      function showActionStatus(title,message,success=false){
        const modal=document.getElementById('actionStatusModal'),graphic=document.getElementById('actionStatusGraphic'),t=document.getElementById('actionStatusTitle'),m=document.getElementById('actionStatusMessage');if(!modal||!graphic)return;if(t)t.textContent=title;if(m)m.textContent=message;graphic.innerHTML=success?`<span class="action-check"><svg class="icon-svg lg" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span>`:`<span class="action-spinner"></span>`;openModal('actionStatusModal');
      }


      const WORKSPACE_RESET_PIN = "729333";
      function requestDestructivePin(title,description,callback){
        state.pendingDestructiveAction=typeof callback==='function'?callback:null;const titleEl=document.getElementById('destructivePinTitle'),desc=document.getElementById('destructivePinDescription'),input=document.getElementById('destructivePinInput'),error=document.getElementById('destructivePinError');if(titleEl)titleEl.textContent=title||'Confirm deletion';if(desc)desc.textContent=(description||'This action changes or removes saved data.')+' Enter your 6-digit PIN to continue.';clearPinBoxes('destructivePinInput');if(error)error.classList.add('hidden');openModal('destructivePinModal');setTimeout(()=>document.querySelector('.pin-code-grid[data-pin-target="destructivePinInput"] .pin-digit')?.focus(),70);
      }
      function confirmDestructivePin(){const input=document.getElementById('destructivePinInput'),error=document.getElementById('destructivePinError'),pin=String(input?.value||'').replace(/\D/g,'').slice(0,6);if(pin!==WORKSPACE_RESET_PIN){document.querySelectorAll('.pin-code-grid[data-pin-target="destructivePinInput"] .pin-digit').forEach(x=>x.classList.add('is-invalid'));if(error)error.classList.remove('hidden');return;}if(error)error.classList.add('hidden');document.querySelectorAll('.pin-code-grid[data-pin-target="destructivePinInput"] .pin-digit').forEach(x=>x.classList.remove('is-invalid'));const action=state.pendingDestructiveAction;state.pendingDestructiveAction=null;closeModal('destructivePinModal');if(action)action();}

      function openResetDataModal(){
        const error=document.getElementById('resetDataPinError');clearPinBoxes('resetDataPinInput');if(error)error.classList.add('hidden');openModal('resetDataPinModal');setTimeout(()=>document.querySelector('.pin-code-grid[data-pin-target=\"resetDataPinInput\"] .pin-digit')?.focus(),80);
      }
      function confirmResetDataPin(){
        const input=document.getElementById('resetDataPinInput'),error=document.getElementById('resetDataPinError');syncPinBoxes('resetDataPinInput');const pin=String(input?.value||'').replace(/\D/g,'').slice(0,6);
        if(pin!==WORKSPACE_RESET_PIN){document.querySelectorAll('.pin-code-grid[data-pin-target=\"resetDataPinInput\"] .pin-digit').forEach(x=>x.classList.add('is-invalid'));if(error)error.classList.remove('hidden');return;}
        document.querySelectorAll('.pin-code-grid[data-pin-target=\"resetDataPinInput\"] .pin-digit').forEach(x=>x.classList.remove('is-invalid'));if(error)error.classList.add('hidden');
        closeModal('resetDataPinModal');
        showConfirmationDialog(
          'Reset all workspace data?',
          'This will remove your current projects, clients, payments, catalog changes, templates, tasks, and cart data, then restore the preloaded workspace dataset. This action cannot be undone unless you exported a backup.',
          'Reset Data',
          performResetWorkspaceData
        );
      }
      function performResetWorkspaceData(){
        const operationalKeys=[
          'JUAN_PROJECTS_LOCAL',
          'JUAN_CLIENTS_LOCAL',
          'JUAN_TASKS_LOCAL',
          'JUAN_CART_STATE',
          'JUAN_TEMPLATES',
          'JUAN_SOLO_SERVICES',
          'JUAN_PACKAGES',
          'JUAN_CATALOG_CATEGORIES',
          'JUAN_LEGACY_SEEDED',
          'JUAN_SAMPLE_DATA_VERSION'
        ];
        operationalKeys.forEach(key=>localStorage.removeItem(key));
        showActionStatus('Resetting Workspace','Restoring the preloaded dataset…',false);
        setTimeout(()=>window.location.reload(),750);
      }

      const CLOUD_QUEUE_KEY='JUAN_CLOUD_MUTATION_QUEUE_V1';
      function readCloudQueue(){try{return JSON.parse(localStorage.getItem(CLOUD_QUEUE_KEY)||'[]')}catch{return []}}
      function writeCloudQueue(rows){localStorage.setItem(CLOUD_QUEUE_KEY,JSON.stringify(rows.slice(-300)))}
      function enqueueCloudMutation(payload){const q=readCloudQueue();q.push({id:`q_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,createdAt:new Date().toISOString(),payload});writeCloudQueue(q);window.dispatchEvent(new CustomEvent('juan:sync-queued',{detail:{count:q.length}}));}
      async function secureProxyRequest(payload,{allowQueue=true}={}){
        const mutation=!['select'].includes(payload.operation);
        try{const response=await fetch('/api/data',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json',...(state.csrfToken?{'X-CSRF-Token':state.csrfToken}:{})},body:JSON.stringify(payload)});const body=await response.json().catch(()=>({error:`HTTP ${response.status}`}));if(response.status===401){state.cloudAuthenticated=false;state.isConnected=false}if(!response.ok){if(mutation&&allowQueue&&(response.status>=500||response.status===0)){enqueueCloudMutation(payload);return {data:null,error:null,queued:true}}return {data:null,error:new Error(body.error||`HTTP ${response.status}`)}}return {data:body.data??null,error:null}}catch(error){if(mutation&&allowQueue){enqueueCloudMutation(payload);return {data:null,error:null,queued:true}}return {data:null,error}}
      }
      async function flushCloudQueue(){if(!navigator.onLine||!state.cloudAuthenticated)return;const q=readCloudQueue();if(!q.length)return;const pending=[];for(const item of q){const r=await secureProxyRequest(item.payload,{allowQueue:false});if(r.error)pending.push(item)}writeCloudQueue(pending);if(!pending.length)showToast('Cloud sync is up to date.');}

      function createSecureDataClient(){
        const request=async(table,operation,payload={})=>secureProxyRequest({table,operation,...payload});
        const from=table=>({
          select(columns='*'){const q={table,operation:'select',columns,filters:[],orderBy:null};const chain={eq(k,v){q.filters.push([k,v]);return chain},order(k,o={}){q.orderBy={column:k,ascending:o.ascending!==false};return request(table,'select',q)},then(resolve,reject){return request(table,'select',q).then(resolve,reject)}};return chain},
          insert(rows){return request(table,'insert',{rows})},
          upsert(rows){return request(table,'upsert',{rows})},
          update(values){const filters=[];return {eq(k,v){filters.push([k,v]);return request(table,'update',{values,filters})}}},
          delete(){const filters=[];return {eq(k,v){filters.push([k,v]);return request(table,'delete',{filters})}}}
        });
        return {from,auth:{getSession:async()=>({data:{session:state.cloudAuthenticated?{}:null},error:state.cloudAuthenticated?null:new Error('Cloud session not authenticated')})}};
      }

      function cloudProjectRow(project){
        return {
          id:project.id,project_number:Number(project.project_number||projectNumber(project)||0)||null,
          client_id:project.client_id||null,client_name:project.client_name||'',client_email:project.client_email||'',client_phone:project.client_phone||'',client_address:project.client_address||'',
          title:project.title||'',status:project.status||'In Progress',delivery_status:project.delivery_status||'Pending',start_date:project.start_date||null,deadline_date:project.deadline_date||null,payment_due_date:project.payment_due_date||null,
          total_amount:Number(project.total_amount||0),subtotal_amount:Number(project.subtotal_amount||0),discount_amount:Number(project.discount_amount||0),rush_fee:Number(project.rush_fee||0),workload_rush_rate:Number(project.workload_rush_rate||0),workload_rush_fee:Number(project.workload_rush_fee||0),workload_at_booking:Number(project.workload_at_booking||0),rush_days_early:Number(project.rush_days_early||0),rush_base_fee:Number(project.rush_base_fee||0),rush_load_factor:Number(project.rush_load_factor||0),rush_project_workload:Number(project.rush_project_workload||0),system_maintenance_charge:Number(project.system_maintenance_charge||0),
          project_type:project.project_type||'',priority:!!project.priority,notes:project.notes||'',deliverables:Array.isArray(project.deliverables)?project.deliverables:[],deadline_auto:project.deadline_auto!==false,
          invoice_number:project.invoice_number||null,invoice_issue_date:project.invoice_issue_date||null,invoice_due_date:project.invoice_due_date||null,deleted:!!project.deleted,archived_at:project.archived_at||null,
          created_at:project.created_at||new Date().toISOString(),updated_at:project.updated_at||project.created_at||new Date().toISOString()
        };
      }
      function cloudProjectItemRows(project){return (project.project_items||[]).map((item,index)=>({id:item.id||`item_${project.id}_${index}`,project_id:project.id,name:item.name||'',qty:Math.max(1,Number(item.qty||1)),price:Number(item.price||0),type:item.type||'SOLO',addon_type:item.addon_type||null,product_code:item.product_code||null,source_product_code:item.source_product_code||null,source_item_name:item.source_item_name||null,category:item.category||'',item_discount:Number(item.item_discount||0),sort_order:index,created_at:item.created_at||project.created_at||new Date().toISOString(),updated_at:item.updated_at||project.updated_at||new Date().toISOString()}));}
      function cloudDeliverableRows(project){return (project.deliverables||[]).map((d,index)=>({id:d.id||`del_${project.id}_${index}`,project_id:project.id,name:d.name||d.item_name||'',item_name:d.item_name||d.name||'',status:d.status||(d.completed?'Completed':'Pending'),completed:!!d.completed,progress:Number(d.progress||(d.completed?100:0)),parent_id:d.parent_id||null,is_group:!!d.is_group,source_type:d.source_type||null,order_item_id:d.order_item_id||null,order_item_occurrence:Number(d.order_item_occurrence||0)||null,package_name:d.package_name||null,completed_at:d.completed_at||null,sort_order:index,created_at:d.created_at||project.created_at||new Date().toISOString(),updated_at:d.updated_at||project.updated_at||new Date().toISOString()}));}
      function cloudPaymentRows(project){return (project.payments||[]).map((pay,index)=>({id:pay.id||`pay_${project.id}_${index}`,project_id:project.id,amount_paid:Number(pay.amount_paid||pay.amount||0),payment_date:pay.payment_date||null,payment_method:pay.payment_method||pay.method||'',reference_no:pay.reference_no||pay.reference_number||'',notes:pay.notes||'',created_at:pay.created_at||new Date().toISOString(),updated_at:pay.updated_at||pay.created_at||new Date().toISOString()}));}
      async function syncProjectBundleToDatabase(project){
        if(!supabaseClient||!state.isConnected||!state.cloudAuthenticated||!project)return;
        if(project.deleted){await supabaseClient.from('projects').delete().eq('id',project.id);return;}
        const parent=await supabaseClient.from('projects').upsert([cloudProjectRow(project)]);if(parent?.error)throw parent.error;
        for(const [table,rows] of [['project_items',cloudProjectItemRows(project)],['deliverables',cloudDeliverableRows(project)],['payments',cloudPaymentRows(project)]]){
          const removed=await supabaseClient.from(table).delete().eq('project_id',project.id);if(removed?.error)throw removed.error;
          if(rows.length){const added=await supabaseClient.from(table).insert(rows);if(added?.error)throw added.error;}
        }
      }
      function scheduleActiveProjectCloudSync(){
        if(cloudHydrating||!state.isConnected||!state.cloudAuthenticated||!supabaseClient||!state.activeProjectId)return;
        clearTimeout(cloudProjectSyncTimer);cloudProjectSyncTimer=setTimeout(async()=>{const project=state.projects.find(p=>String(p.id)===String(state.activeProjectId));if(!project)return;try{await syncProjectBundleToDatabase(project)}catch(e){console.warn('Project cloud synchronization deferred:',e?.message||e)}},650);
      }
      async function bootstrapCloudFromLocal(){
        if(!supabaseClient||!state.isConnected||!state.cloudAuthenticated)return;
        const clients=(state.clients||[]).filter(c=>c?.id).map(c=>({id:c.id,name:c.name||'',email:c.email||'',phone:c.phone||'',address:c.address||'',notes:c.notes||'',client_number:Number(c.client_number||0)||null,created_at:c.created_at||new Date().toISOString(),updated_at:c.updated_at||c.created_at||new Date().toISOString()}));
        const projects=(state.projects||[]).filter(p=>!p.deleted&&p?.id);
        if(clients.length){const r=await supabaseClient.from('clients').upsert(clients);if(r?.error)throw r.error;}
        if(projects.length){const r=await supabaseClient.from('projects').upsert(projects.map(cloudProjectRow));if(r?.error)throw r.error;}
        const items=projects.flatMap(cloudProjectItemRows),deliverables=projects.flatMap(cloudDeliverableRows),payments=projects.flatMap(cloudPaymentRows);
        if(items.length){const r=await supabaseClient.from('project_items').upsert(items);if(r?.error)throw r.error;}
        if(deliverables.length){const r=await supabaseClient.from('deliverables').upsert(deliverables);if(r?.error)throw r.error;}
        if(payments.length){const r=await supabaseClient.from('payments').upsert(payments);if(r?.error)throw r.error;}
      }

      async function initSupabase({silent=false}={}) {
        if(!navigator.onLine){
          state.isConnected=false;
          updateConnectionStatus("offline", "OFFLINE · LOCAL", "No internet connection. Local workspace data remains available.");
          return false;
        }
        if(!silent)updateConnectionStatus("connecting", "CONNECTING…", "Checking secure session and Supabase database access…");
        try {
          const ok=await initializeEnvironmentVariables();
          if(!ok) throw new Error('Secure cloud session is not authenticated.');
          supabaseClient=createSecureDataClient();
          state.isConnected=true;
          await loadDatabaseData();
          await flushCloudQueue();
          updateConnectionStatus("connected", "CLOUD · SYNCED", "Secure Supabase synchronization is active.");
          window.dispatchEvent(new CustomEvent('juan:cloud-connected'));
          return true;
        } catch (err) {
          const message=String(err?.message||err||'Cloud connection failed.');
          state.isConnected=false;
          supabaseClient=null;
          const locked=/not authenticated|authentication required|session/i.test(message);
          updateConnectionStatus(locked?"offline":"error", locked?"OFFLINE · LOCAL":"CLOUD · ERROR", message);
          console.warn('Cloud sync unavailable:',message);
          return false;
        }
      }

      async function loadDatabaseData() {
        cloudHydrating=true;
        try {
          const [clientsRes, projectsRes] = await Promise.all([
            supabaseClient ? supabaseClient.from('clients').select('*').order('name') : { data: [] },
            supabaseClient ? supabaseClient.from('projects').select('*, deliverables(*), payments(*), project_items(*)').order('created_at', { ascending: false }) : { data: [] }
          ]);

          if (clientsRes.error) throw new Error(`Clients table: ${clientsRes.error.message||clientsRes.error}`);
          if (projectsRes.error) throw new Error(`Projects table: ${projectsRes.error.message||projectsRes.error}`);

          if (clientsRes.data && clientsRes.data.length > 0) {
            state.clients = clientsRes.data;
          }
          const localClients = localStorage.getItem("JUAN_CLIENTS_LOCAL");
          if (localClients) {
            try {
              const parsed = JSON.parse(localClients);
              parsed.forEach(lc => {
                if (!state.clients.some(c => c.id === lc.id)) state.clients.push(lc);
              });
            } catch(e){}
          }

          const remoteWasEmpty = !(projectsRes.data||[]).length;
          const uploadAfterLoad=[];
          let fetchedProjects = projectsRes.data || [];
          const localProjs = localStorage.getItem("JUAN_PROJECTS_LOCAL");
          if (localProjs) {
            try {
              const parsedLocal = JSON.parse(localProjs);
              parsedLocal.forEach(lp => {
                const idx=fetchedProjects.findIndex(fp=>String(fp.id)===String(lp.id));
                if(idx<0){fetchedProjects.push(lp);uploadAfterLoad.push(lp);return;}
                const localStamp=Date.parse(lp.updated_at||lp.created_at||0)||0,remoteStamp=Date.parse(fetchedProjects[idx].updated_at||fetchedProjects[idx].created_at||0)||0;
                if(localStamp>remoteStamp){fetchedProjects[idx]=lp;uploadAfterLoad.push(lp);}
              });
            } catch(e){}
          }
          state.projects = fetchedProjects;
          loadTasksState();

          renderCurrentView();
          cloudHydrating=false;
          if(remoteWasEmpty&&(state.projects.length||state.clients.length)){try{await bootstrapCloudFromLocal();showToast('New Supabase database initialized from this workspace.');}catch(e){console.warn('Initial cloud bootstrap failed:',e?.message||e);}}
          else if(uploadAfterLoad.length){for(const project of uploadAfterLoad){try{await syncProjectBundleToDatabase(project)}catch(e){console.warn('Offline project reconciliation deferred:',project.id,e?.message||e);}}}
        } catch (err) {
          cloudHydrating=false;
          console.error("Database error:", err);
          showToast("Warning: Could not load all data from the database. Local data remains available.", "Retry", () => loadDatabaseData());
          const localProjs = localStorage.getItem("JUAN_PROJECTS_LOCAL");
          if (localProjs) { try { state.projects = JSON.parse(localProjs); } catch(e){} }
          renderCurrentView();
        }
      }

      function navigateTo(viewId) {
        state.activeView = viewId;
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.add("active");

        const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (navItem) navItem.classList.add("active");

        renderCurrentView();
      }

      function renderCurrentView() {
        loadTaskStateOnce();
        if (state.activeView === "my-works") { renderMyWorks(); renderOverviewDashboard(); }
        if (state.activeView === "new-order") renderNewOrderView();
        if (state.activeView === "analytics") renderAnalytics();
        if (state.activeView === "projects") renderProjects();
        if (state.activeView === "payments") renderPaymentsView();
        if (state.activeView === "reports") renderReportsView();
        if (state.activeView === "calendar") renderCalendar();
        if (state.activeView === "clients") renderClients();
        if (state.activeView === "client-profile") renderClientProfile();
        if (state.activeView === "pricelist") renderPricelist();
      }


      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      }

      function getProjectPaid(proj) {
        return (proj.payments || []).reduce((sum,p) => sum + Number(p.amount_paid || p.amount || 0), 0);
      }

      function projectHasPackage(proj) {
        const items=proj?.project_items||proj?.items||[];
        return Array.isArray(items)&&items.some(i=>String(i?.type||'').toUpperCase()==='PACKAGE');
      }
function getProjectMaintenanceFee(proj) {
  const fee=getFeeConfig('SYSTEM_MAINTENANCE');
  return projectHasPackage(proj)&&fee.active!==false?SYSTEM_MAINTENANCE_FEE:0;
}
function getProjectRevisionFee(proj){ return 0; } // Revision requests are explicit PHP 500 ADDON order items.

      function getProjectInvoiceTotal(proj){return Math.max(0,Number(proj?.total_amount||0))+getProjectMaintenanceFee(proj)+getProjectRevisionFee(proj);}

      function getProjectBalance(proj) {
        const paid=getProjectPaid(proj),invoiceTotal=getProjectInvoiceTotal(proj);
        return Math.max(0,invoiceTotal-paid);
      }

      function getProjectProgress(proj) {
        const ds=(proj.deliverables||[]).filter(d=>!d.is_group);
        if(!ds.length)return proj.status==="Completed"?100:0;
        return Math.round(ds.reduce((sum,d)=>sum+(typeof d.progress==="number"?d.progress:(d.completed?100:0)),0)/ds.length);
      }

      function getProjectType(proj) {
        const explicit=String(proj?.project_type||'').trim();
        if(explicit&&!['SOLO','PACKAGE'].includes(explicit.toUpperCase()))return explicit;
        const items=proj?.project_items||proj?.items||[];
        const categories=[...new Set(items.map(i=>String(i.category||'').trim()).filter(Boolean).filter(c=>!['SOLO','PACKAGE'].includes(c.toUpperCase())))];
        if(categories.length===1)return categories[0];
        if(categories.length>1)return 'Mixed Services';
        return explicit&&explicit.toUpperCase()==='PACKAGE'?'Package':'Service';
      }

      function isProjectOverdue(proj) {
        if (!proj || proj.deleted || proj.status === 'Completed' || proj.delivery_status === 'Delivered' || proj.archived_at) return false;
        const due=parseDateSafe(proj.deadline_date); if(!due)return false; due.setHours(23,59,59,999);
        return due < new Date();
      }

      function getDeliveredDate(proj){
        return parseDateSafe(proj?.delivered_at || proj?.archived_at || (proj?.delivery_status==='Delivered'?proj?.updated_at:null));
      }

      function isPaymentCollectionOverdue(proj){
        if(!proj || getProjectBalance(proj)<=0 || getProjectPaid(proj)>0)return false;
        const delivered=getDeliveredDate(proj); if(!delivered)return false;
        const cutoff=new Date(delivered); cutoff.setHours(0,0,0,0); cutoff.setDate(cutoff.getDate()+3); cutoff.setHours(23,59,59,999);
        return new Date()>cutoff;
      }

      function effectiveOperationalDate(base=new Date()){
        const d=new Date(base);
        if(d.getHours()>=18)d.setDate(d.getDate()+1);
        return d.toISOString().slice(0,10);
      }

      function getAllPayments() {
        return state.projects.flatMap(p => (p.payments || []).map(pay => ({...pay, project: p})));
      }


      function parseDateSafe(value){ if(!value) return null; const d=new Date(String(value).length===10?value+"T12:00:00":value); return isNaN(d)?null:d; }
      function deadlineInfo(dateValue){
        const d=parseDateSafe(dateValue); if(!d) return {label:"No deadline",sub:"",cls:""};
        const now=new Date(); now.setHours(0,0,0,0); const due=new Date(d); due.setHours(0,0,0,0);
        const diff=Math.round((due-now)/86400000); let label=""; if(diff<0) label=`${Math.abs(diff)}d overdue`; else if(diff===0) label="Due today"; else if(diff===1) label="Due tomorrow"; else label=`${diff} days left`;
        return {label,sub:due.toLocaleDateString("en-PH",{month:"short",day:"numeric",year:due.getFullYear()!==now.getFullYear()?"numeric":undefined}),cls:diff<0?"urgent":diff<=3?"soon":""};
      }
      function togglePopover(id,event){ if(event) event.stopPropagation(); document.querySelectorAll('.popover-wrap.open').forEach(el=>{if(el.id!==id)el.classList.remove('open')}); document.getElementById(id)?.classList.toggle('open'); }
      document.addEventListener('click',()=>document.querySelectorAll('.popover-wrap.open').forEach(el=>el.classList.remove('open')));
      function renderOverviewCurrentProjects(){
        const box=document.getElementById('overviewCurrentProjects'); if(!box)return;
        const active=state.projects.filter(p=>!p.deleted&&p.status!=="Completed"&&p.delivery_status!=="Delivered"&&!p.archived_at).sort(compareProjectPriority);
        box.innerHTML=active.map(p=>{const tag=projectDeadlineTag(p),priority=projectIsPriority(p),ds=(p.deliverables||[]).filter(d=>!d.is_group),done=ds.filter(d=>d.completed).length,prog=ds.length?Math.round(done/ds.length*100):getProjectProgress(p),bal=getProjectBalance(p);return `<div class="current-project-card" onclick="app.openProjectDetails('${p.id}')"><div class="current-project-top"><div class="current-project-copy"><div class="project-ref-row"><span class="project-ref">${formatProjectId(p)}</span></div><div class="current-project-name">${escapeHtml(p.title||'Untitled Project')}</div><div class="current-project-client">${escapeHtml(p.client_name||'No client')}</div></div><div class="current-project-right"><div class="current-project-tag-stack">${priority?'<span class="project-tag priority">PRIORITY</span>':''}<span class="project-tag ${tag.cls}">${escapeHtml(tag.label)}</span></div><div class="current-project-balance">Balance: <strong>${formatCurrency(bal)}</strong></div></div></div><div class="current-project-progress"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${prog}%"></div></div><span>${done}/${ds.length||0}</span></div></div>`}).join('')||`<div class="empty-compact-state"><strong>No current projects</strong><span>Active projects will appear here.</span></div>`;
      }

      function renderOverviewUpcomingDeadlines(){
        const box=document.getElementById('overviewUpcomingDeadlines'); if(!box)return;
        const items=state.projects.filter(p=>!p.deleted&&p.status!=="Completed"&&p.delivery_status!=="Delivered"&&p.deadline_date).sort(compareProjectPriority);
        const card=box.closest('.card');if(card)card.style.display='flex';
        box.innerHTML=items.length?items.map(p=>{const tag=projectDeadlineTag(p);return `<div class="attention-row" onclick="app.openProjectDetails('${p.id}')"><div class="attention-date">${escapeHtml(parseDateSafe(p.deadline_date)?.toLocaleDateString('en-PH',{month:'short',day:'numeric'})||'—')}</div><div><div class="attention-title">${escapeHtml(p.title)}</div><div class="attention-sub">${escapeHtml(formatProjectId(p)+' • '+(p.client_name||'Project'))}</div></div><span class="project-tag ${tag.cls}">${escapeHtml(tag.label)}</span></div>`}).join(''):`<div class="empty-compact-state"><strong>No upcoming deadlines</strong><span>Nothing needs deadline attention right now.</span></div>`;
      }
      function renderOverviewMiniCalendar(){
        const box=document.getElementById('overviewMiniCalendar'),title=document.getElementById('overviewCalendarTitle'); if(!box)return; const now=new Date(),y=now.getFullYear(),m=now.getMonth(); if(title)title.textContent=now.toLocaleDateString('en-PH',{month:'long',year:'numeric'});
        const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),deadlines=new Map(); state.projects.filter(p=>!p.deleted&&p.status!=="Completed"&&p.deadline_date&&String(p.deadline_date).slice(0,7)===`${y}-${String(m+1).padStart(2,'0')}`).forEach(p=>{const day=Number(String(p.deadline_date).slice(8,10));if(!deadlines.has(day))deadlines.set(day,[]);deadlines.get(day).push(p)});
        let h=['S','M','T','W','T','F','S'].map(x=>`<div class="overview-cal-head">${x}</div>`).join(''); for(let i=0;i<first;i++)h+='<div></div>'; for(let d=1;d<=days;d++){const ps=deadlines.get(d)||[],isToday=d===now.getDate();h+=`<div class="overview-cal-day ${isToday?'today':''} ${ps.length?'has-deadline':''}" ${ps.length?`onclick="app.openProjectDetails('${ps[0].id}')" title="${escapeHtml(ps.map(p=>p.title).join(', '))}"`:''}>${d}${ps.length?'<span class="overview-cal-dot"></span>':''}</div>`} box.innerHTML=h;
      }

      function renderOverviewDashboard() {
        const active = state.projects.filter(p => !p.deleted && p.status !== "Completed" && p.delivery_status !== "Delivered" && !p.archived_at);
        const unfinished = active.reduce((sum,p) => sum + (p.deliverables || []).filter(d => !d.is_group && !d.completed).length, 0);
        const now = new Date(); now.setHours(0,0,0,0);
        const inSeven = new Date(now.getTime() + 7*86400000);
        const dueSoon = active.filter(p => { const d=parseDateSafe(p.deadline_date); return d && d>=now && d<=inSeven; }).length;
        const overdue = active.filter(p => { const d=parseDateSafe(p.deadline_date); return d && d<now; }).length;

        const kpi = document.getElementById("overviewKpis");
        if (kpi) {
          kpi.innerHTML = `
            <div class="kpi-card urgency-card urgency-active"><div class="overview-kpi-head"><div class="kpi-label">Active Projects</div><span class="overview-kpi-icon"><svg class="icon-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5M8 17h3"/></svg></span></div><div class="kpi-value">${active.length}</div><div class="kpi-sub">Currently in production</div></div>
            <div class="kpi-card urgency-card urgency-notdone"><div class="overview-kpi-head"><div class="kpi-label">Not Done</div><span class="overview-kpi-icon"><svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span></div><div class="kpi-value">${unfinished}</div><div class="kpi-sub">Unfinished deliverables</div></div>
            <div class="kpi-card urgency-due ${dueSoon?'attention-kpi':''}"><div class="overview-kpi-head"><div class="kpi-label">Due in 7 Days</div><span class="overview-kpi-icon"><svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></span></div><div class="kpi-value">${dueSoon}</div><div class="kpi-sub">Needs attention soon</div></div>
            <div class="kpi-card urgency-overdue ${overdue?'danger-kpi':''}"><div class="overview-kpi-head"><div class="kpi-label">Overdue</div><span class="overview-kpi-icon"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.6 2.4 17.2A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.8L13.7 3.6a2 2 0 0 0-3.4 0z"/></svg></span></div><div class="kpi-value">${overdue}</div><div class="kpi-sub">Past project deadline</div></div>`;
        }
        animateNumbersIn(kpi);
        renderOverviewCurrentProjects();
        renderOverviewUpcomingDeadlines();
        renderOverviewMiniCalendar();
        renderOverviewUpcomingEvents();
        renderOverviewTaskTracker();
      }

      function renderOverviewRevenueChart() {
        const box = document.getElementById("overviewRevenueChart");
        if (!box) return;

        const months = Number(document.getElementById("overviewRevenueRange")?.value || 6);
        const now = new Date();
        const data = [];

        for (let i = months - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
          const label = d.toLocaleString("en-PH", {month:"short"});
          const value = getAllPayments()
            .filter(x => String(x.payment_date || x.created_at || "").slice(0,7) === key)
            .reduce((s,x) => s + Number(x.amount_paid || x.amount || 0), 0);
          data.push({label, value});
        }

        const max = Math.max(1, ...data.map(x => x.value));
        const current = data[data.length - 1]?.value || 0;
        const previous = data[data.length - 2]?.value || 0;
        const growth = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
        const growthLabel = growth > 0 ? `↑ ${growth}%` : growth < 0 ? `↓ ${Math.abs(growth)}%` : "—";
        const currentLabel = formatCurrency(current);
        const points = data.map((x,i) => {
          const xPos = data.length === 1 ? 210 : 18 + (i * 384 / (data.length - 1));
          const yPos = 112 - ((x.value / max) * 82);
          return `${xPos.toFixed(1)},${yPos.toFixed(1)}`;
        }).join(" ");
        const areaPoints = data.map((x,i) => {
          const xPos = data.length === 1 ? 210 : 18 + (i * 384 / (data.length - 1));
          const yPos = 112 - ((x.value / max) * 82);
          return `${xPos.toFixed(1)},${yPos.toFixed(1)}`;
        }).join(" ");

        box.innerHTML = `
          <div class="overview-revenue-summary">
            <div>
              <div class="overview-revenue-total">${currentLabel}</div>
              <div class="overview-revenue-meta">Received this period</div>
            </div>
            <div class="overview-revenue-stat">
              <strong class="overview-growth ${growth === 0 ? "neutral" : ""}">${growthLabel}</strong>
              <span>vs previous period</span>
            </div>
          </div>
          <svg class="minimal-line-chart" viewBox="0 0 420 150" preserveAspectRatio="xMidYMid meet" aria-label="Revenue activity chart">
            <line class="minimal-chart-grid" x1="18" y1="30" x2="402" y2="30"></line>
            <line class="minimal-chart-grid" x1="18" y1="71" x2="402" y2="71"></line>
            <line class="minimal-chart-grid" x1="18" y1="112" x2="402" y2="112"></line>
            <polygon class="minimal-chart-area" points="18,112 ${areaPoints} 402,112"></polygon>
            <polyline class="minimal-chart-line" points="${points}"></polyline>
            ${data.map((x,i) => {
              const xPos = data.length === 1 ? 210 : 18 + (i * 384 / (data.length - 1));
              const yPos = 112 - ((x.value / max) * 82);
              return `<circle class="minimal-chart-dot" cx="${xPos.toFixed(1)}" cy="${yPos.toFixed(1)}" r="3"></circle>`;
            }).join("")}
            ${data.map((x,i) => {
              const xPos = data.length === 1 ? 210 : 18 + (i * 384 / (data.length - 1));
              return `<text class="minimal-chart-label" x="${xPos.toFixed(1)}" y="137" text-anchor="middle">${escapeHtml(x.label)}</text>`;
            }).join("")}
          </svg>`;
      }

      function renderOverviewStatusChart() {
        const box = document.getElementById("overviewStatusChart");
        if (!box) return;

        const projects = state.projects.filter(p => !p.deleted);
        const counts = {};
        projects.forEach(p => counts[p.status || "Other"] = (counts[p.status || "Other"] || 0) + 1);

        const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
        const total = Math.max(1, projects.length);
        const first = entries[0]?.[1] || 0;
        const second = entries[1]?.[1] || 0;
        const firstPct = (first / total) * 100;
        const secondPct = firstPct + ((second / total) * 100);

        box.innerHTML = `
          <div class="minimal-pie-wrap">
            <div class="minimal-pie" style="--pie-a:${firstPct}%;--pie-b:${secondPct}%">
              <div class="minimal-pie-center">
                <strong>${projects.length}</strong>
                <span>Projects</span>
              </div>
            </div>
            <div class="minimal-pie-legend">
              ${entries.slice(0,4).map((entry,i) => `
                <div class="minimal-pie-row">
                  <span class="minimal-pie-label">
                    <span class="minimal-pie-dot ${i===1?'alt':i>1?'muted':''}"></span>
                    ${escapeHtml(entry[0])}
                  </span>
                  <strong>${entry[1]}</strong>
                </div>`).join("") || `<div class="text-muted">No project data yet.</div>`}
            </div>
          </div>`;
      }

      function renderOverviewTaskTracker() {
        const box = document.getElementById("overviewTaskTracker");
        if (!box) return;

        const rows = [];
        state.projects.filter(p => !p.deleted && p.status !== "Completed" && p.delivery_status !== "Delivered").forEach(p => {
          (p.deliverables || []).forEach(d => {
            if (!d.completed) {
              rows.push({
                project: p.title,
                client: p.client_name || "",
                name: d.item_name || d.name || "Deliverable",
                deadline: p.deadline_date || "No deadline"
              });
            }
          });
        });

        box.innerHTML = `
          <div class="overview-task-summary">
            <div class="overview-task-count">
              <strong>${rows.length}</strong>
              <span>pending</span>
            </div>
            <div class="overview-task-count">
              <strong>${state.projects.filter(p => !p.deleted && (p.deliverables || []).length).reduce((sum,p) => sum + (p.deliverables || []).filter(d => d.completed).length, 0)}</strong>
              <span>completed</span>
            </div>
          </div>
          <div class="overview-task-list">
            ${rows.slice(0, 5).map(d => `
              <div class="overview-task-item">
                <span class="overview-task-check">
                  <svg class="icon-svg sm" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
                </span>
                <div>
                  <div class="overview-task-name">${escapeHtml(d.name)}</div>
                  <div class="overview-task-meta">${escapeHtml(d.project)}${d.client ? ` • ${escapeHtml(d.client)}` : ""}</div>
                </div>
                <span class="overview-task-deadline">${escapeHtml(d.deadline)}</span>
              </div>
            `).join("") || `<div class="text-muted py-4">No pending deliverables.</div>`}
          </div>`;
      }

      function renderRecentActivity() {
        const box=document.getElementById("recentActivityList"); if(!box) return;
        const events=[];
        state.projects.filter(p=>!p.deleted).forEach(p=>{
          if(p.created_at) events.push({time:p.created_at,title:"New project",sub:`${p.title} created`});
          (p.payments||[]).forEach(pay=>events.push({time:pay.created_at||pay.payment_date,title:"Payment recorded",sub:`${p.client_name||"Client"} paid ${formatCurrency(pay.amount_paid||pay.amount||0)}`}));
          (p.deliverables||[]).forEach(d=>{ if(d.completed) events.push({time:d.completed_at||p.updated_at||p.created_at,title:"Deliverable completed",sub:`${d.item_name||d.name||"Deliverable"} — ${p.title}`}); });
          if(isProjectOverdue(p)) events.push({time:p.payment_due_date,title:"Payment overdue",sub:`${p.client_name||"Client"} has ${formatCurrency(getProjectBalance(p))} outstanding`});
        });
        state.tasks.forEach(t=>{ if(t.created_at) events.push({time:t.created_at,title:"Task created",sub:t.name}); });
        events.sort((a,b)=>new Date(b.time)-new Date(a.time));
        box.innerHTML=events.slice(0,8).map(e=>`<div class="activity-item"><span class="activity-dot"></span><div><div class="activity-title">${escapeHtml(e.title)}</div><div class="activity-sub">${escapeHtml(e.sub)}</div><div class="activity-time">${e.time?new Date(e.time).toLocaleString("en-PH",{dateStyle:"medium",timeStyle:"short"}):""}</div></div></div>`).join("")||`<div class="text-muted py-4">No activity available yet.</div>`;
      }

      function projectNumber(proj) {
        // Visible Project IDs use one continuous sequence beginning at JP-001.
        // project_number is authoritative after migration/renumbering.
        if (Number.isFinite(Number(proj?.project_number)) && Number(proj.project_number) >= 1) {
          return Number(proj.project_number);
        }
        const raw = String(proj?.legacy_reference || "");
        const legacyMatch = raw.match(/(\d{3})$/);
        if (legacyMatch && Number(legacyMatch[1]) >= 1) return Number(legacyMatch[1]);
        const ordered = state.projects.filter(p=>!p.deleted).slice().sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0));
        return Math.max(1, ordered.findIndex(p=>p.id===proj?.id) + 1);
      }
      function formatProjectId(proj){ return `JP-${String(projectNumber(proj)).padStart(3,'0')}`; }
      function projectIsPriority(proj){
        const explicit = proj?.priority===true || String(proj?.priority||'').toUpperCase()==='YES' || String(proj?.priority||'').toLowerCase()==='priority';
        const rush = Number(proj?.rush_fee||0)>0 || Number(proj?.rush_days_early||0)>0;
        const start=parseDateSafe(proj?.start_date), due=parseDateSafe(proj?.deadline_date),standard=standardProductionDaysForProject(proj);
        const shortTimeline=!!(start&&due&&Math.ceil((due-start)/86400000)<standard);
        return explicit || rush || shortTimeline;
      }
      function projectDeadlineTag(proj){
        const d=parseDateSafe(proj?.deadline_date); if(!proj?.start_date||!d)return {label:'ON HOLD',cls:'on-hold'};
        const now=new Date();now.setHours(0,0,0,0);const due=new Date(d);due.setHours(0,0,0,0);const diff=Math.round((due-now)/86400000);
        if(diff<0)return {label:'OVERDUE',cls:'overdue'}; if(diff===0)return {label:'TODAY',cls:'today'};
        if(diff<=6)return {label:due.toLocaleDateString('en-PH',{weekday:'long'}).toUpperCase(),cls:'soon'};
        if(diff<=13)return {label:'NEXT WEEK',cls:''};
        return {label:due.toLocaleDateString('en-PH',{month:'short',day:'numeric'}).toUpperCase(),cls:''};
      }
      function projectUrgencyLevel(proj){
        const d=parseDateSafe(proj?.deadline_date), priority=projectIsPriority(proj);
        if(!d)return priority?7:8; const now=new Date();now.setHours(0,0,0,0);const due=new Date(d);due.setHours(0,0,0,0);const diff=Math.round((due-now)/86400000);
        if(diff<=0)return priority?1:2; if(diff<=3)return priority?3:4; if(diff<=7)return priority?5:6; return priority?7:8;
      }
      function compareProjectPriority(a,b){
        const ad=parseDateSafe(a?.deadline_date), bd=parseDateSafe(b?.deadline_date);
        if(ad&&bd){
          const timeDiff=ad.getTime()-bd.getTime();
          if(timeDiff!==0)return timeDiff;
          const priorityDiff=Number(projectIsPriority(b))-Number(projectIsPriority(a));
          return priorityDiff||projectNumber(a)-projectNumber(b);
        }
        if(ad&&!bd)return -1;
        if(!ad&&bd)return 1;
        const priorityDiff=Number(projectIsPriority(b))-Number(projectIsPriority(a));
        return priorityDiff||projectNumber(a)-projectNumber(b);
      }
      function formatProjectDate(v){const d=parseDateSafe(v);return d?d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'—';}
      function displayCategory(value){const s=String(value||'').trim();return s||'—';}
      let queuedViewFrame=null,queuedViewScope=null;
      function queueViewRender(scope){queuedViewScope=scope;if(queuedViewFrame)return;queuedViewFrame=requestAnimationFrame(()=>{const target=queuedViewScope;queuedViewScope=null;queuedViewFrame=null;if(target==='projects')renderProjects();else if(target==='payments')renderPaymentsView();else if(target==='clients')renderClients();else if(target==='catalog')renderPricelist();});}
      function currentProductionWorkloadCount(excludeProjectId=''){
        return state.projects.filter(p=>!p.deleted&&String(p.id)!==String(excludeProjectId||'')&&p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at).length;
      }
      function nextProjectNumber(){
        const used=state.projects.filter(p=>!p.deleted).map(projectNumber).filter(Number.isFinite);
        return used.length?Math.max(...used)+1:1;
      }
      function calculateWorkloadRushSurcharge(projectNum,baseRushFee,excludeProjectId='',snapshotActive=null){
        const num=Math.max(0,Number(projectNum||0)),base=Math.max(0,Number(baseRushFee||0));
        const current=currentProductionWorkloadCount(excludeProjectId);
        const hasSnapshot=snapshotActive!==null&&snapshotActive!==undefined&&snapshotActive!==''&&Number.isFinite(Number(snapshotActive));
        const active=hasSnapshot?Math.max(0,Number(snapshotActive)):current;
        if(num<52||base<=0)return {rate:0,fee:0,active};
        const rate=active>=10?35:active>=7?25:active>=4?15:0;
        const fee=Math.round((base*rate/100)*100)/100;
        return {rate,fee,active};
      }
function standardProductionDaysForItems(items=[]){
  const list=(Array.isArray(items)?items:[]).filter(i=>!['ADDON','REQUEST'].includes(String(i?.type||'').toUpperCase()));
  const hasPackage=list.some(i=>String(i?.type||'').toUpperCase()==='PACKAGE');
  if(hasPackage)return 14;
  const itemCount=list.reduce((sum,i)=>sum+Math.max(1,Math.round(Number(i?.qty||1))),0);
  return itemCount>=2?14:7;
}
      function standardProductionDaysForProject(proj){return standardProductionDaysForItems(proj?.project_items||proj?.items||[]);}
      function standardProductionDaysForCart(){return standardProductionDaysForItems(state.cart?.items||[]);}
function projectWorkloadDeliverableCountFromItems(items=[]){
  const list=(Array.isArray(items)?items:[]).filter(i=>!['ADDON','REQUEST'].includes(String(i?.type||'').toUpperCase()));
  return list.reduce((sum,item)=>{
    const qty=Math.max(1,Math.round(Number(item?.qty||1))),type=String(item?.type||'').toUpperCase();
    if(type!=='PACKAGE')return sum+qty;
    const norm=v=>String(v||'').trim().toLowerCase();
    const pkg=(state.packagesList||[]).find(p=>String(p.product_code||'')===String(item.product_code||item.code||'')||norm(p.name)===norm(item.name));
    const inclusions=Array.isArray(pkg?.includedServiceNames)?pkg.includedServiceNames.filter(Boolean).length:0;
    return sum+Math.max(1,inclusions)*qty;
  },0);
}
      function projectWorkloadDeliverableCount(proj){
        const ds=(proj?.deliverables||[]).filter(d=>!d.is_group);
        return ds.length||projectWorkloadDeliverableCountFromItems(proj?.project_items||proj?.items||[]);
      }
      function projectWorkloadFactor(count){
        const n=Math.max(0,Number(count||0));
        if(n>=11)return {factor:1.75,label:'Very High'};
        if(n>=7)return {factor:1.50,label:'High'};
        if(n>=4)return {factor:1.25,label:'Moderate'};
        return {factor:1.00,label:'Standard'};
      }
function calculateRushFromTimeline(startValue,deadlineValue,standardDays=14,deliverableCount=1){
  const start=parseDateSafe(startValue),due=parseDateSafe(deadlineValue),standard=Math.max(1,Number(standardDays||14));
  const load=projectWorkloadFactor(deliverableCount),unit=getFeeAmount('RUSH',500);
  if(!start||!due)return {duration:null,daysEarly:0,baseFee:0,fee:0,standardDays:standard,deliverableCount:Math.max(0,Number(deliverableCount||0)),loadFactor:load.factor,loadLabel:load.label};
  const duration=Math.max(0,Math.round((due-start)/86400000)),daysEarly=Math.max(0,standard-duration);
  const baseFee=daysEarly>0?Math.ceil(daysEarly/4)*unit:0;
  return {duration,daysEarly,baseFee,fee:baseFee,standardDays:standard,deliverableCount:Math.max(0,Number(deliverableCount||0)),loadFactor:load.factor,loadLabel:load.label};
}
      function setListSort(scope,value){
        if(!state.listSorts)state.listSorts={};state.listSorts[scope]=value;
        if(scope==='projects')renderProjects(); else if(scope==='payments')renderPaymentsView(); else if(scope==='clients')renderClients(); else if(scope==='catalog')renderPricelist(); else if(scope==='overviewProjects')renderOverviewCurrentProjects(); else if(scope==='overviewDeadlines')renderOverviewUpcomingDeadlines();
      }
      function sortProjectsFor(scope,items,filterMode=''){
        const pref=state.listSorts?.[scope]||'default',arr=items.slice();
        if(pref==='az')return arr.sort((a,b)=>String(a.title||a.name||'').localeCompare(String(b.title||b.name||'')));
        if(pref==='za')return arr.sort((a,b)=>String(b.title||b.name||'').localeCompare(String(a.title||a.name||'')));
        if(pref==='id')return arr.sort((a,b)=>projectNumber(a)-projectNumber(b));
        if(pref==='priority')return arr.sort(compareProjectPriority);
        if(pref==='date'){
          if(scope==='payments')return arr.sort((a,b)=>{const ad=parseDateSafe(a.payment_due_date||a.deadline_date)?.getTime()??Infinity,bd=parseDateSafe(b.payment_due_date||b.deadline_date)?.getTime()??Infinity;return ad-bd||Number(projectIsPriority(b))-Number(projectIsPriority(a))||projectNumber(a)-projectNumber(b)});
          return arr.sort(compareProjectPriority);
        }
        if(scope==='projects')return arr.sort(filterMode==='Current'?compareProjectPriority:(a,b)=>projectNumber(a)-projectNumber(b));
        if(scope==='payments')return arr.sort(filterMode==='Pending'?(a,b)=>{const ad=parseDateSafe(a.payment_due_date||a.deadline_date)?.getTime()??Infinity,bd=parseDateSafe(b.payment_due_date||b.deadline_date)?.getTime()??Infinity;return ad-bd||Number(projectIsPriority(b))-Number(projectIsPriority(a))||projectNumber(a)-projectNumber(b)}:(a,b)=>projectNumber(a)-projectNumber(b));
        return arr;
      }

      function renumberProjectSequence(){
        // No reserved or skipped Project IDs: JP-001, JP-002, JP-003 ... continuously.
        // Existing order is preserved by the current numeric reference, then creation time.
        const visible=state.projects.filter(p=>!p.deleted).slice().sort((a,b)=>{
          const sourceNum=(p)=>{
            if(Number.isFinite(Number(p?.project_number))&&Number(p.project_number)>=1)return Number(p.project_number);
            const m=String(p?.legacy_reference||'').match(/(\d{3})$/);
            return m&&Number(m[1])>=1?Number(m[1]):Number.MAX_SAFE_INTEGER;
          };
          return sourceNum(a)-sourceNum(b) || new Date(a.created_at||0)-new Date(b.created_at||0) || String(a.id||'').localeCompare(String(b.id||''));
        });
        visible.forEach((p,index)=>{p.project_number=index+1;});
      }
      async function syncRenumberedProjects(){
        if(!supabaseClient||!state.isConnected)return;
        try{await Promise.all(state.projects.filter(p=>!p.deleted).map(p=>supabaseClient.from('projects').update({project_number:p.project_number}).eq('id',p.id)));}catch(e){console.warn('Project sequence sync unavailable:',e)}
      }
      function openOverviewListModal(type){
        const title=document.getElementById('overviewListModalTitle'),body=document.getElementById('overviewListModalBody');if(!title||!body)return;
        if(type==='deadlines'){renderOverviewUpcomingDeadlines();title.textContent='Upcoming Deadlines';body.innerHTML=document.getElementById('overviewUpcomingDeadlines')?.innerHTML||'';}
        else{renderOverviewCurrentProjects();title.textContent='Current Projects';body.innerHTML=document.getElementById('overviewCurrentProjects')?.innerHTML||'';}
        openModal('overviewListModal');
      }
      function renderOverviewUpcomingEvents(){
        const box=document.getElementById('overviewUpcomingEvents');if(!box)return;const now=new Date();now.setHours(0,0,0,0);
        const raw=[...(Array.isArray(state.calendarEvents)?state.calendarEvents:[]),...(Array.isArray(state.manualEvents)?state.manualEvents:[])];
        const events=raw.filter(e=>{const d=parseDateSafe(e.date||e.start_date||e.start);return d&&d>=now}).sort((a,b)=>parseDateSafe(a.date||a.start_date||a.start)-parseDateSafe(b.date||b.start_date||b.start)).slice(0,2);
        box.innerHTML=`<div class="overview-events-label">Upcoming Events</div>`+(events.length?events.map(e=>`<div class="overview-event-row"><span>${escapeHtml(formatProjectDate(e.date||e.start_date||e.start))}</span><strong>${escapeHtml(e.title||e.name||'Event')}</strong></div>`).join(''):`<div class="overview-event-empty">No upcoming events.</div>`);
      }

      function renderProjects() {
        const body=document.getElementById("projectsTableBody"),filters=document.getElementById("projectFilters");if(!body||!filters)return;
        const names=["All","Current","Completed"],current=state.projectFilter||"Current";filters.innerHTML=names.map(n=>`<button class="filter-pill ${current===n?'active':''}" onclick="app.setProjectFilter('${n}')">${n}</button>`).join("");
        const q=(document.getElementById("projectsSearch")?.value||"").trim().toLowerCase();let rows=state.projects.filter(p=>!p.deleted&&(`${formatProjectId(p)} ${p.title||''} ${p.client_name||''} ${p.project_type||''} ${getProjectType(p)||''}`).toLowerCase().includes(q));
        if(current==='Current')rows=rows.filter(p=>p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at);else if(current==='Completed')rows=rows.filter(p=>p.status==='Completed'||p.delivery_status==='Delivered'||p.archived_at);
        rows=sortProjectsFor('projects',rows,current);const sortEl=document.getElementById('projectsSort');if(sortEl)sortEl.value=state.listSorts?.projects||'default';
        body.innerHTML=rows.map(p=>{const bal=getProjectBalance(p),prog=getProjectProgress(p),category=displayCategory(p.project_type||getProjectType(p)||'—'),priority=projectIsPriority(p),status=(p.status==='Completed'||p.delivery_status==='Delivered'||p.archived_at)?'COMPLETED':((!p.start_date||!p.deadline_date)?'ON HOLD':(isProjectOverdue(p)?'OVERDUE':String(p.status||'CURRENT').toUpperCase())),menuId=`projectRowMenu_${String(p.id).replace(/[^a-zA-Z0-9_-]/g,'')}`;return `<tr class="clickable-row" onclick="app.openProjectDetails('${p.id}','deliverables')"><td><strong class="project-id-cell">${escapeHtml(formatProjectId(p))}</strong></td><td><strong>${escapeHtml(p.title||'Untitled Project')}</strong></td><td>${escapeHtml(p.client_name||'—')}</td><td>${escapeHtml(category)}</td><td class="${bal?'text-danger':''}">${formatCurrency(bal)}</td><td><span class="project-tag ${priority?'priority':''}">${priority?'YES':'NO'}</span></td><td><div class="table-progress"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${prog}%"></div></div><span>${prog}%</span></div></td><td>${escapeHtml(formatProjectDate(p.deadline_date))}</td><td><span class="badge ${status==='COMPLETED'?'badge-green':status==='OVERDUE'?'badge-red':status==='ON HOLD'?'badge-neutral':'badge-neutral'}">${escapeHtml(status)}</span></td><td class="table-row-actions" onclick="event.stopPropagation()"><div class="popover-wrap" id="${menuId}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menuId}',event)">⋮</button><div class="popover-panel project-row-menu"><button class="popover-action" onclick="app.openProjectData('${p.id}')">Edit Project</button><button class="popover-action text-danger" onclick="app.deleteProjectById('${p.id}')">Delete Project</button></div></div></td></tr>`}).join('')||`<tr><td colspan="10" class="text-center text-muted py-4">No projects found.</td></tr>`;
      }

      function setProjectFilter(filter){ state.projectFilter=filter; renderProjects(); }

      function renderTasks() {
        loadTaskStateOnce(); const box=document.getElementById("tasksList"), filters=document.getElementById("taskFilters"); if(!box||!filters)return;
        const current=state.taskFilter||"All"; const names=["All","Today","This Week","Overdue","Completed"]; filters.innerHTML=names.map(n=>`<button class="filter-pill ${current===n?'active':''}" onclick="app.setTaskFilter('${n}')">${n}</button>`).join("");
        const q=(document.getElementById("tasksSearch")?.value||"").toLowerCase(); const now=new Date(); const end=new Date(Date.now()+7*86400000);
        let tasks=state.tasks.filter(t=>`${t.name} ${t.projectName} ${t.deliverableName||""}`.toLowerCase().includes(q));
        tasks=tasks.filter(t=>current==="All"?true:current==="Completed"?t.status==="Completed":current==="Overdue"?t.status!=="Completed"&&t.deadline&&new Date(t.deadline+"T23:59:59")<now:current==="Today"?t.deadline===now.toISOString().slice(0,10):t.deadline&&new Date(t.deadline+"T23:59:59")<=end);
        tasks.sort((a,b)=>new Date(a.deadline||"9999")-new Date(b.deadline||"9999"));
        box.innerHTML=tasks.map(t=>{const overdue=t.status!=="Completed"&&t.deadline&&new Date(t.deadline+"T23:59:59")<now; return `<div class="task-row"><div><div class="task-title">${escapeHtml(t.name)}</div><div class="task-meta">${escapeHtml(t.projectName||"")} ${t.deliverableName?`• ${escapeHtml(t.deliverableName)}`:""}</div></div><div><span class="badge ${t.priority==='Urgent'||t.priority==='High'?'badge-red':'badge-neutral'}">${escapeHtml(t.priority||"Normal")}</span></div><div class="${overdue?'overdue':''}">${escapeHtml(t.deadline||"—")}</div><label class="toggle-switch" title="Mark task complete"><input type="checkbox" ${t.status==='Completed'?'checked':''} onchange="app.updateTaskStatus('${t.id}',this.checked?'Completed':'Not Started')"><span class="toggle-slider"></span></label><button class="btn btn-secondary btn-sm" onclick="app.deleteTask('${t.id}')">Delete</button></div>`}).join("")||`<div class="text-center text-muted py-4">No tasks found.</div>`;
      }

      function setTaskFilter(filter){state.taskFilter=filter;renderTasks();}

      function openTaskModal(){
        const projectSelect=document.getElementById("taskProjectInput"), delSelect=document.getElementById("taskDeliverableInput");
        projectSelect.innerHTML=state.projects.filter(p=>!p.deleted&&p.status!=="Completed").map(p=>`<option value="${p.id}">${escapeHtml(p.title)} — ${escapeHtml(p.client_name||"")}</option>`).join("");
        updateTaskDeliverableOptions();
        document.getElementById("taskNameInput").value=""; document.getElementById("taskDescriptionInput").value="";
        document.getElementById("taskDeadlineInput").value=new Date(Date.now()+86400000).toISOString().slice(0,10);
        document.getElementById("taskPriorityInput").value="Normal"; document.getElementById("taskStatusInput").value="Not Started";
        openModal("taskModal");
      }

      function updateTaskDeliverableOptions(){
        const p=state.projects.find(x=>x.id===document.getElementById("taskProjectInput")?.value); const el=document.getElementById("taskDeliverableInput"); if(!el)return;
        el.innerHTML=`<option value="">None</option>`+(p?.deliverables||[]).map(d=>`<option value="${d.id}">${escapeHtml(d.item_name||d.name||"Deliverable")}</option>`).join("");
      }

      function saveTask(){
        const pid=document.getElementById("taskProjectInput").value, p=state.projects.find(x=>x.id===pid), name=document.getElementById("taskNameInput").value.trim();
        if(!p||!name){showToast("Project and task name are required.");return;}
        const did=document.getElementById("taskDeliverableInput").value, d=(p.deliverables||[]).find(x=>x.id===did);
        state.tasks.unshift({id:"task_"+Date.now(),project_id:pid,projectName:p.title,deliverable_id:did||null,deliverableName:d?.item_name||d?.name||"",name,description:document.getElementById("taskDescriptionInput").value.trim(),deadline:document.getElementById("taskDeadlineInput").value,priority:document.getElementById("taskPriorityInput").value,status:document.getElementById("taskStatusInput").value,progress:0,created_at:new Date().toISOString()});
        persistTasksState(); closeModal("taskModal"); renderTasks(); renderOverviewDashboard(); showToast("Task created.");
      }

      function updateTaskStatus(id,status){const t=state.tasks.find(x=>x.id===id);if(t){t.status=status;t.progress=status==="Completed"?100:t.progress||0;persistTasksState();renderTasks();renderOverviewDashboard();}}
      function deleteTask(id){const task=state.tasks.find(t=>t.id===id);requestDestructivePin('Delete Task',`Delete "${task?.name||'this task'}"?`,()=>{state.tasks=state.tasks.filter(t=>t.id!==id);persistTasksState();renderTasks();renderOverviewDashboard();showToast("Task deleted.");});}

      function renderPaymentsView(){
        const body=document.getElementById("paymentsTableBody"),filters=document.getElementById("paymentFilters");if(!body||!filters)return;
        const names=["Pending","All","Completed"],current=state.paymentFilter||"Pending";filters.innerHTML=names.map(n=>`<button class="filter-pill ${current===n?'active':''}" onclick="app.setPaymentFilter('${n}')">${n}</button>`).join("");
        const q=(document.getElementById("paymentsSearch")?.value||"").trim().toLowerCase();let projects=state.projects.filter(p=>!p.deleted&&(`${formatProjectId(p)} ${p.title||''} ${p.client_name||''} ${p.client_email||''}`).toLowerCase().includes(q));
        const encodedPaymentStatus=p=>String(p?.payment_status||"").trim();
        if(current==='Completed')projects=projects.filter(p=>getProjectPaymentStatus(p)==='Completed');
        else if(current==='Pending')projects=projects.filter(p=>getProjectPaymentStatus(p)!=='Completed');
        projects=projects.slice().sort(current==='Pending'?(a,b)=>{const ad=parseDateSafe(a.payment_due_date||a.deadline_date)?.getTime()??Infinity,bd=parseDateSafe(b.payment_due_date||b.deadline_date)?.getTime()??Infinity;return ad-bd||Number(projectIsPriority(b))-Number(projectIsPriority(a))||projectNumber(a)-projectNumber(b)}:(a,b)=>projectNumber(a)-projectNumber(b));
        body.innerHTML=projects.map(p=>{
          const paid=getProjectPaid(p),bal=getProjectBalance(p);
          const sourceStatus=encodedPaymentStatus(p);
          const displayStatus=getProjectPaymentStatus(p);
          const statusKey=displayStatus.toLowerCase();
          const badgeClass=statusKey.includes('completed')?'badge-green':'badge-orange';
          return `<tr class="clickable-row" onclick="app.openProjectDetails('${p.id}','payment-tracker')"><td><strong class="project-id-cell">${escapeHtml(formatProjectId(p))}</strong></td><td><strong>${escapeHtml(p.title||'Untitled Project')}</strong></td><td>${escapeHtml(p.client_name||p.client_email||"—")}</td><td>${formatCurrency(getProjectInvoiceTotal(p))}</td><td>${formatCurrency(paid)}</td><td class="${bal?'text-danger':''}">${formatCurrency(bal)}</td><td>${escapeHtml(formatProjectDate((p.delivery_status==='Delivered'||p.status==='Completed')?p.payment_due_date:''))}</td><td><span class="badge ${badgeClass}">${escapeHtml(displayStatus.toUpperCase())}</span></td></tr>`;
        }).join("")||`<tr><td colspan="8" class="text-center text-muted py-4">No matching invoice or payment records.</td></tr>`;
      }
      function setPaymentFilter(filter){ state.paymentFilter=filter; renderPaymentsView(); }

      function animateNumbersIn(root){
        if(!root)return;root.querySelectorAll('.number-animate,.kpi-value').forEach(el=>{if(el.dataset.animating==='1')return;const raw=el.textContent||'',match=raw.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);if(!match)return;const target=Number(match[0]);if(!Number.isFinite(target))return;const isMoney=raw.includes('₱'),decimals=(raw.match(/\.(\d+)/)?.[1]||'').length,duration=520,start=performance.now();el.dataset.animating='1';const frame=now=>{const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3),value=target*eased;el.textContent=isMoney?new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value):Math.round(value).toLocaleString('en-PH');if(t<1)requestAnimationFrame(frame);else{el.textContent=raw;delete el.dataset.animating;}};requestAnimationFrame(frame);});
      }
      function milestoneAmountLabel(value){return Number(value)>=1000000?`₱${(Number(value)/1000000).toFixed(Number(value)%1000000?1:0)}M`:`₱${Math.round(Number(value)/1000)}K`;}
      function milestoneReachedDate(level){
        const ordered=state.projects.filter(p=>!p.deleted&&getProjectInvoiceTotal(p)>0).map(p=>({p,date:parseDateSafe(p.start_date||p.record_date||p.created_at)})).sort((a,b)=>(a.date?.getTime()??Infinity)-(b.date?.getTime()??Infinity)||projectNumber(a.p)-projectNumber(b.p));
        let total=0,lastDate=null;for(const x of ordered){total+=getProjectInvoiceTotal(x.p);if(x.date)lastDate=x.date;if(total>=Number(level))return lastDate||new Date()}return null;
      }
      function spawnMilestoneConfetti(){
        const box=document.getElementById('milestoneConfetti');if(!box)return;box.innerHTML='';
        for(let i=0;i<42;i++){const s=document.createElement('i');s.style.left=`${5+Math.random()*90}%`;s.style.animationDelay=`${Math.random()*.45}s`;s.style.animationDuration=`${1.8+Math.random()*1.4}s`;s.style.transform=`rotate(${Math.random()*180}deg)`;box.appendChild(s)}
      }
      function openRevenueMilestone(level){
        const total=state.projects.filter(p=>!p.deleted).reduce((s,p)=>s+getProjectInvoiceTotal(p),0);level=Number(level||0);if(!level||total<level)return;
        const reached=milestoneReachedDate(level),dateText=reached?reached.toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'}):'this journey';
        const amount=milestoneAmountLabel(level),caption=`JUAN PROJECT reached the ${amount} revenue milestone on ${dateText}. Another level unlocked.`;
        state.activeMilestoneShare={level,amount,dateText,caption};
        document.getElementById('milestoneCelebrationTitle').textContent=`${amount} unlocked`;
        document.getElementById('milestoneCelebrationCopy').textContent=`Congratulations — JUAN PROJECT reached ${amount} in encoded total receivables on ${dateText}.`;
        openModal('revenueMilestoneModal');spawnMilestoneConfetti();
      }
      async function copyRevenueMilestone(){const text=state.activeMilestoneShare?.caption||'';if(!text)return;try{await navigator.clipboard.writeText(text);showToast('Milestone caption copied.')}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('Milestone caption copied.')}}
      async function shareRevenueMilestone(){const text=state.activeMilestoneShare?.caption||'';if(!text)return;if(navigator.share){try{await navigator.share({title:'JUAN PROJECT Milestone',text});return}catch(e){if(e?.name==='AbortError')return}}copyRevenueMilestone()}
      function shareRevenueMilestoneToX(){const text=state.activeMilestoneShare?.caption||'';if(text)window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,'_blank','noopener')}
      function shareRevenueMilestoneToFacebook(){const text=state.activeMilestoneShare?.caption||'';if(!text)return;const url=location.protocol.startsWith('http')?location.href:'https://www.facebook.com/';window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,'_blank','noopener')}

      function renderReportsView(){
        const box=document.getElementById('reportsContent');if(!box)return;
        const projects=state.projects.filter(p=>!p.deleted),payments=getAllPayments(),totalReceivables=projects.reduce((s,p)=>s+getProjectInvoiceTotal(p),0),collected=payments.reduce((s,p)=>s+Number(p.amount_paid||p.amount||0),0),outstanding=Math.max(0,totalReceivables-collected),active=projects.filter(p=>p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at).length,completed=projects.length-active,collectionRate=totalReceivables?Math.round(collected/totalReceivables*100):0,currentMonth=getLocalDateString(new Date()).slice(0,7),monthCollected=payments.filter(x=>String(x.payment_date||x.created_at||'').slice(0,7)===currentMonth).reduce((s,x)=>s+Number(x.amount_paid||x.amount||0),0),overdue=projects.filter(isPaymentCollectionOverdue).reduce((s,p)=>s+getProjectBalance(p),0);
        const monthMap={};payments.forEach(x=>{const k=String(x.payment_date||x.created_at||'').slice(0,7);if(k)monthMap[k]=(monthMap[k]||0)+Number(x.amount_paid||x.amount||0)});const recent=Object.entries(monthMap).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8),maxVal=Math.max(1,...recent.map(x=>x[1])),pts=recent.map(([k,v],i)=>{const x=recent.length===1?250:24+i*(452/Math.max(1,recent.length-1)),y=132-v/maxVal*96;return `${x.toFixed(1)},${y.toFixed(1)}`}).join(' '),labels=recent.map(([k],i)=>{const x=recent.length===1?250:24+i*(452/Math.max(1,recent.length-1)),d=new Date(k+'-01T12:00:00');return `<text x="${x}" y="160" text-anchor="middle" class="report-chart-label">${d.toLocaleDateString('en-PH',{month:'short'})}</text>`}).join('');
        const pendingCount=projects.filter(p=>getProjectPaymentStatus(p)==='Pending').length,downCount=projects.filter(p=>getProjectPaymentStatus(p)==='Downpayment').length,paidCount=projects.filter(p=>getProjectPaymentStatus(p)==='Completed').length,totalCount=Math.max(1,pendingCount+downCount+paidCount);
        const levels=[10000,50000,100000,300000,500000,750000,1000000],achieved=levels.filter(x=>totalReceivables>=x),next=levels.find(x=>totalReceivables<x)||null,prev=achieved.length?achieved[achieved.length-1]:0,levelProgress=next?Math.max(0,Math.min(100,(totalReceivables-prev)/(next-prev)*100)):100,levelHtml=levels.map(v=>`<button type="button" class="revenue-level ${totalReceivables>=v?'achieved clickable-milestone':''} ${next===v?'next':''}" ${totalReceivables>=v?`onclick="app.openRevenueMilestone(${v})" title="View ${milestoneAmountLabel(v)} milestone"`:'disabled'}><span class="revenue-level-dot">${totalReceivables>=v?'✓':''}</span><strong>${milestoneAmountLabel(v)}</strong></button>`).join('');
        box.innerHTML=`<div class="finance-dashboard-v69">
          <div class="finance-kpi-row">
            <div class="finance-kpi"><span>Total Receivables</span><strong class="number-animate">${formatCurrency(totalReceivables)}</strong><small>Encoded project value</small></div>
            <div class="finance-kpi"><span>Collected</span><strong class="number-animate">${formatCurrency(collected)}</strong><small>${collectionRate}% collection rate</small></div>
            <div class="finance-kpi"><span>Outstanding</span><strong class="number-animate">${formatCurrency(outstanding)}</strong><small>Still to be collected</small></div>
            <div class="finance-kpi"><span>This Month</span><strong class="number-animate">${formatCurrency(monthCollected)}</strong><small>Payments received</small></div>
            <div class="finance-kpi"><span>Overdue</span><strong class="number-animate ${overdue?'text-danger':''}">${formatCurrency(overdue)}</strong><small>Delivered + unpaid after 3 days</small></div>
          </div>
          <div class="finance-main-grid">
            <div class="card finance-chart-card"><div class="finance-card-head"><div><span>Revenue & Collections</span><p>Payments received by month</p></div><div class="finance-chart-total"><span>Collected</span><strong>${formatCurrency(collected)}</strong></div></div>${recent.length?`<svg class="report-line-chart finance-large-chart" viewBox="0 0 500 175"><line x1="24" y1="132" x2="476" y2="132" class="report-chart-grid"/><line x1="24" y1="84" x2="476" y2="84" class="report-chart-grid"/><line x1="24" y1="36" x2="476" y2="36" class="report-chart-grid"/><polyline points="${pts}" class="report-chart-line"/>${recent.map(([k,v],i)=>{const x=recent.length===1?250:24+i*(452/Math.max(1,recent.length-1)),y=132-v/maxVal*96;return `<circle cx="${x}" cy="${y}" r="4" class="report-chart-dot"><title>${formatCurrency(v)}</title></circle>`}).join('')}${labels}</svg>`:`<div class="empty-compact-state"><strong>No collection trend yet</strong><span>Recorded payments will appear here.</span></div>`}</div>
            <div class="card finance-health-card"><div class="finance-card-head"><div><span>Collection Health</span><p>Payment status distribution</p></div><strong>${collectionRate}%</strong></div><div class="finance-health-bars"><div><span>Pending</span><i><b style="width:${pendingCount/totalCount*100}%"></b></i><strong>${pendingCount}</strong></div><div><span>Downpayment</span><i><b style="width:${downCount/totalCount*100}%"></b></i><strong>${downCount}</strong></div><div><span>Paid</span><i><b style="width:${paidCount/totalCount*100}%"></b></i><strong>${paidCount}</strong></div></div><div class="finance-health-summary"><div><span>Active Projects</span><strong>${active}</strong></div><div><span>Completed</span><strong>${completed}</strong></div></div></div>
          </div>
          <div class="card revenue-milestone-card finance-milestone-v69"><div class="revenue-level-head"><div><div class="section-kicker">MILESTONES</div><h2 class="card-title">Revenue Level</h2><span>${next?`${formatCurrency(Math.max(0,next-totalReceivables))} to the next level`:'Top milestone reached'}</span></div><strong>${Math.round(levelProgress)}%</strong></div><div class="revenue-level-progress"><i style="width:${levelProgress}%"></i></div><div class="revenue-levels">${levelHtml}</div></div>
        </div>`;animateNumbersIn(box);
      }
      function renderDeliverablesView() {
        const container = document.getElementById("allDeliverablesByProject");
        if (!container) return;

        const projects = state.projects.filter(p =>
          !p.deleted &&
          p.status !== "Completed" &&
          p.delivery_status !== "Delivered" &&
          !p.archived_at
        );

        if (!projects.length) {
          container.innerHTML = `<div class="text-muted text-center py-5">No current project deliverables.</div>`;
          return;
        }

        container.innerHTML = projects.map(proj => {
          const deliverables = Array.isArray(proj.deliverables) ? proj.deliverables : [];
          const completed = deliverables.filter(d => d.completed).length;

          return `
            <div class="card mb-6">
              <div class="card-header">
                <div style="min-width:0;cursor:pointer;" onclick="app.openProjectDetails('${proj.id}')">
                  <div class="section-kicker">PROJECT</div>
                  <h2 class="card-title">${escapeHtml(proj.client_name || "N/A")} — ${escapeHtml(proj.title || "Untitled Project")}</h2>
                  <div class="text-sm text-muted">${completed} / ${deliverables.length} deliverables completed</div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="app.openProjectDetails('${proj.id}')">View Project</button>
              </div>

              <div class="deliverables-list">
                ${deliverables.length ? deliverables.map(del => `
                  <div class="deliverable-row">
                    <div style="min-width:0;flex:1;">
                      <div class="font-semibold">${escapeHtml(del.item_name || del.name || "Deliverable")}</div>
                      <div class="text-sm text-muted">${escapeHtml(del.package_name || "Standalone Deliverable")}</div>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm ${del.completed ? "btn-secondary" : "btn-primary"}"
                      onclick="app.toggleDeliverable('${proj.id}', '${String(del.id).replace(/'/g, "\\'")}')">
                      ${del.completed ? "✓ Completed" : "Mark as Completed"}
                    </button>
                  </div>
                `).join("") : `<div class="text-muted py-4">No deliverables recorded.</div>`}
              </div>
            </div>
          `;
        }).join("");
      }

      function renderClientProfile(){
        ensureContinuousClientIds();
        const id=state.activeClientId,c=state.clients.find(x=>x.id===id);if(!c)return;const cid=clientDisplayId(c),projects=state.projects.filter(p=>!p.deleted&&(p.client_id===id||p.client_name===c.name)),paid=projects.reduce((s,p)=>s+getProjectPaid(p),0),total=projects.reduce((s,p)=>s+getProjectInvoiceTotal(p),0);
        document.getElementById('clientProfileName').innerText=c.name||'Client';document.getElementById('clientProfileEmail').innerText=`${cid}${c.email?` · ${c.email}`:''}`;const saveState=document.getElementById('clientProfileSaveState');if(saveState)saveState.textContent='Saved';
        const paymentRows=projects.flatMap(p=>(p.payments||[]).map(pay=>({project:p,payment:pay}))).sort((a,b)=>new Date(b.payment.payment_date||b.payment.created_at||0)-new Date(a.payment.payment_date||a.payment.created_at||0));
        document.getElementById('clientProfileContent').innerHTML=`<div class="client-profile-layout"><div class="card client-profile-card"><div class="client-profile-identity"><div class="client-profile-avatar">${escapeHtml((c.name||'C').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase())}</div><div><span class="client-id-pill">${escapeHtml(cid)}</span><h2>${escapeHtml(c.name||'Client')}</h2><p>Client details are saved automatically.</p></div></div><div class="client-profile-form"><div class="form-group"><label class="form-label">Full Name</label><input class="form-control" id="clientProfileNameInput" placeholder="Full name or business name" value="${escapeHtml(c.name||'')}" onchange="app.autosaveClientProfileField()"></div><div class="form-group"><label class="form-label">Email</label><input class="form-control" id="clientProfileEmailInput" type="email" placeholder="client@example.com" value="${escapeHtml(c.email||'')}" onchange="app.autosaveClientProfileField()"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-control" id="clientProfilePhoneInput" inputmode="tel" placeholder="+63 963 754 4777" value="${escapeHtml(normalizePhilippinePhone(c.phone)||c.phone||'')}" onblur="this.value=app.normalizePhilippinePhone(this.value);app.autosaveClientProfileField()"></div><div class="form-group"><label class="form-label">Address</label><input class="form-control" id="clientProfileAddressInput" placeholder="City, Province" value="${escapeHtml(c.address||'')}" onchange="app.autosaveClientProfileField()"></div></div></div><div class="client-stat-grid client-profile-stats"><div class="mini-stat"><div class="label">Projects</div><div class="value">${projects.length}</div></div><div class="mini-stat"><div class="label">Project Value</div><div class="value">${formatCurrency(total)}</div></div><div class="mini-stat"><div class="label">Paid</div><div class="value">${formatCurrency(paid)}</div></div><div class="mini-stat"><div class="label">Outstanding</div><div class="value">${formatCurrency(Math.max(0,total-paid))}</div></div></div></div><div class="card mt-6"><div class="card-header"><div><div class="section-kicker">HISTORY</div><h2 class="card-title">Projects</h2></div></div><div class="table-responsive"><table class="data-table unified-table"><thead><tr><th>Project ID</th><th>Project</th><th>Value</th><th>Balance</th><th>Status</th></tr></thead><tbody>${projects.sort((a,b)=>projectNumber(a)-projectNumber(b)).map(p=>`<tr onclick="app.openProjectDetails('${p.id}')" style="cursor:pointer"><td><strong>${escapeHtml(formatProjectId(p))}</strong></td><td>${escapeHtml(p.title)}</td><td>${formatCurrency(getProjectInvoiceTotal(p))}</td><td>${formatCurrency(getProjectBalance(p))}</td><td>${escapeHtml(p.status||'')}</td></tr>`).join('')||`<tr><td colspan="5" class="text-muted text-center">No projects.</td></tr>`}</tbody></table></div></div><div class="card mt-6"><div class="card-header"><div><div class="section-kicker">FINANCE</div><h2 class="card-title">Payment History</h2></div></div>${paymentRows.length?`<div class="payment-history-unified">${paymentRows.map(({project,payment})=>`<div class="payment-history-unified-row client-history-payment"><div class="payment-history-unified-main"><strong>${escapeHtml(formatProjectId(project))} · ${escapeHtml(project.title||'Project')}</strong><span>${escapeHtml(payment.payment_method||payment.method||'Payment')}${payment.reference_no?` · Ref ${escapeHtml(payment.reference_no)}`:''}</span></div><div class="payment-history-unified-amount"><strong>+${formatCurrency(payment.amount_paid||payment.amount||0)}</strong><span>${escapeHtml(payment.payment_date||'')}</span></div></div>`).join('')}</div>`:`<div class="payment-history-empty"><strong>No payment history</strong><span>Recorded client payments will appear here.</span></div>`}</div>`;
      }
      function autosaveClientProfileField(){
        const c=state.clients.find(x=>x.id===state.activeClientId);if(!c)return;const name=document.getElementById('clientProfileNameInput')?.value.trim()||'',email=document.getElementById('clientProfileEmailInput')?.value.trim()||'',phone=normalizePhilippinePhone(document.getElementById('clientProfilePhoneInput')?.value||''),address=document.getElementById('clientProfileAddressInput')?.value.trim()||'',status=document.getElementById('clientProfileSaveState');
        if(!name||!email){if(status)status.textContent='Check required fields';return;}c.name=name;c.email=email;c.phone=phone;c.address=address;state.projects.forEach(p=>{if(p.client_id===c.id){p.client_name=name;p.client_email=email;p.client_phone=phone;p.client_address=address;}});persistClientsState();persistProjectsState();if(status){status.textContent='Saved';status.classList.add('is-saved');setTimeout(()=>status.classList.remove('is-saved'),700);}document.getElementById('clientProfileName').innerText=name;document.getElementById('clientProfileEmail').innerText=`${clientDisplayId(c)} · ${email}`;if(supabaseClient&&state.isConnected)syncClientToDatabase(c);
      }
      function saveClientProfileChanges(){autosaveClientProfileField();}

      function openClientProfile(id){state.activeClientId=id;navigateTo("client-profile");}

      function getFriendlyDeadlineLabel(deadlineDateStr) {
        if (!deadlineDateStr) return "--";

        const today = new Date(); today.setHours(0,0,0,0);
        const target = new Date(deadlineDateStr); target.setHours(0,0,0,0);
        const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "OVERDUE";
        if (diffDays === 0) return "DUE TODAY";
        if (diffDays === 1) return "DUE NEXT DAY";

        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        if (diffDays <= 7) return `DUE ${dayNames[target.getDay()]}`;
        return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      function evaluatePaymentStatus(totalAmount, totalPaid, approvalStatus, dueDateStr) {
        const remainingBalance=Math.max(0,totalAmount-totalPaid);
        if(remainingBalance===0&&totalAmount>0)return {status:'COMPLETED',daysRemaining:0,daysOverdue:0,lateFee:0,currentAmountDue:0};
        return {status:totalPaid>0?'DOWNPAYMENT':'PENDING',daysRemaining:null,daysOverdue:0,lateFee:0,currentAmountDue:remainingBalance};
      }

      function renderMyWorks() {
        const container = document.getElementById("worksContainer");
        const alertsContainer = document.getElementById("paymentOverdueAlerts");
        const paymentDueSection = document.getElementById("paymentDueSection");
        const paymentDueContainer = document.getElementById("paymentDueContainer");

        if (!container) return;
        container.innerHTML = ""; 
        if (alertsContainer) alertsContainer.innerHTML = "";
        if (paymentDueContainer) paymentDueContainer.innerHTML = "";

        const activeProjects = state.projects.filter(p => !p.deleted && p.status === "In Progress" && p.delivery_status !== "Delivered");
        
        const unpaidDeliveredProjects = state.projects.filter(p => {
          if (p.deleted || p.delivery_status !== "Delivered") return false;
          const totalPaid = (p.payments || []).reduce((sum, pay) => sum + Number(pay.amount_paid), 0);
          return (getProjectInvoiceTotal(p) - totalPaid) > 0;
        });

        if (unpaidDeliveredProjects.length > 0 && paymentDueSection) {
          paymentDueSection.classList.remove("hidden");
          unpaidDeliveredProjects.forEach(proj => {
            const totalPaid = (proj.payments || []).reduce((sum, pay) => sum + Number(pay.amount_paid), 0);
            const remaining = Math.max(0, getProjectInvoiceTotal(proj) - totalPaid);
            paymentDueContainer.innerHTML += `
              <div class="card mb-4" style="border-left: 4px solid var(--status-orange);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <span class="badge badge-orange">Delivered</span>
                    <span class="badge badge-red ml-2">${formatCurrency(remaining)} Remaining</span>
                    <h3 style="font-size:18px; font-weight:700; margin-top:6px;">${proj.client_name} — ${proj.title}</h3>
                  </div>
                  <div class="action-buttons-group">
                    <button class="btn btn-secondary btn-sm" onclick="app.openProjectDetails('${proj.id}')">View Project</button>
                    <button class="btn btn-primary btn-sm" onclick="app.sendBalanceReminderEmail('${proj.id}')">Send Payment Reminder</button>
                  </div>
                </div>
              </div>
            `;
          });
        } else if (paymentDueSection) {
          paymentDueSection.classList.add("hidden");
        }

        if (activeProjects.length === 0) {
          container.innerHTML = `<div class="card text-muted text-center py-4">No active production works. Click "New Order" to start.</div>`;
          return;
        }

        let overdueHtml = "";

        activeProjects.forEach(proj => {
          const totalPaid = (proj.payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
          proj.paidAmount = totalPaid;
          proj.balanceAmount = Math.max(0, getProjectInvoiceTotal(proj) - totalPaid);

          const evalStatus = evaluatePaymentStatus(getProjectInvoiceTotal(proj), totalPaid, proj.approval_status, proj.payment_due_date);
          proj.paymentStatus = evalStatus.status;

          if (evalStatus.status === "PENDING" && evalStatus.daysOverdue > 0) {
            overdueHtml += `
              <div class="card mb-3" style="border-left: 4px solid var(--status-red); background: rgba(255,59,48,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <strong style="color:var(--status-red);">PAYMENT OVERDUE</strong>
                    <div class="font-semibold mt-1">${proj.client_name} — ${proj.title}</div>
                  </div>
                  <div class="text-right">
                    <div>Original Balance: <strong>${formatCurrency(proj.balanceAmount)}</strong></div>
                    <div>Late Fee (2%/wk): <strong style="color:var(--status-red);">${formatCurrency(evalStatus.lateFee)}</strong></div>
                    <div style="font-size:16px; font-weight:700;">Amount Due: ${formatCurrency(evalStatus.currentAmountDue)}</div>
                  </div>
                </div>
              </div>
            `;
          }

          const friendlyLabel = getFriendlyDeadlineLabel(proj.deadline_date);

          const card = document.createElement("div");
          card.className = "card mb-4";
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; flex-wrap:wrap; gap:8px;" onclick="app.openProjectDetails('${proj.id}')">
              <div>
                <span class="badge ${evalStatus.status === 'PENDING' ? 'badge-red' : 'badge-green'}">${evalStatus.status}</span>
                <span class="badge badge-neutral ml-2">${friendlyLabel}</span>
                <h3 style="font-size:18px; font-weight:700; margin-top:6px;">${proj.client_name} — ${proj.title}</h3>
              </div>
              <div class="text-right">
                <div style="font-size:16px; font-weight:700;">Balance: ${formatCurrency(proj.balanceAmount)}</div>
                <div style="font-size:12px; color:var(--text-tertiary);">Total: ${formatCurrency(getProjectInvoiceTotal(proj))}</div>
              </div>
            </div>
          `;
          container.appendChild(card);
        });

        if (alertsContainer) alertsContainer.innerHTML = overdueHtml;
      }

      /* ==========================================================================
         FINANCIAL ANALYTICS
         ========================================================================== */
      function renderAnalytics() {
        const totalRevenueEl = document.getElementById("analyticsTotalRevenue");
        const totalPaidEl = document.getElementById("analyticsTotalPaid");
        const outstandingEl = document.getElementById("analyticsOutstanding");
        const monthlyIncomeEl = document.getElementById("analyticsMonthlyIncome");
        const tableBody = document.getElementById("analyticsMonthlyTableBody");

        if (!totalRevenueEl || !tableBody) return;

        let totalRevenue = 0;
        let totalPaid = 0;
        let currentMonthIncome = 0;

        const currentMonthKey = new Date().toISOString().substring(0, 7); // YYYY-MM
        const monthlyData = {};

        state.projects.filter(p => !p.deleted).forEach(proj => {
          totalRevenue += getProjectInvoiceTotal(proj);

          const projMonthKey = (proj.created_at || new Date().toISOString()).substring(0, 7);
          if (!monthlyData[projMonthKey]) {
            monthlyData[projMonthKey] = { ordersCount: 0, paymentsSum: 0, totalAmountSum: 0 };
          }
          monthlyData[projMonthKey].ordersCount += 1;
          monthlyData[projMonthKey].totalAmountSum += getProjectInvoiceTotal(proj);

          (proj.payments || []).forEach(pay => {
            const payAmount = Number(pay.amount_paid || 0);
            totalPaid += payAmount;

            const payMonthKey = (pay.payment_date || pay.created_at || new Date().toISOString()).substring(0, 7);
            if (!monthlyData[payMonthKey]) {
              monthlyData[payMonthKey] = { ordersCount: 0, paymentsSum: 0, totalAmountSum: 0 };
            }
            monthlyData[payMonthKey].paymentsSum += payAmount;

            if (payMonthKey === currentMonthKey) {
              currentMonthIncome += payAmount;
            }
          });
        });

        const outstandingBalance = Math.max(0, totalRevenue - totalPaid);

        totalRevenueEl.innerText = formatCurrency(totalRevenue);
        totalPaidEl.innerText = formatCurrency(totalPaid);
        outstandingEl.innerText = formatCurrency(outstandingBalance);
        monthlyIncomeEl.innerText = formatCurrency(currentMonthIncome);

        tableBody.innerHTML = "";
        const sortedMonths = Object.keys(monthlyData).sort().reverse();

        if (sortedMonths.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No financial records found.</td></tr>`;
          return;
        }

        sortedMonths.forEach(mKey => {
          const mObj = monthlyData[mKey];
          const dateDate = new Date(mKey + "-01");
          const monthLabel = dateDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          tableBody.innerHTML += `
            <tr>
              <td class="font-semibold">${monthLabel}</td>
              <td>${mObj.ordersCount}</td>
              <td style="color:var(--primary-mint-dark); font-weight:600;">${formatCurrency(mObj.paymentsSum)}</td>
              <td class="text-right font-bold">${formatCurrency(mObj.totalAmountSum)}</td>
            </tr>
          `;
        });
      }

      /* ==========================================================================
         DELETE RECOVERY / UNDO MECHANISM
         ========================================================================== */
      function deleteCurrentProject() {
        if (!state.activeProjectId) return;
        const proj = state.projects.find(p => p.id === state.activeProjectId);if (!proj) return;
        requestDestructivePin('Delete Project',`Delete "${proj.title}"? The remaining Project IDs will be resequenced.`,async()=>{proj.deleted=true;state.lastDeletedProject=proj;renumberProjectSequence();persistProjectsState();await syncRenumberedProjects();showToast(`Project "${proj.title}" deleted.`,"Undo",()=>undoDeleteProject(proj.id));navigateTo('projects');renderProjects();renderOverviewDashboard();});
      }

      function deleteProjectById(projId){state.activeProjectId=projId;deleteCurrentProject();}

      function undoDeleteProject(projId) {
        const proj = state.projects.find(p => p.id === projId);
        if (proj) {
          proj.deleted = false;
          state.lastDeletedProject = null;
          renumberProjectSequence();
          persistProjectsState();
          syncRenumberedProjects();
          renderCurrentView();
          showToast(`Project "${proj.title}" restored.`);
        }
      }

      /* ==========================================================================
         NEW ORDER & CART PERSISTENCE WORKFLOW
         ========================================================================== */
      function renderNewOrderView() {
        const today=getLocalDateString(new Date());
        if((!state.cart.items?.length&&!state.cart.projectName&&state.cart.startDate!==today)){state.cart.startDate=today;state.cart.deadlineDate=addDaysToDateString(today,14);state.cart.deadlineManuallySet=false;state.cart.rushFee=0;state.cart.workloadRushRate=0;state.cart.workloadRushFee=0;persistCartState();}
        if(!state.cart.startDate||!state.cart.deadlineDate)setDefaultOrderDates();
        populateClientDropdown();
        const projectNameInput = document.getElementById("orderProjectName");
        if (projectNameInput) projectNameInput.value = state.cart.projectName || "";
        renderServiceCatalog();
        renderCartUI();
      }

      function populateClientDropdown(filterQuery = "", forceOpen = false) {
        const hidden=document.getElementById("orderClientSelect"),search=document.getElementById("orderClientSearch"),menu=document.getElementById("orderClientSuggestions");if(!hidden||!search||!menu)return;hidden.value=state.cart.selectedClientId||'';const selected=state.clients.find(c=>c.id===state.cart.selectedClientId);if(selected&&!filterQuery&&document.activeElement!==search)search.value=`${selected.name}${selected.email?` — ${selected.email}`:''}`;const q=String(filterQuery||'').trim().toLowerCase();const filtered=state.clients.filter(c=>!q||`${c.name||''} ${c.email||''}`.toLowerCase().includes(q)).slice(0,8);menu.innerHTML=filtered.map(c=>`<button type="button" class="typeahead-option" onclick="app.selectExistingClient('${c.id}')"><strong>${escapeHtml(c.name||'Unnamed Client')}</strong><span>${escapeHtml(c.email||'No email')}</span></button>`).join('')||`<div class="typeahead-empty">No matching clients</div>`;menu.classList.toggle('open',forceOpen&&document.activeElement===search);
      }
      function showClientSuggestions(){const search=document.getElementById('orderClientSearch');populateClientDropdown(search?.value||'',true)}
      function filterExistingClientOptions(value){state.cart.selectedClientId='';const hidden=document.getElementById('orderClientSelect');if(hidden)hidden.value='';persistCartState();populateClientDropdown(value,true)}
      function selectExistingClient(id){const c=state.clients.find(x=>x.id===id);if(!c)return;state.cart.selectedClientId=id;persistCartState();const hidden=document.getElementById('orderClientSelect'),search=document.getElementById('orderClientSearch'),menu=document.getElementById('orderClientSuggestions');if(hidden)hidden.value=id;if(search)search.value=`${c.name}${c.email?` — ${c.email}`:''}`;if(menu)menu.classList.remove('open')}
      function hideClientSuggestions(){document.getElementById('orderClientSuggestions')?.classList.remove('open')}

      function setClientMode(mode) {
        state.cart.clientMode = mode;
        const existingBtn = document.getElementById("segExistingClientBtn");
        const newBtn = document.getElementById("segNewClientBtn");
        const selectMode = document.getElementById("clientSelectMode");
        const newMode = document.getElementById("clientNewMode");

        if (mode === 'existing') {
          existingBtn.classList.add("active");
          newBtn.classList.remove("active");
          selectMode.classList.remove("hidden");
          newMode.classList.add("hidden");
        } else {
          newBtn.classList.add("active");
          existingBtn.classList.remove("active");
          newMode.classList.remove("hidden");
          selectMode.classList.add("hidden");
        }
        persistCartState();
      }

      function handleClientSelectChange(val) { selectExistingClient(val); }

      function switchCatalogTab(tab) {
        state.catalogTab = tab;
        const btns = document.querySelectorAll("#catalogSegmentControl .segment");
        btns.forEach(b => b.classList.toggle("active", String(b.getAttribute('onclick')||'').includes(`'${tab}'`)));
        renderServiceCatalog();
      }

      /* UNIFIED SERVICE CATALOG PRESENTATION WITH UNIFIED ADD TO CART BUTTONS */
      function setOrderShopService(service){ state.orderShopService=service||'ALL'; renderServiceCatalog(); }
      function renderServiceCatalog() {
        ensureCatalogCategories();
        const grid=document.getElementById("serviceCatalogGrid"),filters=document.getElementById('orderShopServiceFilters');
        if(!grid)return;
        const selected=state.orderShopService||'ALL';
        if(filters)filters.innerHTML=['ALL',...state.catalogCategories].map(service=>`<button type="button" class="shop-filter-chip ${selected===service?'active':''}" onclick="app.setOrderShopService(decodeURIComponent('${encodeURIComponent(service)}'))">${escapeHtml(service==='ALL'?'All':displayCategory(service))}</button>`).join('');
        grid.innerHTML="";grid.classList.toggle('package-grid',state.catalogTab==='PACKAGE');
        if(state.catalogTab==='SOLO'){
          const items=state.soloServices.filter(item=>selected==='ALL'||String(item.category||'')===selected);
          grid.innerHTML=items.map(item=>`<div class="catalog-item"><div><div class="catalog-title">${escapeHtml(item.name)}</div><div class="catalog-desc">${escapeHtml(item.description||'Item')}</div><div class="catalog-service-tag">${escapeHtml(displayCategory(item.category||''))}</div></div><div class="catalog-price-area"><div class="catalog-current-price">${formatCurrency(item.price)}</div><button class="btn-add-cart" onclick="app.addToCart('${String(item.name).replace(/'/g,"\\'")}', ${Number(item.price||0)}, 'SOLO')">+ Add</button></div></div>`).join('')||`<div class="empty-compact-state"><strong>No items</strong><span>No Shop items are available in this Service.</span></div>`;
        }else{
          const packages=state.packagesList.filter(pkg=>selected==='ALL'||String(pkg.category||'')===selected);
          grid.innerHTML=packages.map(pkg=>{const inclusions=Array.isArray(pkg.includedServiceNames)?pkg.includedServiceNames:String(pkg.description||'').split('\n').map(s=>s.replace(/^•\s*/,'').trim()).filter(Boolean);return `<div class="catalog-item package-card"><div><div class="catalog-title">${escapeHtml(pkg.name)}</div><div class="catalog-service-tag">${escapeHtml(displayCategory(pkg.category||''))}</div><details class="package-inclusions"><summary>${inclusions.length} items · View inclusions</summary><ul class="package-inclusions-list">${inclusions.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></details></div><div class="catalog-price-area"><div class="package-price-stack"><span class="catalog-current-price">${formatCurrency(pkg.sellingPrice)}</span><span class="package-original-price">${formatCurrency(pkg.originalPrice)}</span></div><button class="btn-add-cart" onclick="app.addPackageToCart('${pkg.product_code}')">+ Add</button></div></div>`}).join('')||`<div class="empty-compact-state"><strong>No packages</strong><span>No packages are available in this Service.</span></div>`;
        }
      }

      function addToCart(name, price, type = 'SOLO', qty = 1) {
        const existingIndex = state.cart.items.findIndex(i => i.name === name && i.type === type);
        const catalogItem=(state.soloServices||[]).find(x=>String(x.name||'').toLowerCase()===String(name||'').toLowerCase());
        if (existingIndex > -1) {
          state.cart.items[existingIndex].qty += qty;
        } else {
          state.cart.items.push({ id: 'item_' + Date.now(), name, price: Number(price), type, qty, item_discount:0, product_code:catalogItem?.product_code||null, category:catalogItem?.category||'' });
        }
        if(state.cart.startDate&&!state.cart.deadlineManuallySet)state.cart.deadlineDate=addDaysToDateString(state.cart.startDate,standardProductionDaysForCart());
        persistCartState();
        renderCartUI();
        setDefaultOrderDates(false);
        showToast(`Added ${name} to cart.`);
      }
      function addPackageToCart(pkgCode) {
        const pkg = state.packagesList.find(p => p.product_code === pkgCode);
        if (!pkg) return;

        state.cart.items = state.cart.items.filter(i => i.type !== 'PACKAGE');
        
        state.cart.items.push({
          id: 'pkg_' + Date.now(),
          name: pkg.name,
          price: pkg.sellingPrice,
          type: 'PACKAGE',
          qty: 1,
          product_code: pkg.product_code,
          category: pkg.category || '',
          includedItems: pkg.includedServiceNames,
          item_discount: 0
        });

        if(state.cart.startDate&&!state.cart.deadlineManuallySet)state.cart.deadlineDate=addDaysToDateString(state.cart.startDate,standardProductionDaysForCart());
        persistCartState();
        renderCartUI();
        setDefaultOrderDates(false);
        showToast(`${pkg.name} package added to cart.`);
      }

      function updateCartQty(itemId, delta) {
        const item = state.cart.items.find(i => i.id === itemId);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
          state.cart.items = state.cart.items.filter(i => i.id !== itemId);
        }
        if(state.cart.startDate&&!state.cart.deadlineManuallySet)state.cart.deadlineDate=addDaysToDateString(state.cart.startDate,standardProductionDaysForCart());
        persistCartState();
        renderCartUI();
        setDefaultOrderDates(false);
      }

      function updateCartItemDiscount(itemId,value){const item=state.cart.items.find(i=>i.id===itemId);if(!item||String(item.type||'').toUpperCase()==='PACKAGE')return;const line=Math.max(0,Number(item.price||0))*Math.max(1,Number(item.qty||1));item.item_discount=Math.min(line,Math.max(0,Number(value||0)));persistCartState();renderCartUI();}

      function renderCartUI() {
        const container = document.getElementById("cartItemsContainer");
        if (!container) return;
        container.innerHTML = "";

        if (state.cart.items.length === 0) {
          container.innerHTML = `<div class="text-center text-muted py-4">Your cart is empty. Select service/s to add.</div>`;
        } else {
          state.cart.items.forEach(item => {
            container.innerHTML += `
              <div class="cart-item">
                <div class="cart-item-info">
                  <div class="cart-item-name">${item.name}</div>
                  <div class="cart-item-sub">${formatCurrency(item.price)} each</div>
                </div>
                <div class="cart-item-actions cart-item-actions-v69">
                  ${String(item.type||'').toUpperCase()!=='PACKAGE'?`<label class="cart-line-discount">Discount ₱<input type="number" min="0" step="0.01" value="${Number(item.item_discount||0)}" onchange="app.updateCartItemDiscount('${item.id}',this.value)"></label>`:''}
                  <button class="qty-btn" onclick="app.updateCartQty('${item.id}', -1)">-</button>
                  <span class="font-bold text-sm">${item.qty}</span>
                  <button class="qty-btn" onclick="app.updateCartQty('${item.id}', 1)">+</button>
                </div>
              </div>
            `;
          });
        }

        updateCartCalculations();
      }

      function updateCartCalculations() {
        const discountVal = Number(document.getElementById("cartDiscountVal")?.value || 0);
        const discountType = document.getElementById("cartDiscountType")?.value || "fixed";

        if (discountVal < 0) {
          showToast("Discount cannot be negative.");
          return;
        }

        state.cart.discountVal = discountVal;
        state.cart.discountType = discountType;

        let grossSubtotal = 0, itemDiscountTotal = 0;
        state.cart.items.forEach(i => {const line=Number(i.price||0)*Number(i.qty||0);grossSubtotal+=line;if(String(i.type||'').toUpperCase()!=='PACKAGE')itemDiscountTotal+=Math.min(line,Math.max(0,Number(i.item_discount||0)));});
        const subtotal = Math.max(0,grossSubtotal-itemDiscountTotal);

        let discountAmount = 0;
        if (discountType === 'percent') {
          discountAmount = subtotal * (discountVal / 100);
        } else {
          discountAmount = discountVal;
        }
        discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

        const rushFee = Number(state.cart.rushFee || 0);
        const workloadRushFee = Number(state.cart.workloadRushFee || 0);
        const maintenanceFee=state.cart.items.some(i=>String(i.type||'').toUpperCase()==='PACKAGE')?SYSTEM_MAINTENANCE_FEE:0;
        const total = Math.max(0, subtotal - discountAmount + rushFee + workloadRushFee + maintenanceFee);

        document.getElementById("summarySubtotal").innerText = formatCurrency(grossSubtotal); const itemDiscRow=document.getElementById("summaryItemDiscountRow"),itemDiscEl=document.getElementById("summaryItemDiscount");if(itemDiscRow)itemDiscRow.style.display=itemDiscountTotal>0?"flex":"none";if(itemDiscEl)itemDiscEl.innerText=`- ${formatCurrency(itemDiscountTotal)}`;
        document.getElementById("summaryDiscount").innerText = `- ${formatCurrency(discountAmount)}`;

        const rushRow = document.getElementById("summaryRushRow");
        const rushSummary = document.getElementById("summaryRushFee");
        if (rushRow && rushSummary) {
          const combinedRush = rushFee + workloadRushFee;
          rushRow.style.display = combinedRush > 0 ? "flex" : "none";
          rushSummary.innerText = `+ ${formatCurrency(combinedRush)}`;
        }

        const maintenanceRow=document.getElementById("summaryMaintenanceRow"),maintenanceEl=document.getElementById("summaryMaintenance");
        if(maintenanceRow)maintenanceRow.style.display=maintenanceFee>0?"flex":"none";
        if(maintenanceEl)maintenanceEl.innerText=`+ ${formatCurrency(maintenanceFee)}`;
        const additionalLabel=document.getElementById('summaryAdditionalFeesLabel');if(additionalLabel)additionalLabel.style.display=(rushFee+workloadRushFee+maintenanceFee)>0?'flex':'none';
        document.getElementById("summaryTotal").innerText = formatCurrency(total);

        persistCartState();
      }

      function getLocalDateString(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      function addDaysToDateString(dateString, days) {
        const d = new Date(`${dateString}T00:00:00`);
        d.setDate(d.getDate() + days);
        return getLocalDateString(d);
      }

      function setDefaultOrderDates(forceDeadline = false) {
        const startInput = document.getElementById("orderStartDate");
        const deadlineInput = document.getElementById("orderDeadlineDate");
        if (!startInput || !deadlineInput) return;

        const today = getLocalDateString(new Date());
        if (!state.cart.startDate || forceDeadline === true) {
          state.cart.startDate = today;
        }

        startInput.value = state.cart.startDate || today;

        if (!state.cart.deadlineDate || forceDeadline === true || state.cart.deadlineManuallySet === false) {
          state.cart.deadlineDate = addDaysToDateString(startInput.value, standardProductionDaysForCart());
        }

        deadlineInput.value = state.cart.deadlineDate;
        updateRushCalculations();
      }

      function handleStartDateChange() {
        const startInput = document.getElementById("orderStartDate");
        if (!startInput?.value) return;

        state.cart.startDate = startInput.value;

        // Keep the predicted deadline at exactly 14 days unless the user has
        // intentionally changed the deadline. This makes the default timeline
        // predictable without overriding an intentional rush request.
        if (!state.cart.deadlineManuallySet) {
          state.cart.deadlineDate = addDaysToDateString(startInput.value, standardProductionDaysForCart());
          const deadlineInput = document.getElementById("orderDeadlineDate");
          if (deadlineInput) deadlineInput.value = state.cart.deadlineDate;
        }

        updateRushCalculations();
      }

      function handleDeadlineDateChange() {
        const deadlineInput = document.getElementById("orderDeadlineDate");
        if (!deadlineInput?.value) return;
        state.cart.deadlineManuallySet = true;
        updateRushCalculations();
      }

function updateRushCalculations() {
  const startVal=document.getElementById('orderStartDate')?.value,deadVal=document.getElementById('orderDeadlineDate')?.value,rushDisplay=document.getElementById('rushFeeDisplayBox'),durationEl=document.getElementById('orderDurationDays'),badgeEl=document.getElementById('rushFeeBadge'),rushTextEl=document.getElementById('orderRushFeeText');
  if(!startVal||!deadVal){state.cart.rushDaysEarly=0;state.cart.rushFee=0;state.cart.workloadRushRate=0;state.cart.workloadRushFee=0;if(rushDisplay)rushDisplay.style.display='none';updateCartCalculations();return;}
  state.cart.startDate=startVal;state.cart.deadlineDate=deadVal;const start=new Date(`${startVal}T00:00:00`),dead=new Date(`${deadVal}T00:00:00`),durationDays=Math.max(0,Math.round((dead-start)/86400000)),standard=standardProductionDaysForCart(),workloadCount=projectWorkloadDeliverableCountFromItems(state.cart.items),rushCalc=calculateRushFromTimeline(startVal,deadVal,standard,workloadCount),rushFee=rushCalc.fee,workloadRush=calculateWorkloadRushSurcharge(nextProjectNumber(),rushFee);
  state.cart.rushDaysEarly=rushCalc.daysEarly;state.cart.rushFee=rushFee;state.cart.workloadRushRate=workloadRush.rate;state.cart.workloadRushFee=workloadRush.fee;
  if(durationEl)durationEl.textContent=`${durationDays} day${durationDays===1?'':'s'}`;if(badgeEl)badgeEl.textContent=(rushFee+workloadRush.fee)>0?'RUSH':'STANDARD';if(rushTextEl)rushTextEl.textContent=formatCurrency(rushFee+workloadRush.fee);if(rushDisplay)rushDisplay.style.display='block';updateCartCalculations();
}
      /* VALIDATION FOR NEW ORDER */
      function showOrderConfirmation() {
        updateRushCalculations();
        const deadlineErr = document.getElementById("orderDeadlineError");
        if (deadlineErr) deadlineErr.innerText = "";

        if (new Date(`${state.cart.deadlineDate}T00:00:00`) <= new Date(`${state.cart.startDate}T00:00:00`)) {
          if (deadlineErr) deadlineErr.innerText = "Deadline date must be after the start date.";
          showToast("Deadline date must be after the start date.");
          return;
        }

        if (state.cart.items.length === 0) {
          showToast("Please add items to your cart before proceeding.");
          return;
        }

        const projectNameInput = document.getElementById("orderProjectName");
        const projectNameError = document.getElementById("orderProjectNameError");
        const projectName = projectNameInput ? projectNameInput.value.trim() : "";
        if (projectNameError) projectNameError.innerText = "";
        if (!projectName) {
          if (projectNameError) projectNameError.innerText = "Project name is required.";
          showToast("Project name is required.");
          if (projectNameInput) projectNameInput.focus();
          return;
        }
        state.cart.projectName = projectName;
        persistCartState();

        let clientName = "";
        const clientSelErr = document.getElementById("orderClientSelectError");
        if (clientSelErr) clientSelErr.innerText = "";

        if (state.cart.clientMode === 'existing') {
          const client = state.clients.find(c => c.id === state.cart.selectedClientId);
          if (!client) {
            if (clientSelErr) clientSelErr.innerText = "Please select a client.";
            showToast("Please select a client.");
            return;
          }
          clientName = client.name;
        } else {
          clientName = document.getElementById("newClientName").value.trim();
          const email = document.getElementById("newClientEmail").value.trim();
          const emailErr = document.getElementById("newClientEmailError");
          if (emailErr) emailErr.innerText = "";

          if (!clientName) {
            document.getElementById("newClientNameError").innerText = "Client name is required.";
            showToast("Client name is required.");
            return;
          }
          if (!email || !email.includes("@")) {
            if (emailErr) emailErr.innerText = "Please enter a valid email address.";
            showToast("Please enter a valid email address.");
            return;
          }
        }

        const body = document.getElementById("orderSummaryModalBody");
        body.innerHTML = `
          <div class="mb-4"><strong>Project Name:</strong> ${escapeHtml(projectName)}</div>
          <div class="mb-4"><strong>Client:</strong> ${escapeHtml(clientName)}</div>
          <div class="mb-4"><strong>Start Date:</strong> ${state.cart.startDate}</div>
          <div class="mb-4"><strong>Deadline Date:</strong> ${state.cart.deadlineDate}</div>
          <div class="divider"></div>
          <div class="font-bold mb-2">Order Items:</div>
          ${state.cart.items.map(i => `<div class="summary-row"><span>${escapeHtml(i.name)} (x${Math.max(1,Number(i.qty||1))})</span><span>${formatCurrency(i.price * i.qty)}</span></div>`).join("")}
          <div class="divider"></div>
          ${(Number(state.cart.rushFee||0)+Number(state.cart.workloadRushFee||0)+ (state.cart.items.some(i=>String(i.type||'').toUpperCase()==='PACKAGE')?SYSTEM_MAINTENANCE_FEE:0))>0?`<div class="summary-section-label additional-fees-heading">Additional Fees <button type="button" class="inline-info-button" onclick="app.openFeeInfo('all')">i</button></div>`:''}${(Number(state.cart.rushFee||0)+Number(state.cart.workloadRushFee||0))>0?`<div class="summary-row compact-fee-row"><span>Rush Fee</span><span>${formatCurrency(Number(state.cart.rushFee||0)+Number(state.cart.workloadRushFee||0))}</span></div>`:''}${state.cart.items.some(i=>String(i.type||'').toUpperCase()==='PACKAGE')?`<div class="summary-row compact-fee-row"><span>System Maintenance Fee</span><span>${formatCurrency(SYSTEM_MAINTENANCE_FEE)}</span></div>`:''}
          <div class="summary-row summary-total"><span>Total Amount</span><span>${document.getElementById("summaryTotal").innerText}</span></div>
        `;

        openModal("orderSummaryModal");
      }

      async function syncProjectToDatabase(project) {
        if (!supabaseClient || !state.isConnected || !project) return;
        try { await syncProjectBundleToDatabase(project); showToast("Project synchronized successfully."); }
        catch (e) { console.error("Project sync retry failed:", e); showToast(`Project sync failed: ${e.message || e}`); }
      }

      async function syncPaymentToDatabase(project, payment) {
        if (!supabaseClient || !state.isConnected || !project || !payment) return;
        try {
          const { error } = await supabaseClient.from('payments').insert([{
            project_id: project.id,
            amount_paid: payment.amount_paid,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            reference_no: payment.reference_no
          }]);
          if (error) throw error;
          showToast("Payment synchronized successfully.");
        } catch (e) {
          console.error("Payment sync retry failed:", e);
          showToast(`Payment sync failed: ${e.message || e}`);
        }
      }

      async function syncClientToDatabase(client) {
        if (!supabaseClient || !state.isConnected || !client) return;
        try {
          const { error } = await supabaseClient.from('clients').update({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            notes: client.notes
          }).eq('id', client.id);
          if (error) throw error;
          showToast("Client synchronized successfully.");
        } catch (e) {
          console.error("Client sync retry failed:", e);
          showToast(`Client sync failed: ${e.message || e}`);
        }
      }

      async function syncNewClientToDatabase(client) {
        if (!supabaseClient || !state.isConnected || !client) return;
        try {
          const { error } = await supabaseClient.from('clients').insert([{
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address
          }]);
          if (error) throw error;
          showToast("Client synchronized successfully.");
        } catch (e) {
          console.error("New client sync retry failed:", e);
          showToast(`Client sync failed: ${e.message || e}`);
        }
      }


      function getPackageInclusionNames(packageCode, fallbackItem) {
        const code = String(packageCode || "").trim().toUpperCase();
        const pkg = (state.packagesList || []).find(p =>
          String(p.product_code || "").trim().toUpperCase() === code
        );

        if (pkg && Array.isArray(pkg.includedServiceNames)) {
          return pkg.includedServiceNames.filter(Boolean).map(String);
        }

        if (pkg && pkg.description) {
          return String(pkg.description)
            .split("\n")
            .map(s => s.replace(/^•\s*/, "").trim())
            .filter(Boolean);
        }

        if (fallbackItem && Array.isArray(fallbackItem.includedItems)) {
          return fallbackItem.includedItems.filter(Boolean).map(String);
        }

        return [];
      }

      function buildOrderedDeliverables() {
        const result=[];
        (state.cart.items||[]).forEach((item,itemIndex)=>{
          if(!item.id)item.id=`item_${Date.now()}_${itemIndex}`;
          const qty=Math.max(1,Math.round(Number(item.qty||1)));
          for(let occurrence=1;occurrence<=qty;occurrence++)result.push({id:`del_${Date.now()}_${itemIndex}_${occurrence}_${Math.random().toString(36).slice(2,7)}`,item_name:item.name,name:item.name,source_type:'ORDER_ITEM',order_item_id:item.id,order_item_occurrence:occurrence,completed:false,progress:0,status:'Pending',completed_at:null});
        });
        return result;
      }
      async function confirmAndCreateOrder() {
        let clientId = state.cart.selectedClientId;
        let clientName = "";
        let clientEmail = "";

        if (state.cart.clientMode === 'new') {
          clientName = document.getElementById("newClientName").value.trim();
          clientEmail = document.getElementById("newClientEmail").value.trim();
          const phone = normalizePhilippinePhone(document.getElementById("newClientPhone").value);
          const address = document.getElementById("newClientAddress").value.trim();

          const newClient = { id: 'client_' + Date.now(), name: clientName, email: clientEmail, phone, address };
          state.clients.push(newClient);
          clientId = newClient.id;
          persistClientsState();

          if (supabaseClient && state.isConnected) {
            try {
              const { error } = await supabaseClient.from('clients').upsert([{ id: clientId, name: clientName, email: clientEmail, phone, address }]);
              if (error) throw error;
            } catch (e) {
              console.error("Database operation failed while creating client:", e);
              showToast("Warning: Client was saved locally, but could not sync to the database.", "Retry", () => syncNewClientToDatabase(newClient));
            }
          }
        } else {
          const existing = state.clients.find(c => c.id === clientId);
          clientName = existing.name;
          clientEmail = existing.email;
        }

        let grossSubtotal = 0, itemDiscountTotal = 0;
        state.cart.items.forEach(i => {const line=Number(i.price||0)*Number(i.qty||0);grossSubtotal+=line;if(String(i.type||'').toUpperCase()!=='PACKAGE')itemDiscountTotal+=Math.min(line,Math.max(0,Number(i.item_discount||0)));});
        const subtotal=Math.max(0,grossSubtotal-itemDiscountTotal);
        let discount = state.cart.discountType === 'percent' ? subtotal * (state.cart.discountVal / 100) : state.cart.discountVal;
        const rushFee = Number(state.cart.rushFee || 0);
        const newProjectNumber=nextProjectNumber();
        const workloadRush=calculateWorkloadRushSurcharge(newProjectNumber,rushFee);
        const workloadRushFee=Number(workloadRush.fee||0);
        const totalAmount = Math.max(0, subtotal - discount + rushFee + workloadRushFee);

        const projectTitle = state.cart.projectName.trim();

        const newProject = {
          id: 'proj_' + Date.now(),
          project_number: newProjectNumber,
          client_id: clientId,
          client_name: clientName,
          client_email: clientEmail,
          title: projectTitle,
          status: "In Progress",
          delivery_status: "Pending",
          start_date: state.cart.startDate,
          deadline_date: state.cart.deadlineDate,
          deadline_auto: !state.cart.deadlineManuallySet,
          payment_due_date: "",
          total_amount: totalAmount,
          subtotal_amount: subtotal,
          discount_amount: discount,
          rush_fee: rushFee,
          workload_rush_rate: Number(workloadRush.rate||0),
          workload_rush_fee: workloadRushFee,
          workload_at_booking: Number(workloadRush.active||0),
          rush_days_early: Number(state.cart.rushDaysEarly || 0),
          rush_base_fee: Number(calculateRushFromTimeline(state.cart.startDate,state.cart.deadlineDate,standardProductionDaysForCart(),projectWorkloadDeliverableCountFromItems(state.cart.items)).baseFee||0),
          rush_load_factor: Number(calculateRushFromTimeline(state.cart.startDate,state.cart.deadlineDate,standardProductionDaysForCart(),projectWorkloadDeliverableCountFromItems(state.cart.items)).loadFactor||1),
          rush_project_workload: Number(projectWorkloadDeliverableCountFromItems(state.cart.items)||0),
          system_maintenance_charge: state.cart.items.some(i=>String(i.type||'').toUpperCase()==='PACKAGE') ? SYSTEM_MAINTENANCE_FEE : 0,
          project_type: "",
          priority: (()=>{const start=parseDateSafe(state.cart.startDate),due=parseDateSafe(state.cart.deadlineDate),standard=standardProductionDaysForCart(),days=start&&due?Math.ceil((due-start)/86400000):standard;return rushFee>0||days<standard;})(),
          project_items: state.cart.items.map((i,index) => ({ id:i.id||`oi_new_${Date.now()}_${index}`, name: i.name, price: i.price, qty: i.qty, type: i.type, item_discount:String(i.type||'').toUpperCase()==='PACKAGE'?0:Number(i.item_discount||0), product_code:i.product_code||i.code||null, category:i.category||"" })),
          included_revisions: 0,
          revision_count: 0,
          revision_fee_per_revision: getFeeAmount('REVISION',REVISION_FEE_PER_REVISION),
          additional_revision_fee: getFeeAmount('REVISION',REVISION_FEE_PER_REVISION),
          notes: "",
          created_at: new Date().toISOString(),
          invoice_number: null,
          invoice_issue_date: getLocalDateString(new Date()),
          invoice_due_date: "",
          deleted: false,
          deliverables: buildOrderedDeliverables(),
          payments: []
        };

        state.projects.unshift(newProject);
        persistProjectsState();

        if (supabaseClient && state.isConnected) {
          try { await syncProjectBundleToDatabase(newProject); }
          catch(e) { console.error("Database operation failed while creating project:", e); showToast("Warning: Project was saved locally, but could not sync to the database.", "Retry", () => syncProjectToDatabase(newProject)); }
        }

        // A successful order always leaves New Order blank for the next entry.
        if(state.editingDraftId){deleteOrderDraft(state.editingDraftId,true);state.editingDraftId=null;}
        resetNewOrderForm(true);

        closeModal("orderSummaryModal");
        showToast("Order created successfully!");
        openProjectDetails(newProject.id);
      }

      /* ==========================================================================
         PROJECT DETAILS & PAYMENTS PERSISTENCE
         ========================================================================== */
      function ensureInvoiceNumber(proj) {
        if (!proj) return null;
        const sourceDate = parseDateSafe(proj.start_date) || parseDateSafe(proj.record_date) || parseDateSafe(proj.created_at) || new Date();
        const year = sourceDate.getFullYear();
        const desired = `${formatProjectId(proj)}-${year}`;
        if (proj.invoice_number !== desired) proj.invoice_number = desired;
        proj.invoice_issue_date = proj.invoice_issue_date || (proj.start_date || proj.record_date || String(proj.created_at || '').slice(0,10) || new Date().toISOString().slice(0,10));
        proj.invoice_due_date = proj.invoice_due_date || proj.payment_due_date || proj.deadline_date || "";
        persistProjectsState();
        return proj.invoice_number;
      }

      function getProjectPaymentStatus(proj){
        const total=getProjectInvoiceTotal(proj),paid=Math.max(0,getProjectPaid(proj)),balance=Math.max(0,total-paid);
        if(total>0&&balance<=0)return 'Completed';
        if(paid>0)return 'Downpayment';
        return 'Pending';
      }

      function getInvoiceStatus(proj, balance) {
        if (balance <= 0 && Number(proj.total_amount) > 0) return "PAID";
        const paid=getProjectPaid(proj);
        if (paid > 0) return "DOWNPAYMENT";
        return "UNPAID";
      }

      function switchProjectTab(tab, event) {
        document.querySelectorAll('#view-project-details .tab-content').forEach(el => el.classList.remove('active'));
        const target=document.getElementById(`projTab-${tab}`);if(target)target.classList.add('active');
        document.querySelectorAll('#view-project-details .tab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.projectTab===tab));
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;
        if(tab==='project-data')populateProjectData(proj);
        if(tab==='payment-tracker')renderPaymentTracker(proj);
        if(tab==='invoice')renderInvoicePaper(proj);
        if(tab==='notes'){const notes=document.getElementById('projectNotesTextarea');notes.value=proj.notes||'';enforceWordLimit(notes,120,'projectNotesWordCount');}
      }

      async function saveInvoicePDF() {
        const proj=state.projects.find(p=>p.id===state.activeProjectId);
        if(proj){ensureInvoiceNumber(proj);renderInvoicePaper(proj);}
        showToast("Use your browser Print dialog and choose Save as PDF.");
        setTimeout(() => window.print(), 100);
      }

      async function saveInvoiceImage() {
        showToast("Offline mode does not require external image libraries. Use Save as PDF or your device screenshot tool.");
      }


      function openEditProjectModal(projectId) {
        if(projectId) state.activeProjectId=projectId;
        const proj=state.projects.find(p=>p.id===state.activeProjectId); if(!proj)return;
        document.getElementById("editProjectTitle").value = proj.title || "";
        ensureCatalogCategories();
        const categoryInput=document.getElementById("editProjectType"),categorySuggestions=document.getElementById('editProjectCategorySuggestions');
        categoryInput.value=proj.project_type || getProjectType(proj) || "";
        if(categorySuggestions) categorySuggestions.innerHTML=(state.catalogCategories||[]).map(category=>`<option value="${escapeHtml(category)}"></option>`).join('');
        document.getElementById("editProjectClientName").value = proj.client_name || "";
        document.getElementById("editProjectClientEmail").value = proj.client_email || "";
        document.getElementById("editProjectAmount").value = Number(proj.total_amount || 0);
        document.getElementById("editProjectLegacyRef").value = proj.legacy_reference || proj.invoice_number || "";
        document.getElementById("editProjectRecordDate").value = proj.record_date || proj.start_date || String(proj.created_at || "").slice(0,10);
        document.getElementById("editProjectStartDate").value = proj.start_date || String(proj.created_at || "").slice(0,10);
        document.getElementById("editProjectDeadline").value = proj.deadline_date || "";
        document.getElementById("editProjectPriority").value = projectIsPriority(proj)?'YES':'NO';
        const paid=getProjectPaid(proj),pending=getProjectBalance(proj);
        document.getElementById("editProjectAmountReceived").value = paid;
        document.getElementById("editProjectPendingAmount").value = pending;
        document.getElementById("editProjectPaymentStatus").value = proj.payment_status || getInvoiceStatus(proj,pending);
        document.getElementById("editProjectCompletedToggle").checked = proj.status==="Completed" || proj.delivery_status==="Delivered";
        openModal("editProjectModal");
      }
      function submitEditProject(){
        const proj=state.projects.find(p=>p.id===state.activeProjectId); if(!proj)return;
        const title=document.getElementById("editProjectTitle").value.trim(),clientName=document.getElementById("editProjectClientName").value.trim(),email=document.getElementById("editProjectClientEmail").value.trim();
        if(!title||!clientName){showToast("Project and client name are required.");return;} if(email&&!email.includes('@')){showToast("Please enter a valid client email.");return;}
        proj.title=title; proj.project_type=document.getElementById("editProjectType").value.trim(); proj.client_name=clientName; proj.client_email=email;
        proj.total_amount=Math.max(0,Number(document.getElementById("editProjectAmount").value||0)); proj.legacy_reference=document.getElementById("editProjectLegacyRef").value.trim(); proj.record_date=document.getElementById("editProjectRecordDate").value; proj.start_date=document.getElementById("editProjectStartDate").value; proj.deadline_date=document.getElementById("editProjectDeadline").value;
        proj.priority=document.getElementById('editProjectPriority').value==='YES';
        const received=Math.max(0,Number(document.getElementById("editProjectAmountReceived").value||0)); const pendingInput=Math.max(0,Number(document.getElementById("editProjectPendingAmount").value||0)); proj.payment_status=document.getElementById("editProjectPaymentStatus").value.trim(); proj.pending_amount=pendingInput;
        proj.payments=received>0?[{id:(proj.payments?.[0]?.id||('pay_hist_'+proj.id)),amount_paid:received,amount:received,payment_date:proj.record_date||proj.start_date||String(proj.created_at||'').slice(0,10),method:proj.payments?.[0]?.method||'Historical Record',reference_number:proj.payments?.[0]?.reference_number||'',notes:proj.payments?.[0]?.notes||'',created_at:proj.payments?.[0]?.created_at||proj.created_at||new Date().toISOString()}]:[];
        const completed=document.getElementById("editProjectCompletedToggle").checked; proj.status=completed?"Completed":"In Progress"; proj.delivery_status=completed?"Delivered":"In Production"; if(completed) proj.archived_at=proj.archived_at||new Date().toISOString(); else proj.archived_at=null; proj.updated_at=new Date().toISOString();
        const client=state.clients.find(c=>c.id===proj.client_id)||state.clients.find(c=>String(c.email||'').toLowerCase()===email.toLowerCase()); if(client){client.name=clientName;if(email)client.email=email;}
        persistProjectsState(); persistClientsState(); closeModal("editProjectModal"); openProjectDetails(proj.id); renderOverviewDashboard(); renderProjects(); showToast("Project record updated.");
      }
      function openProjectDetails(projId, initialTab='deliverables') {
        state.activeProjectId=projId;
        const proj=state.projects.find(p=>p.id===projId);if(!proj)return;
        if(Array.isArray(proj.project_items)&&proj.project_items.some(i=>String(i.type||'').toUpperCase()==='HISTORY')&&Array.isArray(proj.deliverables)&&proj.deliverables.length===1&&String(proj.deliverables[0].item_name||proj.deliverables[0].name||'')===String(proj.project_type||'')){proj.deliverables=[];persistProjectsState();}
        const hasOldAutoDeliverables=Array.isArray(proj.deliverables)&&proj.deliverables.some(d=>d.order_item_id&&String(d.source_type||'').toUpperCase()!=='ORDER_ITEM');
        if(hasOldAutoDeliverables&&Array.isArray(proj.project_items)&&!proj.project_items.some(i=>String(i.type||'').toUpperCase()==='HISTORY')){syncProjectDeliverablesFromOrderItems(proj);persistProjectsState();}
        document.getElementById('projDetailTitle').innerText=proj.title||'Untitled Project';
        document.getElementById('projDetailClient').innerText=[formatProjectId(proj),proj.client_email||'No email'].join('  |  ');
        populateProjectData(proj);
        renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);
        document.getElementById('projectNotesTextarea').value=proj.notes||'';
        navigateTo('project-details');
        switchProjectTab(initialTab||'deliverables');
      }

      function getProjectClientRecord(proj){
        return state.clients.find(c=>String(c.id)===String(proj?.client_id))||state.clients.find(c=>String(c.email||'').toLowerCase()===String(proj?.client_email||'').toLowerCase())||null;
      }
      function populateProjectData(proj){
        if(!proj)return;const client=getProjectClientRecord(proj)||{};
        const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
        set('projectDataClientName',proj.client_name||client.name||'');set('projectDataClientEmail',proj.client_email||client.email||'');set('projectDataClientPhone',proj.client_phone||client.phone||'');set('projectDataClientAddress',proj.client_address||client.address||'');
        set('projectDataProjectId',formatProjectId(proj));set('projectDataProjectName',proj.title||'');set('projectDataStartDate',proj.start_date||'');set('projectDataDeadline',proj.deadline_date||'');setTimeout(()=>refreshProjectDataRushPreview(false),0);
        const priorityEl=document.getElementById('projectDataPriority');if(priorityEl)priorityEl.checked=projectIsPriority(proj);
      }
      function openProjectData(projId){
        if(projId&&projId!==state.activeProjectId){openProjectDetails(projId);setTimeout(()=>switchProjectTab('project-data'),0);return;}
        switchProjectTab('project-data');
      }
      function openProjectDataClientProfile(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;const client=getProjectClientRecord(proj);if(!client){showToast('No linked client profile was found.');return;}openClientProfile(client.id);}
      function refreshProjectDataRushPreview(forceDeadline=false){
        const startEl=document.getElementById('projectDataStartDate'),deadlineEl=document.getElementById('projectDataDeadline'),live=document.getElementById('projectDataRushLive');
        if(!startEl||!deadlineEl)return;
        const proj=state.projects.find(p=>p.id===state.activeProjectId);const standard=standardProductionDaysForProject(proj);if(startEl.value && (forceDeadline || !deadlineEl.value)) deadlineEl.value=addDaysToDateString(startEl.value,standard);
        const calc=calculateRushFromTimeline(startEl.value,deadlineEl.value,standard,projectWorkloadDeliverableCount(proj));
        const workload=calculateWorkloadRushSurcharge(proj?projectNumber(proj):nextProjectNumber(),calc.fee,proj?.id||'',proj?.workload_at_booking);
        if(live){
          if(calc.duration===null)live.innerHTML='';
          else if(calc.fee>0) live.innerHTML=`<span>${calc.duration} day timeline</span><strong class="rush-live-active">Rush Fee ${formatCurrency(calc.fee+Number(workload.fee||0))}</strong>`;
          else live.innerHTML=`<span>${calc.duration} day timeline</span><strong>Standard ${standard}-day production</strong>`;
        }
      }
      function handleProjectDataStartDateChange(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(proj)proj.deadline_auto=true;refreshProjectDataRushPreview(true); scheduleProjectDataAutosave(); }
      function handleProjectDataDeadlineChange(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(proj)proj.deadline_auto=false;refreshProjectDataRushPreview(false); scheduleProjectDataAutosave(); }

      let projectDataAutosaveTimer=null;
      function scheduleProjectDataAutosave(){
        clearTimeout(projectDataAutosaveTimer);
        projectDataAutosaveTimer=setTimeout(()=>autosaveProjectData(),260);
      }
      function autosaveProjectData(){
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;
        const previousStart=proj.start_date||'',previousDeadline=proj.deadline_date||'';
        proj.title=document.getElementById('projectDataProjectName')?.value??proj.title??'';
        proj.start_date=document.getElementById('projectDataStartDate')?.value||'';
        proj.deadline_date=document.getElementById('projectDataDeadline')?.value||'';
        
        if(proj.delivery_status!=='Delivered'){proj.payment_due_date='';proj.invoice_due_date='';}
        const start=parseDateSafe(proj.start_date),due=parseDateSafe(proj.deadline_date),rushCalc=calculateRushFromTimeline(proj.start_date,proj.deadline_date,standardProductionDaysForProject(proj),projectWorkloadDeliverableCount(proj));
        if(start&&due){
          proj.rush_days_early=rushCalc.daysEarly;
          proj.rush_fee=rushCalc.fee;
          const workload=calculateWorkloadRushSurcharge(projectNumber(proj),rushCalc.fee,proj.id,proj.workload_at_booking);
          proj.workload_rush_rate=workload.rate;proj.workload_rush_fee=workload.fee;proj.workload_at_booking=workload.active;
          if(Array.isArray(proj.project_items)&&proj.project_items.length)recalculateProjectFromOrderItems(proj);
        }
        const standard=standardProductionDaysForProject(proj);const autoPriority=Number(proj.rush_fee||0)>0||Number(proj.rush_days_early||0)>0||!!(start&&due&&Math.ceil((due-start)/86400000)<standard);
        proj.priority=autoPriority||!!document.getElementById('projectDataPriority')?.checked;
        const priorityEl=document.getElementById('projectDataPriority');if(priorityEl&&autoPriority)priorityEl.checked=true;
        proj.updated_at=new Date().toISOString();
        persistProjectsState();
        const titleEl=document.getElementById('projDetailTitle'),clientEl=document.getElementById('projDetailClient');if(titleEl)titleEl.innerText=proj.title||'Untitled Project';if(clientEl)clientEl.innerText=[formatProjectId(proj),proj.client_email||'No email'].join('  |  ');
        renderProjectOrderItems(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);
      }
      function saveProjectData(){autosaveProjectData();}

      function renderProjectTasks(proj) {
        const box=document.getElementById("projectTasksList"); if(!box)return;
        const tasks=state.tasks.filter(t=>t.project_id===proj.id);
        box.innerHTML=tasks.map(t=>`<div class="task-row" style="grid-template-columns:1.5fr 110px 120px 100px"><div><div class="task-title">${escapeHtml(t.name)}</div><div class="task-meta">${escapeHtml(t.deliverableName||"General task")}</div></div><span class="badge ${t.priority==='Urgent'||t.priority==='High'?'badge-red':'badge-neutral'}">${escapeHtml(t.priority||"Normal")}</span><span>${escapeHtml(t.deadline||"—")}</span><label class="toggle-switch" title="Mark task complete"><input type="checkbox" ${t.status==='Completed'?'checked':''} onchange="app.updateTaskStatus('${t.id}',this.checked?'Completed':'Not Started')"><span class="toggle-slider"></span></label></div>`).join("")||`<div class="text-muted py-4">No tasks for this project yet.</div>`;
      }

      function renderProjectDeliverablesList(proj) {
        const container=document.getElementById('projectDeliverablesList');if(!container)return;
        const ds=Array.isArray(proj.deliverables)?proj.deliverables:[];ds.forEach((d,i)=>{d.id=d.id||`del_${proj.id}_${i}`;d.item_name=d.item_name||d.name||'Deliverable';d.completed=!!d.completed||String(d.status||'').toLowerCase()==='completed';d.progress=d.completed?100:Number(d.progress||0);d.status=d.completed?'Completed':'Pending';});
        ds.filter(d=>d.is_group).forEach(parent=>{const children=ds.filter(c=>String(c.parent_id||'')===String(parent.id));if(children.length){parent.completed=children.every(c=>c.completed);parent.progress=Math.round(children.reduce((s,c)=>s+(c.completed?100:Number(c.progress||0)),0)/children.length);parent.status=parent.completed?'Completed':'Pending';}});
        const countable=ds.filter(d=>!d.is_group),completed=countable.filter(d=>d.completed).length,percent=countable.length?Math.round(completed/countable.length*100):0;const setText=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v};setText('projDetailProgressCount',`${completed} / ${countable.length} completed`);setText('projDetailProgressPercent',`${percent}%`);const bar=document.getElementById('projDetailProgressBar');if(bar)bar.style.width=`${percent}%`;const overallBar=document.getElementById('projectOverallProgressBar'),overallPct=document.getElementById('projectOverallProgressPercent'),overallCount=document.getElementById('projectOverallProgressCount');if(overallBar)overallBar.style.width=`${percent}%`;if(overallPct)overallPct.textContent=`${percent}%`;if(overallCount)overallCount.textContent=`${completed} / ${countable.length}`;
        if(!ds.length){container.innerHTML=`<div class="empty-compact-state"><strong>No deliverables yet</strong><span>Add order items in Project Data. They will appear here automatically.</span></div>`;return;}
        const roots=ds.filter(d=>!d.parent_id);const row=(d,child=false)=>{const menuId=`deliverableMenu_${String(d.id).replace(/[^a-zA-Z0-9_-]/g,'')}`,progress=d.is_group?Number(d.progress||0):(d.completed?100:Number(d.progress||0));return `<div class="deliverable-checklist-row ${child?'deliverable-child-row':''} ${d.completed?'is-complete':''}"><button type="button" class="deliverable-check ${d.completed?'checked':''}" aria-pressed="${d.completed?'true':'false'}" onclick="app.toggleDeliverable('${proj.id}','${String(d.id).replace(/'/g,"\'")}')"><svg class="icon-svg sm" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></button><div class="deliverable-checklist-copy"><strong>${escapeHtml(d.item_name)}</strong>${d.is_group?`<span>${ds.filter(c=>String(c.parent_id||'')===String(d.id)).filter(c=>c.completed).length}/${ds.filter(c=>String(c.parent_id||'')===String(d.id)).length} included items</span>`:''}</div><div class="deliverable-item-progress"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${progress}%"></div></div><span>${Math.round(progress)}%</span></div><div class="popover-wrap" id="${menuId}"><button class="icon-more-button" onclick="event.stopPropagation();app.togglePopover('${menuId}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action text-danger" onclick="event.stopPropagation();app.deleteProjectDeliverable('${String(d.id).replace(/'/g,"\'")}')">Remove Deliverable</button></div></div></div>`};
        container.innerHTML=`<div class="deliverable-checklist">${roots.map(root=>`<div class="deliverable-group-block">${row(root,false)}${ds.filter(c=>String(c.parent_id||'')===String(root.id)).map(c=>row(c,true)).join('')}</div>`).join('')}</div>`;
      }
function recalculateProjectFromOrderItems(proj) {
  const items = Array.isArray(proj.project_items) ? proj.project_items : [];
  const grossSubtotal = items.reduce((sum,item) => sum + Math.max(0,Number(item.price||0)) * Math.max(1,Number(item.qty||1)), 0);
  const itemDiscountTotal=items.reduce((sum,item)=>{if(['PACKAGE','ADDON'].includes(String(item.type||'').toUpperCase()))return sum;const line=Math.max(0,Number(item.price||0))*Math.max(1,Number(item.qty||1));return sum+Math.min(line,Math.max(0,Number(item.item_discount||0)));},0);
  const subtotal=Math.max(0,grossSubtotal-itemDiscountTotal);
  proj.subtotal_amount = subtotal;proj.item_discount_amount=itemDiscountTotal;
  proj.system_maintenance_charge=items.some(i=>String(i.type||'').toUpperCase()==='PACKAGE')?SYSTEM_MAINTENANCE_FEE:0;
  const discount = Math.max(0, Number(proj.discount_amount || 0));
  const stdDays=standardProductionDaysForProject(proj);
  if(proj.start_date&&(!proj.deadline_date||proj.deadline_auto===true)){proj.deadline_date=addDaysToDateString(proj.start_date,stdDays);proj.deadline_auto=true;}
  proj.standard_production_days=stdDays;
  if(proj.start_date&&proj.deadline_date){const rushCalc=calculateRushFromTimeline(proj.start_date,proj.deadline_date,stdDays,projectWorkloadDeliverableCountFromItems(items));proj.rush_days_early=rushCalc.daysEarly;proj.rush_fee=rushCalc.fee;proj.rush_base_fee=rushCalc.baseFee;proj.rush_load_factor=rushCalc.loadFactor;proj.rush_project_workload=rushCalc.deliverableCount;}
  const rush = Math.max(0, Number(proj.rush_fee || 0));
  const workload=calculateWorkloadRushSurcharge(projectNumber(proj),rush,proj.id,proj.workload_at_booking);
  proj.workload_rush_rate=workload.rate;proj.workload_rush_fee=workload.fee;if(!Number.isFinite(Number(proj.workload_at_booking)))proj.workload_at_booking=workload.active;
  proj.total_amount = Math.max(0, subtotal - discount + rush + Number(workload.fee||0));proj.pending_amount = Math.max(0, getProjectInvoiceTotal(proj) - getProjectPaid(proj));
  if(!proj.project_type){const cats=[...new Set(items.filter(i=>!['ADDON','REQUEST'].includes(String(i.type||'').toUpperCase())).map(i=>String(i.category||'').trim()).filter(Boolean))];proj.project_type=cats.length===1?cats[0]:(cats.length>1?'Mixed Services':'');}
  proj.updated_at = new Date().toISOString();
}
      function syncProjectDeliverablesFromOrderItems(proj){
        if(!proj)return false;
        const items=Array.isArray(proj.project_items)?proj.project_items:[],old=Array.isArray(proj.deliverables)?proj.deliverables:[];
        const manual=old.filter(d=>String(d.source_type||'').toUpperCase()==='MANUAL'||(!d.order_item_id&&String(d.source_type||'').toUpperCase()!=='ORDER_ITEM'));
        const norm=v=>String(v||'').trim().toLowerCase();
        const oldByKey=new Map();old.forEach(d=>{const key=[d.order_item_id||'',d.order_item_occurrence||1,d.parent_key||'',norm(d.item_name||d.name)].join('|');if(!oldByKey.has(key))oldByKey.set(key,d)});
        const fresh=[];
        const make=(item,occ,name,extra={})=>{const key=[item.id,occ,extra.parent_key||'',norm(name)].join('|'),prev=oldByKey.get(key);return {...(prev||{}),id:prev?.id||`del_${proj.id}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,item_name:name,name,source_type:'ORDER_ITEM',order_item_id:item.id,order_item_occurrence:occ,completed:!!prev?.completed,progress:prev?.completed?100:Number(prev?.progress||0),status:prev?.completed?'Completed':'Pending',completed_at:prev?.completed_at||null,...extra};};
        items.filter(item=>!['ADDON','REQUEST'].includes(String(item.type||'').toUpperCase())).forEach((item,itemIndex)=>{
          if(!item.id)item.id=`oi_${proj.id}_${Date.now()}_${itemIndex}_${Math.random().toString(36).slice(2,6)}`;
          const qty=Math.max(1,Math.round(Number(item.qty||1))),isPackage=String(item.type||'').toUpperCase()==='PACKAGE';
          const pkg=(state.packagesList||[]).find(p=>String(p.product_code||'')===String(item.product_code||'')||norm(p.name)===norm(item.name));const inclusions=isPackage?[...(pkg?.includedServiceNames||[])]:[];
          for(let occ=1;occ<=qty;occ++){
            if(isPackage&&inclusions.length){
              const parentKey=`${item.id}_${occ}_package`;const parent=make(item,occ,item.name,{is_group:true,parent_key:'',group_key:parentKey,package_name:item.name});fresh.push(parent);
              inclusions.forEach((name,idx)=>fresh.push(make(item,occ,name,{parent_id:parent.id,parent_key:parentKey,package_name:item.name,is_group:false,child_index:idx})));
            }else fresh.push(make(item,occ,item.name,{is_group:false,parent_key:'',package_name:''}));
          }
        });
        proj.deliverables=[...fresh,...manual];proj.updated_at=new Date().toISOString();return true;
      }
function renderProjectOrderItems(proj) {
  const box=document.getElementById('projectOrderItemsList'); if(!box||!proj)return;
  if(!Array.isArray(proj.project_items)) proj.project_items = Array.isArray(proj.items) ? proj.items : [];
  const items=proj.project_items;
  const rows=items.length ? items.map((item,index)=>{
    const type=String(item.type||'').toUpperCase();
    const rawCategory=String(item.category||'').trim();
    const visibleCategory=type==='PACKAGE'?'Package':type==='ADDON'?(String(item.addon_type||'').toUpperCase()==='REVISION'?'Revision Request':String(item.addon_type||'').toUpperCase()==='PROJECT_FILE'?'Project File Request':'Additional Item'):(!rawCategory||['SOLO','SERVICE','ITEM'].includes(rawCategory.toUpperCase())?'Item':rawCategory);
    const line=Number(item.price||0)*Math.max(1,Number(item.qty||1)),lineDisc=['PACKAGE','ADDON'].includes(type)?0:Math.min(line,Math.max(0,Number(item.item_discount||0))),net=line-lineDisc,menuId=`orderItemMenu_${index}`;
    return `<div class="order-item-row"><div class="order-item-main"><strong>${escapeHtml(item.name||'Untitled Item')}</strong><span>${escapeHtml(visibleCategory)}${item.source_item_name?` · ${escapeHtml(item.source_item_name)}`:''} · Qty ${Math.max(1,Number(item.qty||1))}${lineDisc?` · Discount ${formatCurrency(lineDisc)}`:''}</span></div><div class="order-item-price"><strong>${formatCurrency(net)}</strong><span>${formatCurrency(Number(item.price||0))} each</span></div><div class="order-item-actions"><div class="popover-wrap" id="${menuId}"><button class="icon-more-button vertical-more" title="Order item options" onclick="app.togglePopover('${menuId}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openProjectOrderItemModal(${index})">Edit Order Item</button><button class="popover-action text-danger" onclick="app.requestDeleteProjectOrderItem(${index},event)">Remove Order Item</button></div></div></div></div>`;
  }).join('') : `<div class="text-muted py-4">No order items yet.</div>`;
  const grossSubtotal=items.reduce((s,i)=>s+Number(i.price||0)*Math.max(1,Number(i.qty||1)),0),itemDisc=items.reduce((s,i)=>{const type=String(i.type||'').toUpperCase();if(['PACKAGE','ADDON'].includes(type))return s;const line=Number(i.price||0)*Math.max(1,Number(i.qty||1));return s+Math.min(line,Math.max(0,Number(i.item_discount||0)));},0),subtotal=Math.max(0,grossSubtotal-itemDisc),discount=Math.max(0,Number(proj.discount_amount||0)),baseRush=Math.max(0,Number(proj.rush_fee||0)),workloadFee=Math.max(0,Number(proj.workload_rush_fee||0)),combinedRush=baseRush+workloadFee,revisionFee=0,maintenance=getProjectMaintenanceFee(proj),displayTotal=Math.max(0,subtotal-discount+combinedRush+maintenance);
  box.innerHTML=`<div class="project-order-items-list">${rows}</div><div class="project-items-summary"><div class="rush-line"><span>Item Subtotal</span><strong>${formatCurrency(grossSubtotal)}</strong></div>${itemDisc?`<div class="rush-line"><span>Item Discounts</span><strong>− ${formatCurrency(itemDisc)}</strong></div>`:''}${discount?`<div class="rush-line"><span>Project Discount</span><strong>− ${formatCurrency(discount)}</strong></div>`:''}${(combinedRush||revisionFee||maintenance)?`<div class="project-items-fee-label">Additional Fees <button type="button" class="inline-info-button" onclick="app.openFeeInfo('all')">i</button></div>`:''}${combinedRush?`<div class="rush-line compact-fee-row"><span>Rush Fee</span><strong>+ ${formatCurrency(combinedRush)}</strong></div>`:''}${revisionFee?`<div class="rush-line compact-fee-row"><span>Revision Fee</span><strong>+ ${formatCurrency(revisionFee)}</strong></div>`:''}${maintenance?`<div class="rush-line compact-fee-row"><span>System Maintenance Fee</span><strong>+ ${formatCurrency(maintenance)}</strong></div>`:''}<div class="project-items-grand-total"><span>Project Total</span><strong>${formatCurrency(displayTotal)}</strong></div></div>`;
}
      function getProjectCatalogChoices(query=''){
        const q=String(query||'').trim().toLowerCase();
        const services=(state.soloServices||[]).map(x=>({kind:'SERVICE',code:x.product_code,name:x.name,price:Number(x.price||0),category:x.category||'',type:'SOLO'}));
        const bundles=(state.packagesList||[]).map(x=>({kind:'PACKAGE',code:x.product_code,name:x.name,price:Number(x.sellingPrice||0),category:x.category||'',type:'PACKAGE',includedServiceNames:[...(x.includedServiceNames||[])]}));
        return [...services,...bundles].filter(x=>!q||`${x.name} ${x.category} ${x.kind}`.toLowerCase().includes(q));
      }
      function renderProjectOrderItemSuggestions(query=''){
        const box=document.getElementById('projectOrderItemSuggestions');if(!box)return;const items=getProjectCatalogChoices(query);box.classList.add('open');box.innerHTML=items.map((x,i)=>`<button type="button" class="typeahead-option" onmousedown="event.preventDefault();app.selectProjectOrderItemSuggestion(${i})"><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(displayCategory(x.category||x.kind))} · ${formatCurrency(x.price)}</span></button>`).join('')||`<div class="typeahead-empty">No match — keep typing to use a custom item.</div>`;state.projectOrderItemSuggestionCache=items;
      }
function openProjectOrderBatchModal(){
  const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;
  state.projectOrderBatchSelection={};state.projectOrderBatchChoiceCache=[];state.projectOrderBatchCategory='ALL';
  const search=document.getElementById('projectOrderBatchSearch'),name=document.getElementById('projectBatchCustomName'),qty=document.getElementById('projectBatchCustomQty'),price=document.getElementById('projectBatchCustomPrice');
  if(search)search.value='';if(name)name.value='';if(qty)qty.value='1';if(price)price.value='';
  const rev=document.getElementById('projectRevisionRequestPrice');if(rev)rev.textContent=`${formatCurrency(getFeeAmount('REVISION',500))} per request`;
  renderProjectFileRequestOptions(proj);renderProjectOrderBatchChoices('');renderProjectOrderBatchSelected();openModal('projectOrderBatchModal');setTimeout(()=>search?.focus(),70);
}
      function projectBatchKey(item){return String(item.code||item.product_code||item.name||'').toLowerCase()+'|'+String(item.type||'SOLO').toUpperCase();}
      function renderProjectOrderBatchChoices(query=''){
        const box=document.getElementById('projectOrderBatchChoices');if(!box)return;ensureCatalogCategories();const category=state.projectOrderBatchCategory||'ALL',filters=document.getElementById('projectOrderBatchServiceFilters');if(filters){filters.innerHTML=['ALL',...state.catalogCategories].map(c=>{const label=c==='ALL'?'All':displayCategory(c),enc=encodeURIComponent(c);return `<button type="button" class="filter-pill ${category===c?'active':''}" onclick="app.setProjectOrderBatchCategory(decodeURIComponent('${enc}'))">${escapeHtml(label)}</button>`}).join('');}
        const items=getProjectCatalogChoices(query).filter(x=>x.name&&(category==='ALL'||String(x.category||'')===category));state.projectOrderBatchChoiceCache=items;const selected=state.projectOrderBatchSelection||{};
        box.innerHTML=items.map((x,i)=>{const key=projectBatchKey(x),checked=!!selected[key];return `<label class="project-batch-choice"><input type="checkbox" ${checked?'checked':''} onchange="app.toggleProjectOrderBatchChoice(${i},this.checked)"><span><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(String(x.category||'').trim()||(x.type==='PACKAGE'?'Package':'Item'))} · ${formatCurrency(x.price)}</small></span><em>${x.type==='PACKAGE'?'Package':'Item'}</em></label>`}).join('')||`<div class="typeahead-empty">No matching Shop items.</div>`;
      }
      function setProjectOrderBatchCategory(category){state.projectOrderBatchCategory=category||'ALL';renderProjectOrderBatchChoices(document.getElementById('projectOrderBatchSearch')?.value||'');}
      function toggleProjectOrderBatchChoice(index,checked){const item=(state.projectOrderBatchChoiceCache||[])[Number(index)];if(!item)return;if(!state.projectOrderBatchSelection)state.projectOrderBatchSelection={};const key=projectBatchKey(item);if(checked)state.projectOrderBatchSelection[key]={...item,qty:1,item_discount:0};else delete state.projectOrderBatchSelection[key];renderProjectOrderBatchSelected();}
      function addCustomProjectBatchItem(){const name=document.getElementById('projectBatchCustomName')?.value.trim()||'',qty=Math.max(1,Math.round(Number(document.getElementById('projectBatchCustomQty')?.value||1))),price=Math.max(0,Number(document.getElementById('projectBatchCustomPrice')?.value||0));if(!name){showToast('Enter a custom item name.');return}if(!state.projectOrderBatchSelection)state.projectOrderBatchSelection={};const item={kind:'CUSTOM',code:'',name,price,category:'',type:'SOLO',qty,item_discount:0};state.projectOrderBatchSelection['custom|'+Date.now()+'|'+name.toLowerCase()]=item;document.getElementById('projectBatchCustomName').value='';document.getElementById('projectBatchCustomQty').value='1';document.getElementById('projectBatchCustomPrice').value='';renderProjectOrderBatchSelected();}
      function renderProjectOrderBatchSelected(){const box=document.getElementById('projectOrderBatchSelected'),count=document.getElementById('projectOrderBatchCount'),totalEl=document.getElementById('projectOrderBatchTotal'),btn=document.getElementById('projectOrderBatchAddBtn'),entries=Object.entries(state.projectOrderBatchSelection||{}),total=entries.reduce((sum,[,x])=>{const line=Number(x.price||0)*Math.max(1,Number(x.qty||1)),disc=String(x.type||'').toUpperCase()==='PACKAGE'?0:Math.min(line,Math.max(0,Number(x.item_discount||0)));return sum+line-disc;},0);state.projectOrderBatchSelectedKeys=entries.map(([key])=>key);if(count)count.textContent=`${entries.length} item${entries.length===1?'':'s'}`;if(totalEl)totalEl.textContent=formatCurrency(total);if(btn){btn.disabled=!entries.length;btn.textContent=entries.length?`Add ${entries.length} Item${entries.length===1?'':'s'}`:'Add Selected Items';}if(box)box.innerHTML=entries.length?entries.map(([key,x],index)=>`<div class="project-batch-selected-row"><div><strong>${escapeHtml(x.name)}</strong><span>${formatCurrency(x.price||0)} each</span></div><div class="batch-qty-control"><label>Qty</label><input class="form-control" type="number" min="1" value="${Math.max(1,Number(x.qty||1))}" onchange="app.updateProjectOrderBatchQty(${index},this.value)"></div>${String(x.type||'').toUpperCase()!=='PACKAGE'?`<div class="batch-discount-control"><label>Discount ₱</label><input class="form-control" type="number" min="0" step="0.01" value="${Number(x.item_discount||0)}" onchange="app.updateProjectOrderBatchDiscount(${index},this.value)"></div>`:''}<button type="button" class="icon-more-button" aria-label="Remove selected item" onclick="app.removeProjectOrderBatchChoice(${index})">×</button></div>`).join(''):'';}
      function updateProjectOrderBatchQty(index,value){const key=(state.projectOrderBatchSelectedKeys||[])[Number(index)],item=state.projectOrderBatchSelection?.[key];if(!item)return;item.qty=Math.max(1,Math.round(Number(value||1)));renderProjectOrderBatchSelected();}
      function updateProjectOrderBatchDiscount(index,value){const key=(state.projectOrderBatchSelectedKeys||[])[Number(index)],item=state.projectOrderBatchSelection?.[key];if(!item||String(item.type||'').toUpperCase()==='PACKAGE')return;const line=Math.max(0,Number(item.price||0))*Math.max(1,Number(item.qty||1));item.item_discount=Math.min(line,Math.max(0,Number(value||0)));renderProjectOrderBatchSelected();}
      function removeProjectOrderBatchChoice(index){const key=(state.projectOrderBatchSelectedKeys||[])[Number(index)];if(key&&state.projectOrderBatchSelection)delete state.projectOrderBatchSelection[key];renderProjectOrderBatchSelected();renderProjectOrderBatchChoices(document.getElementById('projectOrderBatchSearch')?.value||'');}
      function commitProjectOrderBatch(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;const entries=Object.values(state.projectOrderBatchSelection||{});if(!entries.length)return;if(!Array.isArray(proj.project_items))proj.project_items=[];entries.forEach((item,i)=>proj.project_items.push({id:`oi_${proj.id}_${Date.now()}_${i}_${Math.random().toString(36).slice(2,6)}`,name:item.name,qty:Math.max(1,Number(item.qty||1)),price:Math.max(0,Number(item.price||0)),item_discount:String(item.type||'').toUpperCase()==='PACKAGE'?0:Math.max(0,Number(item.item_discount||0)),type:item.type||'SOLO',product_code:item.code||null,category:item.category||''}));recalculateProjectFromOrderItems(proj);syncProjectDeliverablesFromOrderItems(proj);persistProjectsState();closeModal('projectOrderBatchModal');renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);renderOverviewDashboard();showToast(`${entries.length} item${entries.length===1?'':'s'} added.`);}

      function selectProjectOrderItemSuggestion(index){
        const x=(state.projectOrderItemSuggestionCache||[])[Number(index)];if(!x)return;document.getElementById('projectOrderItemName').value=x.name;document.getElementById('projectOrderItemPrice').value=x.price;setProjectOrderItemType(x.type);state.projectOrderItemSelected={code:x.code,category:x.category,type:x.type,name:x.name};document.getElementById('projectOrderItemSuggestions')?.classList.remove('open');
      }
      function hideProjectOrderItemSuggestions(){document.getElementById('projectOrderItemSuggestions')?.classList.remove('open');}
      function setProjectOrderItemType(type){
        const v=String(type||'SOLO').toUpperCase(); document.getElementById('projectOrderItemType').value=v;
        document.querySelectorAll('#projectOrderItemTypeSegments .segment').forEach(b=>b.classList.toggle('active',b.dataset.orderType===v));const dg=document.getElementById('projectOrderItemDiscountGroup'),di=document.getElementById('projectOrderItemDiscount');if(dg)dg.style.display=v==='PACKAGE'?'none':'block';if(v==='PACKAGE'&&di)di.value='0';
      }

      function openProjectOrderItemModal(index=null){
        const proj=state.projects.find(p=>p.id===state.activeProjectId); if(!proj)return;
        if(!Array.isArray(proj.project_items)) proj.project_items=[];
        const editing=Number.isInteger(index) && index>=0 && index<proj.project_items.length;
        const item=editing?proj.project_items[index]:{name:'',type:'SOLO',qty:1,price:0};
        state.projectOrderItemSelected=editing?{code:item.product_code||item.code||'',category:item.category||'',type:item.type||'SOLO',name:item.name||''}:null;
        document.getElementById('projectOrderItemModalTitle').textContent=editing?'Edit Order Item':'Add Order Item';
        document.getElementById('projectOrderItemIndex').value=editing?String(index):'';
        document.getElementById('projectOrderItemName').value=item.name||'';
        document.getElementById('projectOrderItemQty').value=Math.max(1,Number(item.qty||1));
        document.getElementById('projectOrderItemPrice').value=Math.max(0,Number(item.price||0));const discountInput=document.getElementById('projectOrderItemDiscount');if(discountInput)discountInput.value=String(item.type||'').toUpperCase()==='PACKAGE'?0:Math.max(0,Number(item.item_discount||0));
        setProjectOrderItemType(item.type||'SOLO');document.getElementById('projectOrderItemSuggestions')?.classList.remove('open');openModal('projectOrderItemModal');
      }
      function saveProjectOrderItem(){
        const proj=state.projects.find(p=>p.id===state.activeProjectId); if(!proj)return;
        if(!Array.isArray(proj.project_items)) proj.project_items=[];
        const name=document.getElementById('projectOrderItemName').value.trim();
        const qty=Math.max(1,Math.round(Number(document.getElementById('projectOrderItemQty').value||1)));
        const price=Math.max(0,Number(document.getElementById('projectOrderItemPrice').value||0));
        const type=document.getElementById('projectOrderItemType').value||'SOLO';const lineTotal=price*qty,itemDiscount=String(type).toUpperCase()==='PACKAGE'?0:Math.min(lineTotal,Math.max(0,Number(document.getElementById('projectOrderItemDiscount')?.value||0)));
        if(!name){showToast('Item name is required.');return;}
        const selected=state.projectOrderItemSelected&&String(state.projectOrderItemSelected.name||'').toLowerCase()===name.toLowerCase()?state.projectOrderItemSelected:null;
        const raw=document.getElementById('projectOrderItemIndex').value; const index=raw===''?null:Number(raw);
        const base={name,qty,price,item_discount:itemDiscount,type,product_code:selected?.code||null,category:selected?.category||'',id:index!==null&&proj.project_items[index]?.id?proj.project_items[index].id:`oi_${proj.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`};
        if(index===null){ proj.project_items.push(base); }
        else if(proj.project_items[index]){ proj.project_items[index]={...proj.project_items[index],...base}; }
        recalculateProjectFromOrderItems(proj);syncProjectDeliverablesFromOrderItems(proj);persistProjectsState();closeModal('projectOrderItemModal');renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);renderOverviewDashboard();showToast('Order item saved and synced to Deliverables.');
      }
      function requestDeleteProjectOrderItem(index,event){if(event)event.stopPropagation();const proj=state.projects.find(p=>p.id===state.activeProjectId),item=proj?.project_items?.[index];if(!item)return;requestDestructivePin('Remove Order Item',`Remove "${item.name||'this item'}"? Its linked deliverable will also be removed.`,()=>deleteProjectOrderItem(index,true));}
      function deleteProjectOrderItem(index,authorized=false){
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj||!Array.isArray(proj.project_items)||!proj.project_items[index])return;if(!authorized){requestDeleteProjectOrderItem(index);return;}
        proj.project_items.splice(index,1);recalculateProjectFromOrderItems(proj);syncProjectDeliverablesFromOrderItems(proj);persistProjectsState();renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);renderOverviewDashboard();showToast('Order item removed.');
      }

      function renderProjectDeliverableSuggestions(query=''){
        const box=document.getElementById('projectDeliverableSuggestions');if(!box)return;const items=getProjectCatalogChoices(query);state.projectDeliverableSuggestionCache=items;box.classList.add('open');box.innerHTML=items.map((x,i)=>`<button type="button" class="typeahead-option" onmousedown="event.preventDefault();app.selectProjectDeliverableSuggestion(${i})"><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(displayCategory(x.category||x.kind))}</span></button>`).join('')||`<div class="typeahead-empty">No match — you can enter a custom deliverable.</div>`;
      }
      function selectProjectDeliverableSuggestion(index){const x=(state.projectDeliverableSuggestionCache||[])[Number(index)];if(!x)return;state.projectDeliverableSelected=x;document.getElementById('projectDeliverableName').value=x.name;document.getElementById('projectDeliverableSuggestions')?.classList.remove('open');}
      function openProjectDeliverableModal(){state.projectDeliverableSelected=null;const input=document.getElementById('projectDeliverableName');if(input)input.value='';document.getElementById('projectDeliverableSuggestions')?.classList.remove('open');openModal('projectDeliverableModal');setTimeout(()=>renderProjectDeliverableSuggestions(''),30);}
      function saveProjectDeliverable(){
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;const name=document.getElementById('projectDeliverableName').value.trim();if(!name){showToast('Deliverable name is required.');return;}if(!Array.isArray(proj.deliverables))proj.deliverables=[];
        const selected=state.projectDeliverableSelected&&String(state.projectDeliverableSelected.name||'').toLowerCase()===name.toLowerCase()?state.projectDeliverableSelected:null;const baseId=`del_manual_${proj.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        if(selected?.type==='PACKAGE'&&Array.isArray(selected.includedServiceNames)&&selected.includedServiceNames.length){const parent={id:baseId,item_name:name,name,source_type:'MANUAL',is_group:true,completed:false,progress:0,status:'Pending'};proj.deliverables.push(parent,...selected.includedServiceNames.map((n,i)=>({id:`${baseId}_child_${i}`,item_name:n,name:n,source_type:'MANUAL',parent_id:baseId,package_name:name,completed:false,progress:0,status:'Pending'})));}else proj.deliverables.push({id:baseId,item_name:name,name,source_type:'MANUAL',completed:false,progress:0,status:'Pending',completed_at:null});
        proj.updated_at=new Date().toISOString();persistProjectsState();closeModal('projectDeliverableModal');renderProjectDeliverablesList(proj);renderOverviewDashboard();showToast('Deliverable added.');
      }
      function deleteProjectDeliverable(delId){
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj||!Array.isArray(proj.deliverables))return;const del=proj.deliverables.find(d=>String(d.id)===String(delId));if(!del)return;const linked=del.order_item_id&&Array.isArray(proj.project_items)?proj.project_items.find(i=>String(i.id)===String(del.order_item_id)):null;
        const remove=()=>{if(del.parent_id){proj.deliverables=proj.deliverables.filter(d=>String(d.id)!==String(delId));}else if(linked){proj.project_items=proj.project_items.filter(i=>String(i.id)!==String(del.order_item_id));recalculateProjectFromOrderItems(proj);syncProjectDeliverablesFromOrderItems(proj);}else{const childIds=new Set(proj.deliverables.filter(d=>String(d.parent_id||'')===String(delId)).map(d=>String(d.id)));proj.deliverables=proj.deliverables.filter(d=>String(d.id)!==String(delId)&&!childIds.has(String(d.id)));}proj.updated_at=new Date().toISOString();persistProjectsState();renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);renderOverviewDashboard();showToast('Deliverable removed.');};
        requestDestructivePin('Remove Deliverable',linked?`Remove "${del.item_name||del.name||'this deliverable'}"? Its linked order item will also be removed.`:`Remove "${del.item_name||del.name||'this deliverable'}"?`,remove);
      }
      function toggleAssistant(force){
        const panel=document.getElementById('assistantPanel'); if(!panel)return; const open=typeof force==='boolean'?force:!panel.classList.contains('open'); panel.classList.toggle('open',open); panel.setAttribute('aria-hidden',open?'false':'true'); if(open)setTimeout(()=>document.getElementById('assistantInput')?.focus(),120);
      }
      function addAssistantMessage(text,role='assistant'){
        const box=document.getElementById('assistantMessages'); if(!box)return; const el=document.createElement('div'); el.className=`assistant-message ${role}`; el.textContent=text; box.appendChild(el); box.scrollTop=box.scrollHeight;
      }
      function assistantQuick(question){ toggleAssistant(true); addAssistantMessage(question,'user'); setTimeout(()=>addAssistantMessage(answerWorkspaceQuestion(question),'assistant'),80); }
      function sendAssistantMessage(){
        const input=document.getElementById('assistantInput'); if(!input)return; const q=input.value.trim(); if(!q)return; input.value=''; addAssistantMessage(q,'user'); setTimeout(()=>addAssistantMessage(answerWorkspaceQuestion(q),'assistant'),80);
      }
      function assistantProjectSummary(p){
        const ds=p.deliverables||[],done=ds.filter(d=>d.completed).length,info=deadlineInfo(p.deadline_date),bal=getProjectBalance(p);
        return `${p.title} — ${p.client_name||'No client'}; ${info.label}${info.sub?` (${info.sub})`:''}; ${done}/${ds.length} deliverables complete; balance ${formatCurrency(bal)}.`;
      }
      function answerWorkspaceQuestion(question){
        const q=String(question||'').toLowerCase().trim();
        const all=state.projects.filter(p=>!p.deleted), active=all.filter(p=>p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at), completed=all.filter(p=>p.status==='Completed'||p.delivery_status==='Delivered'||p.archived_at);
        const now=new Date(); now.setHours(0,0,0,0); const week=new Date(now.getTime()+7*86400000);
        const overdue=active.filter(p=>{const d=parseDateSafe(p.deadline_date);return d&&d<now}).sort((a,b)=>parseDateSafe(a.deadline_date)-parseDateSafe(b.deadline_date));
        const dueSoon=active.filter(p=>{const d=parseDateSafe(p.deadline_date);return d&&d>=now&&d<=week}).sort((a,b)=>parseDateSafe(a.deadline_date)-parseDateSafe(b.deadline_date));
        const unfinished=active.flatMap(p=>(p.deliverables||[]).filter(d=>!d.completed).map(d=>({project:p.title,name:d.item_name||d.name||'Deliverable',deadline:d.deadline||p.deadline_date||''})));
        const revenue=all.reduce((s,p)=>s+getProjectInvoiceTotal(p),0), received=getAllPayments().reduce((s,p)=>s+Number(p.amount_paid||p.amount||0),0), receivables=Math.max(0,revenue-received);
        const monthKey=new Date().toISOString().slice(0,7), monthRevenue=getAllPayments().filter(x=>String(x.payment_date||x.created_at||'').slice(0,7)===monthKey).reduce((s,x)=>s+Number(x.amount_paid||x.amount||0),0);
        if(/help|what can you|can you do/.test(q)) return 'I can answer from this workspace about active or completed projects, deadlines, overdue work, deliverables, clients, payments, receivables, and revenue. I do not use outside information.';
        if(/overdue|late|past due/.test(q)) return overdue.length?`${overdue.length} overdue project${overdue.length===1?'':'s'}:\n${overdue.slice(0,8).map((p,i)=>`${i+1}. ${assistantProjectSummary(p)}`).join('\n')}`:'There are no overdue active projects in the workspace.';
        if(/due soon|deadline|due this week|next 7|upcoming/.test(q)) return dueSoon.length?`${dueSoon.length} project${dueSoon.length===1?' is':'s are'} due within 7 days:\n${dueSoon.slice(0,8).map((p,i)=>`${i+1}. ${assistantProjectSummary(p)}`).join('\n')}`:'No active projects are due within the next 7 days.';
        if(/unfinished|not done|pending deliverable|deliverables?.*pending/.test(q)) return unfinished.length?`There are ${unfinished.length} unfinished deliverable${unfinished.length===1?'':'s'} across active projects.\n${unfinished.slice(0,10).map((d,i)=>`${i+1}. ${d.name} — ${d.project}${d.deadline?` (${deadlineInfo(d.deadline).label})`:''}`).join('\n')}`:'There are no unfinished deliverables in active projects.';
        if(/active project|current project|working on/.test(q)) return active.length?`You have ${active.length} active project${active.length===1?'':'s'}.\n${active.sort((a,b)=>(parseDateSafe(a.deadline_date)?.getTime()??Infinity)-(parseDateSafe(b.deadline_date)?.getTime()??Infinity)).slice(0,10).map((p,i)=>`${i+1}. ${assistantProjectSummary(p)}`).join('\n')}`:'There are no active projects.';
        if(/receivable|outstanding|balance.*all|money.*receive/.test(q)) return `Workspace receivables are ${formatCurrency(receivables)}. Total project value is ${formatCurrency(revenue)} and recorded payments total ${formatCurrency(received)}.`;
        if(/revenue.*month|this month.*revenue|earned.*month|received.*month/.test(q)) return `Recorded payments received this month total ${formatCurrency(monthRevenue)}.`;
        if(/total revenue|revenue/.test(q)) return `Total project value recorded in the workspace is ${formatCurrency(revenue)}. Recorded payments received are ${formatCurrency(received)}, leaving ${formatCurrency(receivables)} in receivables.`;
        if(/completed|history|finished/.test(q)) return `History contains ${completed.length} completed project${completed.length===1?'':'s'}.`;
        const terms=q.split(/\s+/).filter(w=>w.length>2&&!['what','show','about','status','project','client','the','for','with','how'].includes(w));
        const matches=all.filter(p=>{const hay=`${p.title} ${p.client_name} ${p.client_email||''} ${getProjectType(p)}`.toLowerCase();return terms.length&&terms.every(t=>hay.includes(t));});
        if(matches.length===1) return assistantProjectSummary(matches[0]);
        if(matches.length>1) return `I found ${matches.length} matching records:\n${matches.slice(0,8).map((p,i)=>`${i+1}. ${assistantProjectSummary(p)}`).join('\n')}`;
        return 'I can only answer from information stored in this JUAN PROJECT workspace, and I could not find enough matching record data for that question.';
      }

      async function toggleDeliverable(projId, delId) {
        const proj=state.projects.find(p=>String(p.id)===String(projId));if(!proj)return;const ds=proj.deliverables||[],del=ds.find(d=>String(d.id)===String(delId));if(!del)return;const target=!del.completed,stamp=target?new Date().toISOString():null;
        const apply=d=>{d.completed=target;d.progress=target?100:0;d.status=target?'Completed':'Pending';d.completed_at=stamp};apply(del);
        if(del.is_group)ds.filter(c=>String(c.parent_id||'')===String(del.id)).forEach(apply);
        if(del.parent_id){const parent=ds.find(d=>String(d.id)===String(del.parent_id)),children=ds.filter(c=>String(c.parent_id||'')===String(del.parent_id));if(parent&&children.length){parent.completed=children.every(c=>c.completed);parent.progress=Math.round(children.reduce((sum,c)=>sum+(c.completed?100:Number(c.progress||0)),0)/children.length);parent.status=parent.completed?'Completed':'Pending';parent.completed_at=parent.completed?new Date().toISOString():null;}}
        proj.updated_at=new Date().toISOString();persistProjectsState();renderProjectDeliverablesList(proj);renderOverviewDashboard();
        if(supabaseClient&&state.isConnected){try{const {error}=await supabaseClient.from('projects').update({deliverables:proj.deliverables,updated_at:proj.updated_at}).eq('id',proj.id);if(error)throw error;}catch(e){console.warn('Deliverable sync unavailable:',e.message);}}
      }

      function readReceiptFile(file){
        return new Promise((resolve,reject)=>{
          if(!file){resolve(null);return}
          if(file.size>3*1024*1024){reject(new Error('Receipt must be 3 MB or smaller to keep the workspace fast.'));return}
          const allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(!allowed.includes(String(file.type||'').toLowerCase())){reject(new Error('Receipt must be JPG, PNG, WEBP, or PDF.'));return}
          const reader=new FileReader();reader.onload=()=>resolve({data:reader.result,name:file.name,type:file.type||'application/octet-stream'});reader.onerror=()=>reject(new Error('Could not read receipt file.'));reader.readAsDataURL(file);
        });
      }
      function openRecordPaymentModal(paymentId=null) {
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;state.editingPaymentId=paymentId||null;const payment=paymentId?(proj.payments||[]).find(p=>String(p.id)===String(paymentId)):null;
        document.getElementById('recordPaymentModalTitle').textContent=payment?'Edit Payment':'Record Payment';
        document.getElementById('recordPaymentSaveBtn').textContent=payment?'Review Changes':'Continue';
        document.getElementById('paymentAmountInput').value=payment?Number(payment.amount_paid||payment.amount||0):'';
        document.getElementById('paymentDateInput').value=payment?.payment_date||effectiveOperationalDate();
        document.getElementById('paymentMethodInput').value=payment?.payment_method||payment?.method||'GCash';
        document.getElementById('paymentRefInput').value=payment?.reference_no||payment?.reference_number||'';
        document.getElementById('paymentNotesInput').value=payment?.notes||'';
        const receiptInput=document.getElementById('paymentReceiptInput');if(receiptInput)receiptInput.value='';
        const current=document.getElementById('paymentReceiptCurrent');if(current)current.textContent=payment?.receipt_name?`Current receipt: ${payment.receipt_name}`:'Optional · image or PDF up to 3 MB';
        document.getElementById('paymentAmountError').innerText='';document.getElementById('paymentDateError').innerText='';openModal('recordPaymentModal');
      }

      async function submitPaymentRecord() {
        const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;
        const amountInput=document.getElementById('paymentAmountInput'),dateInput=document.getElementById('paymentDateInput'),errAmount=document.getElementById('paymentAmountError'),errDate=document.getElementById('paymentDateError');
        errAmount.innerText='';errDate.innerText='';amountInput.classList.remove('is-invalid');dateInput.classList.remove('is-invalid');
        const draft={amount:Number(amountInput.value),payment_date:dateInput.value,payment_method:document.getElementById('paymentMethodInput').value,reference_no:document.getElementById('paymentRefInput').value.trim(),notes:document.getElementById('paymentNotesInput').value.trim(),editingId:state.editingPaymentId||null};
        let valid=true;if(!Number.isFinite(draft.amount)||draft.amount<=0){errAmount.innerText='Payment amount must be greater than ₱0.';amountInput.classList.add('is-invalid');valid=false}if(!draft.payment_date){errDate.innerText='Payment date is required.';dateInput.classList.add('is-invalid');valid=false}if(!valid)return;
        const receiptFile=document.getElementById('paymentReceiptInput')?.files?.[0]||null;
        if(receiptFile){try{const receipt=await readReceiptFile(receiptFile);draft.receipt_data=receipt.data;draft.receipt_name=receipt.name;draft.receipt_type=receipt.type}catch(e){showToast(e.message);return}}
        closeModal('recordPaymentModal');showConfirmationDialog(draft.editingId?'Confirm Payment Changes':'Confirm Payment',`${formatCurrency(draft.amount)} · ${formatProjectDate(draft.payment_date)} · ${draft.payment_method}`,'Confirm',()=>finalizePaymentRecord(proj,draft));
      }
      async function finalizePaymentRecord(proj,draft){
        showActionStatus('Processing Payment','Saving payment details…',false);await new Promise(r=>setTimeout(r,350));let record;
        if(draft.editingId){
          record=(proj.payments||[]).find(p=>String(p.id)===String(draft.editingId));
          if(record){Object.assign(record,{amount_paid:draft.amount,amount:draft.amount,payment_date:draft.payment_date,payment_method:draft.payment_method,reference_no:draft.reference_no,notes:draft.notes,updated_at:new Date().toISOString()});if(draft.receipt_data)Object.assign(record,{receipt_data:draft.receipt_data,receipt_name:draft.receipt_name,receipt_type:draft.receipt_type});}
        }
        if(!record){record={id:'pay_'+Date.now(),project_id:proj.id,amount_paid:draft.amount,payment_date:draft.payment_date,payment_method:draft.payment_method,reference_no:draft.reference_no,notes:draft.notes,receipt_data:draft.receipt_data||'',receipt_name:draft.receipt_name||'',receipt_type:draft.receipt_type||'',created_at:new Date().toISOString()};if(!proj.payments)proj.payments=[];proj.payments.push(record);}
        proj.pending_amount=Math.max(0,getProjectInvoiceTotal(proj)-getProjectPaid(proj));proj.payment_status=getProjectPaymentStatus(proj);proj.updated_at=new Date().toISOString();persistProjectsState();
        if(supabaseClient&&state.isConnected){try{await syncProjectBundleToDatabase(proj)}catch(e){console.warn('Payment sync unavailable:',e.message);}}
        renderPaymentTracker(proj);renderInvoicePaper(proj);renderPaymentsView();renderOverviewDashboard();showActionStatus('Payment Successful',draft.editingId?'Payment changes were saved.':'Payment was recorded successfully.',true);state.editingPaymentId=null;setTimeout(()=>closeModal('actionStatusModal'),750);
      }
      function viewPaymentReceipt(paymentId){
        const proj=state.projects.find(p=>p.id===state.activeProjectId),payment=(proj?.payments||[]).find(p=>String(p.id)===String(paymentId));if(!payment?.receipt_data){showToast('No receipt attached.');return}
        const win=window.open('','_blank');if(!win){showToast('Allow pop-ups to view the receipt.');return}
        if(String(payment.receipt_type||'').includes('pdf')){win.location.href=payment.receipt_data;return}
        win.document.write(`<title>${escapeHtml(payment.receipt_name||'Payment Receipt')}</title><style>body{margin:0;background:#111;display:grid;place-items:center;min-height:100vh}img{max-width:100%;max-height:100vh;object-fit:contain}</style><img src="${payment.receipt_data}" alt="Payment receipt">`);
        win.document.close();
      }
      function attachReceiptToPayment(paymentId){
        const proj=state.projects.find(p=>p.id===state.activeProjectId),payment=(proj?.payments||[]).find(p=>String(p.id)===String(paymentId));if(!payment)return;
        const input=document.createElement('input');input.type='file';input.accept='image/*,application/pdf';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{const receipt=await readReceiptFile(file);Object.assign(payment,{receipt_data:receipt.data,receipt_name:receipt.name,receipt_type:receipt.type,updated_at:new Date().toISOString()});persistProjectsState();renderPaymentTracker(proj);showToast('Receipt attached.')}catch(e){showToast(e.message)}};input.click();
      }

function renderPaymentTracker(proj) {
  const overviewEl=document.getElementById('paymentOverview'),listEl=document.getElementById('paymentTransactions');if(!overviewEl||!proj)return;
  const total=getProjectInvoiceTotal(proj),payments=[...(proj.payments||[])],totalPaid=payments.reduce((s,p)=>s+Number(p.amount_paid||p.amount||0),0),remaining=Math.max(0,total-totalPaid),status=getProjectPaymentStatus(proj);
  overviewEl.innerHTML=`<div class="payment-metrics-grid"><div class="payment-metric-card"><div><span>Payment Status</span><strong>${escapeHtml(status)}</strong></div></div><div class="payment-metric-card"><div><span>Invoice Total</span><strong class="number-animate">${formatCurrency(total)}</strong></div></div><div class="payment-metric-card paid"><div><span>Total Paid</span><strong class="number-animate">${formatCurrency(totalPaid)}</strong></div></div><div class="payment-metric-card ${remaining>0?'due':'paid'}"><div><span>Balance Due</span><strong class="number-animate">${formatCurrency(remaining)}</strong></div></div></div>`;
  if(listEl){
    if(!payments.length){listEl.innerHTML='<div class="payment-history-empty"><strong>No payments recorded</strong><span>Recorded payments will appear here as transactions.</span></div>';animateNumbersIn(overviewEl);return;}
    payments.sort((a,b)=>new Date(b.payment_date||b.created_at||0)-new Date(a.payment_date||a.created_at||0));
    listEl.innerHTML=`<div class="payment-history-unified">${payments.map(p=>{const amount=Number(p.amount_paid||p.amount||0),date=parseDateSafe(p.payment_date||p.created_at),method=p.payment_method||p.method||'Payment',ref=p.reference_no||p.reference_number||'',notes=p.notes||'',menuId=`paymentMenu_${String(p.id).replace(/[^a-zA-Z0-9_-]/g,'')}`,hasReceipt=!!p.receipt_data;return `<div class="payment-history-unified-row"><div class="payment-history-unified-main"><strong>${escapeHtml(method)}</strong><span>${ref?`Ref ${escapeHtml(ref)} · `:''}${date?date.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'No date'}${hasReceipt?' · Receipt attached':''}</span>${notes?`<small>${escapeHtml(notes)}</small>`:''}</div><div class="payment-history-unified-amount"><strong>${formatCurrency(amount)}</strong></div><div class="popover-wrap" id="${menuId}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menuId}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openRecordPaymentModal('${p.id}')">Edit Payment</button><button class="popover-action" onclick="app.attachReceiptToPayment('${p.id}')">${hasReceipt?'Replace':'Attach'} Receipt</button>${hasReceipt?`<button class="popover-action" onclick="app.viewPaymentReceipt('${p.id}')">View Receipt</button>`:''}</div></div></div>`}).join('')}</div>`;
  }
  animateNumbersIn(overviewEl);
}
      /* ==========================================================================
         INVOICE GENERATOR & EMAIL REMINDERS
         ========================================================================== */
function openFeeInfo(type='all'){
  ensureAdditionalFees();const title=document.getElementById('feeInfoTitle'),body=document.getElementById('feeInfoBody');if(!title||!body)return;
  const map={rush:'RUSH',revision:'REVISION',maintenance:'SYSTEM_MAINTENANCE'},core=['RUSH','REVISION','SYSTEM_MAINTENANCE'];
  if(type!=='all'&&map[type]){const fee=getFeeConfig(map[type]);title.textContent=fee.name;body.innerHTML=`<div class="fee-info-copy compact-fee-info"><p>${escapeHtml(fee.description||'Additional project charge.')}</p></div>`;}
  else{title.textContent='Additional Fees';body.innerHTML=`<div class="fee-info-list">${core.map(code=>getFeeConfig(code)).filter(f=>f.active!==false).map(f=>`<div><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.description||'Additional project charge.')}</span></div>`).join('')}</div>`;}
  openModal('feeInfoModal');
}
      function renderInvoicePaper(proj) {
        const paper=document.getElementById('invoicePaperPrintable');if(!paper||!proj)return;
        const invoiceNo=ensureInvoiceNumber(proj),storedSubtotal=Math.max(0,Number(proj.subtotal_amount||0)),discount=Math.max(0,Number(proj.discount_amount||0));
        const baseRush=Math.max(0,Number(proj.rush_fee||0)),workloadFee=Math.max(0,Number(proj.workload_rush_fee||0)),rush=baseRush+workloadFee,revisionFee=getProjectRevisionFee(proj),maintenance=Math.max(0,getProjectMaintenanceFee(proj));
        const projectTotal=Math.max(0,Number(proj.total_amount||0)),inferredSubtotal=Math.max(0,projectTotal-baseRush-workloadFee+discount),subtotal=storedSubtotal>0?storedSubtotal:inferredSubtotal,additionalFees=rush+revisionFee+maintenance,invoiceTotal=Math.max(0,subtotal-discount+additionalFees);
        const paid=(proj.payments||[]).reduce((sum,p)=>sum+Number(p.amount_paid||p.amount||0),0),balance=Math.max(0,invoiceTotal-paid),status=getInvoiceStatus({...proj,total_amount:invoiceTotal},balance);
        const issue=getLocalDateString(new Date()),due=proj.invoice_due_date||proj.payment_due_date||proj.deadline_date||'',statusClass=status==='UNPAID'?'unpaid':status==='DOWNPAYMENT'?'partial':'paid',issueLabel=new Date(issue+'T00:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}),dueLabel=due?new Date(due+'T00:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'}):'—';
        const items=Array.isArray(proj.project_items)&&proj.project_items.length?proj.project_items:(Array.isArray(proj.items)?proj.items:[]);
        const itemRows=items.map(item=>{const qty=Math.max(1,Number(item.qty||1)),unit=Math.max(0,Number(item.price||0)),line=qty*unit,itemDisc=String(item.type||'').toUpperCase()==='PACKAGE'?0:Math.min(line,Math.max(0,Number(item.item_discount||0))),net=line-itemDisc;return `<tr><td><strong>${escapeHtml(item.name||'Item')}</strong>${itemDisc?`<small>Item discount −${formatCurrency(itemDisc)}</small>`:''}</td><td>${qty}</td><td>${formatCurrency(net)}</td></tr>`}).join('')||`<tr><td>Project Services</td><td>1</td><td>${formatCurrency(subtotal)}</td></tr>`;
        paper.innerHTML=`<div class="invoice-header invoice-header-v68"><div class="invoice-brand-block"><h2>${escapeHtml(state.settings.businessName||'JUAN PROJECT')}</h2><div>${escapeHtml(state.ownerEmail||'')}</div><div>${escapeHtml(state.ownerPhone||'')}</div></div><div class="invoice-header-stack"><div class="invoice-label">Invoice</div><div class="invoice-number">${invoiceNo}</div><span class="invoice-status ${statusClass}">${status}</span><div class="invoice-issued-date">Issued ${issueLabel}</div></div></div><div class="invoice-meta-grid"><div><div class="invoice-label">Bill To</div><div class="font-bold">${escapeHtml(proj.client_name||'—')}</div><div class="text-sm text-secondary">${escapeHtml(proj.client_email||'')}</div></div><div><div class="invoice-label">Project</div><div class="font-bold">${escapeHtml(proj.title||'—')}</div><div class="text-sm text-secondary">Due ${dueLabel}</div></div></div><div class="invoice-items-wrap"><table class="invoice-items-table"><thead><tr><th>Order Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${itemRows}</tbody></table></div><div class="invoice-simple-summary"><div class="invoice-simple-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div><div class="invoice-simple-row"><span>Discount</span><strong class="${discount?'text-danger':''}">${discount?`− ${formatCurrency(discount)}`:formatCurrency(0)}</strong></div>${additionalFees?`<div class="invoice-simple-section additional-fees-heading">Additional Fees <button type="button" class="mini-info-button screen-only" onclick="app.openFeeInfo('all')">i</button></div>${rush?`<div class="invoice-simple-row invoice-fee-row"><span>Rush Fee</span><strong>${formatCurrency(rush)}</strong></div>`:''}${revisionFee?`<div class="invoice-simple-row invoice-fee-row"><span>Revision Fee</span><strong>${formatCurrency(revisionFee)}</strong></div>`:''}${maintenance?`<div class="invoice-simple-row invoice-fee-row"><span>System Maintenance Fee</span><strong>${formatCurrency(maintenance)}</strong></div>`:''}<div class="invoice-simple-row invoice-additional-total"><span>Additional Fees</span><strong>${formatCurrency(additionalFees)}</strong></div>`:''}<div class="invoice-simple-row invoice-grand-total"><span>TOTAL</span><strong>${formatCurrency(invoiceTotal)}</strong></div><div class="invoice-simple-row"><span>Amount Paid</span><strong>${formatCurrency(paid)}</strong></div><div class="invoice-simple-row invoice-balance-row"><span>Balance</span><strong style="color:${balance?'var(--status-red)':'var(--status-green)'}">${formatCurrency(balance)}</strong></div></div><div class="text-sm text-tertiary invoice-thankyou">Thank you for choosing ${escapeHtml(state.settings.businessName||'JUAN PROJECT')}.</div>`;
      }

      function sendDeadlineReminderEmail(projId = null) {
        const id = projId || state.activeProjectId;
        const proj = state.projects.find(p => p.id === id);
        if (!proj) return;

        if (!proj.client_email || !proj.client_email.includes("@")) {
          showToast("Please enter a valid email address for this client.");
          return;
        }

        const subject = encodeURIComponent(`Deadline Reminder: ${proj.title}`);
        const body = encodeURIComponent(`Hi ${proj.client_name},\n\nThis is a friendly reminder that your project "${proj.title}" deadline is set for ${proj.deadline_date}.\n\nThank you,\n${state.ownerName}`);
        
        window.open(`mailto:${proj.client_email}?subject=${subject}&body=${body}`, '_blank');
        showToast("Email client opened with deadline reminder.");
      }

      function sendBalanceReminderEmail(projId = null) {
        const id = projId || state.activeProjectId;
        const proj = state.projects.find(p => p.id === id);
        if (!proj) return;

        if (!proj.client_email || !proj.client_email.includes("@")) {
          showToast("Please enter a valid email address for this client.");
          return;
        }

        const totalPaid = (proj.payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const remaining = Math.max(0, getProjectInvoiceTotal(proj) - totalPaid);

        const subject = encodeURIComponent(`Invoice Balance Reminder: ${proj.title}`);
        const body = encodeURIComponent(`Hi ${proj.client_name},\n\nThis is a friendly reminder regarding the outstanding balance of ${formatCurrency(remaining)} for project "${proj.title}".\n\nThank you,\n${state.ownerName}`);
        
        window.open(`mailto:${proj.client_email}?subject=${subject}&body=${body}`, '_blank');
        showToast("Email client opened with payment reminder.");
      }

      /* ==========================================================================
         PROJECT TEMPLATES
         ========================================================================== */
      function saveCurrentProjectAsTemplate() {
        if (!state.activeProjectId) return;
        const proj = state.projects.find(p => p.id === state.activeProjectId);
        if (!proj) return;

        const template = {
          id: 'tmpl_' + Date.now(),
          name: `${proj.title} (Template)`,
          deliverables: (proj.deliverables || []).map(d => d.item_name),
          total_amount: getProjectInvoiceTotal(proj)
        };

        state.templates.push(template);
        persistTemplatesState();
        showToast("Project saved as a template.");
      }

      function renderTemplatesDropdown() {
        const dropdown = document.getElementById("templateSelectDropdown");
        if (!dropdown) return;

        dropdown.innerHTML = `<option value="">-- Load Template --</option>`;
        state.templates.forEach(tmpl => {
          dropdown.innerHTML += `<option value="${tmpl.id}">${tmpl.name}</option>`;
        });
      }

      function loadProjectTemplate(tmplId) {
        if (!tmplId) return;
        const tmpl = state.templates.find(t => t.id === tmplId);
        if (!tmpl) return;

        state.cart.items = [];
        tmpl.deliverables.forEach(dName => {
          state.cart.items.push({ id: 'item_' + Date.now() + Math.random(), name: dName, price: 1000, type: 'SOLO', qty: 1 });
        });

        persistCartState();
        renderCartUI();
        showToast(`Template "${tmpl.name}" loaded into cart.`);
      }

      /* ==========================================================================
         DATA BACKUP & SAFETY RECOVERY
         ========================================================================== */
      function exportDataBackup() {
        const backupData = {
          version: "2.5.0",
          exportDate: new Date().toISOString(),
          clients: state.clients,
          projects: state.projects,
          templates: state.templates,
          soloServices: state.soloServices,
          packagesList: state.packagesList
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `juan_workspace_backup_${new Date().toISOString().substring(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast("Data backup exported successfully.");
      }

      /**
       * Restore a JUAN Workspace JSON backup.
       *
       * IMPORTANT: Restore is intentionally a REPLACE operation, not a merge.
       * The older importer skipped records when IDs already existed, which made
       * a valid backup appear to do nothing on a freshly seeded workspace.
       *
       * Owner profile, theme, and connection settings are kept. Operational
       * workspace data is replaced by the selected backup after confirmation
       * and the destructive-action PIN check.
       */
      function importDataBackup(e) {
        const input = e?.target;
        const file = input?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const data = JSON.parse(evt.target.result);
            const projectsValid = Array.isArray(data?.projects);
            const clientsValid = Array.isArray(data?.clients);

            if (!data || (!projectsValid && !clientsValid)) {
              showToast("Invalid JUAN Workspace backup file.");
              if (input) input.value = "";
              return;
            }

            const projectCount = projectsValid ? data.projects.length : 0;
            const clientCount = clientsValid ? data.clients.length : 0;
            const serviceCount = Array.isArray(data.soloServices) ? data.soloServices.length : 0;
            const packageCount = Array.isArray(data.packagesList) ? data.packagesList.length : 0;
            const backupVersion = String(data.version || "Unknown");

            // Clear the file picker now so the same backup can be selected again
            // even if the user cancels the confirmation/PIN dialog.
            if (input) input.value = "";

            showConfirmationDialog(
              "Restore JSON Backup",
              `Backup v${backupVersion} contains ${projectCount} project${projectCount === 1 ? "" : "s"}, ${clientCount} client${clientCount === 1 ? "" : "s"}, ${serviceCount} service${serviceCount === 1 ? "" : "s"}, and ${packageCount} package${packageCount === 1 ? "" : "s"}. Restoring will replace the current workspace data in this browser.`,
              "Replace & Restore",
              () => requestDestructivePin(
                "Restore Backup",
                "This will replace the current projects, clients, templates, services, packages, tasks, and active order/cart data with the selected backup.",
                () => {
                  try {
                    // Deep-copy backup records so the in-memory state is isolated
                    // from the parsed FileReader object.
                    state.clients = clientsValid ? JSON.parse(JSON.stringify(data.clients)) : [];
                    state.projects = projectsValid ? JSON.parse(JSON.stringify(data.projects)) : [];
                    state.templates = Array.isArray(data.templates) ? JSON.parse(JSON.stringify(data.templates)) : [];
                    state.soloServices = Array.isArray(data.soloServices) ? JSON.parse(JSON.stringify(data.soloServices)) : [];
                    state.packagesList = Array.isArray(data.packagesList)
                      ? normalizeBroadcastPackageNames(JSON.parse(JSON.stringify(data.packagesList)))
                      : [];

                    // Rebuild catalog categories from restored services/packages.
                    state.catalogCategories = [...new Set([
                      ...state.soloServices.map(item => String(item?.category || "").trim()),
                      ...state.packagesList.map(item => String(item?.category || "").trim())
                    ].filter(Boolean))];

                    // A restore should not keep unrelated temporary work from the
                    // browser that existed before the backup was selected.
                    state.tasks = [];
                    state.cart.items = [];
                    state.cart.selectedClientId = "";
                    state.cart.projectName = "";
                    state.cart.discountVal = 0;
                    state.cart.startDate = "";
                    state.cart.deadlineDate = "";
                    state.cart.deadlineManuallySet = false;
                    state.cart.rushFee = 0;
                    state.cart.rushDaysEarly = 0;

                    // Keep the public JP-001, JP-002 ... sequence continuous even
                    // when a legacy backup contains duplicate/misaligned numbers.
                    renumberProjectSequence();

                    persistProjectsState();
                    persistClientsState();
                    persistTemplatesState();
                    persistCatalogState();
                    persistTasksState();
                    localStorage.removeItem("JUAN_CART_STATE");

                    // Prevent the built-in sample seeder from replacing a restored
                    // legacy-only backup on the next page load.
                    localStorage.setItem("JUAN_LEGACY_SEEDED", "1");
                    localStorage.setItem("JUAN_SAMPLE_DATA_VERSION", SAMPLE_DATA_VERSION);
                    localStorage.setItem("JUAN_LAST_BACKUP_RESTORE", new Date().toISOString());
                    localStorage.setItem("JUAN_LAST_BACKUP_VERSION", backupVersion);

                    renderCurrentView();
                    renderTemplatesDropdown();
                    showActionStatus("Backup Restored", `${state.projects.length} projects and ${state.clients.length} clients are now loaded.`, true);
                    setTimeout(() => closeModal("actionStatusModal"), 1200);
                    showToast("JSON backup restored successfully.");
                  } catch (restoreErr) {
                    console.error("Backup restore failed:", restoreErr);
                    showToast("Backup was valid, but the workspace could not restore it.");
                  } finally {
                    if (input) input.value = "";
                  }
                }
              )
            );
          } catch(err) {
            console.error("Backup JSON parse failed:", err);
            showToast("Failed to parse backup JSON.");
            if (input) input.value = "";
          }
        };
        reader.onerror = function() {
          showToast("The selected backup file could not be read.");
          if (input) input.value = "";
        };
        reader.readAsText(file);
      }

      /* ==========================================================================
         CALENDAR TRUE BOX/GRID LAYOUT
         ========================================================================== */
      function renderCalendar(){
        const cells=document.getElementById('calendarGridCells'),header=document.getElementById('calendarMonthYearHeader');if(!cells||!header)return;
        const curr=state.calendarDate,year=curr.getFullYear(),month=curr.getMonth();header.innerText=curr.toLocaleDateString('en-US',{month:'long',year:'numeric'});cells.innerHTML='';
        const firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate(),todayStr=getLocalDateString(new Date());
        for(let i=0;i<firstDay;i++)cells.innerHTML+='<div class="calendar-cell text-muted" style="opacity:.2"></div>';
        for(let d=1;d<=daysInMonth;d++){
          const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,isToday=dateStr===todayStr,matchingProjects=state.projects.filter(p=>!p.deleted&&p.deadline_date===dateStr),events=(state.manualEvents||[]).filter(e=>e.date===dateStr).sort((a,b)=>String(a.start_time||'').localeCompare(String(b.start_time||'')));
          cells.innerHTML+=`<div class="calendar-cell ${isToday?'today':''}" onclick="if(event.target===this||event.target.classList.contains('cell-day-num'))app.openCalendarEventModal('${dateStr}')"><div class="cell-day-num">${d}<button type="button" class="calendar-cell-add" onclick="event.stopPropagation();app.openCalendarEventModal('${dateStr}')" aria-label="Add event on ${dateStr}">+</button></div>${matchingProjects.map(p=>`<div class="calendar-event-tag project-deadline" onclick="event.stopPropagation();app.openProjectDetails('${p.id}')">${escapeHtml(formatProjectId(p))} · ${escapeHtml(p.title||p.client_name||'Project')}</div>`).join('')}${events.map(e=>`<div class="calendar-event-tag manual-calendar-event ${e.type==='Meeting'?'meeting':''}" onclick="event.stopPropagation();app.openCalendarEventModal('${dateStr}','${e.id}')"><span>${escapeHtml(e.start_time||'')}</span>${escapeHtml(e.title||e.type||'Event')}</div>`).join('')}</div>`;
        }
      }
      function openCalendarEventModal(dateValue='',eventId=''){
        const existing=(state.manualEvents||[]).find(e=>e.id===eventId)||null,date=dateValue||existing?.date||getLocalDateString(new Date());
        document.getElementById('calendarEventModalTitle').textContent=existing?`Edit ${existing.type||'Event'}`:'Add Event';document.getElementById('calendarEventId').value=existing?.id||'';document.getElementById('calendarEventType').value=existing?.type||'Event';document.getElementById('calendarEventDate').value=existing?.date||date;document.getElementById('calendarEventTitle').value=existing?.title||'';document.getElementById('calendarEventStartTime').value=existing?.start_time||'';document.getElementById('calendarEventEndTime').value=existing?.end_time||'';document.getElementById('calendarEventNotes').value=existing?.notes||'';document.getElementById('calendarEventDeleteBtn')?.classList.toggle('hidden',!existing);
        const projectSel=document.getElementById('calendarEventProject');if(projectSel){projectSel.innerHTML='<option value="">None</option>'+state.projects.filter(p=>!p.deleted).sort((a,b)=>projectNumber(a)-projectNumber(b)).map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(formatProjectId(p))} · ${escapeHtml(p.title||'Project')}</option>`).join('');projectSel.value=existing?.project_id||'';}
        openModal('calendarEventModal');
      }
      function saveCalendarEvent(){
        const id=document.getElementById('calendarEventId').value,title=document.getElementById('calendarEventTitle').value.trim(),date=document.getElementById('calendarEventDate').value,type=document.getElementById('calendarEventType').value,startTime=document.getElementById('calendarEventStartTime').value,endTime=document.getElementById('calendarEventEndTime').value,projectId=document.getElementById('calendarEventProject').value,notes=document.getElementById('calendarEventNotes').value.trim();if(!title||!date){showToast('Add an event title and date.');return;}
        const payload={id:id||`evt_${Date.now()}`,title,date,type,start_time:startTime,end_time:endTime,project_id:projectId,notes,updated_at:new Date().toISOString()};const idx=(state.manualEvents||[]).findIndex(e=>e.id===id);if(idx>=0)state.manualEvents[idx]={...state.manualEvents[idx],...payload};else state.manualEvents.push({...payload,created_at:new Date().toISOString()});persistCalendarEvents();closeModal('calendarEventModal');renderCalendar();renderOverviewUpcomingEvents();showToast(id?'Calendar event updated.':'Calendar event added.');
      }
      function deleteCalendarEvent(){const id=document.getElementById('calendarEventId').value;if(!id)return;const event=(state.manualEvents||[]).find(e=>e.id===id);requestDestructivePin('Delete Calendar Event',`Delete "${event?.title||'this event'}"?`,()=>{state.manualEvents=(state.manualEvents||[]).filter(e=>e.id!==id);persistCalendarEvents();closeModal('calendarEventModal');renderCalendar();renderOverviewUpcomingEvents();showToast('Calendar event deleted.');});}

      function changeCalendarMonth(delta) {
        state.calendarDate.setMonth(state.calendarDate.getMonth() + delta);
        renderCalendar();
      }

      function resetCalendarToToday() {
        state.calendarDate = new Date();
        renderCalendar();
      }

      function renderHistory() {
        const container = document.getElementById("historyListContainer");
        if (!container) return;
        const q=(document.getElementById('historySearch')?.value||'').toLowerCase();
        let completed = state.projects.filter(p => !p.deleted && (p.status === "Completed" || p.delivery_status === "Delivered"));
        completed=completed.filter(p=>`${formatProjectId(p)} ${p.legacy_reference||''} ${p.client_name||''} ${p.client_email||''} ${p.title||''} ${p.project_type||''}`.toLowerCase().includes(q));
        completed.sort((a,b)=>new Date(b.deadline_date||b.created_at||0)-new Date(a.deadline_date||a.created_at||0));
        if (!completed.length) { container.innerHTML = `<div class="card text-center text-muted py-4">No matching completed works.</div>`; return; }
        container.innerHTML=completed.map(proj=>{
          const paid=getProjectPaid(proj), pending=getProjectBalance(proj), paymentStatus=proj.payment_status||getInvoiceStatus(proj,pending);
          return `<div class="history-card">
            <div class="history-card-head">
              <div style="min-width:0;cursor:pointer" onclick="app.openProjectDetails('${proj.id}')"><div class="history-card-title">${escapeHtml(proj.title||'Untitled Project')}</div><div class="history-card-sub">${escapeHtml(proj.client_name||'No client')} • ${escapeHtml(formatProjectId(proj))}</div></div>
              <div class="history-card-actions"><div class="text-right"><div class="font-bold">${formatCurrency(getProjectInvoiceTotal(proj))}</div><div class="text-sm text-muted">${escapeHtml(proj.deadline_date||String(proj.created_at||'').slice(0,10)||'No date')}</div></div><div class="popover-wrap" id="historyProjectMenu_${String(proj.id).replace(/[^a-zA-Z0-9_-]/g,'')}"><button class="icon-more-button vertical-more" title="Project options" onclick="event.stopPropagation();app.togglePopover('historyProjectMenu_${String(proj.id).replace(/[^a-zA-Z0-9_-]/g,'')}',event)">⋮</button><div class="popover-panel project-row-menu"><button class="popover-action" onclick="event.stopPropagation();app.openEditProjectModal('${proj.id}')">Edit Project</button><button class="popover-action text-danger" onclick="event.stopPropagation();app.deleteProjectById('${proj.id}')">Delete Project</button></div></div></div>
            </div>
            <details class="history-details"><summary>View complete record</summary><div class="history-detail-grid">
              <div class="history-detail-item"><div class="history-detail-label">Record date</div><div class="history-detail-value">${escapeHtml(proj.record_date||proj.start_date||String(proj.created_at||'').slice(0,10)||'—')}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Client email</div><div class="history-detail-value">${escapeHtml(proj.client_email||'—')}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Project type</div><div class="history-detail-value">${escapeHtml(proj.project_type||getProjectType(proj)||'—')}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Amount due</div><div class="history-detail-value">${formatCurrency(getProjectInvoiceTotal(proj))}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Amount received</div><div class="history-detail-value">${formatCurrency(paid)}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Payment status</div><div class="history-detail-value">${escapeHtml(paymentStatus)}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Pending amount</div><div class="history-detail-value">${formatCurrency(pending)}</div></div>
              <div class="history-detail-item"><div class="history-detail-label">Completion date</div><div class="history-detail-value">${escapeHtml(proj.deadline_date||'—')}</div></div>
            </div></details>
          </div>`}).join('');
      }

      /* ==========================================================================
         CLIENTS DIRECTORY & EDIT CLIENT WORKFLOW
         ========================================================================== */
      function renderClients(){
        ensureContinuousClientIds();persistClientsState();
        const grid=document.getElementById('clientsListGrid');if(!grid)return;const q=(document.getElementById('clientsSearch')?.value||'').trim().toLowerCase(),pref=state.listSorts?.clients||'id';let clients=state.clients.slice().filter(c=>`${clientDisplayId(c)} ${c.name||''} ${c.email||''} ${c.phone||''} ${c.address||''}`.toLowerCase().includes(q));
        if(pref==='az')clients.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));else if(pref==='za')clients.sort((a,b)=>String(b.name||'').localeCompare(String(a.name||'')));else clients.sort((a,b)=>Number(a.client_number||0)-Number(b.client_number||0));
        const sortEl=document.getElementById('clientsSort');if(sortEl)sortEl.value=pref;if(!clients.length){grid.innerHTML=`<div class="card text-center text-muted py-4">${q?'No matching clients.':'No clients registered yet.'}</div>`;return}
        const rows=clients.map((c,idx)=>{const count=state.projects.filter(p=>!p.deleted&&(p.client_id===c.id||p.client_name===c.name)).length,menuId=`clientMenu${idx}`;return `<tr class="clickable-row" onclick="app.openClientProfile('${c.id}')"><td><strong>${escapeHtml(clientDisplayId(c))}</strong></td><td><strong>${escapeHtml(c.name||'—')}</strong></td><td>${escapeHtml(c.email||'—')}</td><td>${escapeHtml(normalizePhilippinePhone(c.phone)||c.phone||'—')}</td><td class="client-address-cell">${escapeHtml(c.address||'—')}</td><td>${count}</td><td class="text-right" onclick="event.stopPropagation()"><div class="popover-wrap" id="${menuId}"><button class="icon-more-button vertical-more" title="Client options" aria-label="Options for ${escapeHtml(c.name||'client')}" onclick="app.togglePopover('${menuId}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openEditClientModal('${c.id}')">Edit Client</button><button class="popover-action text-danger" onclick="app.removeClient('${c.id}')">Delete Client</button></div></div></td></tr>`}).join('');grid.innerHTML=`<div class="card table-card clients-directory-card"><div class="table-responsive"><table class="data-table unified-table clients-unified-table"><thead><tr><th>Client ID</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Projects</th><th class="actions-col"></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
      }

      function removeClient(clientId){
        const client=state.clients.find(c=>c.id===clientId);if(!client)return;const projectCount=state.projects.filter(p=>!p.deleted&&(p.client_id===clientId||p.client_name===client.name)).length;
        requestDestructivePin('Remove Client',`Remove "${client.name}" from the directory? ${projectCount?`${projectCount} saved project record${projectCount===1?'':'s'} will keep their client snapshot.`:'No project records will be removed.'}`,async()=>{state.clients=state.clients.filter(c=>c.id!==clientId);if(state.cart.selectedClientId===clientId){state.cart.selectedClientId='';persistCartState();}ensureContinuousClientIds();persistClientsState();if(supabaseClient&&state.isConnected){try{await supabaseClient.from('clients').delete().eq('id',clientId)}catch(e){console.warn('Client removal database sync failed:',e)}}renderClients();showToast('Client removed from directory.');});
      }

      function openEditClientModal(clientId) {
        const client = state.clients.find(c => c.id === clientId);
        if (!client) return;

        document.getElementById("editClientId").value = client.id;
        document.getElementById("editClientName").value = client.name || "";
        document.getElementById("editClientEmail").value = client.email || "";
        document.getElementById("editClientPhone").value = client.phone || "";
        document.getElementById("editClientAddress").value = client.address || "";
        document.getElementById("editClientNotes").value = client.notes || ""; enforceWordLimit(document.getElementById("editClientNotes"),80,"editClientNotesCount");

        document.getElementById("editClientNameError").innerText = "";
        document.getElementById("editClientEmailError").innerText = "";
        document.getElementById("editClientPhoneError").innerText = "";

        openModal("editClientModal");
      }

      async function submitEditClient() {
        const clientId = document.getElementById("editClientId").value;
        const nameInput = document.getElementById("editClientName");
        const emailInput = document.getElementById("editClientEmail");
        const phoneInput = document.getElementById("editClientPhone");
        const addressInput = document.getElementById("editClientAddress");
        const notesInput = document.getElementById("editClientNotes");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = normalizePhilippinePhone(phoneInput.value);
        const address = addressInput.value.trim();
        const notes = notesInput.value.trim();

        const errName = document.getElementById("editClientNameError");
        const errEmail = document.getElementById("editClientEmailError");
        const errPhone = document.getElementById("editClientPhoneError");

        errName.innerText = "";
        errEmail.innerText = "";
        errPhone.innerText = "";
        nameInput.classList.remove("is-invalid");
        emailInput.classList.remove("is-invalid");
        phoneInput.classList.remove("is-invalid");

        let valid = true;
        if (!name) {
          errName.innerText = "Client name is required.";
          nameInput.classList.add("is-invalid");
          valid = false;
        }
        if (!email || !email.includes("@")) {
          errEmail.innerText = "Please enter a valid email address.";
          emailInput.classList.add("is-invalid");
          valid = false;
        }
        if (!phone) {
          errPhone.innerText = "Phone number is required.";
          phoneInput.classList.add("is-invalid");
          valid = false;
        }

        if (!valid) {
          showToast("Please correct the validation errors.");
          return;
        }

        const client = state.clients.find(c => c.id === clientId);
        if (!client) {
          showToast("Client record not found.");
          return;
        }

        client.name = name;
        client.email = email;
        client.phone = phone;
        client.address = address;
        client.notes = notes;

        persistClientsState();

        // Update client name in projects connected to this client
        state.projects.forEach(p => {
          if (p.client_id === clientId) {
            p.client_name = name;
            p.client_email = email;
          }
        });
        persistProjectsState();

        if (supabaseClient && state.isConnected) {
          try {
            await supabaseClient.from('clients').update({ name, email, phone, address, notes }).eq('id', clientId);
          } catch(e) {
            console.error("Database operation failed while updating client:", e);
            showToast("Warning: Client changes were saved locally, but could not sync to the database.", "Retry", () => syncClientToDatabase(client));
          }
        }

        closeModal("editClientModal");
        renderClients();
        showToast("Client details updated successfully.");
      }

      function ensureCatalogCategories(){
        if(!Array.isArray(state.catalogCategories))state.catalogCategories=[];
        let migrated=false;
        (state.soloServices||[]).forEach(service=>{
          let c=String(service.category||'').trim();
          if(!c||c.toUpperCase()==='SOLO'||c.toUpperCase()==='PACKAGE'){service.category='TV Broadcast Graphics';c=service.category;migrated=true;}
          if(c&&!state.catalogCategories.includes(c))state.catalogCategories.push(c);
        });
        (state.packagesList||[]).forEach(pkg=>{
          let c=String(pkg.category||'').trim();
          if(!c||c.toUpperCase()==='PACKAGE'||c.toUpperCase()==='SOLO'){
            const first=(pkg.includedServiceNames||[])[0],svc=(state.soloServices||[]).find(service=>String(service.name||'')===String(first||''));
            c=String(svc?.category||'TV Broadcast Graphics');pkg.category=c;migrated=true;
          }
          if(c&&!state.catalogCategories.includes(c))state.catalogCategories.push(c);
        });
        state.catalogCategories=[...new Set(state.catalogCategories.map(x=>String(x||'').trim()).filter(Boolean).filter(x=>!['SOLO','PACKAGE'].includes(x.toUpperCase())))];
        if(!state.catalogCategories.some(x=>x.toLowerCase()==='tv broadcast graphics')&&(state.soloServices||[]).some(s=>String(s.category||'').toLowerCase()==='tv broadcast graphics'))state.catalogCategories.unshift('TV Broadcast Graphics');
        if(migrated)persistCatalogState();
      }
      function catalogTableSnapshot(tableSelector){
        const table=document.querySelector(tableSelector);if(!table)return '<div class="empty-compact-state"><strong>No items</strong><span>Nothing matches the current catalog view.</span></div>';
        const clone=table.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));clone.querySelectorAll('button').forEach(btn=>btn.remove());
        return `<div class="catalog-full-table-scroll">${clone.outerHTML}</div>`;
      }
      function openCatalogFullView(){
        renderPricelist();
        const filter=state.catalogManagerFilter||'All Items',selected=state.catalogManagerCategory||'ALL',title=document.getElementById('catalogFullViewTitle'),body=document.getElementById('catalogFullViewBody');if(!body)return;
        const category=selected==='ALL'?'All Services':displayCategory(selected);if(title)title.textContent=`${filter} · ${category}`;
        const services=catalogTableSnapshot('#catalogServicesCard table'),packages=catalogTableSnapshot('#catalogPackagesCard table');
        body.innerHTML=selected==='ALL'?services:(filter==='Items'?services:filter==='Packages'?packages:`<div class="catalog-full-section"><div class="section-kicker">ITEMS</div>${services}</div><div class="catalog-full-section"><div class="section-kicker">PACKAGES</div>${packages}</div>`);
        openModal('catalogFullViewModal');
      }

      function openCatalogSectionFullView(kind='all'){
        const previous=state.catalogManagerFilter;state.catalogManagerFilter=kind==='packages'?'Packages':kind==='items'?'Items':'All Items';openCatalogFullView();state.catalogManagerFilter=previous;renderPricelist();
      }
      function renderPricelist(){
        ensureCatalogCategories();ensureAdditionalFees();renderAdditionalFeesManager();const serviceList=document.getElementById('catalogCategoryList'),itemsBody=document.getElementById('catalogServicesBody'),packagesBody=document.getElementById('catalogPackagesBody'),filters=document.getElementById('catalogManagerFilters');if(!serviceList||!itemsBody||!packagesBody||!filters)return;
        const q=(document.getElementById('catalogManagerSearch')?.value||'').trim().toLowerCase(),pref=state.listSorts?.catalog||'default',selected=state.catalogManagerCategory||'ALL';if(selected==='ALL')state.catalogManagerFilter='All Items';else if(!['Items','Packages'].includes(state.catalogManagerFilter))state.catalogManagerFilter='Items';const filter=state.catalogManagerFilter;filters.innerHTML=selected==='ALL'?'':['Items','Packages'].map(n=>`<button class="filter-pill ${filter===n?'active':''}" onclick="app.setCatalogManagerFilter('${n}')">${n}</button>`).join('');filters.style.display=selected==='ALL'?'none':'flex';const sortEl=document.getElementById('catalogSort');if(sortEl)sortEl.value=pref;
        const categories=['ALL',...state.catalogCategories];if(pref==='az')categories.splice(1,categories.length-1,...categories.slice(1).sort((a,b)=>String(a).localeCompare(String(b))));if(pref==='za')categories.splice(1,categories.length-1,...categories.slice(1).sort((a,b)=>String(b).localeCompare(String(a))));
        serviceList.innerHTML=categories.map((service,index)=>{const label=service==='ALL'?'All':displayCategory(service),itemCount=service==='ALL'?state.soloServices.length:state.soloServices.filter(s=>String(s.category||'')===service).length,packageCount=service==='ALL'?state.packagesList.length:state.packagesList.filter(p=>String(p.category||'')===service).length,enc=encodeURIComponent(service),draggable=service!=='ALL'&&pref==='default';return `<button class="catalog-category-item ${selected===service?'active':''}" ${draggable?'draggable="true"':''} data-service-index="${index-1}" ondragstart="app.startCatalogServiceDrag(event,${index-1})" ondragover="app.allowCatalogServiceDrop(event)" ondrop="app.dropCatalogService(event,${index-1})" onclick="app.selectCatalogCategory(decodeURIComponent('${enc}'))"><span class="service-drag-handle" aria-hidden="true">${service==='ALL'?'':'⋮⋮'}</span><span class="service-nav-copy"><strong>${escapeHtml(label)}</strong><small>${itemCount} item${itemCount===1?'':'s'}${packageCount?` · ${packageCount} package${packageCount===1?'':'s'}`:''}</small></span>${service!=='ALL'?`<span class="catalog-category-more vertical-more" onclick="event.stopPropagation();app.openCatalogCategoryMenu(decodeURIComponent('${enc}'),this,event)">⋮</span>`:''}</button>`}).join('');
        let items=state.soloServices.filter(item=>(selected==='ALL'||String(item.category||'')===selected)&&(`${item.name||''} ${item.category||''} ${item.description||''}`).toLowerCase().includes(q)),packages=state.packagesList.filter(pkg=>(selected==='ALL'||String(pkg.category||'')===selected)&&`${pkg.name||''} ${pkg.category||''} ${pkg.description||''} ${(pkg.includedServiceNames||[]).join(' ')}`.toLowerCase().includes(q));const cmp=pref==='za'?(a,b)=>String(b.name||'').localeCompare(String(a.name||'')):(a,b)=>String(a.name||'').localeCompare(String(b.name||''));if(pref!=='default'){items.sort(cmp);packages.sort(cmp)}
        const packageCard=document.getElementById('catalogPackagesCard'),itemCard=document.getElementById('catalogServicesCard'),head=document.getElementById('catalogServicesHead'),title=document.getElementById('catalogSelectedCategoryTitle'),kicker=document.getElementById('catalogItemsKicker'),addItem=document.getElementById('catalogAddItemBtn');if(title)title.textContent=selected==='ALL'?'All Shop Items':displayCategory(selected);if(kicker)kicker.textContent=selected==='ALL'?'SHOP':'ITEMS';if(addItem)addItem.style.display=selected==='ALL'?'none':'';
        if(selected==='ALL'){
          packageCard.style.display='none';itemCard.style.display=filter==='Packages'?'none':'';if(head)head.innerHTML='<tr><th>Item / Package</th><th>Description / Inclusions</th><th>Price</th><th class="actions-col"></th></tr>';
          const itemRows=items.map((item,i)=>{const menu=`shopItem_${i}`;return `<tr><td><strong>${escapeHtml(item.name)}</strong><small class="row-subtype">${escapeHtml(displayCategory(item.category||''))} · Item</small></td><td class="catalog-desc-cell">${escapeHtml(item.description||'')}</td><td><strong>${formatCurrency(item.price||0)}</strong></td><td class="actions-cell"><div class="popover-wrap" id="${menu}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menu}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openEditServiceModal('${item.product_code}')">Edit Item</button><button class="popover-action text-danger" onclick="app.quickDeleteCatalogItem('${item.product_code}')">Delete Item</button></div></div></td></tr>`}).join('');
          const packageRows=packages.map((pkg,i)=>{const inc=Array.isArray(pkg.includedServiceNames)?pkg.includedServiceNames:[],menu=`shopPkg_${i}`;return `<tr class="package-row"><td><strong>${escapeHtml(normalizeBroadcastPackageName(pkg.name))}</strong><small class="row-subtype">${escapeHtml(packageDisplayDescription(pkg)||displayCategory(pkg.category||''))}</small></td><td><details class="catalog-inclusions-accordion"><summary>${inc.length} item${inc.length===1?'':'s'}</summary><div>${inc.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></details></td><td><strong>${formatCurrency(pkg.sellingPrice||0)}</strong><small class="row-price-note">Original ${formatCurrency(pkg.originalPrice||0)}</small></td><td class="actions-cell"><div class="popover-wrap" id="${menu}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menu}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openEditPackageModal('${pkg.product_code}')">Edit Package</button><button class="popover-action text-danger" onclick="app.quickDeleteCatalogPackage('${pkg.product_code}')">Delete Package</button></div></div></td></tr>`}).join('');itemsBody.innerHTML=(filter==='Packages'?'':itemRows)+(filter==='Items'?'':packageRows)||`<tr><td colspan="4" class="text-center text-muted py-4">No matching Shop items.</td></tr>`;
        }else{
          itemCard.style.display=filter==='Packages'?'none':'';packageCard.style.display=filter==='Items'?'none':'';if(head)head.innerHTML='<tr><th>Item / Service</th><th>Description</th><th>Price</th><th class="actions-col"></th></tr>';
          itemsBody.innerHTML=items.map((item,i)=>{const menu=`shopItem_${i}`;return `<tr><td><strong>${escapeHtml(item.name)}</strong></td><td class="catalog-desc-cell">${escapeHtml(item.description||'')}</td><td><strong>${formatCurrency(item.price||0)}</strong></td><td class="actions-cell"><div class="popover-wrap" id="${menu}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menu}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openEditServiceModal('${item.product_code}')">Edit Item</button><button class="popover-action text-danger" onclick="app.quickDeleteCatalogItem('${item.product_code}')">Delete Item</button></div></div></td></tr>`}).join('')||`<tr><td colspan="4" class="text-center text-muted py-4">No matching items in this Service.</td></tr>`;
          packagesBody.innerHTML=packages.map((pkg,i)=>{const inc=Array.isArray(pkg.includedServiceNames)?pkg.includedServiceNames:[],menu=`shopPkg_${i}`;return `<tr><td><strong>${escapeHtml(normalizeBroadcastPackageName(pkg.name))}</strong>${packageDisplayDescription(pkg)?`<small class="row-subtype">${escapeHtml(packageDisplayDescription(pkg))}</small>`:''}</td><td><details class="catalog-inclusions-accordion"><summary>${inc.length} item${inc.length===1?'':'s'}</summary><div>${inc.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></details></td><td>${formatCurrency(pkg.originalPrice||0)}</td><td><strong>${formatCurrency(pkg.sellingPrice||0)}</strong></td><td class="actions-cell"><div class="popover-wrap" id="${menu}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menu}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openEditPackageModal('${pkg.product_code}')">Edit Package</button><button class="popover-action text-danger" onclick="app.quickDeleteCatalogPackage('${pkg.product_code}')">Delete Package</button></div></div></td></tr>`}).join('')||`<tr><td colspan="5" class="text-center text-muted py-4">No packages in this Service.</td></tr>`;
        }
      }
      function startCatalogServiceDrag(event,index){state.draggedCatalogServiceIndex=index;event.dataTransfer.effectAllowed='move';event.currentTarget.classList.add('is-dragging');}
      function allowCatalogServiceDrop(event){event.preventDefault();event.dataTransfer.dropEffect='move';}
      function dropCatalogService(event,index){event.preventDefault();document.querySelectorAll('.catalog-category-item').forEach(x=>x.classList.remove('is-dragging'));const from=Number(state.draggedCatalogServiceIndex);if(!Number.isInteger(from)||from<0||index<0||from===index)return;const list=state.catalogCategories;const [moved]=list.splice(from,1);list.splice(index,0,moved);persistCatalogState();state.listSorts.catalog='default';renderPricelist();showToast('Service sequence updated.');}
      function openCatalogCategoryMenu(name,button,event){event?.stopPropagation();openCatalogCategoryModal(name);}
      function quickDeleteCatalogItem(code){const svc=state.soloServices.find(s=>s.product_code===code);if(!svc)return;const bundles=state.packagesList.filter(p=>(p.includedServiceNames||[]).includes(svc.name));requestDestructivePin('Delete Item',`Delete "${svc.name}"?${bundles.length?` It will also be removed from ${bundles.length} Package${bundles.length===1?'':'s'}.`:''}`,()=>{state.soloServices=state.soloServices.filter(s=>s.product_code!==code);state.packagesList.forEach(p=>{p.includedServiceNames=(p.includedServiceNames||[]).filter(n=>n!==svc.name);const selected=new Set(p.includedServiceNames);p.originalPrice=state.soloServices.filter(s=>selected.has(s.name)).reduce((sum,s)=>sum+Number(s.price||0),0);p.discount=Math.max(0,Number(p.originalPrice||0)-Number(p.sellingPrice||0));});persistCatalogState();renderPricelist();renderServiceCatalog();showToast('Item deleted.');});}
      function quickDeleteCatalogPackage(code){const pkg=state.packagesList.find(p=>p.product_code===code);if(!pkg)return;requestDestructivePin('Delete Package',`Delete "${pkg.name}"?`,()=>{state.packagesList=state.packagesList.filter(p=>p.product_code!==code);persistCatalogState();renderPricelist();renderServiceCatalog();showToast('Package deleted.');});}

      function setCatalogManagerFilter(filter){if(state.catalogManagerCategory==='ALL'){state.catalogManagerFilter='All Items';}else state.catalogManagerFilter=filter==='Packages'?'Packages':'Items';renderPricelist()}
      function selectCatalogCategory(category){state.catalogManagerCategory=category;state.catalogManagerFilter=category==='ALL'?'All Items':'Items';renderPricelist()}
      function switchPricelistTab(tab){state.catalogManagerFilter=tab==='PACKAGE'?'Packages':'Items';renderPricelist()}
      function filterPricelistTable(){renderPricelist()}
      function openCatalogCategoryModal(existing=''){ensureCatalogCategories();document.getElementById('catalogCategoryOldName').value=existing||'';document.getElementById('catalogCategoryName').value=existing||'';document.getElementById('catalogCategoryModalTitle').textContent=existing?'Edit Service':'Add Service';document.getElementById('catalogCategoryDeleteBtn')?.classList.toggle('hidden',!existing);openModal('catalogCategoryModal')}
      function saveCatalogCategory(){const old=document.getElementById('catalogCategoryOldName').value.trim(),name=document.getElementById('catalogCategoryName').value.trim();if(!name){showToast('Item name is required.');return}ensureCatalogCategories();const dup=state.catalogCategories.some(c=>c.toLowerCase()===name.toLowerCase()&&c!==old);if(dup){showToast('That Service already exists.');return}if(old){const idx=state.catalogCategories.indexOf(old);if(idx>-1)state.catalogCategories[idx]=name;state.soloServices.forEach(s=>{if(String(s.category||'')===old)s.category=name});state.packagesList.forEach(pkg=>{if(String(pkg.category||'')===old)pkg.category=name});if(state.catalogManagerCategory===old)state.catalogManagerCategory=name}else state.catalogCategories.push(name);persistCatalogState();closeModal('catalogCategoryModal');renderPricelist();renderServiceCatalog();showToast(old?'Service updated.':'Service added.')}
      function openCatalogServiceModal(code=''){
        ensureCatalogCategories();if(!state.catalogCategories.length){showToast('Create a Service first.');return}if(state.catalogManagerCategory==='ALL'&&!code){showToast('Select a Service first, then add an Item.');return}const item=code?state.soloServices.find(s=>s.product_code===code):null;document.getElementById('catalogServiceModalTitle').textContent=item?'Edit Item':'Add Item';document.getElementById('catalogServiceCode').value=item?.product_code||'';document.getElementById('catalogServiceName').value=item?.name||'';document.getElementById('catalogServiceDescription').value=item?.description||'';enforceWordLimit(document.getElementById('catalogServiceDescription'),60,'catalogServiceDescriptionCount');document.getElementById('catalogServicePrice').value=item?.price??'';document.getElementById('catalogServiceDeleteBtn')?.classList.toggle('hidden',!item);const sel=document.getElementById('catalogServiceCategory');sel.innerHTML=state.catalogCategories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');sel.value=item?.category||(state.catalogManagerCategory!=='ALL'?state.catalogManagerCategory:state.catalogCategories[0]);openModal('catalogServiceModal')
      }
      function saveCatalogService(){const code=document.getElementById('catalogServiceCode').value,name=document.getElementById('catalogServiceName').value.trim(),category=document.getElementById('catalogServiceCategory').value,desc=document.getElementById('catalogServiceDescription').value.trim(),price=Number(document.getElementById('catalogServicePrice').value);if(!name||!category||!Number.isFinite(price)||price<0){showToast('Enter a valid Item name, Service, and price.');return}if(code){const item=state.soloServices.find(s=>s.product_code===code);if(item)Object.assign(item,{name:name.toUpperCase(),category,description:desc,price,active:true,type:'SOLO'})}else{const nums=state.soloServices.map(s=>Number(String(s.product_code||'').match(/(\d+)$/)?.[1]||0)),next=Math.max(0,...nums)+1;state.soloServices.push({product_code:`SRV-${String(next).padStart(3,'0')}`,name:name.toUpperCase(),category,description:desc,price,active:true,type:'SOLO'})}persistCatalogState();closeModal('catalogServiceModal');renderPricelist();renderServiceCatalog();showToast(code?'Item updated.':'Item added.')}
      function packageDisplayDescription(pkg){const d=String(pkg?.description||'').trim();return /^includes\s*:/i.test(d)?'':d;}
      function renderPackageServiceChoices(query=''){
        const box=document.getElementById('catalogPackageServiceChoices');if(!box)return;const q=String(query||'').toLowerCase(),category=document.getElementById('catalogPackageCategory')?.value||'',selected=new Set(state.packageBuilderSelectedNames||[]),items=state.soloServices.filter(s=>(!category||String(s.category||'')===category)&&(`${s.name||''} ${s.category||''}`).toLowerCase().includes(q));box.innerHTML=items.map(s=>`<label class="package-service-choice"><input type="checkbox" value="${escapeHtml(s.name)}" data-price="${Number(s.price||0)}" ${selected.has(s.name)?'checked':''} onchange="app.togglePackageBuilderService(this.value,this.checked)"><span><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(displayCategory(s.category||''))} · Item · ${formatCurrency(s.price||0)}</small></span></label>`).join('')||`<div class="typeahead-empty">No matching Items in this Service</div>`;updatePackagePriceSummary()
      }
      function togglePackageBuilderService(name,checked){const set=new Set(state.packageBuilderSelectedNames||[]);if(checked)set.add(name);else set.delete(name);state.packageBuilderSelectedNames=[...set];updatePackagePriceSummary()}
      function updatePackagePriceSummary(){const selected=new Set(state.packageBuilderSelectedNames||[]),total=state.soloServices.filter(s=>selected.has(s.name)).reduce((sum,s)=>sum+Number(s.price||0),0),el=document.getElementById('catalogPackageOriginalTotal');if(el)el.textContent=formatCurrency(total)}
      function openCatalogPackageModal(code=''){
        ensureCatalogCategories();if(!state.catalogCategories.length){showToast('Create a Service and Items first.');return}if(state.catalogManagerCategory==='ALL'&&!code){showToast('Select the Service where this Package belongs.');return}const pkg=code?state.packagesList.find(p=>p.product_code===code):null;state.packageBuilderSelectedNames=[...(pkg?.includedServiceNames||[])];document.getElementById('catalogPackageModalTitle').textContent=pkg?'Edit Package':'Create Package';document.getElementById('catalogPackageCode').value=pkg?.product_code||'';document.getElementById('catalogPackageName').value=pkg?normalizeBroadcastPackageName(pkg.name):'';document.getElementById('catalogPackageDescription').value=packageDisplayDescription(pkg);enforceWordLimit(document.getElementById('catalogPackageDescription'),80,'catalogPackageDescriptionCount');document.getElementById('catalogPackageSellingPrice').value=pkg?.sellingPrice??'';document.getElementById('catalogPackageDeleteBtn')?.classList.toggle('hidden',!pkg);const categorySel=document.getElementById('catalogPackageCategory');categorySel.innerHTML=state.catalogCategories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(displayCategory(c))}</option>`).join('');categorySel.value=pkg?.category||(state.catalogManagerCategory!=='ALL'?state.catalogManagerCategory:state.catalogCategories[0]);document.getElementById('catalogPackageServiceSearch').value='';renderPackageServiceChoices('');openModal('catalogPackageModal')
      }
      function saveCatalogPackage(){
        const code=document.getElementById('catalogPackageCode').value,name=document.getElementById('catalogPackageName').value.trim(),category=document.getElementById('catalogPackageCategory').value,description=document.getElementById('catalogPackageDescription')?.value.trim()||'',selling=Number(document.getElementById('catalogPackageSellingPrice').value),included=[...(state.packageBuilderSelectedNames||[])],selected=new Set(included),original=state.soloServices.filter(s=>selected.has(s.name)).reduce((sum,s)=>sum+Number(s.price||0),0);if(!name||!category||!included.length||!Number.isFinite(selling)||selling<0){showToast('Add a Package name, Service, at least one Item, and a valid offer price.');return}const payload={name:name.toUpperCase(),category,description,type:'PACKAGE',sellingPrice:selling,originalPrice:original,discount:Math.max(0,original-selling),includedServiceNames:included,active:true};if(code){const pkg=state.packagesList.find(p=>p.product_code===code);if(pkg)Object.assign(pkg,payload)}else{const nums=state.packagesList.map(p=>Number(String(p.product_code||'').match(/(\d+)$/)?.[1]||0)),next=Math.max(0,...nums)+1;state.packagesList.push({product_code:`PKG-${String(next).padStart(3,'0')}`,...payload})}persistCatalogState();closeModal('catalogPackageModal');renderPricelist();renderServiceCatalog();showToast(code?'Package updated.':'Package created.')
      }
      function deleteCatalogCategory(){const name=document.getElementById('catalogCategoryOldName')?.value.trim();if(!name)return;const usedServices=state.soloServices.filter(s=>String(s.category||'')===name).length,usedPackages=state.packagesList.filter(p=>String(p.category||'')===name).length;requestDestructivePin('Delete Service',`Delete "${name}"? ${usedServices+usedPackages?`It contains ${usedServices} item${usedServices===1?'':'s'} and ${usedPackages} package${usedPackages===1?'':'s'}; move or delete them first.`:'The Service is empty.'}`,()=>{if(usedServices||usedPackages){showToast('Move or delete the items in this category first.');return;}state.catalogCategories=state.catalogCategories.filter(c=>c!==name);if(state.catalogManagerCategory===name)state.catalogManagerCategory='ALL';persistCatalogState();closeModal('catalogCategoryModal');renderPricelist();showToast('Service deleted.');});}
      function deleteCatalogService(){const code=document.getElementById('catalogServiceCode')?.value;if(!code)return;const svc=state.soloServices.find(s=>s.product_code===code);if(!svc)return;const bundles=state.packagesList.filter(p=>(p.includedServiceNames||[]).includes(svc.name));requestDestructivePin('Delete Item',`Delete "${svc.name}"?${bundles.length?` It will also be removed from ${bundles.length} package${bundles.length===1?'':'s'}.`:''}`,()=>{state.soloServices=state.soloServices.filter(s=>s.product_code!==code);state.packagesList.forEach(p=>{p.includedServiceNames=(p.includedServiceNames||[]).filter(n=>n!==svc.name);const selected=new Set(p.includedServiceNames);p.originalPrice=state.soloServices.filter(s=>selected.has(s.name)).reduce((sum,s)=>sum+Number(s.price||0),0);p.discount=Math.max(0,Number(p.originalPrice||0)-Number(p.sellingPrice||0));});persistCatalogState();closeModal('catalogServiceModal');renderPricelist();renderServiceCatalog();showToast('Item deleted.');});}
      function deleteCatalogPackage(){const code=document.getElementById('catalogPackageCode')?.value;if(!code)return;const pkg=state.packagesList.find(p=>p.product_code===code);if(!pkg)return;requestDestructivePin('Delete Package',`Delete "${pkg.name}"?`,()=>{state.packagesList=state.packagesList.filter(p=>p.product_code!==code);persistCatalogState();closeModal('catalogPackageModal');renderPricelist();renderServiceCatalog();showToast('Package deleted.');});}

      function openEditServiceModal(code) { openCatalogServiceModal(code); }

      function openEditPackageModal(code) { openCatalogPackageModal(code); }

      /* VALIDATION FOR EDITING CATALOG / PACKAGES */
      function savePricelistItem() {
        const code = document.getElementById("pricelistItemId").value;
        const type = document.getElementById("pricelistItemType").value;
        const nameInput = document.getElementById("pricelistItemName");
        const priceInput = document.getElementById("pricelistItemPrice");
        const descInput = document.getElementById("pricelistItemDesc");
        
        const name = nameInput.value.trim().toUpperCase();
        const desc = descInput.value.trim();
        const price = Number(priceInput.value);

        const errName = document.getElementById("pricelistItemNameError");
        const errPrice = document.getElementById("pricelistItemPriceError");
        if (errName) errName.innerText = "";
        if (errPrice) errPrice.innerText = "";
        nameInput.classList.remove("is-invalid");
        priceInput.classList.remove("is-invalid");

        let valid = true;
        if (!name) {
          if (errName) errName.innerText = "Name is required.";
          nameInput.classList.add("is-invalid");
          valid = false;
        }
        if (isNaN(price) || price < 0) {
          if (errPrice) errPrice.innerText = "Price must be greater than or equal to ₱0.";
          priceInput.classList.add("is-invalid");
          valid = false;
        }

        if (!valid) {
          showToast("Please fix the validation errors before saving.");
          return;
        }

        if (type === 'SOLO') {
          const item = state.soloServices.find(s => s.product_code === code);
          if (item) {
            item.name = name;
            item.description = desc;
            item.price = price;
          }
        } else {
          const pkg = state.packagesList.find(p => p.product_code === code);
          if (pkg) {
            const origPrice = Number(document.getElementById("pricelistItemOriginalPrice").value || price);
            pkg.name = normalizeBroadcastPackageName(name);
            pkg.description = desc;
            pkg.sellingPrice = price;
            pkg.originalPrice = origPrice;
            pkg.discount = Math.max(0, origPrice - price);
          }
        }

        persistCatalogState();
        closeModal("pricelistItemModal");
        renderPricelist();
        renderServiceCatalog();
        showToast("Changes saved successfully to the database.");
      }

      async function saveProjectNotes() {
        if (!state.activeProjectId) return;
        const proj = state.projects.find(p => p.id === state.activeProjectId);
        if (!proj) return;
        const notesEl=document.getElementById('projectNotesTextarea');enforceWordLimit(notesEl,120,'projectNotesWordCount');proj.notes = notesEl.value.trim();
        proj.updated_at = new Date().toISOString();
        persistProjectsState();
        if (supabaseClient && state.isConnected) {
          try { const {error}=await supabaseClient.from('projects').update({notes:proj.notes,updated_at:proj.updated_at}).eq('id',proj.id); if(error) throw error; }
          catch(e){ console.warn('Notes database sync unavailable:',e.message); }
        }
        showToast("Notes saved.");
      }

      function promptMarkAsDelivered() {
        if(!state.activeProjectId)return;const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;
        showConfirmationDialog('Mark as Delivered',`Mark "${proj.title}" as delivered? It will leave Current Projects and move to Completed. Any unpaid balance will remain Pending in Invoices & Payments.`,'Confirm Delivery',()=>{
          showActionStatus('Processing','Updating project status…',false);
          setTimeout(()=>{proj.delivery_status='Delivered';proj.status='Completed';proj.delivered_at=proj.delivered_at||new Date().toISOString();const deliveredDay=String(proj.delivered_at).slice(0,10);proj.payment_due_date=addDaysToDateString(deliveredDay,3);proj.invoice_due_date=proj.payment_due_date;proj.archived_at=proj.archived_at||proj.delivered_at;proj.updated_at=new Date().toISOString();persistProjectsState();renderOverviewDashboard();renderProjects();renderPaymentsView();showActionStatus('Project Delivered','The project was moved to Completed.',true);setTimeout(()=>{closeModal('actionStatusModal');navigateTo('projects');state.projectFilter='Completed';renderProjects();},900);},650);
        });
      }

      function openPricelistModal() { openCatalogServiceModal(); }

      function openCustomProductModal() { openModal("customProductModal"); }

      function addCustomProductToCart() {
        const nameInput = document.getElementById("customProdName");
        const priceInput = document.getElementById("customProdPrice");
        const errName = document.getElementById("customProdNameError");
        const errPrice = document.getElementById("customProdPriceError");

        if (errName) errName.innerText = "";
        if (errPrice) errPrice.innerText = "";
        nameInput.classList.remove("is-invalid");
        priceInput.classList.remove("is-invalid");

        const name = nameInput.value.trim().toUpperCase();
        const price = Number(priceInput.value);
        const qty = Number(document.getElementById("customProdQty").value || 1);

        let valid = true;
        if (!name) {
          if (errName) errName.innerText = "Item name is required.";
          nameInput.classList.add("is-invalid");
          valid = false;
        }
        if (isNaN(price) || price < 0) {
          if (errPrice) errPrice.innerText = "Price must be greater than or equal to ₱0.";
          priceInput.classList.add("is-invalid");
          valid = false;
        }

        if (!valid) {
          showToast("Please enter a valid Item name and price.");
          return;
        }

        addToCart(name, price, 'SOLO', qty);
        closeModal("customProductModal");
        showToast(`Custom Item "${name}" added to cart.`);
      }

      function mobileOpenProjectOrderBatch(projId){
        if(projId)state.activeProjectId=projId;
        openProjectOrderBatchModal();
      }
      function mobileAttachReceipt(projId,paymentId){
        if(projId)state.activeProjectId=projId;
        attachReceiptToPayment(paymentId);
      }
      function mobileViewPaymentReceipt(projId,paymentId){
        if(projId)state.activeProjectId=projId;
        viewPaymentReceipt(paymentId);
      }
      function mobileOpenRecordPayment(projId){
        if(projId)state.activeProjectId=projId;
        openRecordPaymentModal();
      }
      function mobileOpenEditProject(projId){
        openEditProjectModal(projId);
      }


      function defaultAdditionalFees(){
        return [
          {code:'RUSH',name:'Rush Fee',amount:500,rule:'per_4_days_early',description:'Applied when the requested deadline is earlier than the standard timeline. Current workload may adjust the final rush charge from JP-052 onward.',active:true,locked:true},
          {code:'REVISION',name:'Revision Fee',amount:500,rule:'per_revision',description:'Applied for each chargeable revision request added to the project.',active:true,locked:true},
          {code:'SYSTEM_MAINTENANCE',name:'System Maintenance Fee',amount:21,rule:'package_once',description:'Applied once to orders containing a Package to support the JUAN Project system and service operations.',active:true,locked:true}
        ];
      }
      function ensureAdditionalFees(){
        if(Array.isArray(state.additionalFees)&&state.additionalFees.length)return state.additionalFees;
        let saved=[];try{saved=JSON.parse(localStorage.getItem('JUAN_ADDITIONAL_FEES')||'[]');if(!Array.isArray(saved))saved=[];}catch(_){saved=[];}
        const defaults=defaultAdditionalFees();const byCode=new Map(saved.map(f=>[String(f.code||'').toUpperCase(),f]));
        state.additionalFees=defaults.map(d=>({...d,...(byCode.get(d.code)||{}),code:d.code,locked:true}));
        saved.filter(f=>!defaults.some(d=>d.code===String(f.code||'').toUpperCase())).forEach(f=>state.additionalFees.push({...f,code:String(f.code||`CUSTOM_${Date.now()}`).toUpperCase(),locked:false}));
        persistAdditionalFees();return state.additionalFees;
      }
      function persistAdditionalFees(){localStorage.setItem('JUAN_ADDITIONAL_FEES',JSON.stringify(state.additionalFees||[]));}
      function getFeeConfig(code){ensureAdditionalFees();const key=String(code||'').toUpperCase();return state.additionalFees.find(f=>String(f.code||'').toUpperCase()===key)||{code:key,name:key,amount:0,rule:'manual',description:'',active:false};}
      function getFeeAmount(code,fallback=0){const fee=getFeeConfig(code);return fee.active===false?0:Math.max(0,Number.isFinite(Number(fee.amount))?Number(fee.amount):Number(fallback||0));}
      function renderAdditionalFeesManager(){
        const body=document.getElementById('catalogAdditionalFeesBody');if(!body)return;ensureAdditionalFees();const ruleLabel={per_4_days_early:'Every 4 days earlier',per_revision:'Per revision',package_once:'Once with package',manual:'Manual'};
        body.innerHTML=(state.additionalFees||[]).map((fee,i)=>{const menu=`shopFee_${i}`;return `<tr><td><strong>${escapeHtml(fee.name||'Fee')}</strong>${fee.active===false?'<small class="row-subtype">Inactive</small>':''}</td><td><strong>${formatCurrency(fee.amount||0)}</strong></td><td>${escapeHtml(ruleLabel[fee.rule]||'Manual')}</td><td class="catalog-desc-cell">${escapeHtml(fee.description||'—')}</td><td class="actions-cell"><div class="popover-wrap" id="${menu}"><button class="icon-more-button vertical-more" onclick="app.togglePopover('${menu}',event)">⋮</button><div class="popover-panel client-row-menu"><button class="popover-action" onclick="app.openAdditionalFeeModal('${escapeHtml(fee.code)}')">Edit Fee</button>${fee.locked?'':`<button class="popover-action text-danger" onclick="app.deleteAdditionalFee('${escapeHtml(fee.code)}')">Delete Fee</button>`}</div></div></td></tr>`}).join('')||'<tr><td colspan="5" class="text-center text-muted py-4">No fees configured.</td></tr>';
      }
      function openAdditionalFeeModal(code=''){
        ensureAdditionalFees();const fee=code?getFeeConfig(code):null;document.getElementById('additionalFeeModalTitle').textContent=fee?'Edit Fee':'Add Fee';document.getElementById('additionalFeeCode').value=fee?.code||'';document.getElementById('additionalFeeName').value=fee?.name||'';document.getElementById('additionalFeeAmount').value=fee?.amount??'';document.getElementById('additionalFeeRule').value=fee?.rule||'manual';document.getElementById('additionalFeeDescription').value=fee?.description||'';document.getElementById('additionalFeeActive').checked=fee?.active!==false;document.getElementById('additionalFeeDeleteBtn')?.classList.toggle('hidden',!fee||fee.locked);enforceWordLimit(document.getElementById('additionalFeeDescription'),45,'additionalFeeDescriptionCount');openModal('additionalFeeModal');
      }
      function saveAdditionalFee(){const lockedCode=String(document.getElementById('additionalFeeCode')?.value||'').toUpperCase();if(lockedCode==='REVISION')document.getElementById('additionalFeeAmount').value=REVISION_FEE_PER_REVISION;if(lockedCode==='SYSTEM_MAINTENANCE')document.getElementById('additionalFeeAmount').value=SYSTEM_MAINTENANCE_FEE;
        ensureAdditionalFees();let code=String(document.getElementById('additionalFeeCode')?.value||'').trim().toUpperCase(),name=document.getElementById('additionalFeeName')?.value.trim()||'',amount=Math.max(0,Number(document.getElementById('additionalFeeAmount')?.value||0)),rule=document.getElementById('additionalFeeRule')?.value||'manual',description=document.getElementById('additionalFeeDescription')?.value.trim()||'',active=!!document.getElementById('additionalFeeActive')?.checked;if(!name){showToast('Fee name is required.');return;}if(!code){code='CUSTOM_'+Date.now();state.additionalFees.push({code,name,amount,rule,description,active,locked:false});}else{const fee=state.additionalFees.find(f=>f.code===code);if(fee)Object.assign(fee,{name,amount,rule,description,active});}
        persistAdditionalFees();state.projects.forEach(p=>{if(projectHasPackage(p))p.system_maintenance_charge=getFeeAmount('SYSTEM_MAINTENANCE',21);});persistProjectsState();closeModal('additionalFeeModal');renderAdditionalFeesManager();updateCartCalculations();const proj=state.projects.find(p=>p.id===state.activeProjectId);if(proj){recalculateProjectFromOrderItems(proj);renderProjectOrderItems(proj);renderInvoicePaper(proj);}showToast('Additional fee updated.');
      }
      function deleteAdditionalFee(code=''){
        code=String(code||document.getElementById('additionalFeeCode')?.value||'').toUpperCase();const fee=(state.additionalFees||[]).find(f=>f.code===code);if(!fee||fee.locked){showToast('Core fees can be edited but not deleted.');return;}requestDestructivePin('Delete Fee',`Delete "${fee.name}"?`,()=>{state.additionalFees=state.additionalFees.filter(f=>f.code!==code);persistAdditionalFees();closeModal('additionalFeeModal');renderAdditionalFeesManager();showToast('Fee deleted.');});
      }

      function loadOrderDraftsState(){try{state.orderDrafts=JSON.parse(localStorage.getItem('JUAN_ORDER_DRAFTS')||'[]');if(!Array.isArray(state.orderDrafts))state.orderDrafts=[];}catch(_){state.orderDrafts=[];}state.editingDraftId=null;}
      function persistOrderDrafts(){localStorage.setItem('JUAN_ORDER_DRAFTS',JSON.stringify(state.orderDrafts||[]));updateDraftCountBadge();}
      function updateDraftCountBadge(){const el=document.getElementById('orderDraftCount');if(el)el.textContent=String((state.orderDrafts||[]).length);}
      function collectOrderDraft(){
        state.cart.projectName=document.getElementById('orderProjectName')?.value.trim()||state.cart.projectName||'';state.cart.startDate=document.getElementById('orderStartDate')?.value||state.cart.startDate;state.cart.deadlineDate=document.getElementById('orderDeadlineDate')?.value||state.cart.deadlineDate;
        return {id:state.editingDraftId||`draft_${Date.now()}`,saved_at:new Date().toISOString(),cart:JSON.parse(JSON.stringify(state.cart)),newClient:{name:document.getElementById('newClientName')?.value||'',email:document.getElementById('newClientEmail')?.value||'',phone:document.getElementById('newClientPhone')?.value||'',address:document.getElementById('newClientAddress')?.value||''}};
      }
      function saveOrderDraft(){
        if(!Array.isArray(state.orderDrafts))loadOrderDraftsState();const draft=collectOrderDraft(),idx=state.orderDrafts.findIndex(d=>d.id===draft.id);if(idx>=0)state.orderDrafts[idx]=draft;else state.orderDrafts.unshift(draft);state.editingDraftId=draft.id;persistOrderDrafts();showToast('Order draft saved.');
      }
      function openOrderDrafts(){renderOrderDrafts();openModal('orderDraftsModal');}
      function renderOrderDrafts(){const box=document.getElementById('orderDraftsList');if(!box)return;const drafts=[...(state.orderDrafts||[])].sort((a,b)=>new Date(b.saved_at||0)-new Date(a.saved_at||0));box.innerHTML=drafts.length?drafts.map(d=>{const project=d.cart?.projectName||'Untitled order',count=(d.cart?.items||[]).reduce((s,i)=>s+Number(i.qty||1),0),when=d.saved_at?new Date(d.saved_at).toLocaleString('en-PH',{dateStyle:'medium',timeStyle:'short'}):'';return `<div class="draft-order-row"><div><strong>${escapeHtml(project)}</strong><span>${count} item${count===1?'':'s'} · Saved ${escapeHtml(when)}</span></div><div class="draft-order-actions"><button class="btn btn-secondary btn-sm" onclick="app.loadOrderDraft('${d.id}')">Edit Draft</button><button class="icon-more-button vertical-more" onclick="app.deleteOrderDraft('${d.id}')" aria-label="Delete draft">⋮</button></div></div>`}).join(''):'<div class="empty-compact-state"><strong>No drafts</strong><span>Save an unfinished New Order and continue it later.</span></div>';}
      function loadOrderDraft(id){const d=(state.orderDrafts||[]).find(x=>x.id===id);if(!d)return;state.cart={...state.cart,...JSON.parse(JSON.stringify(d.cart||{}))};state.editingDraftId=id;persistCartState();closeModal('orderDraftsModal');navigateTo('new-order');setTimeout(()=>{const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};set('orderProjectName',state.cart.projectName);set('orderStartDate',state.cart.startDate);set('orderDeadlineDate',state.cart.deadlineDate);set('cartDiscountVal',state.cart.discountVal||0);set('cartDiscountType',state.cart.discountType||'fixed');set('newClientName',d.newClient?.name);set('newClientEmail',d.newClient?.email);set('newClientPhone',d.newClient?.phone);set('newClientAddress',d.newClient?.address);setClientMode(state.cart.clientMode||'existing');if(state.cart.selectedClientId)selectExistingClient(state.cart.selectedClientId);renderCartUI();renderServiceCatalog();updateRushCalculations();},60);}
      function deleteOrderDraft(id,silent=false){if(!Array.isArray(state.orderDrafts))loadOrderDraftsState();state.orderDrafts=state.orderDrafts.filter(d=>d.id!==id);if(state.editingDraftId===id)state.editingDraftId=null;persistOrderDrafts();renderOrderDrafts();if(!silent)showToast('Draft deleted.');}
      function resetNewOrderForm(silent=false){
        const today=getLocalDateString(new Date());state.cart={clientMode:'existing',selectedClientId:'',projectName:'',items:[],discountVal:0,discountType:'fixed',startDate:today,deadlineDate:addDaysToDateString(today,7),deadlineManuallySet:false,rushFee:0,workloadRushRate:0,workloadRushFee:0,rushDaysEarly:0};state.editingDraftId=null;persistCartState();
        const ids=['orderProjectName','orderClientSearch','orderClientSelect','newClientName','newClientEmail','newClientPhone','newClientAddress'];ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});const dv=document.getElementById('cartDiscountVal'),dt=document.getElementById('cartDiscountType');if(dv)dv.value='0';if(dt)dt.value='fixed';setClientMode('existing');renderCartUI();setDefaultOrderDates(true);if(!silent)showToast('New Order form cleared.');
      }

      let workspaceClockTimer=null;
      function updateWorkspaceClock(){const now=new Date(),parts=new Intl.DateTimeFormat('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).formatToParts(now),get=t=>parts.find(p=>p.type===t)?.value||'',date=now.toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'});[['overviewClockHours',get('hour')],['overviewClockMinutes',get('minute')],['overviewClockSeconds',get('second')],['overviewClockPeriod',get('dayPeriod')],['workspaceClockHours',get('hour')],['workspaceClockMinutes',get('minute')],['workspaceClockSeconds',get('second')],['workspaceClockPeriod',get('dayPeriod')],['overviewClockDate',date],['workspaceClockModalDate',date]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});}
      function startWorkspaceClock(){if(workspaceClockTimer)clearInterval(workspaceClockTimer);updateWorkspaceClock();workspaceClockTimer=setInterval(updateWorkspaceClock,1000);}
      function openWorkspaceClock(){updateWorkspaceClock();openModal('workspaceClockModal');}

      function getProjectFileRequestChoices(proj){
        const out=[],seen=new Set(),norm=v=>String(v||'').trim().toLowerCase();const push=(name,price,code='')=>{const key=norm(name);if(!name||seen.has(key))return;seen.add(key);out.push({name,price:Math.max(0,Number(price||0)),code});};
        (proj?.project_items||[]).forEach(item=>{const type=String(item.type||'').toUpperCase();if(['ADDON','REQUEST'].includes(type))return;if(type==='PACKAGE'){const pkg=(state.packagesList||[]).find(p=>String(p.product_code||'')===String(item.product_code||'')||norm(p.name)===norm(item.name));(pkg?.includedServiceNames||[]).forEach(name=>{const svc=(state.soloServices||[]).find(s=>norm(s.name)===norm(name));push(name,svc?.price||0,svc?.product_code||'');});}else{const svc=(state.soloServices||[]).find(s=>String(s.product_code||'')===String(item.product_code||'')||norm(s.name)===norm(item.name));push(item.name,svc?.price??item.price,svc?.product_code||item.product_code||'');}});return out;
      }
      function renderProjectFileRequestOptions(proj){const sel=document.getElementById('projectFileRequestItem');if(!sel)return;state.projectFileRequestChoices=getProjectFileRequestChoices(proj);sel.innerHTML=state.projectFileRequestChoices.length?state.projectFileRequestChoices.map((x,i)=>`<option value="${i}">${escapeHtml(x.name)} · ${formatCurrency(x.price)} → request ${formatCurrency(x.price*.5)}</option>`).join(''):'<option value="">No eligible item</option>';}
      function refreshProjectAfterRequest(proj){recalculateProjectFromOrderItems(proj);syncProjectDeliverablesFromOrderItems(proj);persistProjectsState();renderProjectOrderItems(proj);renderProjectDeliverablesList(proj);renderPaymentTracker(proj);renderInvoicePaper(proj);renderOverviewDashboard();}
      function addProjectRevisionRequest(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;if(!Array.isArray(proj.project_items))proj.project_items=[];const fee=REVISION_FEE_PER_REVISION;proj.project_items.push({id:`oi_${proj.id}_revision_${Date.now()}`,name:'Revision Request',qty:1,price:fee,type:'ADDON',addon_type:'REVISION',category:'Requests',item_discount:0});proj.revision_count=0;proj.revision_fee_per_revision=fee;refreshProjectAfterRequest(proj);showToast(`Revision request added · ${formatCurrency(fee)}.`);}
      function removeProjectRevisionRequest(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj||!Array.isArray(proj.project_items))return;const i=[...proj.project_items].map((x,idx)=>[x,idx]).reverse().find(([x])=>String(x.addon_type||'').toUpperCase()==='REVISION')?.[1];if(i===undefined)return;proj.project_items.splice(i,1);refreshProjectAfterRequest(proj);showToast('Revision request removed.');}
      function addProjectFileRequest(){const proj=state.projects.find(p=>p.id===state.activeProjectId);if(!proj)return;const idx=Number(document.getElementById('projectFileRequestItem')?.value),choice=(state.projectFileRequestChoices||[])[idx];if(!choice){showToast('Choose the item for the project file request.');return;}if(!Array.isArray(proj.project_items))proj.project_items=[];const price=Math.round(choice.price*.5*100)/100;proj.project_items.push({id:`oi_${proj.id}_file_${Date.now()}`,name:'Project File Request',source_item_name:choice.name,qty:1,price,type:'ADDON',addon_type:'PROJECT_FILE',product_code:null,source_product_code:choice.code||null,category:'Project Files',item_discount:0});refreshProjectAfterRequest(proj);renderProjectFileRequestOptions(proj);showToast(`Project file request added · ${formatCurrency(price)}.`);}

      function setCloudLoginFeedback(message="",kind=""){
        const feedback=document.getElementById('cloudLoginFeedback');
        const err=document.getElementById('cloudLoginError');
        if(feedback){feedback.textContent=message;feedback.className=`cloud-login-feedback${kind?` is-${kind}`:''}`;}
        if(err)err.textContent=kind==='error'?message:'';
      }
      function setCloudConnectBusy(busy,label="Connect"){
        const btn=document.getElementById('cloudLoginConnectBtn');
        const input=document.getElementById('cloudPasswordInput');
        if(btn){btn.disabled=!!busy;btn.textContent=busy?label:"Connect";}
        if(input)input.disabled=!!busy;
      }
      function openCloudLogin(){
        const input=document.getElementById('cloudPasswordInput');
        if(input){input.value='';input.disabled=false;}
        setCloudLoginFeedback("Enter your workspace password to start a secure session.","info");
        setCloudConnectBusy(false);
        openModal('cloudLoginModal');
        setTimeout(()=>input?.focus(),40);
      }
      async function connectCloud(){
        const input=document.getElementById('cloudPasswordInput');
        const password=String(input?.value||'');
        if(!password){setCloudLoginFeedback('Enter the workspace password.','error');input?.focus();return false;}
        setCloudConnectBusy(true,"Authenticating…");
        setCloudLoginFeedback("Authenticating workspace password…","working");
        updateConnectionStatus("connecting","AUTHENTICATING…","Validating the secure workspace session.");
        try{
          const response=await fetch('/api/session',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({password})});
          const body=await response.json().catch(()=>({}));
          if(!response.ok){
            const message=response.status===401?'Wrong workspace password.':(body.error||`Authentication failed (HTTP ${response.status}).`);
            throw new Error(message);
          }
          state.csrfToken=String(body.csrfToken||'');
          state.cloudAuthenticated=true;
          setCloudLoginFeedback("Password accepted. Connecting to Supabase…","working");
          setCloudConnectBusy(true,"Connecting…");
          const connected=await initSupabase();
          if(!connected){
            const detail=document.getElementById('cloudConnectionDetail')?.textContent||'Supabase connection failed. Check Vercel environment variables and database installation.';
            throw new Error(detail);
          }
          setCloudLoginFeedback("Connected. Supabase sync and Gemini are ready.","success");
          setCloudConnectBusy(true,"Connected");
          showToast('Secure cloud sync connected.');
          setTimeout(()=>{closeModal('cloudLoginModal');setCloudConnectBusy(false);},500);
          return true;
        }catch(e){
          const message=String(e?.message||'Cloud sign-in failed');
          state.isConnected=false;
          if(/wrong workspace password/i.test(message))state.cloudAuthenticated=false;
          updateConnectionStatus("error","CLOUD · ERROR",message);
          setCloudLoginFeedback(message,"error");
          setCloudConnectBusy(false);
          input?.focus();
          return false;
        }
      }
      async function disconnectCloud(){
        try{await fetch('/api/session',{method:'DELETE',credentials:'same-origin',headers:{'X-CSRF-Token':state.csrfToken||''}})}catch{}
        state.cloudAuthenticated=false;state.isConnected=false;supabaseClient=null;state.csrfToken='';
        updateConnectionStatus('offline','OFFLINE · LOCAL','Secure cloud session disconnected. Local workspace data remains available.');
        window.dispatchEvent(new CustomEvent('juan:cloud-disconnected'));
        showToast('Cloud sync disconnected.');
      }

      return {
        initWorkspace,
        initSupabase,
        updateConnectionStatus,
        flushCloudQueue,
        openCloudLogin,
        connectCloud,
        disconnectCloud,
        openWorkspaceClock,
        saveOrderDraft,
        openOrderDrafts,
        loadOrderDraft,
        deleteOrderDraft,
        resetNewOrderForm,
        openAdditionalFeeModal,
        saveAdditionalFee,
        deleteAdditionalFee,
        renderAdditionalFeesManager,
        addProjectRevisionRequest,
        removeProjectRevisionRequest,
        addProjectFileRequest,
        navigateTo,
        setThemeMode,
        setDashboardTheme,
        handleProjectDataStartDateChange,
        handleProjectDataDeadlineChange,
        setClientMode,
        handleClientSelectChange,
        showClientSuggestions,
        filterExistingClientOptions,
        selectExistingClient,
        hideClientSuggestions,
        switchCatalogTab,
        setOrderShopService,
        addToCart,
        addPackageToCart,
        updateCartQty,
        updateCartItemDiscount,
        updateCartCalculations,
        updateRushCalculations,
        handleStartDateChange,
        handleDeadlineDateChange,
        showOrderConfirmation,
        confirmAndCreateOrder,
        openProjectDetails,
        openProjectData,
        saveProjectData,
        scheduleProjectDataAutosave,
        autosaveProjectData,
        openProjectDataClientProfile,
        switchProjectTab,
        saveInvoicePDF,
        saveInvoiceImage,
        openFeeInfo,
        toggleDeliverable,
        openRecordPaymentModal,
        submitPaymentRecord,
        finalizePaymentRecord,
        attachReceiptToPayment,
        mobileAttachReceipt,
        mobileViewPaymentReceipt,
        mobileOpenRecordPayment,
        viewPaymentReceipt,
        sendDeadlineReminderEmail,
        sendBalanceReminderEmail,
        saveCurrentProjectAsTemplate,
        loadProjectTemplate,
        exportDataBackup,
        importDataBackup,
        openResetDataModal,
        confirmResetDataPin,
        requestDestructivePin,
        confirmDestructivePin,
        deleteCurrentProject,
        deleteProjectById,
        undoDeleteProject,
        saveProjectNotes,
        promptMarkAsDelivered,
        openPricelistModal,
        openCustomProductModal,
        addCustomProductToCart,
        renderPricelist,
        openCatalogFullView,
        openCatalogSectionFullView,
        switchPricelistTab,
        filterPricelistTable,
        setCatalogManagerFilter,
        selectCatalogCategory,
        openCatalogCategoryModal,
        saveCatalogCategory,
        startCatalogServiceDrag,
        allowCatalogServiceDrop,
        dropCatalogService,
        openCatalogCategoryMenu,
        quickDeleteCatalogItem,
        quickDeleteCatalogPackage,
        openCatalogServiceModal,
        saveCatalogService,
        openCatalogPackageModal,
        renderPackageServiceChoices,
        togglePackageBuilderService,
        updatePackagePriceSummary,
        saveCatalogPackage,
        deleteCatalogCategory,
        deleteCatalogService,
        deleteCatalogPackage,
        openEditServiceModal,
        openEditPackageModal,
        savePricelistItem,
        openEditClientModal,
        submitEditClient,
        handleProfilePhotoUpload,
        normalizePhilippinePhone,
        enforceWordLimit,
        handlePinDigitInput,
        handlePinDigitKeydown,
        onCropZoomChange,
        confirmCroppedImage,
        removeProfilePhoto,
        updateOwnerName,
        updateOwnerAddress,
        updateOwnerPhone,
        updateOwnerEmail,
        changeCalendarMonth,
        resetCalendarToToday,
        openCalendarEventModal,
        saveCalendarEvent,
        deleteCalendarEvent,
        closeModal,
        syncProjectToDatabase,
        syncPaymentToDatabase,
        syncClientToDatabase,
        syncNewClientToDatabase,
        renderOverviewDashboard,
        renderOverviewUpcomingEvents,
        openOverviewListModal,
        setListSort,
        queueViewRender,
        togglePopover,
        renderProjects,
        setProjectFilter,
        setPaymentFilter,
        renderTasks,
        setTaskFilter,
        openTaskModal,
        updateTaskDeliverableOptions,
        saveTask,
        updateTaskStatus,
        deleteTask,
        renderPaymentsView,
        renderReportsView,
        openRevenueMilestone,
        shareRevenueMilestone,
        shareRevenueMilestoneToX,
        shareRevenueMilestoneToFacebook,
        copyRevenueMilestone,
        renderDeliverablesView,
        openClientProfile,
        renderClients,
        removeClient,
        renderClientProfile,
        saveClientProfileChanges,
        autosaveClientProfileField,
        handleLegacyCSVImport,
        importPastedSheetData,
        openEditProjectModal,
        mobileOpenEditProject,
        submitEditProject,
        renderProjectOrderItems,
        openProjectOrderItemModal,
        openProjectOrderBatchModal,
        mobileOpenProjectOrderBatch,
        renderProjectOrderBatchChoices,
        setProjectOrderBatchCategory,
        toggleProjectOrderBatchChoice,
        addCustomProjectBatchItem,
        renderProjectOrderBatchSelected,
        updateProjectOrderBatchQty,
        updateProjectOrderBatchDiscount,
        removeProjectOrderBatchChoice,
        commitProjectOrderBatch,
        renderProjectOrderItemSuggestions,
        selectProjectOrderItemSuggestion,
        hideProjectOrderItemSuggestions,
        setProjectOrderItemType,
        saveProjectOrderItem,
        deleteProjectOrderItem,
        requestDeleteProjectOrderItem,
        openProjectDeliverableModal,
        renderProjectDeliverableSuggestions,
        selectProjectDeliverableSuggestion,
        saveProjectDeliverable,
        deleteProjectDeliverable,
        toggleAssistant,
        assistantQuick,
        sendAssistantMessage,
        assistantCreateSimpleProject
      };
    })();

    document.addEventListener("DOMContentLoaded", () => {
      app.initWorkspace();
      setTimeout(()=>refreshSearchableSelects(document),60);
      
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#orderClientTypeahead")) app.hideClientSuggestions();
        if (!e.target.closest("#projectOrderItemModal .typeahead-wrap")) app.hideProjectOrderItemSuggestions();
        if (!e.target.closest("#projectDeliverableModal .typeahead-wrap")) document.getElementById('projectDeliverableSuggestions')?.classList.remove('open');
      });

      document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const viewId = item.getAttribute("data-view");
          if (viewId) app.navigateTo(viewId);
        });
      });
    });
