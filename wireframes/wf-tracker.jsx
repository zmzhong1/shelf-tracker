// wf-tracker.jsx — Sections 2–5: the four Tracker tabs with briefed states.

/* ============ ADD ============ */
function AddEmpty() {
  return (
    <Phone h={760} tab={<TabBar variant="fab" active="Add" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Add</div>
        <Input label="Brand" placeholder="start typing — autocompletes from your 51 brands" />
        <Input label="Product name" placeholder="EN or 中文" />
        <div style={{ display: "flex", gap: 8 }}>
          <Input label="Shade code" placeholder="PK03 / C088-18" style={{ flex: 1 }} />
          <Input label="Shade name" placeholder="Pure Cake" style={{ flex: 1.4 }} />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="wf-label" style={{ margin: 0 }}>Category</span>
          <Pill>Blush</Pill><Pill>Lip</Pill><Pill>Eye</Pill><Pill>Base</Pill><Pill>…</Pill>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Input label="Use-by (까지)" placeholder="—" style={{ flex: 1 }} />
          <Input label="Mfg (제조)" placeholder="—" style={{ flex: 1 }} />
          <Input label="Opened" placeholder="—" style={{ flex: 1 }} />
        </div>
        <Note>dates optional — badge falls back to mfg+36mo “est.” fields mirror sheet columns; nothing invented</Note>
        <div style={{ marginTop: "auto", paddingBottom: 10 }}>
          <Btn primary>Save</Btn>
        </div>
      </div>
    </Phone>
  );
}

function AddAutocomplete() {
  return (
    <Phone h={760} kbd>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Add</div>
        <Input label="Brand" value="fw" focus />
        <div className="sk" style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
          {[["FWEE", "12 items on your shelf"], ["Flower Knows", "3 items"], ["fwee… new brand?", "add as typed"]].map(([n, d], i) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: i ? "1.4px dashed var(--wf-fill2)" : "none", minHeight: 44 }}>
              <strong style={{ color: i === 2 ? "var(--wf-faint)" : undefined }}>{n}</strong>
              <span className="wf-small wf-dim">{d}</span>
            </div>
          ))}
        </div>
        <Note>her own history first — counts build trust. “new brand” is the last row, never a dead end</Note>
      </div>
    </Phone>
  );
}

function AddSaved() {
  return (
    <Phone h={760} tab={<TabBar variant="fab" active="Add" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Add</div>
        <Input label="Brand" value="FWEE" />
        <Input label="Product name" value="Blurry Pudding Pot" />
        <div style={{ display: "flex", gap: 8 }}>
          <Input label="Shade code" value="PK05" style={{ flex: 1 }} />
          <Input label="Shade name" value="Mauve Pudding" style={{ flex: 1.4 }} />
        </div>
        <div style={{ marginTop: "auto", paddingBottom: 10 }}>
          <Btn ghost>Save</Btn>
        </div>
        <Toast style={{ bottom: 86 }}>Saved ✓ — PK05 · form resets, brand kept</Toast>
        <Note style={{ position: "absolute", right: 6, bottom: 150 }}>toast offers “add another<br />from same brand” —<br />haul-unpacking mode</Note>
      </div>
    </Phone>
  );
}

/* ============ SCAN ============ */
function ScanTaken() {
  return (
    <Phone h={760}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Scan</div>
        <Hatch h={300} label="captured frame" />
        <div className="sk" style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", background: "#fff" }}>
          <span style={{ fontSize: 20 }}>◌</span>
          <div>
            <strong>Reading barcode…</strong>
            <div className="wf-small wf-dim">8 8061 2345 678</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingBottom: 10 }}>
          <Btn style={{ flex: 1 }}>Retake</Btn>
          <Btn ghost style={{ flex: 1 }}>Skip → type it</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScanHit() {
  return (
    <Phone h={760}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Scan · found</div>
        <div className="sk" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", background: "#fff", borderColor: "var(--wf-fresh)" }}>
          <Hatch h={50} label="📦" style={{ width: 50 }} />
          <div style={{ flex: 1 }}>
            <strong>BBIA · Downy Cheek</strong>
            <div className="wf-small" style={{ color: "var(--wf-fresh)" }}>✓ database hit — check it's the right shade</div>
          </div>
        </div>
        <Input label="Shade code — DB doesn't know shades, she does" value="C088-18" focus />
        <Input label="Use-by (까지)" placeholder="from the stamp, if visible" />
        <Note>prefill = brand + product only. shade stays hers to type; cursor lands there automatically</Note>
        <div style={{ marginTop: "auto", paddingBottom: 10 }}>
          <Btn primary>Save to shelf</Btn>
        </div>
      </div>
    </Phone>
  );
}

function ScanMiss() {
  return (
    <Phone h={760}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Scan · not listed</div>
        <div className="sk" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", background: "#fff" }}>
          <span style={{ fontSize: 22 }}>✶</span>
          <div style={{ flex: 1 }}>
            <strong>Not in the database — normal for K-beauty</strong>
            <div className="wf-small wf-dim">barcode saved · 8 8061 2345 678 · fills the form for next time</div>
          </div>
        </div>
        <Input label="Brand" placeholder="autocomplete from your shelf" focus />
        <Input label="Product name" placeholder=" " />
        <Note>NOT an error state: neutral ink, no red, same form as Add with barcode already attached. one extra line of copy, then move on.</Note>
        <div style={{ marginTop: "auto", paddingBottom: 10 }}>
          <Btn primary>Save to shelf</Btn>
        </div>
      </div>
    </Phone>
  );
}

/* ============ IMPORT ============ */
function ImportPreview() {
  return (
    <Phone h={760} tab={<TabBar variant="fab" active="Import" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Import</div>
        <div className="sk sk-dash" style={{ padding: "10px 12px", color: "var(--wf-faint)", background: "var(--wf-fill)", fontSize: 13 }}>
          pasted: 3 rows from Shelf Scanner ⌘V
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Row brand="Dasique" name="Juicy Dewy Tint" code="#05" badge={["fresh", "new"]} />
          <Row brand="Hince" name="提亮腮紅澎澎餅" code="01" badge={["fresh", "new"]} />
          <Row brand="FWEE" name="Pudding Pot" code="PK03" badge={["exp", "dupe?"]} highlight />
        </div>
        <Note>preview = same row component as List. dupes flagged BEFORE import, per row — tap to keep/skip</Note>
        <div style={{ marginTop: "auto", paddingBottom: 10, display: "flex", gap: 8 }}>
          <Btn ghost style={{ flex: 1 }}>Clear</Btn>
          <Btn primary style={{ flex: 2 }}>Import 2 · skip 1</Btn>
        </div>
      </div>
    </Phone>
  );
}

/* ============ LIST ============ */
function ListStates() {
  return (
    <Phone h={760} tab={<TabBar variant="fab" active="List" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <SearchBar value="cheek" active />
        <div className="wf-small wf-dim">7 of 201 · sorted by expiry</div>
        <Row brand="Rom&nd" name="Better Than Cheek" code="BC01" badge={["exp", "EXPIRED 3/26"]} />
        <Row brand="BBIA" name="Downy Cheek" code="C088-18" badge={["soon", "82d left"]} />
        <Row brand="Dasique" name="Blending Mood Cheek" code="#09" actions />
        <Row brand="FWEE" name="Blurry Pudding Pot" zh="水霧交融澎潤腮紅膏" code="PK03" />
        <Row brand="Hince" name="提亮腮紅澎澎餅 Poong Poong" code="01" badge={["ret", "retired"]} dim />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          <Note>code never truncates — names ellipsize, code is the identity</Note>
          <Note>row 3: swipe (or long-press) reveals Opened today / Retire — both 44px</Note>
          <Note>retired stays visible at 45% — her history, not trash</Note>
        </div>
      </div>
    </Phone>
  );
}

function ListDupeSheet() {
  return (
    <Phone h={760}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, opacity: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Add</div>
        <Input label="Brand" value="FWEE" />
        <Input label="Shade code" value="PK03" />
        <Sheet title="You own this" h={290}>
          <Row brand="FWEE" name="Blurry Pudding Pot" code="PK03 · Pure Cake" badge={["fresh", "OK"]} highlight />
          <div className="wf-dim">added May 2028</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <Btn style={{ flex: 1 }}>Cancel</Btn>
            <Btn primary style={{ flex: 1 }}>Save anyway</Btn>
          </div>
          <Note>fires on save, not while typing — never interrupts entry. shows the owned card so she can compare in hand</Note>
        </Sheet>
      </div>
    </Phone>
  );
}

/* ---- sections ---- */
function SectionAdd() {
  return (
    <DCSection id="add" title="2 · Tracker — Add" subtitle="log a purchase &lt; 30s, one-handed">
      <DCArtboard id="add-empty" label="empty" width={390} height={760}><AddEmpty /></DCArtboard>
      <DCArtboard id="add-auto" label="brand autocomplete open" width={390} height={760}><AddAutocomplete /></DCArtboard>
      <DCArtboard id="add-saved" label="saved toast" width={390} height={760}><AddSaved /></DCArtboard>
    </DCSection>
  );
}

function SectionScan() {
  return (
    <DCSection id="scan" title="3 · Tracker — Scan" subtitle="the database miss is common and must feel fine">
      <DCArtboard id="scan-taken" label="photo taken" width={390} height={760}><ScanTaken /></DCArtboard>
      <DCArtboard id="scan-hit" label="database hit" width={390} height={760}><ScanHit /></DCArtboard>
      <DCArtboard id="scan-miss" label="database miss — not an error" width={390} height={760}><ScanMiss /></DCArtboard>
    </DCSection>
  );
}

function SectionImport() {
  return (
    <DCSection id="import" title="4 · Tracker — Import" subtitle="paste rows from Shelf Scanner">
      <DCArtboard id="import-preview" label="pasted preview" width={390} height={760}><ImportPreview /></DCArtboard>
    </DCSection>
  );
}

function SectionList() {
  return (
    <DCSection id="list" title="5 · Tracker — List" subtitle="search active · expired · ≤90d · retired · duplicate sheet">
      <DCArtboard id="list-states" label="search + all row states" width={390} height={760}><ListStates /></DCArtboard>
      <DCArtboard id="list-dupe" label="duplicate warning sheet" width={390} height={760}><ListDupeSheet /></DCArtboard>
    </DCSection>
  );
}

Object.assign(window, { SectionAdd, SectionScan, SectionImport, SectionList });
