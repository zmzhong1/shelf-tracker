// wf-signature.jsx — Section 1: three directions for the signature system
// (swatch card + list row + tab bar), differing in how far "futuristic" goes.

function DirLabel({ children }) {
  return <div className="wf-small wf-dim" style={{ margin: "2px 0 -4px 2px", letterSpacing: ".06em", textTransform: "uppercase" }}>{children}</div>;
}

/* ---------- Direction A · Glass Minimal (~20%) ---------- */
function DirA() {
  return (
    <div className="wf" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 18 }}>
      <Note>Toss-clean. Glass is a whisper: flat white cards, one dot of shade color. Safest, fastest to read.</Note>
      <DirLabel>swatch card — flat, dot swatch</DirLabel>
      <div style={{ display: "flex", gap: 12 }}>
        <div className="sk" style={{ width: 150, height: 200, background: "#fff", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Smear w={26} h={26} pink style={{ borderRadius: "50%" }} />
            <span className="wf-mono-big" style={{ fontSize: 14 }}>PK03</span>
          </div>
          <div style={{ marginTop: "auto" }}>
            <div className="wf-small wf-dim">FWEE</div>
            <div>Blurry Pudding Pot</div>
            <Badge tone="fresh">OK · 14mo</Badge>
          </div>
        </div>
        <Note style={{ alignSelf: "center" }}>← swatch is a tidy circle,<br />not a smear. card is square-ish,<br />text does the work</Note>
      </div>
      <DirLabel>list row — text-led</DirLabel>
      <div className="sk sk-faint" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff" }}>
        <Smear w={26} h={26} pink style={{ borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <strong>FWEE</strong> <span className="wf-dim">Blurry Pudding Pot</span>
          <div className="wf-small wf-dim">水霧交融澎潤腮紅膏</div>
        </div>
        <span className="wf-mono-big" style={{ fontSize: 13 }}>PK03</span>
        <Badge tone="soon">≤90d</Badge>
      </div>
      <DirLabel>tab bar — standard, labeled</DirLabel>
      <TabBar variant="classic" active="List" />
      <Note>risk: doesn't beat the pretty commercial trackers. wins on speed only.</Note>
    </div>
  );
}

/* ---------- Direction B · Seoul Glass (as briefed, ~50%) ---------- */
function DirB() {
  return (
    <div className="wf" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 18 }}>
      <Note>The brief, literally: photocard 3:4, organic smear, floating pill tab bar with Scan raised at center.</Note>
      <DirLabel>swatch card — photocard 3:4, smear hero</DirLabel>
      <div style={{ display: "flex", gap: 12 }}>
        <Card w={150} pink badge={["fresh", "OK"]} />
        <Note style={{ alignSelf: "center" }}>← smear = top half, organic blob<br />like a hand-swatch. glass footer<br />holds code + badge.<br />gloss sweep on tap ✦</Note>
      </div>
      <DirLabel>list row — smear thumb + code prominent</DirLabel>
      <Row brand="FWEE" name="Blurry Pudding Pot" zh="水霧交融澎潤腮紅膏" code="PK03" badge={["soon", "≤90d"]} />
      <DirLabel>tab bar — floating pill, Scan raised</DirLabel>
      <TabBar variant="fab" active="List" />
      <Note>scan at center = the in-store job is one thumb-reach away. 5 slots is the max — Catalog could live behind List instead.</Note>
    </div>
  );
}

/* ---------- Direction C · Dewy Futurist (~80%) ---------- */
function DirC() {
  return (
    <div className="wf" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 18 }}>
      <Note>Smear becomes the whole surface. Code is the hero, set huge. Iridescent edge on active things.</Note>
      <DirLabel>swatch card — full-bleed smear, code overlay</DirLabel>
      <div style={{ display: "flex", gap: 12 }}>
        <div className="sk" style={{ width: 150, height: 200, padding: 0, overflow: "hidden", position: "relative" }}>
          <Smear w={150} h={200} pink style={{ borderRadius: 0 }} />
          <div style={{ position: "absolute", inset: 0, padding: 10, display: "flex", flexDirection: "column" }}>
            <span className="wf-small" style={{ color: "#5c3a42" }}>FWEE</span>
            <span className="wf-mono-big" style={{ fontSize: 30, marginTop: "auto", color: "#3c2228" }}>PK03</span>
            <span className="wf-small" style={{ color: "#5c3a42" }}>Pure Cake · OK</span>
          </div>
          <div className="sk-dash" style={{ position: "absolute", inset: 3, border: "1.5px dashed var(--wf-accent)", borderRadius: 10, pointerEvents: "none" }}></div>
        </div>
        <Note style={{ alignSelf: "center" }}>← dashed edge = iridescent rim<br />(hero/active only).<br />text sits ON the shade —<br />contrast must be computed<br />per-swatch ⚠</Note>
      </div>
      <DirLabel>list row — code-first chip cluster</DirLabel>
      <div className="sk sk-faint" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff" }}>
        <span className="wf-mono-big" style={{ fontSize: 16 }}>PK03</span>
        <Smear w={34} h={20} pink style={{ borderRadius: 99 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="wf-small">FWEE · Pudding Pot</span>
          <div className="wf-small wf-dim" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>水霧交融澎潤腮紅膏</div>
        </div>
        <Badge tone="fresh">OK</Badge>
      </div>
      <DirLabel>tab bar — icon dock, smear underline</DirLabel>
      <TabBar variant="dock" active="List" />
      <Note>risk: 87 blushes = 87 loud cards; legibility of bilingual names on smears; icon-only nav needs learning. boldest shelf-appeal though.</Note>
    </div>
  );
}

function SectionSignature() {
  return (
    <DCSection id="signature" title="1 · Signature system — three directions" subtitle="swatch card + list row + tab bar. Pick one; everything else follows.">
      <DCArtboard id="dir-a" label="A · Glass Minimal · 20% future" width={430} height={760}><DirA /></DCArtboard>
      <DCArtboard id="dir-b" label="B · Seoul Glass · as briefed" width={430} height={760}><DirB /></DCArtboard>
      <DCArtboard id="dir-c" label="C · Dewy Futurist · 80% future" width={430} height={760}><DirC /></DCArtboard>
    </DCSection>
  );
}

window.SectionSignature = SectionSignature;
