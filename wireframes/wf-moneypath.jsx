// wf-moneypath.jsx — Section 0: the 5-second in-store job, as a storyboard.

function MPFrame00() {
  return (
    <Phone h={720} tab={<TabBar variant="fab" active="List" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Shelf</div>
        <SearchBar />
        <div style={{ display: "flex", gap: 6 }}>
          <Pill active>All 201</Pill><Pill>Blush 87</Pill><Pill>Lip</Pill><Pill>Expiring</Pill>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Row brand="FWEE" name="Blurry Pudding Pot" code="PK03" zh="水霧交融澎潤腮紅膏" />
          <Row brand="Rom&nd" name="Better Than Cheek" code="BC01" badge={["soon", "≤90d"]} />
          <Row brand="Dasique" name="Blending Mood Cheek" code="#09" />
          <Row brand="BBIA" name="Downy Cheek" code="C088-18" />
        </div>
        <Note>search is the front door —<br />top of List, one tap from cold open</Note>
      </div>
    </Phone>
  );
}

function MPFrame01() {
  return (
    <Phone h={720} kbd>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <SearchBar value="pure cake" active />
        <div className="wf-small wf-dim">1 match · searching name + shade + code</div>
        <Row brand="FWEE" name="Blurry Pudding Pot" code="PK03 · Pure Cake" highlight badge={["fresh", "OWNED"]} />
        <Note style={{ marginTop: 4 }}>the answer must land *above* the keyboard.<br />match shown after ~2 letters, no submit</Note>
      </div>
    </Phone>
  );
}

function MPFrame02() {
  return (
    <Phone h={720}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div className="wf-dim">‹ back</div>
        <div className="sk" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, background: "#fff" }}>
          <Smear w={326} h={170} pink />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <strong style={{ fontSize: 18 }}>FWEE · Blurry Pudding Pot</strong>
            <Badge tone="fresh">OK · 14mo</Badge>
          </div>
          <div className="wf-mono-big" style={{ fontSize: 30 }}>PK03 — Pure Cake</div>
          <div className="wf-small wf-dim">水霧交融澎潤腮紅膏 · added May 2025 · cheek shelf A</div>
          <div className="sk sk-dash sk-faint" style={{ padding: "8px 10px", textAlign: "center", color: "var(--wf-fresh)", fontSize: 17 }}>
            ✓ You already own this shade
          </div>
        </div>
        <Note>the 5-second answer: smear + giant code,<br />readable at arm's length in a store aisle</Note>
      </div>
    </Phone>
  );
}

function MPFrame03() {
  return (
    <Phone h={720} tab={<TabBar variant="fab" active="Scan" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Scan</div>
        <Hatch h={330} label="camera viewfinder" />
        <div className="sk sk-dash" style={{ height: 70, margin: "-260px 40px 0", borderColor: "var(--wf-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wf-accent)", background: "transparent", position: "relative", zIndex: 2 }}>
          barcode guide
        </div>
        <div style={{ marginTop: 180, display: "flex", justifyContent: "center" }}>
          <div className="sk" style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--wf-ink)" }}></div>
        </div>
        <Note style={{ textAlign: "center" }}>shutter in thumb zone, 64px</Note>
      </div>
    </Phone>
  );
}

function MPFrame04() {
  return (
    <Phone h={720}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div className="wf-h" style={{ fontSize: 26 }}>Scan → found</div>
        <div className="sk" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", background: "#fff" }}>
          <Hatch h={54} label="📦" style={{ width: 54 }} />
          <div style={{ flex: 1 }}>
            <strong>Hince · True Dimension Radiance Balm</strong>
            <div className="wf-small wf-dim">database hit · 8 fields prefilled</div>
          </div>
        </div>
        <Input label="Brand" value="Hince" />
        <Input label="Shade code" value="LIGHT 02" />
        <Input label="Printed use-by (까지)" placeholder="add if visible" />
        <div style={{ marginTop: "auto", paddingBottom: 12 }}>
          <Btn primary>Save to shelf</Btn>
        </div>
        <Toast style={{ bottom: 70 }}>Saved ✓ — on your shelf</Toast>
        <Note style={{ position: "absolute", right: 10, top: 64 }}>whole path &lt; 30s,<br />one-handed</Note>
      </div>
    </Phone>
  );
}

function SectionMoneyPath() {
  return (
    <DCSection id="moneypath" title="0 · Money path — the 5-second job" subtitle="open → search “Pure Cake” → owned card → scan new → save. Everything else is judged against this.">
      <DCArtboard id="mp-00" label="00 · cold open" width={390} height={720}><MPFrame00 /></DCArtboard>
      <DCArtboard id="mp-01" label="01 · search, keyboard up" width={390} height={720}><MPFrame01 /></DCArtboard>
      <DCArtboard id="mp-02" label="02 · owned card" width={390} height={720}><MPFrame02 /></DCArtboard>
      <DCArtboard id="mp-03" label="03 · scan a new product" width={390} height={720}><MPFrame03 /></DCArtboard>
      <DCArtboard id="mp-04" label="04 · prefill → save" width={390} height={720}><MPFrame04 /></DCArtboard>
    </DCSection>
  );
}

window.SectionMoneyPath = SectionMoneyPath;
