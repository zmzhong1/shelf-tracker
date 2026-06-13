// wf-parts.jsx — shared wireframe primitives. Exports to window.

function Phone({ h = 720, children, kbd = false, tab = null }) {
  return (
    <div className="wf" style={{ width: 390, height: h, display: "flex", flexDirection: "column", background: "#fff" }}>
      <div className="wf-statusbar"><span>9:41</span><span>▢ ▢ ▢</span></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "4px 16px 0", minHeight: 0, position: "relative" }}>
        {children}
      </div>
      {kbd ? <div className="wf-kbd" style={{ height: 210 }}>K E Y B O A R D</div> : null}
      {tab}
      <div className="wf-homebar"></div>
    </div>
  );
}

function SBox({ h = 60, label = "", className = "", style = {}, children }) {
  return (
    <div className={"sk wf-fill " + className} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wf-faint)", ...style }}>
      {children || label}
    </div>
  );
}

function Hatch({ h = 120, label = "photo", style = {} }) {
  return (
    <div className="sk wf-hatch" style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wf-faint)", ...style }}>
      {label}
    </div>
  );
}

function Smear({ w = 44, h = 44, pink = false, style = {} }) {
  return <div className={"wf-smear" + (pink ? " pink" : "")} style={{ width: w, height: h, flex: "0 0 auto", ...style }}></div>;
}

function Badge({ tone = "fresh", children }) {
  return <span className={"wf-badge " + tone}>{children}</span>;
}

function Note({ children, style = {} }) {
  return <div className="wf-note" style={style}>{children}</div>;
}

function Pill({ active = false, children }) {
  return <span className={"wf-pill" + (active ? " is-active" : "")}>{children}</span>;
}

function Btn({ primary = false, ghost = false, children, style = {} }) {
  return <div className={"wf-btn" + (primary ? " primary" : "") + (ghost ? " ghost" : "")} style={style}>{children}</div>;
}

function Input({ label, value, placeholder, focus = false, style = {} }) {
  return (
    <div style={style}>
      {label ? <div className="wf-label">{label}</div> : null}
      <div className={"wf-input" + (value ? " filled" : "") + (focus ? " focus" : "")}>
        {value || placeholder || " "}
        {focus ? <span style={{ marginLeft: 2, color: "var(--wf-accent)" }}>|</span> : null}
      </div>
    </div>
  );
}

function SearchBar({ value, active = false, style = {} }) {
  return (
    <div className={"wf-input" + (value ? " filled" : "") + (active ? " focus" : "")} style={{ borderRadius: 99, gap: 8, ...style }}>
      <span style={{ color: "var(--wf-faint)", flex: "0 0 auto" }}>⌕</span>
      <span style={{ color: value ? "var(--wf-ink)" : "var(--wf-faint)", flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "Search brand, shade, code…"}</span>
      {active ? <span style={{ color: "var(--wf-accent)" }}>|</span> : null}
    </div>
  );
}

/* ---- tab bars, three structural variants ---- */
function TabBar({ variant = "classic", active = "List" }) {
  const Item = ({ name, raised = false }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      minWidth: 56, minHeight: 44, justifyContent: "center",
      color: name === active ? "var(--wf-ink)" : "var(--wf-faint)",
      fontWeight: name === active ? 700 : 400,
    }}>
      <div className={name === active ? "sk wf-fill" : "sk sk-faint"}
        style={{
          width: raised ? 52 : 24, height: raised ? 52 : 24, borderRadius: "50%",
          marginTop: raised ? -28 : 0,
          background: raised ? "var(--wf-ink)" : undefined,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: raised ? "#fff" : undefined, fontSize: 18,
        }}>{raised ? "◉" : ""}</div>
      <span className="wf-small">{name}</span>
    </div>
  );

  if (variant === "fab") {
    return (
      <div style={{ padding: "0 28px 2px" }}>
        <div className="sk" style={{ display: "flex", justifyContent: "space-around", alignItems: "center", background: "#fff", padding: "6px 8px 4px", borderRadius: 99, border: "1.6px solid var(--wf-line)" }}>
          <Item name="List" /><Item name="Add" /><Item name="Scan" raised /><Item name="Import" /><Item name="Catalog" />
        </div>
      </div>
    );
  }
  if (variant === "dock") {
    return (
      <div style={{ padding: "0 70px 2px" }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", background: "#fff", padding: "8px 6px", borderRadius: 99, border: "1.6px solid var(--wf-line)" }}>
          {["List", "Add", "Scan", "Import"].map(n => (
            <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 48, minHeight: 44, justifyContent: "center" }}>
              <span style={{ fontSize: 17, color: n === active ? "var(--wf-ink)" : "var(--wf-faint)" }}>{n === active ? "◆" : "◇"}</span>
              {n === active ? <Smear w={20} h={7} pink /> : <div style={{ height: 7 }}></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // classic
  return (
    <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1.6px solid var(--wf-line)", padding: "6px 6px 2px", background: "#fff" }}>
      <Item name="Add" /><Item name="Scan" /><Item name="Import" /><Item name="List" />
    </div>
  );
}

/* ---- default list row (direction B structure) ---- */
function Row({ brand = "FWEE", name = "Blurry Pudding Pot", zh = "", code = "PK03", badge = ["fresh", "OK · 14mo"], dim = false, actions = false, highlight = false }) {
  return (
    <div className={highlight ? "sk" : "sk sk-faint"} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
      background: "#fff", opacity: dim ? 0.45 : 1,
      borderColor: highlight ? "var(--wf-accent)" : undefined,
    }}>
      <Smear w={40} h={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "baseline", minWidth: 0 }}>
          <strong style={{ flex: "0 0 auto" }}>{brand}</strong>
          <span className="wf-dim wf-small" style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="wf-mono-big" style={{ fontSize: 13.5 }}>{code}</span>
          {zh ? <span className="wf-small wf-dim" style={{ overflow: "hidden", textOverflowName: "ellipsis", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zh}</span> : null}
        </div>
      </div>
      {actions ? (
        <div style={{ display: "flex", gap: 6 }}>
          <span className="wf-pill wf-small">Opened today</span>
          <span className="wf-pill wf-small">Retire</span>
        </div>
      ) : <Badge tone={badge[0]}>{badge[1]}</Badge>}
    </div>
  );
}

/* photocard 3:4 (direction B structure) */
function Card({ w = 150, brand = "FWEE", name = "Pudding Pot", code = "PK03", badge = ["fresh", "OK"], pink = false }) {
  const h = Math.round(w * 4 / 3);
  return (
    <div className="sk" style={{ width: w, height: h, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", padding: 8 }}>
      <Smear w={w - 16} h={Math.round(h * 0.52)} pink={pink} style={{ borderRadius: "52% 48% 45% 55% / 45% 52% 48% 55%" }} />
      <div style={{ padding: "7px 3px 0", display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <span className="wf-small wf-dim">{brand}</span>
        <span style={{ fontSize: 14, lineHeight: 1.1 }}>{name}</span>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="wf-mono-big" style={{ fontSize: 13 }}>{code}</span>
          <Badge tone={badge[0]}>{badge[1]}</Badge>
        </div>
      </div>
    </div>
  );
}

function Toast({ children, style = {} }) {
  return (
    <div className="sk" style={{ position: "absolute", left: 30, right: 30, bottom: 18, background: "var(--wf-ink)", color: "#fff", padding: "10px 16px", textAlign: "center", ...style }}>
      {children}
    </div>
  );
}

/* bottom sheet overlay */
function Sheet({ title, children, h = 250 }) {
  return (
    <div style={{ position: "absolute", inset: "-4px -16px 0", background: "rgba(56,52,47,.25)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 3 }}>
      <div className="sk" style={{ background: "#fff", borderRadius: "22px 22px 0 0", padding: "14px 18px 18px", minHeight: h, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ width: 44, height: 4, background: "var(--wf-fill2)", borderRadius: 9, margin: "0 auto 2px" }}></div>
        <div className="wf-h">{title}</div>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { Phone, SBox, Hatch, Smear, Badge, Note, Pill, Btn, Input, SearchBar, TabBar, Row, Card, Toast, Sheet });
