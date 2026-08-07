const steps = ["entity","safe","elections","entitypack","jurisdiction","gir"];

const stepMeta = {
  entity:{title:"Entity Administration",short:"Entity Admin",subtitle:"Source of truth",doc:"Entity Administration - Version CW",tree:"Entity Administration - Version CW",flow:"Entity Admin → WData → Safe Harbour",instructionTitle:"Start with the entity source of truth",instructionCopy:"Click an entity row to edit selected fields. Save the spreadsheet changes, then open Outgoing and use the Share updates icon in the connection card to push the latest data to WData.",incoming:"General lists incoming",outgoing:"Entity administration data points - WData",tip:"The spreadsheet save and the WData share are separate actions. The outgoing Share updates icon is the hand-off to WData, matching the Workiva interaction shown in the reference screenshots."},
  safe:{title:"Transitional Safe Harbour",short:"Safe Harbour",subtitle:"Pass / fail branch",doc:"2024 - Pillar 2 - Transitional Safe Harbour",tree:"2024 - Pillar 2 - Transitional Safe Harbour",flow:"Entity Admin + Financial Data → Safe Harbour → WData",instructionTitle:"Test jurisdictions and trigger the workflow branch",instructionCopy:"Select Germany or Netherlands, adjust a financial value, and watch the Safe Harbour tests recalculate. Germany is configured to pass; Netherlands is configured to fail. Then share the result through Outgoing.",incoming:"Entity Registration + CbCR data",outgoing:"Safe Harbour - 2024",tip:"This is the demo's main branching moment. A failed jurisdiction activates the Entity Pack and Jurisdictional Pack; a passed jurisdiction does not require those detailed calculations."},
  elections:{title:"Jurisdictional Elections",short:"Elections",subtitle:"Annual & five-year",doc:"Year - Jurisdictional Elections",tree:"Jurisdictional Election Template",flow:"Entity Registration → Elections → WData",instructionTitle:"Capture jurisdictional elections once",instructionCopy:"Use the dropdowns to change annual and five-year elections for a jurisdiction. Your selections remain in the demo state and are reused downstream. Share the updated election table through Outgoing.",incoming:"Incoming Entity Registration",outgoing:"Outgoing Elections",tip:"The exact tax logic is intentionally simplified. The interaction demonstrates that elections are captured once and then reused in the Entity Pack, Jurisdictional Pack and final GIR dataset."},
  entitypack:{title:"Entity Pack",short:"Entity Pack",subtitle:"Failed entities only",doc:"Pillar 2 - Entity Pack",tree:"Pillar 2 - Entity Pack",flow:"Failed Safe Harbour entities → Entity Pack → WData",instructionTitle:"Complete entity-level calculations for failed entities",instructionCopy:"Choose Alpha BV or Delta BV, review imported automated values, enter additions or reductions, and observe calculated totals. This step is only required for entities in the failed Netherlands jurisdiction.",incoming:"Entity Registration + Safe Harbour + Elections",outgoing:"Outgoing Entity Data",tip:"Green cells are imported automatically, blue cells are user inputs, and white total cells are calculated. Completing the two Netherlands entities supplies the data used in the jurisdiction aggregation."},
  jurisdiction:{title:"Jurisdictional Pack",short:"Jurisdiction Pack",subtitle:"Aggregate entity results",doc:"Jurisdictional Pack",tree:"Jurisdictional Pack",flow:"Entity Packs → Jurisdictional aggregation → WData",instructionTitle:"Aggregate entity results at jurisdiction level",instructionCopy:"The Netherlands pack automatically aggregates Alpha BV and Delta BV. Change back to the Entity Pack if you want to alter an adjustment and see the jurisdiction totals update when you return.",incoming:"Entity Pack outputs + Elections",outgoing:"Outgoing Jurisdiction Data",tip:"This view changes the reporting level from entity to jurisdiction. It reuses prior Entity Pack values instead of asking the user to enter the same data again."},
  gir:{title:"GIR – Global",short:"Final Output",subtitle:"GIR-ready dataset",doc:"GIR - Global",tree:"GIR - Global",flow:"Entity + Jurisdiction data → Final reporting dataset",instructionTitle:"Review and export the assembled reporting dataset",instructionCopy:"The final view combines the entity, Safe Harbour, election and jurisdiction-level information. Review the completion checklist and preview or download a dummy JSON/CSV dataset.",incoming:"Entity + Jurisdiction + Election outputs",outgoing:"Final GIR dataset",tip:"The demo ends with a GIR-ready dataset for downstream tagging / filing. It does not simulate XML/XBRL tagging, authority submission, or a production Workiva integration."}
};

const state = {
  current:"entity",
  shared:new Set(),
  dirty:new Set(),
  safeResults:{
    Germany:{revenue:3000000,profit:17800000,tax:5000000,employee:420000,tangible:800000,adjustment:0},
    Netherlands:{revenue:20000000,profit:1000000,tax:140000,employee:300000,tangible:600000,adjustment:0}
  },
  activeJurisdiction:"Netherlands",
  elections:{
    Netherlands:{assetGain:"No",coveredTaxes:"No",sbie:"No",carryForward:"No",equity:"No",electionYear:"",revocationYear:""},
    Germany:{assetGain:"No",coveredTaxes:"No",sbie:"No",carryForward:"No",equity:"No",electionYear:"",revocationYear:""},
    France:{assetGain:"No",coveredTaxes:"No",sbie:"No",carryForward:"No",equity:"No",electionYear:"",revocationYear:""}
  },
  entities:[
    {year:2024,code:"NL101",name:"Alpha BV",jurisdiction:"Netherlands",parent:"Global HoldCo",shareholder:"Global HoldCo",tin:"TIA",upe:"Yes",pope:"No",status:"Complete"},
    {year:2024,code:"NL119",name:"Delta BV",jurisdiction:"Netherlands",parent:"Global HoldCo",shareholder:"Global HoldCo",tin:"TID",upe:"No",pope:"No",status:"Complete"},
    {year:2024,code:"DE103",name:"Beta GmbH",jurisdiction:"Germany",parent:"Global HoldCo",shareholder:"Global HoldCo",tin:"TIP",upe:"No",pope:"No",status:"Complete"},
    {year:2024,code:"FR108",name:"Gamma SAS",jurisdiction:"France",parent:"EU HoldCo",shareholder:"Global HoldCo",tin:"TIQ",upe:"No",pope:"No",status:"Complete"},
    {year:2024,code:"UK117",name:"R UK Ltd",jurisdiction:"UK",parent:"Global HoldCo",shareholder:"Global HoldCo",tin:"TIR",upe:"No",pope:"No",status:"Complete"},
    {year:2024,code:"NL107",name:"B BV",jurisdiction:"Netherlands",parent:"EU HoldCo",shareholder:"Global HoldCo",tin:"TIB",upe:"No",pope:"No",status:"Complete"}
  ],
  entityPack:{
    "Alpha BV":{globe:12000000,covered:1200000,additions:350000,reductions:150000},
    "Delta BV":{globe:8000000,covered:700000,additions:100000,reductions:200000}
  },
  activeEntity:"Alpha BV",
  modalIndex:0,
  editingEntityIndex:null,
  exporting:false
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => Number(n||0).toLocaleString("en-US",{maximumFractionDigits:0});
const pct = n => `${(n*100).toFixed(2)}%`;
const wait = ms => new Promise(r=>setTimeout(r,ms));

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add("hidden"),2800)}
function letters(n){const out=[];for(let i=0;i<n;i++){let x=i,s="";do{s=String.fromCharCode(65+(x%26))+s;x=Math.floor(x/26)-1}while(x>=0);out.push(s)}return out}
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function selectHtml(values,selected,attrs=""){return `<select ${attrs}>${values.map(v=>`<option value="${escapeHtml(v)}" ${v===selected?"selected":""}>${escapeHtml(v)}</option>`).join("")}</select>`}
function inputHtml(value,attrs=""){return `<input type="number" value="${value}" ${attrs}/>`}
function row(cells,cls="",attrs=""){return `<tr class="${cls}" ${attrs}><td class="rownum"></td>${cells.map(c=>`<td class="${c.cls||""}" ${c.colspan?`colspan="${c.colspan}"`:""}>${c.html??escapeHtml(c)}</td>`).join("")}</tr>`}
function makeTable(headers,rows){const width=headers.length;let html=`<thead><tr class="letters"><th class="rownum"></th>${letters(width).map(x=>`<th>${x}</th>`).join("")}</tr><tr><th class="rownum">1</th>${headers.map(h=>`<th class="${h.cls||"section-head"}">${h.html??escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>`;rows.forEach((r,i)=>{html+=r.replace('<td class="rownum"></td>',`<td class="rownum">${i+2}</td>`)});return html+"</tbody>"}

function safeCalc(j){
  const d=state.safeResults[j];
  const p2Revenue=d.revenue+d.adjustment;
  const p2Profit=d.profit+d.adjustment;
  const etr=p2Profit?d.tax/p2Profit:0;
  const deMinimis=p2Revenue<10000000 && Math.abs(p2Profit)<1000000;
  const simplified=etr>=0.15;
  const substance=Math.max(0,d.employee*.05+d.tangible*.05);
  const routine=(p2Profit-substance)<=0;
  const pass=deMinimis||simplified||routine;
  return {p2Revenue,p2Profit,etr,deMinimis,simplified,substance,routine,pass};
}

function entityTable(){
  const headers=["Fiscal Year","Entity Code","Entity Name","Jurisdiction","Parent Entity","Shareholder","TIN","UPE only yes where relevant","POPE Indicator","Completion Status"];
  const rows=state.entities.map((e,i)=>row([
    e.year,e.code,e.name,e.jurisdiction,e.parent,e.shareholder,e.tin,e.upe,e.pope,{html:e.status,cls:"total"}
  ].map((v,idx)=>typeof v==="object"?v:{html:escapeHtml(v),cls:idx>=1&&idx<=8?"manual":""}),"clickable-row",`data-entity-row="${i}" title="Click to edit this entity"`));
  return makeTable(headers,rows);
}

function safeTable(){
  const headers=["Jurisdiction ID","Fiscal year","Revenue (CbCr)","Manual ADJ","Revenue for Pillar 2","Profit (loss) before income tax (CbCr)","Income tax expense","Profit before income tax for Pillar 2","ETR","Employee Expenses","Tangible Assets","Substance-based income exclusion","De minimis Test","Simplified ETR Test","Routine profit Test","Safe harbour applicable"];
  const rows=["Netherlands","Germany"].map(j=>{
    const d=state.safeResults[j],c=safeCalc(j);
    return row([
      {html:j,cls:"manual"},{html:"2024",cls:"total"},{html:money(d.revenue),cls:"auto"},{html:inputHtml(d.adjustment,`data-safe-field="adjustment" data-jurisdiction="${j}"`),cls:"manual"},{html:money(c.p2Revenue),cls:"total"},{html:inputHtml(d.profit,`data-safe-field="profit" data-jurisdiction="${j}"`),cls:"auto"},{html:inputHtml(d.tax,`data-safe-field="tax" data-jurisdiction="${j}"`),cls:"auto"},{html:money(c.p2Profit),cls:"total"},{html:pct(c.etr),cls:"total"},{html:inputHtml(d.employee,`data-safe-field="employee" data-jurisdiction="${j}"`),cls:"auto"},{html:inputHtml(d.tangible,`data-safe-field="tangible" data-jurisdiction="${j}"`),cls:"auto"},{html:money(c.substance),cls:"total"},{html:c.deMinimis?"Pass":"Fail",cls:c.deMinimis?"pass":"fail"},{html:c.simplified?"Pass":"Fail",cls:c.simplified?"pass":"fail"},{html:c.routine?"Pass":"Fail",cls:c.routine?"pass":"fail"},{html:c.pass?"Pass":"Fail",cls:c.pass?"pass":"fail"}
    ],j===state.activeJurisdiction?"active-safe-row":"",`data-safe-row="${j}"`);
  });
  return makeTable(headers,rows);
}

function electionsTable(){
  const h=["Year for which the elections are made","Jurisdiction ID","Aggregate asset gain election","Immaterial decrease in Covered Taxes election","Election not to apply the Substance-based Income Exclusion","Negative Tax Expense Carry-forward","Equity Investment Inclusion Election","Election year","Revocation year"];
  const yesNo=["No","Yes"];
  const rows=Object.keys(state.elections).map(j=>{const e=state.elections[j];return row([
    {html:"2024",cls:"total"},{html:j,cls:"manual"},{html:selectHtml(yesNo,e.assetGain,`data-election="assetGain" data-jurisdiction="${j}"`),cls:"manual"},{html:selectHtml(yesNo,e.coveredTaxes,`data-election="coveredTaxes" data-jurisdiction="${j}"`),cls:"manual"},{html:selectHtml(yesNo,e.sbie,`data-election="sbie" data-jurisdiction="${j}"`),cls:"manual"},{html:selectHtml(yesNo,e.carryForward,`data-election="carryForward" data-jurisdiction="${j}"`),cls:"manual"},{html:selectHtml(yesNo,e.equity,`data-election="equity" data-jurisdiction="${j}"`),cls:"manual"},{html:`<input type="text" value="${escapeHtml(e.electionYear)}" placeholder="YYYY" data-election="electionYear" data-jurisdiction="${j}">`,cls:"manual"},{html:`<input type="text" value="${escapeHtml(e.revocationYear)}" placeholder="YYYY" data-election="revocationYear" data-jurisdiction="${j}">`,cls:"manual"}
  ])});
  return makeTable(h,rows);
}

function entityPackTable(){
  const e=state.entityPack[state.activeEntity];
  const netAdj=e.additions-e.reductions;
  const finalIncome=e.globe+netAdj;
  const headers=["OECD GIR number","Reference","Description","Instructions","Automated additions","Automated reductions","Please provide + amounts","Please provide - amounts","Net total amounts","Data point ID"];
  const rows=[
    row([{html:"3.1.1"},{html:"GloBE Income Calculation",cls:"total"},{html:"Profit after tax according to Group reporting"},{html:"Imported from source financial data"},{html:money(e.globe),cls:"auto"},{html:"—",cls:"auto"},{html:"—",cls:"manual"},{html:"—",cls:"manual"},{html:money(e.globe),cls:"total"},{html:`${state.activeEntity.replace(/\s/g,'_')}_GLOBE_001`,cls:"muted-cell"}]),
    row([{html:"3.1.1"},{html:"Adjustments",cls:"total"},{html:"Entity-specific additions"},{html:"User input"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:inputHtml(e.additions,`data-pack-field="additions"`),cls:"manual"},{html:"—",cls:"manual"},{html:money(e.additions),cls:"total"},{html:`${state.activeEntity.replace(/\s/g,'_')}_ADJ_ADD`,cls:"muted-cell"}]),
    row([{html:"3.1.1"},{html:"Adjustments",cls:"total"},{html:"Entity-specific reductions"},{html:"User input"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:"—",cls:"manual"},{html:inputHtml(e.reductions,`data-pack-field="reductions"`),cls:"manual"},{html:money(-e.reductions),cls:"total"},{html:`${state.activeEntity.replace(/\s/g,'_')}_ADJ_RED`,cls:"muted-cell"}]),
    row([{html:"3.1.1"},{html:"FINAL",cls:"total"},{html:"FINAL amount after allocations"},{html:"Calculated"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:"—",cls:"manual"},{html:"—",cls:"manual"},{html:money(finalIncome),cls:"total"},{html:`${state.activeEntity.replace(/\s/g,'_')}_FINAL`,cls:"muted-cell"}]),
    row([{html:"3.2.4"},{html:"Covered Taxes",cls:"total"},{html:"Current and deferred covered taxes"},{html:"Imported from source data"},{html:money(e.covered),cls:"auto"},{html:"—",cls:"auto"},{html:"—",cls:"manual"},{html:"—",cls:"manual"},{html:money(e.covered),cls:"total"},{html:`${state.activeEntity.replace(/\s/g,'_')}_TAX`,cls:"muted-cell"}])
  ];return makeTable(headers,rows);
}

function jurisdictionTotals(){
  const a=state.entityPack["Alpha BV"],d=state.entityPack["Delta BV"];
  const calc=x=>({income:x.globe+x.additions-x.reductions,covered:x.covered,adjustment:x.additions-x.reductions});
  const aa=calc(a),dd=calc(d);const income=aa.income+dd.income,covered=aa.covered+dd.covered,adjustment=aa.adjustment+dd.adjustment;const substance=29400,excess=Math.max(0,income-substance),etr=income?covered/income:0,topup=Math.max(0,(.15-etr)*excess);return {aa,dd,income,covered,adjustment,substance,excess,etr,topup};
}
function jurisdictionTable(){
  const t=jurisdictionTotals();
  const headers=["Metric","Alpha BV","Delta BV","Netherlands Total","Source / logic","Status"];
  const rows=[
    row([{html:"GloBE Income",cls:"total"},{html:money(t.aa.income),cls:"auto"},{html:money(t.dd.income),cls:"auto"},{html:money(t.income),cls:"total"},{html:"Entity Pack aggregation"},{html:"Automated",cls:"auto"}]),
    row([{html:"Covered Taxes",cls:"total"},{html:money(t.aa.covered),cls:"auto"},{html:money(t.dd.covered),cls:"auto"},{html:money(t.covered),cls:"total"},{html:"Entity Pack aggregation"},{html:"Automated",cls:"auto"}]),
    row([{html:"Adjustments",cls:"total"},{html:money(t.aa.adjustment),cls:"auto"},{html:money(t.dd.adjustment),cls:"auto"},{html:money(t.adjustment),cls:"total"},{html:"Additions less reductions"},{html:"Automated",cls:"auto"}]),
    row([{html:"Substance Based Income Exclusion",cls:"total"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:money(t.substance),cls:"total"},{html:"Jurisdiction calculation"},{html:"Automated",cls:"auto"}]),
    row([{html:"Excess Profit",cls:"total"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:money(t.excess),cls:"total"},{html:"GloBE Income less SBIE"},{html:"Automated",cls:"auto"}]),
    row([{html:"ETR",cls:"total"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:pct(t.etr),cls:t.etr<.15?"fail":"pass"},{html:"Covered Taxes / GloBE Income"},{html:"Calculated",cls:"total"}]),
    row([{html:"Top-up tax payable",cls:"total"},{html:"—",cls:"auto"},{html:"—",cls:"auto"},{html:money(t.topup),cls:"total"},{html:"Simplified demo calculation"},{html:"Calculated",cls:"total"}])
  ];return makeTable(headers,rows);
}

function girTable(){
  const t=jurisdictionTotals();const n=safeCalc("Netherlands"),g=safeCalc("Germany");
  const headers=["Reporting section","Data point","Netherlands","Germany","Entity / group value","Status","Source"];
  const rows=[
    row([{html:"1.1 Filing Constituent Entity",cls:"total"},{html:"Name of Filing Constituent Entity"},{html:"Alpha BV",cls:"auto"},{html:"Beta GmbH",cls:"auto"},{html:"Global HoldCo",cls:"total"},{html:"Complete",cls:"pass"},{html:"Entity Administration"}]),
    row([{html:"1.2 MNE Group General Information",cls:"total"},{html:"Reporting Fiscal Year"},{html:"2024",cls:"auto"},{html:"2024",cls:"auto"},{html:"2024",cls:"total"},{html:"Complete",cls:"pass"},{html:"Entity Administration"}]),
    row([{html:"2.2 Jurisdictional exceptions",cls:"total"},{html:"Transitional Safe Harbour"},{html:n.pass?"Pass":"Fail",cls:n.pass?"pass":"fail"},{html:g.pass?"Pass":"Fail",cls:g.pass?"pass":"fail"},{html:"—"},{html:"Complete",cls:"pass"},{html:"Safe Harbour"}]),
    row([{html:"2.2 Elections",cls:"total"},{html:"Aggregate Asset Gain Election"},{html:state.elections.Netherlands.assetGain,cls:"auto"},{html:state.elections.Germany.assetGain,cls:"auto"},{html:"—"},{html:"Complete",cls:"pass"},{html:"Jurisdictional Elections"}]),
    row([{html:"3.2 ETR computation",cls:"total"},{html:"GloBE Income"},{html:money(t.income),cls:"auto"},{html:"Safe Harbour – no detailed pack",cls:"muted-cell"},{html:"—"},{html:"Complete",cls:"pass"},{html:"Jurisdictional Pack"}]),
    row([{html:"3.2 ETR computation",cls:"total"},{html:"ETR"},{html:pct(t.etr),cls:t.etr<.15?"fail":"pass"},{html:pct(g.etr),cls:"pass"},{html:"—"},{html:"Ready",cls:"pass"},{html:"Jurisdictional Pack / Safe Harbour"}])
  ];return makeTable(headers,rows);
}
function tableFor(step){return ({entity:entityTable,safe:safeTable,elections:electionsTable,entitypack:entityPackTable,jurisdiction:jurisdictionTable,gir:girTable})[step]()}

function treeFor(step){const maps={entity:["Entity administration data points - WData","General lists incoming","Dropdown"],safe:["Safe harbour - Jurisdictions","Jurisdiction Validation","Data","Safe Harbour outgoing","Entity Registration","Safe Harbour PY","Lists","CbCr data"],elections:["Jurisdictional Election Template","Outgoing Elections","Incoming Entity Registration"],entitypack:["Health sheet","1 - General Information","2a - Jurisdictional Elections","2b - Entity elections","3 - GloBE Income or Loss","3a - Allocations related to…","3b - Cross-border adjustments","4 - Covered Taxes","5 - Substance Based Income…","6 GIR-Report","Admin","Outgoing Entity Data","Incoming Entity Registration"],jurisdiction:["1 - General Information","1a - Characteristics of the…","1b - Other Accounting Standards","1c - High summary","1d - Jurisdiction Elections","2 - GloBE Income & Loss","3 - Covered Taxes","4 - Substance based income…","5 - Top-up Tax Calculation","Allocation if needed","Additional top up tax"],gir:["Chapter 1 - General information","1.1 - Filing Constituent Entity","1.1 Recipient Jurisdiction","1.3.2 Group entities","1.3.3 Changes in structure","1.4 High level summary","Chapter 2 - Jurisdictional…","2.2 Jurisdictional exceptions","Chapter 3 - GloBE Computation","3.2 ETR computation"]};return maps[step].map((x,i)=>`<div class="tree-item ${i===0||x.startsWith('Chapter')||/^\d -/.test(x)?'group':''} ${i===0?'selected':''}" data-tree-index="${i}"><span>${i===0?'⌄ ':''}${escapeHtml(x)}</span>${i%3===0?'<span class="tree-status"></span>':''}</div>`).join("")}

function renderStepNav(){
  $("#step-nav").innerHTML=steps.map((s,i)=>{const m=stepMeta[s];return `<button class="step-button ${i?"locked":""}" data-step="${s}"><b>${i+1}</b><span><strong>${m.short}</strong><small>${m.subtitle}</small></span><i class="step-check">✓</i></button>`}).join("");
  $$(".step-button").forEach(b=>b.addEventListener("click",()=>showStep(b.dataset.step)));
}
function renderDataFlow(){
  const labels=["Source financial data","WData","Entity Administration","Safe Harbour","Entity Pack","Jurisdiction Pack","Final reporting dataset"];
  const currentMap={entity:2,safe:3,elections:3,entitypack:4,jurisdiction:5,gir:6};
  const completeIndex=Math.max(-1,...steps.filter(s=>state.shared.has(s)).map(s=>({entity:2,safe:3,elections:3,entitypack:4,jurisdiction:5,gir:6}[s])));
  $("#data-flow").innerHTML=labels.map((l,i)=>`${i?'<div class="flow-arrow">↓</div>':''}<div class="flow-node ${i<=completeIndex?'complete':''} ${i===currentMap[state.current]?'current':''}">${l}</div>`).join("");
}
function updateWData(){const list=$("#wdata-list");if(!state.shared.size){list.innerHTML='<li class="empty">No updates shared yet.</li>';return}list.innerHTML=steps.filter(s=>state.shared.has(s)).map(s=>`<li>✓ ${stepMeta[s].title}</li>`).join("")}

function renderToolbar(){
  let html="";
  if(state.current==="entity") html=`<div class="context-row"><span class="context-label">Interaction:</span><span>Click a row to edit entity details.</span><span class="legend-chip"><span class="legend-dot manual"></span> Editable / client data</span><button id="edit-first-entity" class="mini-button primary" type="button">Edit Alpha BV</button></div>`;
  if(state.current==="safe") html=`<div class="context-row"><label class="context-label" for="jurisdiction-selector">Focus jurisdiction:</label><select id="jurisdiction-selector" class="mini-select"><option>Netherlands</option><option>Germany</option></select><span class="legend-chip"><span class="legend-dot auto"></span> Automated</span><span class="legend-chip"><span class="legend-dot manual"></span> Manual adjustment</span><span class="legend-chip"><span class="legend-dot calc"></span> Calculated</span><button id="safe-demo-toggle" class="mini-button primary" type="button">Toggle selected jurisdiction outcome</button></div>`;
  if(state.current==="elections") html=`<div class="context-row"><span class="context-label">Interaction:</span><span>Change dropdowns directly in the sheet.</span><span class="legend-chip"><span class="legend-dot manual"></span> Election input</span></div>`;
  if(state.current==="entitypack") html=`<div class="context-row"><label class="context-label" for="entity-selector">Entity requiring detailed pack:</label><select id="entity-selector" class="mini-select"><option>Alpha BV</option><option>Delta BV</option></select><span class="legend-chip"><span class="legend-dot auto"></span> Imported automatically</span><span class="legend-chip"><span class="legend-dot manual"></span> User input</span><span class="legend-chip"><span class="legend-dot calc"></span> Calculated total</span></div>`;
  if(state.current==="jurisdiction") html=`<div class="context-row"><span class="context-label">Netherlands aggregation:</span><span>Alpha BV + Delta BV → jurisdiction-level reporting.</span><button id="back-to-entity-pack" class="mini-button" type="button">Edit Entity Pack inputs</button></div>`;
  if(state.current==="gir") html=`<div class="context-row"><span class="context-label">Final dataset:</span><span>All required demo inputs are assembled.</span><button id="export-dataset" class="mini-button primary" type="button">Export Final Dataset</button></div>`;
  $("#sheet-toolbar").innerHTML=html;
}

function renderScenario(){
  const s=$("#scenario-strip");
  if(state.current==="safe"){
    const n=safeCalc("Netherlands"),g=safeCalc("Germany");
    s.innerHTML=`<div class="branch"><span class="branch-badge ${g.pass?'pass':'fail'}">Germany ${g.pass?'PASS':'FAIL'}</span><span>${g.pass?'No detailed Entity Pack required.':'Detailed calculation required.'}</span></div><div class="branch"><span class="branch-badge ${n.pass?'pass':'fail'}">Netherlands ${n.pass?'PASS':'FAIL'}</span><span>${n.pass?'No detailed Entity Pack required.':'Entity Pack + Jurisdiction Pack required.'}</span></div>`;s.classList.remove("hidden");return;
  }
  if(state.current==="entitypack") {s.innerHTML=`<div class="branch"><span class="branch-badge fail">Netherlands FAILED Safe Harbour</span><span>Detailed entity calculations are required for Alpha BV and Delta BV.</span></div>`;s.classList.remove("hidden");return}
  if(state.current==="jurisdiction") {s.innerHTML=`<div class="branch"><strong>Entity-level calculations</strong><span>Alpha BV ↓</span><span class="branch-badge fail">Netherlands Jurisdiction Pack</span><span>↑ Delta BV</span><strong>Jurisdiction-level reporting</strong></div>`;s.classList.remove("hidden");return}
  if(state.current==="gir") {s.innerHTML=`<div class="branch"><span class="branch-badge pass">Reporting dataset ready</span><span>Pillar 2 reporting dataset ready for downstream tagging / filing.</span></div>`;s.classList.remove("hidden");return}
  s.classList.add("hidden");s.innerHTML="";
}

function shareIcon(shared){return `<button id="share-updates-icon" class="share-updates-icon ${shared?'':'pulse'}" type="button" aria-label="Share updates" title="Share updates"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4"></path><path d="m7.5 8.5 4.5-4.5 4.5 4.5"></path><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"></path></svg></button>`}
function renderConnections(){
  const m=stepMeta[state.current],shared=state.shared.has(state.current),dirty=state.dirty.has(state.current);
  $("#incoming-panel").innerHTML=`<div class="connection-note">Incoming data is refreshed from previously shared WData outputs.</div><article class="connection-card"><div class="connection-card-head"><strong>${m.incoming}</strong><span>↻</span></div><p>Source: <a>WData</a> <em>Table</em><br><b style="color:#299337">✓</b> Last refreshed: ${state.current==='entity'?'Demo baseline':'Just now'}</p></article>`;
  $("#outgoing-panel").innerHTML=`<div class="connection-note">Use the small Share updates icon in the top-right of the card, as in Workiva, to send the latest values to WData.</div><article class="connection-card ${shared?'shared':''}" id="outgoing-card"><div class="connection-card-head"><strong>${m.outgoing}</strong>${shareIcon(shared)}</div><p>Destination:<br><a>WData</a> <em>Table</em><br><span id="last-shared">${shared?'✓ Last shared: Just now':dirty?'○ Spreadsheet changed — share updates required':'○ Updates not yet shared'}</span></p></article>`;
  $("#share-updates-icon")?.addEventListener("click",shareCurrent);
}
function setConnectionTab(tab){const incoming=tab==="incoming";$("#incoming-tab").classList.toggle("active",incoming);$("#outgoing-tab").classList.toggle("active",!incoming);$("#incoming-panel").classList.toggle("hidden",!incoming);$("#outgoing-panel").classList.toggle("hidden",incoming)}

function bindTableInteractions(){
  if(state.current==="entity"){
    $$('[data-entity-row]').forEach(r=>r.addEventListener('click',()=>openEntityEditor(Number(r.dataset.entityRow))));
    $("#edit-first-entity")?.addEventListener("click",()=>openEntityEditor(0));
  }
  if(state.current==="safe"){
    $("#jurisdiction-selector").value=state.activeJurisdiction;
    $("#jurisdiction-selector").addEventListener("change",e=>{state.activeJurisdiction=e.target.value;focusSafeRow();renderScenario()});
    $("#safe-demo-toggle").addEventListener("click",toggleSafeOutcome);
    $$('[data-safe-field]').forEach(inp=>inp.addEventListener('input',e=>{const j=e.target.dataset.jurisdiction,field=e.target.dataset.safeField;state.safeResults[j][field]=Number(e.target.value||0);markDirty('safe');renderSheetOnly();focusSafeRow()}));
  }
  if(state.current==="elections") $$('[data-election]').forEach(el=>el.addEventListener('change',e=>{state.elections[e.target.dataset.jurisdiction][e.target.dataset.election]=e.target.value;markDirty('elections');flashCell(e.target.closest('td'))}));
  if(state.current==="entitypack"){
    $("#entity-selector").value=state.activeEntity;$("#entity-selector").addEventListener("change",e=>{state.activeEntity=e.target.value;renderSheetOnly()});
    $$('[data-pack-field]').forEach(inp=>inp.addEventListener('input',e=>{state.entityPack[state.activeEntity][e.target.dataset.packField]=Number(e.target.value||0);markDirty('entitypack');renderSheetOnly()}));
  }
  $("#back-to-entity-pack")?.addEventListener("click",()=>showStep("entitypack"));
  $("#export-dataset")?.addEventListener("click",openExport);
  $$(".tree-item").forEach(x=>x.addEventListener("click",()=>{$$(".tree-item").forEach(y=>y.classList.remove("selected"));x.classList.add("selected");toast(`Opened ${x.textContent.trim()} (simulated section).`)}));
}
function flashCell(cell){if(!cell)return;cell.classList.remove('flash');void cell.offsetWidth;cell.classList.add('flash')}
function renderSheetOnly(){
  $("#sheet-table").innerHTML=tableFor(state.current);renderToolbar();renderScenario();bindTableInteractions();updateStatus();
}
function focusSafeRow(){const r=$(`[data-safe-row="${state.activeJurisdiction}"]`);r?.scrollIntoView({block:"center",inline:"nearest"});r?.classList.add("flash");setTimeout(()=>r?.classList.remove("flash"),850)}
function toggleSafeOutcome(){
  const j=state.activeJurisdiction,d=state.safeResults[j];
  if(safeCalc(j).pass){d.profit=20000000;d.tax=1200000;d.revenue=1900000000;}else{d.profit=17800000;d.tax=5000000;d.revenue=3000000;}
  markDirty("safe");renderSheetOnly();focusSafeRow();toast(`${j} recalculated to ${safeCalc(j).pass?'PASS':'FAIL'}.`)
}

function markDirty(step){state.dirty.add(step);state.shared.delete(step);const idx=steps.indexOf(step);for(let i=idx+1;i<steps.length;i++) state.shared.delete(steps[i]);updateWData();renderDataFlow();updateStatus();renderConnections();unlockSteps()}
function updateStatus(){const shared=state.shared.has(state.current),dirty=state.dirty.has(state.current);const st=$("#step-status");st.className="status-pill"+(shared?" shared":dirty?" dirty":"");st.textContent=shared?"Shared to WData":dirty?"Changes not shared":"Not shared";const i=steps.indexOf(state.current);$("#next-step").disabled=state.current!=="gir"&&!shared;$("#next-step").textContent=i===5?"Demo complete ✓":"Next step →"}

function unlockSteps(){
  $$(".step-button").forEach((b,i)=>{if(i===0)return;b.classList.add("locked")});
  if(state.shared.has("entity")) $(`[data-step="safe"]`).classList.remove("locked");
  if(state.shared.has("safe")) $(`[data-step="elections"]`).classList.remove("locked");
  if(state.shared.has("safe")&&state.shared.has("elections")&&!safeCalc("Netherlands").pass) $(`[data-step="entitypack"]`).classList.remove("locked");
  if(state.shared.has("entitypack")) $(`[data-step="jurisdiction"]`).classList.remove("locked");
  if(state.shared.has("jurisdiction")) $(`[data-step="gir"]`).classList.remove("locked");
  $$(".step-button").forEach(b=>b.classList.toggle("complete",state.shared.has(b.dataset.step)));
}

async function showConnectionProgress(){
  const t=$("#connection-toast"),bar=$("#connection-progress"),text=$("#connection-toast-text");t.classList.remove("hidden");bar.style.width="8%";text.textContent="Refreshing Connection";await wait(250);bar.style.width="45%";await wait(420);bar.style.width="78%";await wait(420);bar.style.width="100%";text.textContent="Updates shared";await wait(550);t.classList.add("hidden");bar.style.width="0";
}
async function shareCurrent(){
  if(state.current==="entity"&&state.dirty.has("entity")){/* saved changes already live in local spreadsheet state */}
  if(state.current==="safe"&&safeCalc("Netherlands").pass){toast("For the default story, make Netherlands fail Safe Harbour before continuing.");return}
  const icon=$("#share-updates-icon");if(icon)icon.disabled=true;await showConnectionProgress();state.shared.add(state.current);state.dirty.delete(state.current);updateWData();renderDataFlow();unlockSteps();updateStatus();renderConnections();toast(`${stepMeta[state.current].title} updates shared to WData.`);
  if(state.current==="safe"&&!safeCalc("Netherlands").pass){$(`[data-step="entitypack"]`).classList.remove("locked")}
}

function showStep(step){
  if(!steps.includes(step))return;const btn=$(`.step-button[data-step="${step}"]`);if(btn?.classList.contains("locked")){toast("Complete and share the earlier required steps first.");return}
  state.current=step;const i=steps.indexOf(step),m=stepMeta[step];$("#page-title").textContent=m.title;$("#doc-title").textContent=m.doc;$("#tree-title").textContent=m.tree;$("#tree-items").innerHTML=treeFor(step);$("#instruction-number").textContent=i+1;$("#instruction-title").textContent=m.instructionTitle;$("#instruction-copy").textContent=m.instructionCopy;$("#flow-note").textContent=m.flow;$("#progress-text").textContent=`Step ${i+1} of 6`;$("#progress-bar").style.width=`${((i+1)/6)*100}%`;$$('.step-button').forEach(b=>b.classList.toggle('active',b.dataset.step===step));$("#previous-step").disabled=i===0;setConnectionTab('incoming');renderSheetOnly();renderConnections();renderScenario();renderDataFlow();updateStatus();$("#sheet-scroll").scrollLeft=0;
}

function openEntityEditor(index){state.editingEntityIndex=index;const e=state.entities[index];$("#entity-editor-title").textContent=`Edit ${e.name}`;$("#entity-form").innerHTML=`
<label>Entity name<input id="edit-name" value="${escapeHtml(e.name)}"></label>
<label>Entity code<input id="edit-code" value="${escapeHtml(e.code)}"></label>
<label>Jurisdiction${selectHtml(["Netherlands","Germany","France","UK"],e.jurisdiction,'id="edit-jurisdiction"')}</label>
<label>Parent entity<input id="edit-parent" value="${escapeHtml(e.parent)}"></label>
<label>Shareholder<input id="edit-shareholder" value="${escapeHtml(e.shareholder)}"></label>
<label>TIN<input id="edit-tin" value="${escapeHtml(e.tin)}"></label>`;$("#entity-editor").classList.remove("hidden")}
function closeEntityEditor(){$("#entity-editor").classList.add("hidden")}
function saveEntity(){const i=state.editingEntityIndex,e=state.entities[i];e.name=$("#edit-name").value.trim()||e.name;e.code=$("#edit-code").value.trim()||e.code;e.jurisdiction=$("#edit-jurisdiction").value;e.parent=$("#edit-parent").value.trim()||e.parent;e.shareholder=$("#edit-shareholder").value.trim()||e.shareholder;e.tin=$("#edit-tin").value.trim()||e.tin;markDirty("entity");closeEntityEditor();renderSheetOnly();toast("Spreadsheet changes saved. Use Outgoing → Share updates to send them to WData.")}

function showGuide(index=steps.indexOf(state.current)){state.modalIndex=index;const step=steps[index],m=stepMeta[step];$("#modal-step").textContent=`STEP ${index+1} OF 6`;$("#modal-title").textContent=m.title;$("#modal-copy").textContent=m.instructionCopy;$("#modal-tip").textContent=m.tip;$("#modal-back").style.visibility=index===0?"hidden":"visible";$("#modal-next").textContent="Got it";$("#modal").classList.remove("hidden")}
function highlightOutgoing(){setConnectionTab('outgoing');const card=$("#outgoing-card");card?.classList.add('highlight');const icon=$("#share-updates-icon");icon?.focus();setTimeout(()=>card?.classList.remove('highlight'),4500)}
function nextStep(){const i=steps.indexOf(state.current);if(i===5){openExport();return}showStep(steps[i+1]);showGuide(i+1)}
function prevStep(){const i=steps.indexOf(state.current);if(i>0)showStep(steps[i-1])}

function finalDataset(){const t=jurisdictionTotals();return {reportingYear:2024,group:"Hallway Corporation (dummy)",entities:state.entities.map(({year,code,name,jurisdiction,parent,tin})=>({year,code,name,jurisdiction,parent,tin})),safeHarbour:{Germany:{...safeCalc("Germany"),status:safeCalc("Germany").pass?"PASS":"FAIL"},Netherlands:{...safeCalc("Netherlands"),status:safeCalc("Netherlands").pass?"PASS":"FAIL"}},jurisdictionalElections:state.elections,entityPack:state.entityPack,jurisdictionPack:{Netherlands:{globeIncome:t.income,coveredTaxes:t.covered,adjustments:t.adjustment,etr:t.etr,topUpTax:t.topup}},status:"Pillar 2 reporting dataset ready for downstream tagging / filing"}}
function openExport(){const data=finalDataset();$("#export-preview").textContent=JSON.stringify(data,null,2);$("#export-modal").classList.remove("hidden")}
function downloadFile(name,type,text){const blob=new Blob([text],{type}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function downloadJson(){downloadFile("pillar2-demo-dataset.json","application/json",JSON.stringify(finalDataset(),null,2))}
function downloadCsv(){const d=finalDataset();const rows=[["Jurisdiction","Safe Harbour","GloBE Income","Covered Taxes","ETR","Top-up Tax"],["Germany",d.safeHarbour.Germany.status,"N/A","N/A",d.safeHarbour.Germany.etr,"N/A"],["Netherlands",d.safeHarbour.Netherlands.status,d.jurisdictionPack.Netherlands.globeIncome,d.jurisdictionPack.Netherlands.coveredTaxes,d.jurisdictionPack.Netherlands.etr,d.jurisdictionPack.Netherlands.topUpTax]];downloadFile("pillar2-demo-dataset.csv","text/csv",rows.map(r=>r.join(",")).join("\n"))}

function restart(){
  state.current="entity";state.shared.clear();state.dirty.clear();state.activeJurisdiction="Netherlands";state.activeEntity="Alpha BV";
  state.safeResults.Germany={revenue:3000000,profit:17800000,tax:5000000,employee:420000,tangible:800000,adjustment:0};state.safeResults.Netherlands={revenue:20000000,profit:1000000,tax:140000,employee:300000,tangible:600000,adjustment:0};
  state.entityPack["Alpha BV"]={globe:12000000,covered:1200000,additions:350000,reductions:150000};state.entityPack["Delta BV"]={globe:8000000,covered:700000,additions:100000,reductions:200000};
  Object.keys(state.elections).forEach(j=>state.elections[j]={assetGain:"No",coveredTaxes:"No",sbie:"No",carryForward:"No",equity:"No",electionYear:"",revocationYear:""});
  renderStepNav();unlockSteps();updateWData();showStep("entity");setTimeout(()=>showGuide(0),250);toast("Demo restarted.")
}

// Static controls
$("#incoming-tab").addEventListener("click",()=>setConnectionTab("incoming"));
$("#outgoing-tab").addEventListener("click",()=>setConnectionTab("outgoing"));
$("#instruction-action").addEventListener("click",highlightOutgoing);
$("#next-step").addEventListener("click",nextStep);
$("#previous-step").addEventListener("click",prevStep);
$("#restart-demo").addEventListener("click",restart);
$("#show-help").addEventListener("click",()=>showGuide());
$("#modal-close").addEventListener("click",()=>$("#modal").classList.add("hidden"));
$("#modal-next").addEventListener("click",()=>$("#modal").classList.add("hidden"));
$("#modal-back").addEventListener("click",()=>{if(state.modalIndex>0){state.modalIndex--;showGuide(state.modalIndex)}});
$("#entity-editor-close").addEventListener("click",closeEntityEditor);$("#entity-cancel").addEventListener("click",closeEntityEditor);$("#entity-save").addEventListener("click",saveEntity);
$("#export-close").addEventListener("click",()=>$("#export-modal").classList.add("hidden"));$("#download-json").addEventListener("click",downloadJson);$("#download-csv").addEventListener("click",downloadCsv);
$("#connection-toast-close").addEventListener("click",()=>$("#connection-toast").classList.add("hidden"));

renderStepNav();unlockSteps();updateWData();showStep("entity");setTimeout(()=>showGuide(0),300);
