const steps = ["entity", "safe", "elections", "entitypack", "jurisdiction", "gir"];

const stepMeta = {
  entity: {
    title: "Entity Administration",
    doc: "Entity Administration - Version CW",
    tree: "Entity Administration - Version CW",
    nav: "Entity Admin",
    subtitle: "Source of truth",
    instructionTitle: "Start with the entity source of truth",
    instructionCopy: "Review the entity table. Editable cells are shown with a subtle blue treatment. Select an editable cell to update the entity, then open Outgoing and use Share updates.",
    incoming: "General lists incoming",
    outgoing: "Entity administration data points - WData",
    tip: "The Outgoing connection is the hand-off to WData. Click the small Share updates icon in the top-right of the connection card before moving on."
  },
  safe: {
    title: "Transitional Safe Harbour",
    doc: "2024 - Pillar 2 - Transitional Safe Harbour",
    tree: "2024 - Pillar 2 - Transitional Safe Harbour",
    nav: "Safe Harbour",
    subtitle: "Pass / fail branch",
    instructionTitle: "Review the pre-populated Safe Harbour results",
    instructionCopy: "The demo already provides the financial amounts. Netherlands is configured to fail and Germany is configured to pass. Scroll right to inspect the tests, then share the outgoing results.",
    incoming: "Entity Registration + CbCR data",
    outgoing: "Safe Harbour - 2024",
    tip: "No data entry is required to create the failed scenario. The Netherlands values are pre-populated so the failed path is immediately visible and unlocks the detailed calculation steps."
  },
  elections: {
    title: "Jurisdictional Elections",
    doc: "Year - Jurisdictional Elections",
    tree: "Jurisdictional Election Template",
    nav: "Elections",
    subtitle: "Annual & five-year",
    instructionTitle: "Capture jurisdictional elections",
    instructionCopy: "Use the dropdowns to review or change an election. The selection is retained in the demo and then shared through Outgoing Elections.",
    incoming: "Incoming Entity Registration",
    outgoing: "Outgoing Elections",
    tip: "Election selections are captured once and reused later in the Entity Pack, Jurisdictional Pack and GIR."
  },
  entitypack: {
    title: "Entity Pack",
    doc: "Pillar 2 - Entity Pack",
    tree: "Pillar 2 - Entity Pack",
    nav: "Entity Pack",
    subtitle: "Failed entities only",
    instructionTitle: "Complete the Entity Pack for failed entities",
    instructionCopy: "Netherlands failed Safe Harbour, so Alpha BV and Delta BV require Entity Packs. Switch between entities, review automated data and type any amount you want in the blue adjustment field.",
    incoming: "Entity Registration + Safe Harbour + Elections",
    outgoing: "Outgoing Entity Data",
    tip: "Green cells are automated. Blue cells are user-entered adjustments. Calculated totals update from the entity-level amounts and are later aggregated by jurisdiction."
  },
  jurisdiction: {
    title: "Jurisdictional Pack",
    doc: "Jurisdictional Pack",
    tree: "Jurisdictional Pack",
    nav: "Jurisdiction Pack",
    subtitle: "Aggregate entity results",
    instructionTitle: "Review the jurisdiction-level aggregation",
    instructionCopy: "The Netherlands summary automatically aggregates Alpha BV and Delta BV. Review the calculated GloBE Income, covered taxes, ETR and top-up tax, then share the output.",
    incoming: "Entity Pack outputs + Elections",
    outgoing: "Outgoing Jurisdiction Data",
    tip: "This step shows the change from entity-level calculations to jurisdiction-level reporting. No re-keying is required."
  },
  gir: {
    title: "GIR – Global",
    doc: "GIR - Global",
    tree: "GIR - Global",
    nav: "Final Output",
    subtitle: "GIR-ready dataset",
    instructionTitle: "Review and export the final reporting dataset",
    instructionCopy: "The GIR view combines the entity and jurisdiction data. Use Export Final Dataset to preview or download dummy JSON/CSV output.",
    incoming: "Entity + Jurisdiction + Election outputs",
    outgoing: "Final GIR dataset",
    tip: "This demo stops at a prepared reporting dataset. It does not simulate XML/XBRL tagging or submission to a tax authority."
  }
};

const state = {
  current: "entity",
  shared: new Set(),
  safeFail: true,
  modalIndex: 0,
  selectedEntityPack: "Alpha BV",
  entityChangesSaved: false,
  entities: [
    {year: 2024, code: "NL101", name: "Alpha BV", jurisdiction: "Netherlands", parent: "Global HoldCo", shareholder: "Global HoldCo", tin: "TIA", upe: "Yes"},
    {year: 2024, code: "NL119", name: "Delta BV", jurisdiction: "Netherlands", parent: "Global HoldCo", shareholder: "Global HoldCo", tin: "TID", upe: "No"},
    {year: 2024, code: "DE103", name: "Beta GmbH", jurisdiction: "Germany", parent: "Global HoldCo", shareholder: "Global HoldCo", tin: "TIP", upe: "No"},
    {year: 2024, code: "FR108", name: "Gamma SAS", jurisdiction: "France", parent: "EU HoldCo", shareholder: "Global HoldCo", tin: "TIQ", upe: "No"},
    {year: 2024, code: "UK117", name: "R UK Ltd", jurisdiction: "UK", parent: "Global HoldCo", shareholder: "Global HoldCo", tin: "TIR", upe: "No"},
    {year: 2024, code: "NL107", name: "B BV", jurisdiction: "Netherlands", parent: "EU HoldCo", shareholder: "Global HoldCo", tin: "TIB", upe: "No"}
  ],
  elections: {
    Netherlands: ["No", "No", "No", "No", "No", "No"],
    Germany: ["No", "No", "No", "No", "No", "No"],
    France: ["No", "No", "No", "No", "No", "No"]
  },
  entityPacks: {
    "Alpha BV": {globe: 12150000, coveredTaxes: 1050000, add: 249864, reduction: 50000},
    "Delta BV": {globe: 8150000, coveredTaxes: 720000, add: 100000, reduction: 150000}
  }
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => Number(n).toLocaleString("en-US", {maximumFractionDigits: 0});

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  window.setTimeout(() => el.classList.add("hidden"), 2500);
}

function letters(n) {
  return Array.from({length: n}, (_, i) => {
    let x = i + 1, out = "";
    while (x) { x--; out = String.fromCharCode(65 + (x % 26)) + out; x = Math.floor(x / 26); }
    return out;
  });
}

function row(cells, cls = "", attrs = "") {
  return `<tr class="${cls}" ${attrs}><td class="rownum"></td>${cells.map(c => `<td class="${c.cls || ""}" ${c.attrs || ""}>${c.html ?? c}</td>`).join("")}</tr>`;
}

function makeTable(headers, rows) {
  let html = `<thead><tr class="letters"><th class="rownum"></th>${letters(headers.length).map(x => `<th>${x}</th>`).join("")}</tr><tr><th class="rownum">1</th>${headers.map(h => `<th class="section-head">${h}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach((r, i) => { html += r.replace('<td class="rownum"></td>', `<td class="rownum">${i + 2}</td>`); });
  return html + "</tbody>";
}

function selectHtml(values, selected, attrs = "") {
  return `<select ${attrs}>${values.map(v => `<option value="${v}" ${v === selected ? "selected" : ""}>${v}</option>`).join("")}</select>`;
}

function inputHtml(value, attrs = "") {
  return `<input class="editable-number" type="text" inputmode="numeric" autocomplete="off" value="${value}" ${attrs} />`;
}

function renderNav() {
  $("#step-nav").innerHTML = steps.map((step, i) => {
    const m = stepMeta[step];
    return `<button class="step-button ${i ? "locked" : ""}" data-step="${step}" type="button"><b>${i + 1}</b><span><strong>${m.nav}</strong><small>${m.subtitle}</small></span><i class="step-check">✓</i></button>`;
  }).join("");
  $$(".step-button").forEach(btn => btn.addEventListener("click", () => showStep(btn.dataset.step)));
}

function renderDataFlow() {
  const flow = [
    ["source", "Source financial data"], ["wdata", "WData"], ["entity", "Entity Administration"], ["safe", "Safe Harbour"], ["entitypack", "Entity Pack"], ["jurisdiction", "Jurisdiction Pack"], ["gir", "Final reporting dataset"]
  ];
  const currentIndex = {entity: 2, safe: 3, elections: 3, entitypack: 4, jurisdiction: 5, gir: 6}[state.current];
  $("#data-flow").innerHTML = flow.map(([key, label], i) => {
    const complete = i < currentIndex || (key === "gir" && state.current === "gir" && state.shared.has("gir"));
    const current = i === currentIndex;
    return `${i ? '<div class="flow-arrow">↓</div>' : ''}<div class="flow-node ${complete ? "complete" : ""} ${current ? "current" : ""}">${label}</div>`;
  }).join("");
}

function treeFor(step) {
  const maps = {
    entity: ["Entity administration data points - WData", "General lists incoming", "Dropdown"],
    safe: ["Safe harbour - Jurisdictions", "Jurisdiction Validation", "Data", "Safe Harbour outgoing", "Entity Registration", "Safe Harbour PY", "Lists", "CbCr data"],
    elections: ["Jurisdictional Election Template", "Outgoing Elections", "Incoming Entity Registration"],
    entitypack: ["Health sheet", "1 - General Information", "2a - Jurisdictional Elections", "2b - Entity elections", "3 - GloBE Income or Loss", "3a - Allocations related to…", "3b - Cross-border adjustments", "4 - Covered Taxes", "5 - Substance Based Income…", "6 GIR-Report", "Admin", "Outgoing Entity Data", "Incoming Entity Registration"],
    jurisdiction: ["1 - General Information", "1a - Characteristics of the…", "1b - Other Accounting Standards", "1c - High summary", "1d - Jurisdiction Elections", "2 - GloBE Income & Loss", "3 - Covered Taxes", "4 - Substance based income…", "5 - Top-up Tax Calculation", "Allocation if needed", "Additional top up tax"],
    gir: ["Chapter 1 - General information", "1.1 - Filing Constituent Entity", "1.1 Recipient Jurisdiction", "1.3.2 Group entities", "1.3.3 Changes in structure", "1.4 High level summary", "Chapter 2 - Jurisdictional…", "2.2 Jurisdictional exceptions", "Chapter 3 - GloBE Computation", "3.2 ETR computation"]
  };
  return maps[step].map((x, i) => `<div class="tree-item ${i === 0 || x.startsWith("Chapter") || /^\d -/.test(x) ? "group" : ""} ${i === 0 ? "selected" : ""}"><span>${i === 0 ? "⌄ " : ""}${x}</span>${i % 3 === 0 ? '<span class="tree-status"></span>' : ''}</div>`).join("");
}

function entityTable() {
  const headers = ["Fiscal Year", "Entity Code", "Entity Name", "Jurisdiction", "Parent Entity", "Shareholder", "TIN", "UPE only yes where relevant", "Pope Indicator", "Completion Status"];
  return makeTable(headers, state.entities.map((e, i) => row([
    {html: e.year, cls: "readonly-cell"},
    {html: `<input class="entity-inline-input" data-entity-index="${i}" data-entity-field="code" value="${e.code}" aria-label="Entity code for ${e.name}">`, cls: "manual editable-cell"},
    {html: `<input class="entity-inline-input" data-entity-index="${i}" data-entity-field="name" value="${e.name}" aria-label="Entity name">`, cls: "manual editable-cell"},
    {html: `<select class="entity-inline-input" data-entity-index="${i}" data-entity-field="jurisdiction" aria-label="Jurisdiction for ${e.name}">${["Netherlands","Germany","France","UK"].map(v => `<option ${v === e.jurisdiction ? "selected" : ""}>${v}</option>`).join("")}</select>`, cls: "manual editable-cell"},
    {html: `<input class="entity-inline-input" data-entity-index="${i}" data-entity-field="parent" value="${e.parent}" aria-label="Parent entity for ${e.name}">`, cls: "manual editable-cell"},
    {html: `<input class="entity-inline-input" data-entity-index="${i}" data-entity-field="shareholder" value="${e.shareholder}" aria-label="Shareholder for ${e.name}">`, cls: "manual editable-cell"},
    {html: `<input class="entity-inline-input" data-entity-index="${i}" data-entity-field="tin" value="${e.tin}" aria-label="TIN for ${e.name}">`, cls: "manual editable-cell"},
    {html: `<select class="entity-inline-input" data-entity-index="${i}" data-entity-field="upe" aria-label="UPE status for ${e.name}"><option ${e.upe === "Yes" ? "selected" : ""}>Yes</option><option ${e.upe === "No" ? "selected" : ""}>No</option></select>`, cls: "manual editable-cell"},
    {html: "No", cls: "readonly-cell"}, {html: "Complete", cls: "auto readonly-cell"}
  ], `entity-row`, `data-entity-index="${i}"`)));
}

function safeTable() {
  const headers = ["Result of PY Safe Harbour Test", "#", "Jurisdiction ID", "Fiscal year", "Revenue (CbCr)", "ADJ 1", "ADJ 2", "ADJ 3", "Revenue for Pillar 2", "Profit (loss) before income tax (CbCr)", "ADJ 1", "ADJ 2", "ADJ 3", "Profit before income tax for Pillar 2", "Income tax expense", "ETR", "Employee Expenses", "Tangible Assets", "Substance-based income exclusion", "De minimis Test", "Simplified ETR Test", "Routine profit Test", "Safe harbour applicable", "Which one do you choose?"];
  const jurisdictions = [
    {j: "Netherlands - CE -", result: "FAILED", rev: 25000000, profit: 12000000, tax: 1200000, etr: "10.00%", employee: 300000, sbie: 158293, tests: ["Fail", "Fail", "Fail", "Fail"], choice: "—"},
    {j: "Germany - CE -", result: "PASSED", rev: 8500000, profit: 4200000, tax: 840000, etr: "20.00%", employee: 210000, sbie: 125000, tests: ["Pass", "Pass", "Pass", "Pass"], choice: "De minimis Test"},
    {j: "France - CE -", result: "PASSED", rev: 3000000, profit: 17800000, tax: 5000000, etr: "28.09%", employee: 185000, sbie: "—", tests: ["Fail", "Pass", "Fail", "Pass"], choice: "Simplified ETR Test"}
  ];
  return makeTable(headers, jurisdictions.map((x, i) => row([
    {html: `<span class="safe-status-copy ${x.result === "FAILED" ? "fail-copy" : "pass-copy"}">${x.result}</span>`, cls: x.result === "FAILED" ? "fail" : "pass"},
    {html: i + 1, cls: "readonly-cell"}, {html: x.j, cls: "readonly-cell"}, {html: 2024, cls: "readonly-cell"}, {html: money(x.rev), cls: "auto readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: money(x.rev), cls: "readonly-cell"},
    {html: money(x.profit), cls: "auto readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: "—", cls: "readonly-cell"}, {html: money(x.profit), cls: "readonly-cell"}, {html: money(x.tax), cls: "auto readonly-cell"}, {html: x.etr, cls: "readonly-cell"}, {html: money(x.employee), cls: "auto readonly-cell"}, {html: "—", cls: "auto readonly-cell"}, {html: x.sbie === "—" ? "—" : money(x.sbie), cls: "readonly-cell"},
    ...x.tests.map(v => ({html: v, cls: v === "Pass" ? "pass" : "fail"})), {html: x.choice}
  ], i === 0 ? "safe-focus" : "")));
}

function electionsTable() {
  const headers = ["Year for which the elections are made", "Jurisdiction ID", "Aggregate asset gain election (Article 3.2.6)", "Immaterial decrease in Covered Taxes election (Article 4.6.1)", "Election not to apply the Substance-based Income Exclusion (Article 5.3.1)", "Negative Tax Expense Carry-forward (Article 4.1.5)", "Deemed Distribution election", "Equity Investment Inclusion Election (Article 3.2.1(c))", "Election year", "Revocation Year", "Notification", "Stock-based compensation election"];
  const jurisdictions = ["Netherlands", "Germany", "France"];
  return makeTable(headers, jurisdictions.map((j, rowIndex) => row([
    {html: 2024}, {html: `${j} - CE -`},
    ...state.elections[j].map((value, colIndex) => ({html: selectHtml(["No", "Yes"], value, `data-election-j="${j}" data-election-i="${colIndex}"`), cls: "manual"})),
    {html: "", cls: "manual"}, {html: "", cls: "manual"}, {html: "", cls: "total"}, {html: selectHtml(["No", "Yes"], "No"), cls: "manual"}
  ], rowIndex === 0 ? "election-focus" : "")));
}

function entityPackTable() {
  const p = state.entityPacks[state.selectedEntityPack];
  const net = p.globe + p.add - p.reduction;
  const headers = ["OECD GIR number", "Reference", "Description", "Instructions", "Automated Additions", "Automated Reductions", "Please provide + amounts", "Please provide - amounts", "Net total amounts", "Check for correct field entry", "Check for correct figure entry"];
  const rows = [
    row([{html: ""}, {html: "3.1.1"}, {html: "<strong>GloBE Income Calculation</strong>"}, {html: ""}, {html: money(p.globe), cls: "auto"}, {html: "—", cls: "auto"}, {html: inputHtml(p.add, 'data-pack-field="add"'), cls: "manual"}, {html: inputHtml(p.reduction, 'data-pack-field="reduction"'), cls: "manual"}, {html: money(net), cls: "total", attrs: 'data-pack-total="net"'}, {html: "✓"}, {html: "✓"}], "pack-focus"),
    row([{html: ""}, {html: "3.1.1"}, {html: "Adjustments to determine Final according to GloBE tax before allocations"}, {html: ""}, {html: "—", cls: "auto"}, {html: "—", cls: "auto"}, {html: "—", cls: "readonly-input"}, {html: "—", cls: "readonly-input"}, {html: "—", cls: "readonly-cell"}, {html: "✓", cls: "readonly-cell"}, {html: "✓", cls: "readonly-cell"}]),
    row([{html: ""}, {html: "3.2.4"}, {html: "Net Tax Expense"}, {html: ""}, {html: money(p.coveredTaxes), cls: "auto"}, {html: "—", cls: "auto"}, {html: "35,000", cls: "readonly-input"}, {html: "—", cls: "readonly-input"}, {html: money(p.coveredTaxes + 35000), cls: "readonly-cell"}, {html: "✓"}, {html: "✓"}]),
    row([{html: ""}, {html: "4.1"}, {html: "Covered Taxes"}, {html: ""}, {html: money(p.coveredTaxes), cls: "auto"}, {html: "—", cls: "auto"}, {html: "—", cls: "readonly-input"}, {html: "—", cls: "readonly-input"}, {html: money(p.coveredTaxes), cls: "readonly-cell"}, {html: "✓"}, {html: "✓"}])
  ];
  return makeTable(headers, rows);
}

function jurisdictionTotals() {
  const packs = Object.values(state.entityPacks);
  const globe = packs.reduce((sum, p) => sum + p.globe + p.add - p.reduction, 0);
  const taxes = packs.reduce((sum, p) => sum + p.coveredTaxes, 0);
  const sbie = 29400;
  const excess = Math.max(0, globe - sbie);
  const etr = globe ? taxes / globe : 0;
  const topupRate = Math.max(0, 0.15 - etr);
  const topup = Math.round(excess * topupRate);
  return {globe, taxes, sbie, excess, etr, topup};
}

function jurisdictionTable() {
  const t = jurisdictionTotals();
  const headers = ["General Jurisdiction Information", "Value", "Source / status", "Pillar II Calculation Summary", "Amounts in EUR", "Source / status"];
  const rows = [
    row([{html: "Jurisdiction Name"}, {html: "Netherlands"}, {html: "Automated", cls: "auto"}, {html: "GloBE Income"}, {html: money(t.globe)}, {html: "Automated", cls: "auto"}]),
    row([{html: "Jurisdiction ID"}, {html: "Netherlands - CE -", cls: "readonly-cell"}, {html: "Automated", cls: "auto readonly-cell"}, {html: "Covered taxes"}, {html: money(t.taxes)}, {html: "Automated", cls: "auto"}]),
    row([{html: "Year"}, {html: "2024"}, {html: "Automated", cls: "auto"}, {html: "Substance Based Income Exclusion"}, {html: money(t.sbie)}, {html: "Automated", cls: "auto"}]),
    row([{html: "Reporting Currency"}, {html: "EUR"}, {html: ""}, {html: "Excess Profit"}, {html: money(t.excess)}, {html: "Automated", cls: "auto"}]),
    row([{html: "Transitional Safe Harbour applicable"}, {html: "Test failed", cls: "fail"}, {html: "Automated", cls: "auto"}, {html: "Top-up tax payable"}, {html: money(t.topup)}, {html: "Automated", cls: "auto"}]),
    row([{html: "TIN Subgroup"}, {html: "TIZ"}, {html: ""}, {html: "ETR in %"}, {html: `${(t.etr * 100).toFixed(2)}%`, cls: t.etr < .15 ? "fail" : "pass"}, {html: "Calculated"}])
  ];
  return makeTable(headers, rows);
}

function girTable() {
  const t = jurisdictionTotals();
  const headers = ["1.1 Identification of the Filing Constituent Entity", "Value", "1.2 MNE Group General Information", "Value", "1.3 Corporate Structure", "Value", "Chapter / status"];
  return makeTable(headers, [
    row([{html: "UPE is the Filing Constituent Entity"}, {html: selectHtml(["Yes", "No"], "Yes"), cls: "manual"}, {html: "Name of the MNE Group"}, {html: "Hallway Corporation", cls: "readonly-input"}, {html: "Name of the UPE"}, {html: "Global HoldCo", cls: "readonly-input"}, {html: "Chapter 1"}]),
    row([{html: "Name of the Filing Constituent Entity"}, {html: "Global HoldCo", cls: "readonly-input"}, {html: "Start date of Reporting Fiscal Year"}, {html: "2024-01-01"}, {html: "TIN of the UPE"}, {html: "atch123"}, {html: "1.1 / 1.2"}]),
    row([{html: "Tax identification number (TIN)"}, {html: "atch123"}, {html: "End date of Reporting Fiscal Year"}, {html: "2024-12-31"}, {html: "Status for GloBE purposes"}, {html: "Constituent Entity"}, {html: "1.3"}]),
    row([{html: "Role"}, {html: selectHtml(["Ultimate Parent Entity", "Designated Filing Entity"], "Ultimate Parent Entity"), cls: "manual"}, {html: "Amended Return"}, {html: selectHtml(["Choose", "No", "Yes"], "No"), cls: "manual"}, {html: "Applicable rules?"}, {html: "Yes"}, {html: "Chapter 2 / 3"}]),
    row([{html: "Jurisdiction where the Filing CE is located"}, {html: "Netherlands"}, {html: "GloBE Income"}, {html: money(t.globe), cls: "auto"}, {html: "ETR computation"}, {html: `${(t.etr * 100).toFixed(2)}%`, cls: "auto"}, {html: "3.2 ETR computation"}])
  ]);
}

function tableFor(step) {
  return {entity: entityTable, safe: safeTable, elections: electionsTable, entitypack: entityPackTable, jurisdiction: jurisdictionTable, gir: girTable}[step]();
}

function renderToolbar() {
  const toolbar = $("#sheet-toolbar");
  if (state.current === "entity") {
    toolbar.innerHTML = `<strong>Editable fields:</strong> Update the light-blue cells directly in the row, then <button id="save-entity-inline" class="sheet-save-button" type="button">Save spreadsheet changes</button>`;
    $("#save-entity-inline")?.addEventListener("click", saveEntityInlineChanges);
  } else if (state.current === "safe") {
    toolbar.innerHTML = `<strong>Demo scenario:</strong> Netherlands is pre-populated to <span class="safe-status-copy fail-copy">FAIL</span>; Germany is pre-populated to <span class="safe-status-copy pass-copy">PASS</span>. No amount entry is required.`;
  } else if (state.current === "entitypack") {
    toolbar.innerHTML = `<label><strong>Entity:</strong> <select id="pack-entity-select"><option>Alpha BV</option><option>Delta BV</option></select></label><span>Only entities in the failed Netherlands jurisdiction require an Entity Pack.</span>`;
    $("#pack-entity-select").value = state.selectedEntityPack;
    $("#pack-entity-select").addEventListener("change", (e) => { state.selectedEntityPack = e.target.value; renderCurrentSheet(); });
  } else if (state.current === "gir") {
    toolbar.innerHTML = `<strong>Final output:</strong> Reporting data points are assembled and ready for downstream tagging / filing. <button id="export-action" class="export-action" type="button">Export Final Dataset</button>`;
    $("#export-action").addEventListener("click", openExport);
  } else {
    toolbar.innerHTML = "";
  }
}

function renderConnections() {
  const m = stepMeta[state.current];
  const shared = state.shared.has(state.current);
  $("#incoming-panel").innerHTML = `<div class="connection-note">Incoming data is refreshed from previously shared WData outputs.</div><article class="connection-card"><div class="connection-card-head"><strong>${m.incoming}</strong><span>↻</span></div><p>Source: <a>WData</a> · Table<br><b style="color:#299337">✓</b> Last refreshed: ${state.current === "entity" ? "Demo baseline" : "Just now"}</p></article>`;
  $("#outgoing-panel").innerHTML = `<div class="connection-note">Use the icon on the connection card to share the latest spreadsheet values to WData.</div><article class="connection-card" id="outgoing-card"><div class="connection-card-head"><strong>${m.outgoing}</strong><button id="share-updates" class="share-updates-icon ${shared ? "shared" : ""}" data-tooltip="Share updates" aria-label="Share updates" type="button">↥</button></div><p>Destination: <a>WData</a> · Table<br><span id="last-shared">${shared ? '<b style="color:#299337">✓</b> Last shared: Just now' : '○ Updates not yet shared'}</span></p></article>`;
  $("#share-updates")?.addEventListener("click", shareCurrent);
}

function setConnectionTab(tab) {
  const incoming = tab === "incoming";
  $("#incoming-tab").classList.toggle("active", incoming);
  $("#outgoing-tab").classList.toggle("active", !incoming);
  $("#incoming-panel").classList.toggle("hidden", !incoming);
  $("#outgoing-panel").classList.toggle("hidden", incoming);
}

function clearCoach() { $$(".coach-target").forEach(el => el.classList.remove("coach-target")); }
function coach(el) { clearCoach(); if (el) { el.classList.add("coach-target"); el.scrollIntoView?.({block: "nearest", inline: "nearest"}); } }

function coachPrimaryAction() {
  clearCoach();
  if (state.current === "entity") {
    if (state.entityChangesSaved) coach($("#outgoing-tab"));
    else coach($(".entity-inline-input"));
  }
  if (state.current === "safe") coach($("#outgoing-tab"));
  if (state.current === "elections") coach($("#sheet-table select"));
  if (state.current === "entitypack") coach($("#sheet-table input[data-pack-field='add']"));
  if (state.current === "jurisdiction") coach($("#outgoing-tab"));
  if (state.current === "gir") coach(state.shared.has("gir") ? $("#export-action") : $("#outgoing-tab"));
}

function showShareTarget() {
  setConnectionTab("outgoing");
  window.setTimeout(() => coach($("#share-updates")), 50);
}

function renderScenario() {
  const strip = $("#scenario-strip");
  if (state.current === "safe") {
    strip.innerHTML = `<strong>Demo branch:</strong> Netherlands already contains the values that make the Safe Harbour tests fail. Germany passes. The user only needs to review the result and share it to WData.`;
    strip.classList.remove("hidden");
  } else if (state.current === "entitypack") {
    strip.innerHTML = `<strong>Why this step is active:</strong> Netherlands failed Safe Harbour, so the detailed Entity Pack is required for Alpha BV and Delta BV.`;
    strip.classList.remove("hidden");
  } else {
    strip.classList.add("hidden");
  }
}

function renderCurrentSheet() {
  $("#sheet-table").innerHTML = tableFor(state.current);
  renderToolbar();
  bindDynamicInteractions();
  window.setTimeout(coachPrimaryAction, 80);
}

function showStep(step) {
  if (!steps.includes(step)) return;
  const btn = $(`.step-button[data-step="${step}"]`);
  if (btn?.classList.contains("locked")) { toast("Complete and share the earlier step first."); return; }
  clearCoach();
  state.current = step;
  const i = steps.indexOf(step), m = stepMeta[step];
  $("#page-title").textContent = m.title;
  $("#doc-title").textContent = m.doc;
  $("#tree-title").textContent = m.tree;
  $("#tree-items").innerHTML = treeFor(step);
  $("#instruction-number").textContent = i + 1;
  $("#instruction-title").textContent = m.instructionTitle;
  $("#instruction-copy").textContent = m.instructionCopy;
  $("#progress-text").textContent = `Step ${i + 1} of 6`;
  $("#progress-bar").style.width = `${((i + 1) / 6) * 100}%`;
  $$(".step-button").forEach(b => b.classList.toggle("active", b.dataset.step === step));
  $("#step-status").textContent = state.shared.has(step) ? "Shared to WData" : (step === "gir" ? "Ready" : "Not shared");
  $("#step-status").classList.toggle("shared", state.shared.has(step) || step === "gir");
  $("#previous-step").disabled = i === 0;
  $("#next-step").textContent = i === 5 ? "Demo complete ✓" : "Next step →";
  $("#next-step").disabled = step !== "gir" && !state.shared.has(step);
  setConnectionTab("incoming");
  renderConnections();
  renderCurrentSheet();
  renderScenario();
  renderDataFlow();
  $("#sheet-scroll").scrollLeft = 0;
}

function bindDynamicInteractions() {
  if (state.current === "entity") {
    $$(".entity-inline-input").forEach(control => {
      control.addEventListener("input", () => {
        state.entityChangesSaved = false;
        clearCoach();
        coach($("#save-entity-inline"));
      });
      control.addEventListener("change", () => {
        state.entityChangesSaved = false;
        clearCoach();
        coach($("#save-entity-inline"));
      });
    });
  }
  if (state.current === "elections") {
    $$("select[data-election-j]").forEach(select => select.addEventListener("change", () => {
      state.elections[select.dataset.electionJ][Number(select.dataset.electionI)] = select.value;
      toast("Election selection updated in the spreadsheet.");
      showShareTarget();
    }));
  }
  if (state.current === "entitypack") {
    $$("input[data-pack-field]").forEach(input => input.addEventListener("input", () => {
      const p = state.entityPacks[state.selectedEntityPack];
      const cleaned = input.value.replace(/[^0-9.-]/g, "");
      if (cleaned !== input.value) input.value = cleaned;
      p[input.dataset.packField] = Number(cleaned || 0);
      const total = p.globe + p.add - p.reduction;
      $("[data-pack-total='net']").textContent = money(total);
    }));
    $$("input[data-pack-field]").forEach(input => input.addEventListener("change", showShareTarget));
  }
}

function saveEntityInlineChanges() {
  $$(".entity-inline-input").forEach(control => {
    const index = Number(control.dataset.entityIndex);
    const field = control.dataset.entityField;
    if (state.entities[index] && field) state.entities[index][field] = control.value;
  });
  state.entityChangesSaved = true;
  clearCoach();
  toast("Spreadsheet changes saved. Open Outgoing to share the latest updates.");
  window.setTimeout(() => coach($("#outgoing-tab")), 100);
}

async function showConnectionProgress() {
  const t = $("#connection-toast"), bar = $("#connection-progress"), text = $("#connection-toast-text");
  text.textContent = "Refreshing Connection"; bar.style.width = "0%"; t.classList.remove("hidden");
  await new Promise(r => setTimeout(r, 60)); bar.style.width = "76%";
  await new Promise(r => setTimeout(r, 850)); bar.style.width = "100%"; text.textContent = "Connection refreshed";
  await new Promise(r => setTimeout(r, 550)); t.classList.add("hidden");
}

async function shareCurrent() {
  clearCoach();
  await showConnectionProgress();
  state.shared.add(state.current);
  state.safeFail = true;
  const btn = $(`.step-button[data-step="${state.current}"]`); btn?.classList.add("complete");
  unlockNext();
  renderConnections();
  $("#step-status").textContent = state.current === "gir" ? "Shared to WData" : "Shared to WData";
  $("#step-status").classList.add("shared");
  $("#next-step").disabled = false;
  renderDataFlow();
  toast(`${stepMeta[state.current].title} updates shared to WData.`);
  if (state.current === "gir") coach(state.shared.has("gir") ? $("#export-action") : $("#outgoing-tab"));
  else coach($("#next-step"));
}

function unlockNext() {
  const i = steps.indexOf(state.current);
  if (i < steps.length - 1) $(`.step-button[data-step="${steps[i + 1]}"]`)?.classList.remove("locked");
}

function nextStep() {
  clearCoach();
  const i = steps.indexOf(state.current);
  if (i === 5) { toast("Demo complete. GIR-ready data has been assembled."); return; }
  showStep(steps[i + 1]);
  showGuide(i + 1);
}
function previousStep() { const i = steps.indexOf(state.current); if (i > 0) showStep(steps[i - 1]); }

function showGuide(index = steps.indexOf(state.current)) {
  state.modalIndex = index;
  const step = steps[index], m = stepMeta[step];
  $("#modal-step").textContent = `STEP ${index + 1} OF 6`;
  $("#modal-title").textContent = m.title;
  $("#modal-copy").textContent = m.instructionCopy;
  $("#modal-tip").textContent = m.tip;
  $("#modal-back").style.visibility = index === 0 ? "hidden" : "visible";
  $("#modal-next").textContent = index === 5 ? "Close" : "Got it";
  $("#modal").classList.remove("hidden");
}

function closeGuide() {
  $("#modal").classList.add("hidden");
  window.setTimeout(coachPrimaryAction, 100);
}

function exportDataset() {
  const t = jurisdictionTotals();
  return {
    reportingYear: 2024,
    safeHarbour: {Netherlands: "FAIL", Germany: "PASS"},
    entities: state.entities,
    entityPacks: state.entityPacks,
    jurisdiction: {name: "Netherlands", globeIncome: t.globe, coveredTaxes: t.taxes, etr: Number((t.etr * 100).toFixed(2)), topUpTaxPayable: t.topup},
    status: "Ready for downstream tagging / filing"
  };
}

function openExport() {
  clearCoach();
  $("#export-preview").textContent = JSON.stringify(exportDataset(), null, 2);
  $("#export-modal").classList.remove("hidden");
  state.shared.add("gir");
  $(`.step-button[data-step="gir"]`)?.classList.add("complete");
  $("#step-status").textContent = "Dataset ready";
  renderDataFlow();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function downloadJson() { downloadFile("pillar2-demo-dataset.json", JSON.stringify(exportDataset(), null, 2), "application/json"); }
function downloadCsv() {
  const d = exportDataset();
  const rows = [["Metric", "Value"], ["Reporting year", d.reportingYear], ["Netherlands Safe Harbour", "FAIL"], ["Germany Safe Harbour", "PASS"], ["Netherlands GloBE Income", d.jurisdiction.globeIncome], ["Netherlands Covered Taxes", d.jurisdiction.coveredTaxes], ["Netherlands ETR %", d.jurisdiction.etr], ["Netherlands Top-up Tax Payable", d.jurisdiction.topUpTaxPayable]];
  downloadFile("pillar2-demo-dataset.csv", rows.map(r => r.join(",")).join("\n"), "text/csv");
}

function restart() {
  state.current = "entity"; state.shared.clear(); state.safeFail = true; state.selectedEntityPack = "Alpha BV"; state.entityChangesSaved = false;
  $$(".step-button").forEach((b, i) => { b.classList.remove("complete", "locked"); if (i > 0) b.classList.add("locked"); });
  showStep("entity"); showGuide(0);
}

renderNav();
$("#incoming-tab").addEventListener("click", () => { clearCoach(); setConnectionTab("incoming"); });
$("#outgoing-tab").addEventListener("click", () => { setConnectionTab("outgoing"); window.setTimeout(() => coach($("#share-updates")), 80); });
$("#instruction-action").addEventListener("click", () => state.current === "gir" && state.shared.has("gir") ? coach($("#export-action")) : showShareTarget());
$("#next-step").addEventListener("click", nextStep);
$("#previous-step").addEventListener("click", previousStep);
$("#restart-demo").addEventListener("click", restart);
$("#show-help").addEventListener("click", () => showGuide());
$("#modal-close").addEventListener("click", closeGuide);
$("#modal-next").addEventListener("click", closeGuide);
$("#modal-back").addEventListener("click", () => { if (state.modalIndex > 0) showGuide(state.modalIndex - 1); });
$("#export-close").addEventListener("click", () => $("#export-modal").classList.add("hidden"));
$("#download-json").addEventListener("click", downloadJson);
$("#download-csv").addEventListener("click", downloadCsv);
$("#connection-toast-close").addEventListener("click", () => $("#connection-toast").classList.add("hidden"));

showStep("entity");
window.setTimeout(() => showGuide(0), 300);

// PowerPoint / embedded presentation mode.
// PowerPoint Web Viewer adds its own URL bar/footer, so its usable viewport is often
// much shorter than 16:9. Instead of assuming a fixed screen size, lay the app out
// on a compact virtual canvas and scale that canvas to the browser frame that is
// actually available. Normal GitHub Pages mode is unchanged.
(function applyPresentationMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") !== "presentation") return;

  document.body.classList.add("presentation-mode");
  document.documentElement.classList.add("presentation-mode");

  const shell = document.querySelector(".app-shell");
  if (!shell) return;

  function fitPresentationCanvas() {
    // 720 CSS px is tall enough for the complete demo UI while still allowing
    // readable scaling in PowerPoint's shallow embedded browser.
    const virtualHeight = 720;
    const viewportWidth = Math.max(320, window.innerWidth);
    const viewportHeight = Math.max(240, window.innerHeight);
    const scale = Math.min(1, viewportHeight / virtualHeight);
    const virtualWidth = viewportWidth / scale;

    document.body.classList.toggle("presentation-short", viewportHeight < 610);

    shell.style.position = "absolute";
    shell.style.left = "0";
    shell.style.top = "0";
    shell.style.width = `${virtualWidth}px`;
    shell.style.height = `${virtualHeight}px`;
    shell.style.minHeight = `${virtualHeight}px`;
    shell.style.transformOrigin = "top left";
    shell.style.transform = `scale(${scale})`;

    document.body.style.width = `${viewportWidth}px`;
    document.body.style.height = `${viewportHeight}px`;
    document.body.style.overflow = "hidden";
  }

  fitPresentationCanvas();
  window.addEventListener("resize", fitPresentationCanvas);
})();
