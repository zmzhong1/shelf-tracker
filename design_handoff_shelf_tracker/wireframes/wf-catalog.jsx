// wf-catalog.jsx — Sections 6–7: Catalog (browse mode) and Shelf Scanner.

/* ============ CATALOG ============ */
function CatalogGrid() {
  return (
    <Phone h={820}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Catalog</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Pill active>All areas</Pill><Pill>Cheek</Pill><Pill>Lip</Pill><Pill>Expiring</Pill><Pill>⋯</Pill>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
          <span className="wf-h">FWEE <span className="wf-small wf-dim">12</span></span>
          <span className="wf-small wf-dim">A–Z ▾</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Card w={165} pink code="PK03" name="Pudding Pot" badge={["fresh", "OK"]} />
          <Card w={165} code="PK05" name="Pudding Pot" badge={["soon", "≤90d"]} />
          <Card w={165} pink code="ML01" name="Lip&Cheek Blush" badge={["fresh", "OK"]} />
          <Card w={165} code="03" name="Mellow Blusher" badge={["exp", "EXP"]} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="wf-h">Dasique <span className="wf-small wf-dim">9</span></span>
        </div>
        <Note>brand = section, sticky header while scrolling. 2-up photocards; smear carries the shade story</Note>
      </div>
    </Phone>
  );
}

function CatalogInsights() {
  return (
    <Phone h={820}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Insights</div>
        <div style={{ display: "flex", gap: 8 }}>
          <SBox h={84} style={{ flex: 1, flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 26, color: "var(--wf-exp)" }}>6</span>
            <span className="wf-small">expired</span>
          </SBox>
          <SBox h={84} style={{ flex: 1, flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 26, color: "var(--wf-soon)" }}>11</span>
            <span className="wf-small">≤90 days</span>
          </SBox>
          <SBox h={84} style={{ flex: 1, flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 26 }}>201</span>
            <span className="wf-small">on shelf</span>
          </SBox>
        </div>
        <div className="sk" style={{ padding: 12, background: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
          <strong>Expiring next</strong>
          <Row brand="Rom&nd" name="Better Than Cheek" code="BC01" badge={["exp", "EXPIRED"]} />
          <Row brand="BBIA" name="Downy Cheek" code="C088-18" badge={["soon", "82d"]} />
        </div>
        <div className="sk" style={{ padding: 12, background: "#fff", display: "flex", flexDirection: "column", gap: 6 }}>
          <strong>Collection gaps</strong>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Smear w={30} h={18} style={{ borderRadius: 99 }} />
            <span className="wf-small">87 blush · 0 coral-toned this year</span>
          </div>
          <div className="wf-small wf-dim">spectrum strip of owned shades, gaps hollow</div>
        </div>
        <Note>insights answer “what should I NOT buy again” before a haul — feeds the shopping list below</Note>
      </div>
    </Phone>
  );
}

function CatalogHaul() {
  return (
    <Phone h={820}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Korea Haul</div>
        <div className="wf-small wf-dim">checkable in-store · long-press to edit</div>
        {[
          ["☑", "FWEE Pudding Pot — PK05 Mauve", "₩14,000", true],
          ["☑", "Dasique mood cheek refill #09", "₩18,500", true],
          ["☐", "Hince radiance balm LIGHT 02", "₩32,000", false],
          ["☐", "Rom&nd new cheek (check shade vs owned!)", "₩16,000", false],
        ].map(([c, t, p, done], i) => (
          <div key={i} className="sk sk-faint" style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", background: "#fff", opacity: done ? 0.55 : 1 }}>
            <span style={{ fontSize: 19 }}>{c}</span>
            <span style={{ flex: 1, textDecoration: done ? "line-through" : "none" }}>{t}</span>
            <span className="wf-mono-big" style={{ fontSize: 13 }}>{p}</span>
          </div>
        ))}
        <div style={{ marginTop: "auto", paddingBottom: 8 }}>
          <div className="sk" style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--wf-ink)", color: "#fff" }}>
            <span>checked 2 of 4</span>
            <span className="wf-mono-big" style={{ fontSize: 16 }}>₩32,500 spent · ₩48,000 left</span>
          </div>
          <Note style={{ marginTop: 6 }}>running subtotal pinned bottom — updates as she checks items off in the store</Note>
        </div>
      </div>
    </Phone>
  );
}

/* ============ SCANNER ============ */
function ScannerQueue() {
  const Q = ({ state, label }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <Hatch h={86} label="" style={{ width: 86, borderColor: state === "fail" ? "var(--wf-exp)" : state === "ok" ? "var(--wf-fresh)" : undefined }} />
      <span className="wf-small" style={{ color: state === "fail" ? "var(--wf-exp)" : state === "ok" ? "var(--wf-fresh)" : "var(--wf-faint)" }}>{label}</span>
    </div>
  );
  return (
    <div className="wf" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, background: "#fff", height: "100%" }}>
      <div className="wf-h" style={{ fontSize: 26 }}>Shelf Scanner <span className="wf-small wf-dim">— runs in claude.ai</span></div>
      <div style={{ display: "flex", gap: 12 }}>
        <Q state="ok" label="✓ read" />
        <Q state="ok" label="✓ read" />
        <Q state="reading" label="◌ reading…" />
        <Q state="fail" label="✗ retake" />
        <div className="sk sk-dash" style={{ width: 86, height: 86, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wf-faint)", fontSize: 26 }}>+</div>
      </div>
      <Note>queue is honest: per-photo state. a ✗ never blocks the batch — retake or drop, others proceed</Note>
      <div className="wf-small wf-dim">AI reads brand · shade code · 까지 (use-by) · 제조 (mfg) from stamps</div>
    </div>
  );
}

function ScannerTable() {
  const cell = (v, low) => (
    <td style={low ? { background: "#fdeef0", color: "var(--wf-exp)" } : {}}>{v}{low ? " ?" : ""}</td>
  );
  return (
    <div className="wf" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, background: "#fff", height: "100%" }}>
      <div className="wf-h" style={{ fontSize: 26 }}>Results — review before trusting</div>
      <table className="wf-table">
        <thead><tr><th></th><th>Brand</th><th>Product</th><th>Shade</th><th>까지 use-by</th><th>제조 mfg</th></tr></thead>
        <tbody>
          <tr><td>☑</td><td>FWEE</td><td>Blurry Pudding Pot</td><td className="wf-mono">PK03</td><td className="wf-mono">2027.11</td><td>—</td></tr>
          <tr><td>☑</td><td>Dasique</td><td>Juicy Dewy Tint</td><td className="wf-mono">#05</td>{cell("2026.08", true)}<td>—</td></tr>
          <tr><td>☑</td>{cell("Hince?", true)}<td>提亮腮紅澎澎餅</td>{cell("0l ?", true)}<td>—</td><td className="wf-mono">2025.12</td></tr>
        </tbody>
      </table>
      <Note>every AI-read cell is tappable to edit. low-confidence = tinted + “?”, NEVER silently confident. embossed stamps misread: 0↔O, 1↔l</Note>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn ghost>Re-read photo</Btn>
        <Btn primary>Copy 3 rows → Import</Btn>
      </div>
      <div className="wf-small wf-dim">copies in the exact column order Tracker’s Import tab expects</div>
    </div>
  );
}

function SectionCatalog() {
  return (
    <DCSection id="catalog" title="6 · Catalog — browse mode" subtitle="brand grid · insights · Korea Haul checklist">
      <DCArtboard id="cat-grid" label="brand grid + filters" width={390} height={820}><CatalogGrid /></DCArtboard>
      <DCArtboard id="cat-insights" label="insights" width={390} height={820}><CatalogInsights /></DCArtboard>
      <DCArtboard id="cat-haul" label="Korea Haul + ₩ subtotal" width={390} height={820}><CatalogHaul /></DCArtboard>
    </DCSection>
  );
}

function SectionScanner() {
  return (
    <DCSection id="scanner" title="7 · Shelf Scanner" subtitle="photo queue + editable results — must read as “review before trusting”">
      <DCArtboard id="scn-queue" label="photo queue states" width={620} height={320}><ScannerQueue /></DCArtboard>
      <DCArtboard id="scn-table" label="editable results table" width={620} height={400}><ScannerTable /></DCArtboard>
    </DCSection>
  );
}

Object.assign(window, { SectionCatalog, SectionScanner });
