/**
 * JUAN PROJECT WORKSPACE — assistant-bridge.js
 * ------------------------------------------------------------------
 * PURPOSE: Compatibility bridge for the JUAN Assistant bubble and navigation hooks. Kept separate so assistant UI changes do not require editing the application engine.
 * LOAD ORDER: 2 of 4 local modules (the OCR library may load between modules).
 *
 * MAINTENANCE TIP:
 * - Search for `function <name>` or `app.<action>` to find a feature.
 * - Make one logical change at a time and commit it with Git.
 * - Do not rename stored LocalStorage keys unless you also write a migration.
 */

(function(){
  const BUBBLE_KEY='JUAN_ASSISTANT_BUBBLE_ENABLED';
  const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  function dueTodayCount(){try{const rows=JSON.parse(localStorage.getItem('JUAN_PROJECTS_LOCAL')||'[]');const t=localDate();return rows.filter(p=>!p.deleted&&p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at&&String(p.deadline_date||'')===t).length}catch(e){return 0}}
  function updateBubble(){const enabled=localStorage.getItem(BUBBLE_KEY)!=='false',wrap=document.getElementById('assistantBubbleWrap'),toggle=document.getElementById('assistantBubbleToggle'),badge=document.getElementById('assistantFabBadge'),nudge=document.getElementById('assistantDeadlineNudge'),count=dueTodayCount();if(toggle)toggle.checked=enabled;if(wrap)wrap.style.display=enabled?'flex':'none';if(badge){badge.hidden=!count;badge.textContent=count}if(nudge){nudge.hidden=!count;nudge.textContent=count?`${count} project${count===1?' is':'s are'} due today.`:''}}
  const originalNavigate=app.navigateTo.bind(app);app.navigateTo=function(view){originalNavigate(view);if(view==='assistant')setTimeout(()=>document.getElementById('assistantPageInput')?.focus(),80);updateBubble()};
  const originalOverview=app.renderOverviewDashboard?.bind(app);if(originalOverview)app.renderOverviewDashboard=function(){const r=originalOverview();requestAnimationFrame(updateBubble);return r};
  window.juanAI={
    flow:null,draft:{},fieldIndex:0,
    fields:[['fullName','Full Name'],['address','Address'],['email','Email Address'],['phone','Phone Number'],['projectName','Project Name']],
    setBubbleEnabled(v){localStorage.setItem(BUBBLE_KEY,v?'true':'false');updateBubble()},
    message(text,role='assistant',html=false){const box=document.getElementById('assistantPageMessages');if(!box)return;const el=document.createElement('div');el.className=`assistant-page-message ${role}`;if(html)el.innerHTML=text;else el.innerHTML=`${role==='assistant'?'<strong>JUAN Assistant</strong>':''}<span></span>`,el.querySelector('span').textContent=text;box.appendChild(el);box.scrollTop=box.scrollHeight},
    newChat(){this.flow=null;this.draft={};this.fieldIndex=0;const box=document.getElementById('assistantPageMessages');if(box)box.innerHTML='<div class="assistant-page-message assistant"><strong>JUAN Assistant</strong><span>I can help encode a basic project record. For now I only collect Full Name, Address, Email Address, Phone Number, and Project Name.</span></div>'},
    beginEncode(){this.flow='encode';this.draft={};this.fieldIndex=0;this.message('Sure. What is the Full Name?')},
    showDueToday(){const rows=(()=>{try{return JSON.parse(localStorage.getItem('JUAN_PROJECTS_LOCAL')||'[]')}catch(e){return []}})(),t=localDate(),due=rows.filter(p=>!p.deleted&&p.status!=='Completed'&&p.delivery_status!=='Delivered'&&!p.archived_at&&String(p.deadline_date||'')===t);this.message(due.length?`${due.length} project${due.length===1?' is':'s are'} due today:\n${due.map(p=>`• JP-${String(Number(p.project_number||0)).padStart(3,'0')} — ${p.title||'Untitled Project'}`).join('\n')}`:'There are no project deadlines today.')},
    send(){const input=document.getElementById('assistantPageInput'),text=input?.value.trim();if(!text)return;if(input)input.value='';this.message(text,'user');if(!this.flow){if(/encode|log|add project|help me encode/i.test(text))return this.beginEncode();if(/due|deadline|today/i.test(text))return this.showDueToday();return this.message('For now I can encode a basic project record or show deadlines due today.');}if(this.flow==='encode'){const [key,label]=this.fields[this.fieldIndex];this.draft[key]=text;this.fieldIndex++;if(this.fieldIndex<this.fields.length){this.message(`What is the ${this.fields[this.fieldIndex][1]}?`);return;}this.flow='confirm';this.showConfirmation()}},
    showConfirmation(){const d=this.draft,box=document.getElementById('assistantPageMessages');if(!box)return;const wrap=document.createElement('div');wrap.className='assistant-confirm-card';wrap.innerHTML=`<div class="section-kicker">CONFIRM DETAILS</div><div class="assistant-confirm-grid"><span>Full Name</span><strong>${this.escape(d.fullName)}</strong><span>Address</span><strong>${this.escape(d.address)}</strong><span>Email Address</span><strong>${this.escape(d.email)}</strong><span>Phone Number</span><strong>${this.escape(d.phone)}</strong><span>Project Name</span><strong>${this.escape(d.projectName)}</strong></div><div class="assistant-confirm-actions"><button class="btn btn-secondary btn-sm" onclick="juanAI.cancelEncode()">Cancel</button><button class="btn btn-confirm btn-sm" onclick="juanAI.confirmEncode()">Confirm & Save</button></div>`;box.appendChild(wrap);box.scrollTop=box.scrollHeight},
    confirmEncode(){const result=app.assistantCreateSimpleProject(this.draft);if(!result?.ok){this.message(result?.message||'I could not save the record.');return}this.flow=null;this.draft={};this.fieldIndex=0;const status=document.getElementById('actionStatusModal');if(status){document.getElementById('actionStatusTitle').textContent='Saving Project';document.getElementById('actionStatusMessage').textContent='Encoding the confirmed details…';document.getElementById('actionStatusGraphic').innerHTML='<span class="action-spinner"></span>';status.classList.add('active')}setTimeout(()=>{if(status)status.classList.remove('active');this.message(`${result.projectRef} was created successfully.`);updateBubble()},500)},
    cancelEncode(){this.flow=null;this.draft={};this.fieldIndex=0;this.message('Encoding cancelled.')},
    escape(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  };
  document.addEventListener('DOMContentLoaded',()=>{updateBubble();setTimeout(updateBubble,250);});
})();
