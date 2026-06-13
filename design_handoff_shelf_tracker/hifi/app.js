/* Shelf Tracker — data + interactions. Vanilla JS, no build. */
(function () {
  "use strict";

  /* ---------------- icons ---------------- */
  const I = {
    list: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    add: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    scan: '<svg viewBox="0 0 24 24"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>',
    import: '<svg viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>',
    cat: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>',
    chk: '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>',
  };
  function statusBar() {
    return '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
      + '<svg width="17" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 11.6l2.3-2.8a3.1 3.1 0 0 0-4.6 0L8 11.6z"/><path d="M8 3.1c2.4 0 4.6 1 6.2 2.5l1.6-2A11.7 11.7 0 0 0 8 .5 11.7 11.7 0 0 0 .2 3.6l1.6 2A8.9 8.9 0 0 1 8 3.1z" opacity=".9"/><path d="M8 6.7c1.4 0 2.7.5 3.6 1.4l1.6-2A9.2 9.2 0 0 0 8 4.1 9.2 9.2 0 0 0 2.8 6.1l1.6 2A5.7 5.7 0 0 1 8 6.7z"/></svg>'
      + '<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" stroke-opacity=".35"/><rect x="3" y="3" width="15" height="6" rx="1.5" fill="currentColor"/><rect x="22.6" y="4" width="1.6" height="4" rx="1" fill="currentColor" fill-opacity=".35"/></svg>';
  }

  /* ---------------- data ---------------- */
  const DATA = [
    { id: "fwee-pk03", brand: "FWEE", name: "Blurry Pudding Pot", zh: "水霧交融澎潤腮紅膏", code: "PK03", shade: "Pure Cake", area: "Cheek", status: "fresh", badge: "14mo", s1: "#F8CDD4", s2: "#E89DAD", sdeep: "#C9788C", added: "May 2025", opened: "Jun 2025", expBy: "mfg +36mo (est.)" },
    { id: "fwee-pk05", brand: "FWEE", name: "Blurry Pudding Pot", zh: "霧感腮紅膏", code: "PK05", shade: "Mauve Pudding", area: "Cheek", status: "soon", badge: "≤90d", s1: "#E8C7E0", s2: "#C99BC4", sdeep: "#A874A4", added: "Aug 2024", opened: "Sep 2024", expBy: "opened +12mo" },
    { id: "fwee-or02", brand: "FWEE", name: "Mellow Cheek Tint", zh: "柔霧腮紅", code: "OR02", shade: "Apricot Mellow", area: "Cheek", status: "expired", badge: "expired", s1: "#F4C6AC", s2: "#E59A78", sdeep: "#CE7150", added: "Jan 2023", opened: "Feb 2023", expBy: "printed 2/26" },
    { id: "fwee-ml01", brand: "FWEE", name: "Lip & Cheek Blur", zh: "唇頰兩用", code: "ML01", shade: "Rosy Milk", area: "Lip", status: "fresh", badge: "OK", s1: "#EBBDB6", s2: "#D98F87", sdeep: "#BE6A61", added: "Mar 2026", opened: "—", expBy: "unopened" },
    { id: "bbia-c088", brand: "BBIA", name: "Downy Cheek", zh: "絨霧腮紅", code: "C088-18", shade: "Rosewood Mute", area: "Cheek", status: "soon", badge: "82d", s1: "#E9BCC4", s2: "#D292A0", sdeep: "#B56C7E", added: "Apr 2025", opened: "May 2025", expBy: "opened +12mo" },
    { id: "romnd-bc01", brand: "Rom&nd", name: "Better Than Cheek", zh: "柔霧腮紅", code: "BC01", shade: "Dusty Ribbon", area: "Cheek", status: "expired", badge: "3/26", s1: "#EFB7AE", s2: "#DD8E82", sdeep: "#C56F62", added: "Dec 2022", opened: "Jan 2023", expBy: "printed 3/26" },
    { id: "dasique-09", brand: "Dasique", name: "Blending Mood Cheek", zh: "混色腮紅", code: "#09", shade: "Rosy Brown", area: "Cheek", status: "fresh", badge: "OK", s1: "#EBBDB6", s2: "#D98F87", sdeep: "#BE6A61", added: "Feb 2026", opened: "Mar 2026", expBy: "opened +12mo" },
    { id: "dasique-05", brand: "Dasique", name: "Juicy Dewy Tint", zh: "果汁唇釉", code: "#05", shade: "Fig Fig", area: "Lip", status: "fresh", badge: "OK", s1: "#E2A8AE", s2: "#C77E89", sdeep: "#9E5867", added: "Feb 2026", opened: "—", expBy: "unopened" },
    { id: "hince-01", brand: "Hince", name: "提亮腮紅澎澎餅", zh: "True Dimension", code: "01", shade: "Poong Glow", area: "Cheek", status: "retired", badge: "retired", s1: "#E4C9DF", s2: "#C49BBE", sdeep: "#9E74A0", added: "Jun 2023", opened: "Jul 2023", expBy: "retired Apr 2026" },
    { id: "hince-lb02", brand: "Hince", name: "Radiance Balm", zh: "光澤潤唇", code: "LIGHT 02", shade: "Glow Veil", area: "Lip", status: "fresh", badge: "OK", s1: "#EFC3B6", s2: "#DD9482", sdeep: "#C26C58", added: "Mar 2026", opened: "—", expBy: "unopened" },
    { id: "rom-jj04", brand: "Rom&nd", name: "Juicy Lasting Tint", zh: "果汁唇釉", code: "JJ04", shade: "Pink B姆bler", area: "Lip", status: "soon", badge: "≤90d", s1: "#F1B7C2", s2: "#DD8597", sdeep: "#C0617A", added: "Sep 2024", opened: "Oct 2024", expBy: "opened +12mo" },
    { id: "bbia-r12", brand: "BBIA", name: "Ready To Wear Cheek", zh: "腮紅餅", code: "R12", shade: "Brick Pop", area: "Cheek", status: "fresh", badge: "OK", s1: "#E7A893", s2: "#D17D63", sdeep: "#B05C42", added: "Jan 2026", opened: "Feb 2026", expBy: "opened +24mo" },
    { id: "dasique-mw", brand: "Dasique", name: "Mood Blur Cheek", zh: "霧感腮紅", code: "#03", shade: "Peach Whip", area: "Cheek", status: "fresh", badge: "OK", s1: "#F3C9B4", s2: "#E29A7C", sdeep: "#C7714F", added: "Feb 2026", opened: "—", expBy: "unopened" },
  ];

  const STATUS_TONE = { fresh: "fresh", soon: "soon", expired: "expired", retired: "retired" };

  /* ---------------- render helpers ---------------- */
  function rowHTML(it) {
    const tone = STATUS_TONE[it.status];
    return `<div class="row ${it.status === "retired" ? "retired" : ""}" data-id="${it.id}">
      <span class="dot" style="--s1:${it.s1};--sdeep:${it.sdeep}"></span>
      <div class="row__main">
        <div class="row__l1"><b>${esc(it.brand)}</b><span class="row__name">${esc(it.name)}</span></div>
        <div class="row__l2"><span class="row__code">${esc(it.code)}</span><span class="row__zh">${esc(it.shade)} · ${esc(it.zh)}</span></div>
      </div>
      <span class="pill-badge ${tone}">${it.badge}</span>
      <div class="row__actions">
        <button class="mini-act opened" data-act="opened">Opened today</button>
        <button class="mini-act retire" data-act="retire">Retire</button>
      </div>
    </div>`;
  }
  function cardHTML(it, active) {
    const tone = STATUS_TONE[it.status] === "retired" ? "fresh" : STATUS_TONE[it.status];
    return `<article class="pc ${active ? "pc--active" : ""} ${it.status === "retired" ? "pc--retired" : ""}" data-id="${it.id}" style="--s1:${it.s1};--s2:${it.s2};--sdeep:${it.sdeep}">
      <div class="pc__smear"></div><div class="pc__scrim"></div>
      <div class="pc__in">
        <div class="pc__top"><span class="pc__brand">${esc(it.brand)}</span><span class="gbadge ${tone}">${esc(it.badge)}</span></div>
        <div class="pc__meta">
          <div class="pc__name">${esc(it.name)}</div>
          <div class="pc__code">${esc(it.code)}</div>
          <div class="pc__shade">${esc(it.shade)}</div>
        </div>
      </div>
    </article>`;
  }

  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    // status bars
    $$(".appbar .dots").forEach(d => d.innerHTML = statusBar());
    // tab bar
    buildTabbar();

    renderList();
    renderCatalog();
    wireNav();
    wireList();
    wireAdd();
    wireScan();
    wireImport();
    wireCatalog();
    wireDetail();
    wireMoneyPath();
    wireDark();
    restoreState();
  });

  function restoreState() {
    try {
      if (localStorage.getItem("st.dark") === "1") {
        $("#app").classList.add("sg-dark");
        $$("#darkToggle button").forEach(b => b.classList.toggle("on", b.dataset.mode === "dark"));
      }
      const cv = localStorage.getItem("st.cat");
      if (cv) { const b = $(`#cat-seg [data-view="${cv}"]`); if (b) b.click(); }
      const sc = localStorage.getItem("st.screen");
      if (sc && sc !== "list") go(sc);
    } catch (e) {}
  }

  /* ---------- tab bar ---------- */
  function buildTabbar() {
    const items = [["list", "List", I.list], ["add", "Add", I.add], ["scan", "Scan", I.scan], ["import", "Import", I.import], ["cat", "Catalog", I.cat]];
    $("#tabbar").innerHTML = items.map(([k, l, ic]) => {
      if (k === "scan") return `<div class="tab tab--scan" data-go="scan">${ic}</div>`;
      return `<div class="tab" data-go="${k}">${ic}<span class="tlbl">${l}</span><span class="tdot"></span></div>`;
    }).join("");
  }

  /* ---------- navigation ---------- */
  const SCREENS = { list: "list", add: "add", scan: "scan", import: "import", cat: "cat", detail: "detail" };
  function go(name) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
    $$(".tab").forEach(t => t.classList.toggle("on", t.dataset.go === name));
    if (name === "scan") resetScan();
    if (name !== "detail") { try { localStorage.setItem("st.screen", name); } catch (e) {} }
    const sc = $(`.screen[data-screen="${name}"] .screen__scroll`);
    if (sc) sc.scrollTop = 0;
  }
  window.__go = go;
  function wireNav() {
    $("#tabbar").addEventListener("click", e => {
      const t = e.target.closest(".tab"); if (!t) return;
      go(t.dataset.go);
    });
  }

  /* ---------- LIST ---------- */
  let listFilter = "all", listQuery = "";
  function renderList() {
    const q = listQuery.trim().toLowerCase();
    let items = DATA.filter(it => {
      if (listFilter === "cheek" && it.area !== "Cheek") return false;
      if (listFilter === "lip" && it.area !== "Lip") return false;
      if (listFilter === "expiring" && !(it.status === "soon" || it.status === "expired")) return false;
      if (q) {
        const hay = (it.brand + " " + it.name + " " + it.zh + " " + it.code + " " + it.shade).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const order = { expired: 0, soon: 1, fresh: 2, retired: 3 };
    items.sort((a, b) => order[a.status] - order[b.status]);
    $("#list-rows").innerHTML = items.map(rowHTML).join("") || `<div style="color:var(--sg-ink-45);font-size:14px;text-align:center;padding:30px 0">No items match “${listQuery}”.</div>`;
    $("#list-count").textContent = `${items.length} of ${DATA.length} · by expiry`;
  }
  function wireList() {
    const input = $("#list-search");
    input.addEventListener("input", () => {
      listQuery = input.value;
      input.closest(".search").classList.toggle("has-val", !!listQuery);
      renderList();
    });
    $(".search .clearx", $('.screen[data-screen="list"]')).addEventListener("click", () => {
      input.value = ""; listQuery = ""; input.closest(".search").classList.remove("has-val"); renderList(); input.focus();
    });
    $("#list-chips").addEventListener("click", e => {
      const c = e.target.closest(".chip"); if (!c) return;
      $$("#list-chips .chip").forEach(x => x.classList.remove("on"));
      c.classList.add("on"); listFilter = c.dataset.filter; renderList();
    });
    // row tap → detail, swipe-reveal via tap on already-selected? use long-press / button row toggled by a swipe affordance: tap opens detail, the "⋯" not present, so we reveal on a second tap-hold. Simpler: click row opens detail; click on revealed actions handled.
    let pressTimer = null, revealedRow = null;
    const rowsEl = $("#list-rows");
    function closeReveal() { if (revealedRow) { revealedRow.classList.remove("revealed"); revealedRow = null; } }
    rowsEl.addEventListener("click", e => {
      const act = e.target.closest(".mini-act");
      if (act) {
        e.stopPropagation();
        const row = act.closest(".row"); const it = DATA.find(d => d.id === row.dataset.id);
        if (act.dataset.act === "retire") { it.status = "retired"; it.badge = "retired"; }
        else { it.badge = "opened ·"; setTimeout(() => { it.badge = "12mo"; }, 0); }
        closeReveal(); renderList();
        toast(act.dataset.act === "retire" ? "Retired — kept in history" : "Marked opened today");
        return;
      }
      const row = e.target.closest(".row"); if (!row) return;
      if (row.classList.contains("revealed")) { closeReveal(); return; }
      if (revealedRow) { closeReveal(); return; }
      openDetail(row.dataset.id);
    });
    // long press reveals actions
    rowsEl.addEventListener("pointerdown", e => {
      const row = e.target.closest(".row"); if (!row || e.target.closest(".mini-act")) return;
      pressTimer = setTimeout(() => { closeReveal(); row.classList.add("revealed"); revealedRow = row; pressTimer = null; }, 420);
    });
    rowsEl.addEventListener("pointerup", () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
    rowsEl.addEventListener("pointerleave", () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } });
  }

  /* ---------- DETAIL ---------- */
  function openDetail(id) {
    const it = DATA.find(d => d.id === id); if (!it) return;
    const owned = it.status !== "retired";
    const tone = STATUS_TONE[it.status] === "retired" ? "fresh" : STATUS_TONE[it.status];
    $("#detail-body").innerHTML = `
      <div class="detail__hero" style="--s1:${it.s1};--s2:${it.s2};--sdeep:${it.sdeep}">
        <div class="pc__smear"></div><div class="pc__scrim"></div>
        <div class="detail__back" data-back>${I.back}</div>
        <div class="pc__in">
          <div class="pc__top"><span class="pc__brand">${esc(it.brand)}</span><span class="gbadge ${tone}">${esc(it.badge)}</span></div>
          <div class="pc__meta"><div class="pc__name">${esc(it.name)}</div><div class="pc__code" style="font-size:40px">${esc(it.code)}</div></div>
        </div>
      </div>
      ${owned ? `<div class="owned-ribbon">${I.chk}<span>You already own this shade</span></div>` : `<div class="owned-ribbon" style="background:var(--sg-ink-12);color:var(--sg-ink-45)">Retired — kept in your history</div>`}
      <div>
        <div class="kv"><span class="k">Shade</span><span class="v">${esc(it.shade)} · ${esc(it.zh)}</span></div>
        <div class="kv"><span class="k">Code</span><span class="v mono">${it.code}</span></div>
        <div class="kv"><span class="k">Area</span><span class="v">${it.area}</span></div>
        <div class="kv"><span class="k">Added / Opened</span><span class="v">${it.added} / ${it.opened}</span></div>
        <div class="kv"><span class="k">Expiry basis</span><span class="v">${it.expBy}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn ghost" data-back>Back to shelf</button>
        <button class="btn primary" data-detail-open>Opened today</button>
      </div>`;
    go("detail");
  }
  function wireDetail() {
    $("#detail-body").addEventListener("click", e => {
      if (e.target.closest("[data-back]")) go("list");
      if (e.target.closest("[data-detail-open]")) { toast("Marked opened today"); go("list"); }
    });
  }

  /* ---------- ADD ---------- */
  const BRANDS = [["FWEE", "12 items"], ["Flower Knows", "3 items"], ["Fwee Glow", "1 item"]];
  function wireAdd() {
    const brand = $("#add-brand"), ac = $("#add-ac");
    brand.addEventListener("input", () => {
      const v = brand.value.trim().toLowerCase();
      if (!v) { ac.classList.remove("open"); return; }
      const matches = BRANDS.filter(b => b[0].toLowerCase().includes(v));
      let html = matches.map(b => `<div class="ac-item" data-brand="${b[0]}"><b>${b[0]}</b><span class="ac-meta">${b[1]}</span></div>`).join("");
      html += `<div class="ac-item is-new" data-brand="${brand.value}"><b>“${brand.value}” — add as new brand</b><span class="ac-meta">+</span></div>`;
      ac.innerHTML = html; ac.classList.add("open");
    });
    ac.addEventListener("click", e => {
      const item = e.target.closest(".ac-item"); if (!item) return;
      brand.value = item.dataset.brand; ac.classList.remove("open"); $("#add-name").focus();
    });
    document.addEventListener("click", e => { if (!e.target.closest("#add-brand") && !e.target.closest("#add-ac")) ac.classList.remove("open"); });

    $("#add-save").addEventListener("click", () => {
      // duplicate check: PK03 + FWEE already owned
      const code = $("#add-code").value.trim().toLowerCase();
      const br = brand.value.trim().toLowerCase();
      if (code === "pk03" && br === "fwee") { openDupeSheet("fwee-pk03"); return; }
      saveAdd();
    });
  }
  function saveAdd() {
    closeSheet();
    toast("Saved ✓ — on your shelf", "Add another");
    // reset but keep brand
    $("#add-name").value = ""; $("#add-code").value = ""; $("#add-shade").value = "";
  }

  /* ---------- DUPLICATE SHEET ---------- */
  function staticRowHTML(it) {
    const tone = STATUS_TONE[it.status];
    return `<div class="row" style="cursor:default">
      <span class="dot" style="--s1:${it.s1};--sdeep:${it.sdeep}"></span>
      <div class="row__main">
        <div class="row__l1"><b>${esc(it.brand)}</b><span class="row__name">${esc(it.name)}</span></div>
        <div class="row__l2"><span class="row__code">${esc(it.code)}</span><span class="row__zh">${esc(it.shade)} · ${esc(it.zh)}</span></div>
      </div>
      <span class="pill-badge ${tone}">${esc(it.badge)}</span>
    </div>`;
  }
  function openDupeSheet(id) {
    const it = DATA.find(d => d.id === id);
    $("#sheet-body").innerHTML = `
      <div class="sheet__grab"></div>
      <div class="sheet__title">You own this</div>
      <p class="sheet__sub">This shade is already on your shelf — added ${it.added}.</p>
      ${staticRowHTML(it)}
      <div class="btn-row">
        <button class="btn ghost" data-sheet-cancel>Cancel</button>
        <button class="btn primary" data-sheet-confirm>Save anyway</button>
      </div>`;
    openSheet();
    $("#sheet-body").querySelectorAll("[data-sheet-cancel]").forEach(b => b.onclick = closeSheet);
    $("#sheet-body").querySelectorAll("[data-sheet-confirm]").forEach(b => b.onclick = saveAdd);
  }
  function openSheet() { $("#scrim").classList.add("open"); $("#sheet").classList.add("open"); }
  function closeSheet() { $("#scrim").classList.remove("open"); $("#sheet").classList.remove("open"); }
  window.__openSheet = openSheet; window.__closeSheet = closeSheet;

  /* ---------- TOAST ---------- */
  let toastT = null;
  function toast(msg, action) {
    const t = $("#toast");
    t.innerHTML = `<div class="tcheck">${I.chk}</div><div class="ttext">${msg}</div>${action ? `<div class="taction">${action}</div>` : ""}`;
    t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
    const a = t.querySelector(".taction"); if (a) a.onclick = () => { t.classList.remove("show"); go("add"); };
  }
  window.__toast = toast;

  /* ---------- SCAN ---------- */
  let scanState = "idle";
  function resetScan() {
    scanState = "idle";
    $("#scan-result-wrap").innerHTML = "";
    const dock = $("#scan-dock");
    dock.style.display = "block";
    dock.innerHTML = '<div class="shutter" id="shutter"></div>';
    $("#shutter").addEventListener("click", () => runScan(false));
    const vf = $("#viewfinder"); if (vf) vf.style.display = "flex";
  }
  function wireScan() {
    $("#shutter").addEventListener("click", () => runScan(false));
    // hidden toggle: double tap the viewfinder corner to force a miss for demo
    $("#scan-miss-toggle").addEventListener("click", () => runScan(true));
  }
  function runScan(forceMiss) {
    if (scanState === "reading") return;
    scanState = "reading";
    $("#scan-dock").style.display = "none";
    $("#scan-result-wrap").innerHTML = `<div class="scan-result miss"><div class="spin"></div><div class="st"><b>Reading barcode…</b><span>8 8061 2345 678</span></div></div>`;
    setTimeout(() => {
      const miss = forceMiss;
      scanState = "result";
      if (!miss) {
        $("#scan-result-wrap").innerHTML = `
          <div class="scan-result hit"><div class="ic">${I.box}</div><div class="st"><b>BBIA · Ready To Wear Cheek</b><span>✓ database hit — confirm the shade</span></div></div>
          <div class="field mono" style="margin-top:12px"><label>Shade code — the DB doesn't know shades, you do</label><input value="R12" id="scan-code"></div>
          <div class="field" style="margin-top:10px"><label>Use-by 까지</label><input placeholder="read it off the stamp, if visible"></div>`;
      } else {
        $("#scan-result-wrap").innerHTML = `
          <div class="scan-result miss"><div class="ic">${I.spark}</div><div class="st"><b>Not in the database — normal for K-beauty</b><span>barcode saved · fills the form for next time</span></div></div>
          <div class="field" style="margin-top:12px"><label>Brand</label><input placeholder="autocompletes from your shelf"></div>
          <div class="field" style="margin-top:10px"><label>Product name</label><input placeholder="EN or 中文"></div>`;
      }
      $("#scan-dock").style.display = "block";
      $("#scan-dock").innerHTML = `<button class="btn primary full" id="scan-save">Save to shelf</button>`;
      $("#scan-save").onclick = () => { resetScan(); toast("Saved ✓ — on your shelf"); go("list"); };
    }, 1300);
  }

  /* ---------- IMPORT ---------- */
  const PASTE_SAMPLE = "Dasique\tJuicy Dewy Tint\t#05\t2026.08\nHince\t提亮腮紅澎澎餅\t01\t—\nFWEE\tBlurry Pudding Pot\tPK03\t2027.11";
  function wireImport() {
    const paste = $("#paste");
    $("#import-fill").addEventListener("click", () => { paste.textContent = PASTE_SAMPLE; previewImport(); });
    paste.addEventListener("input", previewImport);
    $("#import-go").addEventListener("click", () => {
      toast("Imported 2 · skipped 1 duplicate");
      paste.textContent = ""; $("#import-preview").innerHTML = ""; $("#import-actions").style.display = "none";
    });
  }
  function previewImport() {
    const txt = $("#paste").textContent.trim();
    if (!txt) { $("#import-preview").innerHTML = ""; $("#import-actions").style.display = "none"; return; }
    const lines = txt.split("\n").filter(Boolean);
    const html = lines.map(line => {
      const [brand, name, code] = line.split("\t");
      const dupe = (code || "").trim().toUpperCase() === "PK03";
      const it = DATA.find(d => d.code === (code || "").trim()) || { s1: "#E6CFcf", sdeep: "#b89", shade: "", zh: "" };
      return `<div class="row ${dupe ? "dupe" : ""}" style="cursor:default">
        <span class="dot" style="--s1:${it.s1};--sdeep:${it.sdeep}"></span>
        <div class="row__main"><div class="row__l1"><b>${esc(brand) || "?"}</b><span class="row__name">${esc(name)}</span></div>
        <div class="row__l2"><span class="row__code">${esc(code) || "—"}</span><span class="row__zh">${dupe ? "already on shelf" : "new"}</span></div></div>
        <span class="pill-badge ${dupe ? "expired" : "fresh"}">${dupe ? "skip dupe" : "import"}</span>
      </div>`;
    }).join("");
    $("#import-preview").innerHTML = html;
    const newCount = lines.filter(l => (l.split("\t")[2] || "").trim().toUpperCase() !== "PK03").length;
    $("#import-go").textContent = `Import ${newCount} · skip ${lines.length - newCount}`;
    $("#import-actions").style.display = "flex";
  }

  /* ---------- CATALOG ---------- */
  let catView = "grid";
  function renderCatalog() {
    const groups = {};
    DATA.forEach(it => { (groups[it.brand] = groups[it.brand] || []).push(it); });
    const order = Object.keys(groups).sort();
    let html = "";
    order.forEach(brand => {
      const items = groups[brand];
      html += `<div class="brand-head"><span class="bn">${brand}</span><span class="ct">${items.length}</span></div>`;
      html += `<div class="grid">${items.map((it, i) => cardHTML(it, brand === "FWEE" && i === 0)).join("")}</div>`;
    });
    $("#cat-grid-wrap").innerHTML = html;
  }
  function wireCatalog() {
    $("#cat-seg").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      catView = b.dataset.view;
      try { localStorage.setItem("st.cat", catView); } catch (e) {}
      $$("#cat-seg button").forEach(x => x.classList.toggle("on", x === b));
      $$(".cat-view").forEach(v => v.style.display = v.dataset.view === catView ? "flex" : "none");
    });
    $("#cat-grid-wrap").addEventListener("click", e => {
      const c = e.target.closest(".pc"); if (!c) return; openDetail(c.dataset.id);
    });
    // haul
    let spent = 32500, left = 48000;
    $("#haul-list").addEventListener("click", e => {
      const item = e.target.closest(".haul-item"); if (!item) return;
      const price = +item.dataset.price;
      const wasDone = item.classList.toggle("done");
      spent += wasDone ? price : -price; left -= wasDone ? price : -price;
      $("#haul-spent").textContent = "₩" + spent.toLocaleString();
      $("#haul-left").textContent = "₩" + left.toLocaleString();
      const done = $$("#haul-list .haul-item.done").length;
      $("#haul-checked").textContent = `checked ${done} of ${$$("#haul-list .haul-item").length}`;
    });
  }

  /* ---------- DARK MODE ---------- */
  function wireDark() {
    const t = $("#darkToggle"); if (!t) return;
    t.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      $("#app").classList.toggle("sg-dark", b.dataset.mode === "dark");
      try { localStorage.setItem("st.dark", b.dataset.mode === "dark" ? "1" : "0"); } catch (e) {}
      $$("#darkToggle button").forEach(x => x.classList.toggle("on", x === b));
    });
  }

  /* ---------- MONEY PATH (guided) ---------- */
  function wireMoneyPath() {
    const btn = $("#playMoney"); if (!btn) return;
    btn.addEventListener("click", playMoney);
  }
  function coach(text, step, pos) {
    const c = $("#coach");
    c.innerHTML = `<span class="step">${step}</span>${text}`;
    Object.assign(c.style, { top: "", bottom: "", left: "", right: "" });
    Object.assign(c.style, pos);
    c.classList.add("show");
  }
  function hideCoach() { $("#coach").classList.remove("show"); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  async function playMoney() {
    const input = $("#list-search");
    go("list"); await sleep(450);
    coach("Front door: search is the top of the list.", "STEP 1 · open", { top: "70px", left: "20px" });
    await sleep(1400);
    // type "pure cake"
    input.value = ""; listQuery = "";
    const word = "pure cake";
    input.closest(".search").classList.add("has-val");
    for (let i = 1; i <= word.length; i++) { input.value = word.slice(0, i); listQuery = input.value; renderList(); await sleep(95); }
    coach("Match lands above the keyboard — no submit needed.", "STEP 2 · search", { top: "150px", left: "20px" });
    await sleep(1500);
    const first = $("#list-rows .row");
    if (first) { first.classList.add("revealed"); await sleep(120); first.classList.remove("revealed"); openDetail(first.dataset.id); }
    await sleep(500);
    coach("The 5-second answer: you already own Pure Cake.", "STEP 3 · owned", { top: "210px", left: "20px" });
    await sleep(1800);
    hideCoach();
    go("scan"); await sleep(500);
    coach("New product in hand — scan it.", "STEP 4 · scan", { bottom: "150px", left: "20px" });
    await sleep(1300);
    runScan(false);
    await sleep(1700);
    coach("Prefilled. One tap to save — done in under 30s.", "STEP 5 · save", { bottom: "150px", left: "20px" });
    await sleep(2000);
    hideCoach();
    const save = $("#scan-save"); if (save) save.click();
  }
})();
