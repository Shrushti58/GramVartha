import { useEffect, useState } from "react";

// ─── IMPORTANT ───────────────────────────────────────────────
// Replace this path with your actual logo import or public URL.
// e.g. import logoSrc from "./assets/gramvarthalogo.png";
// or   const logoSrc = "/gramvarthalogo.png";
const logoSrc = "../gramvarthalogo.png";
// ─────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════════════════════
   VARIANT 1 — Full-page overlay
   <GramvarthaLoader show={isLoading} />
   ══════════════════════════════════════════════════════════════ */
export function GramvarthaLoader({ show = true }) {
  const phrases = [
    "Connecting your Grampanchayat",
    "Fetching village records…",
    "Preparing governance data…",
    "Syncing notice board…",
    "Almost ready…",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    if (show) setTimeout(() => setVisible(true), 30);
    else setVisible(false);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 2400);
    return () => clearInterval(id);
  }, [show]);

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        role="status"
        aria-live="polite"
        aria-label={phrases[phraseIdx]}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(155deg, #fdf8f2 0%, #f5e8d0 45%, #fdf4ec 100%)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Ambient blobs */}
        <div style={{
          position: "absolute", top: "-10%", right: "-8%",
          width: 340, height: 340, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(95,148,85,0.1), transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-8%", left: "-8%",
          width: 300, height: 300, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(122,62,37,0.1), transparent 70%)",
        }} />

        {/* Glass card */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 24,
          padding: "44px 56px", borderRadius: 28,
          background: "rgba(255,255,255,0.70)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          border: "1px solid rgba(201,168,122,0.25)",
          boxShadow: "0 12px 48px rgba(90,40,18,0.13), 0 1px 0 rgba(255,255,255,0.85) inset",
          animation: "gv-fadeup 0.55s cubic-bezier(0.22,1,0.36,1) both",
        }}>

          {/* Logo with rings + pulse */}
          <div style={{ position: "relative", width: 108, height: 108 }}>
            {/* Pulsing halo rings */}
            <span style={{
              position: "absolute", top: -20, left: -20, right: -20, bottom: -20,
              borderRadius: "50%",
              border: "1.5px solid rgba(201,168,122,0.4)",
              animation: "gv-halo 2.2s ease-out infinite",
            }} />
            <span style={{
              position: "absolute", top: -11, left: -11, right: -11, bottom: -11,
              borderRadius: "50%",
              border: "1.5px solid rgba(159,130,90,0.3)",
              animation: "gv-halo 2.2s ease-out 0.55s infinite",
            }} />

            {/* Spinning arc ring */}
            <svg
              width={108} height={108} viewBox="0 0 108 108" fill="none"
              style={{
                position: "absolute", top: 0, left: 0,
                animation: "gv-spin 2.6s linear infinite",
              }}
              aria-hidden="true"
            >
              <circle
                cx="54" cy="54" r="51"
                stroke="#c9a87a" strokeWidth="3"
                strokeDasharray="76 244"
                strokeLinecap="round" opacity="0.75"
              />
            </svg>

            {/* Actual logo image — gentle float */}
            <img
              src={logoSrc}
              alt="Gramvartha logo"
              width={108} height={108}
              style={{
                borderRadius: "50%",
                display: "block",
                animation: "gv-float 3.2s ease-in-out infinite",
                filter: "drop-shadow(0 6px 18px rgba(90,40,18,0.22))",
              }}
            />
          </div>

          {/* Brand name */}
          <div style={{ textAlign: "center", lineHeight: 1 }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700, fontSize: 22, letterSpacing: "0.13em",
              background: "linear-gradient(135deg, #5f3818 0%, #a07845 55%, #7a3e25 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 5,
            }}>
              GRAMVARTHA
            </div>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11, letterSpacing: "0.22em",
              color: "#9a6840", textTransform: "uppercase",
            }}>
              ग्राम वार्ता
            </div>
          </div>

          {/* Rotating phrase */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10, minHeight: 44,
          }}>
            <p
              key={phraseIdx}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13, fontWeight: 500,
                color: "#7a4828", textAlign: "center", margin: 0,
                animation: "gv-fadeup 0.38s ease both",
              }}
            >
              {phrases[phraseIdx]}
            </p>

            {/* Bouncing dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: "inline-block", width: 6, height: 6,
                  borderRadius: "50%", background: "#c9a87a",
                  animation: "gv-dot 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>

          {/* Shimmer progress bar */}
          <div style={{
            width: 180, height: 3, borderRadius: 99,
            background: "#edd8b8", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, #7a3e25, #c9a87a, #5f9455, #c9a87a, #7a3e25)",
              backgroundSize: "300% 100%",
              animation: "gv-shimmer 2s linear infinite",
            }} />
          </div>
        </div>

        <p style={{
          position: "absolute", bottom: 28,
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11, letterSpacing: "0.06em",
          color: "#9a6840", opacity: 0.65,
        }}>
          Digital Governance for Rural India
        </p>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   VARIANT 2 — Inline loader
   <GramvarthaLoaderInline size="sm|md|lg" label="…" color="brand|white|muted" />
   ══════════════════════════════════════════════════════════════ */
export function GramvarthaLoaderInline({ size = "md", label = "", color = "brand" }) {
  const px = { sm: 20, md: 28, lg: 40 }[size] ?? 28;
  const textColor = { brand: "#7a4828", white: "#ffffff", muted: "#9a6840" }[color] ?? "#7a4828";
  const ringColor = color === "white" ? "rgba(255,255,255,0.8)" : "#c9a87a";

  return (
    <>
      <style>{CSS}</style>
      <span
        role="status" aria-label={label || "Loading"}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        {/* Logo + spinner ring */}
        <span style={{ position: "relative", width: px, height: px, display: "inline-block", flexShrink: 0 }}>
          {/* Spinning arc */}
          <svg
            width={px} height={px} viewBox="0 0 40 40" fill="none"
            style={{
              position: "absolute", top: 0, left: 0,
              animation: "gv-spin 1.6s linear infinite",
            }}
            aria-hidden="true"
          >
            <circle
              cx="20" cy="20" r="18"
              stroke={ringColor} strokeWidth="3"
              strokeDasharray="28 84"
              strokeLinecap="round" opacity="0.85"
            />
          </svg>

          {/* Logo image */}
          <img
            src={logoSrc}
            alt=""
            width={px} height={px}
            style={{ borderRadius: "50%", display: "block" }}
          />
        </span>

        {label && (
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: px < 26 ? 12 : 13, fontWeight: 500,
            color: textColor,
          }}>
            {label}
          </span>
        )}
      </span>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   DEMO PAGE — drop this in your router as a test route
   ══════════════════════════════════════════════════════════════ */
export default function GramvarthaLoaderDemo() {
  const [overlayOn, setOverlayOn] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const triggerOverlay = () => { setOverlayOn(true); setTimeout(() => setOverlayOn(false), 4500); };
  const triggerBtn     = () => { setBtnLoading(true); setTimeout(() => setBtnLoading(false), 3000); };

  return (
    <>
      <style>{CSS}</style>
      <GramvarthaLoader show={overlayOn} />

      <div style={{
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(155deg, #fdf8f2 0%, #f5e8d0 50%, #fdf4ec 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 32, padding: 40,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, margin: "0 0 6px",
            background: "linear-gradient(135deg, #5f3818, #a07845)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Gramvartha Loader
          </h1>
          <p style={{ color: "#9a6840", fontSize: 13, margin: 0 }}>
            Branded loading components — two variants
          </p>
        </div>

        {/* ─ Variant 1 card ─ */}
        <div style={CARD}>
          <span style={BADGE}>Variant 1 — Full-page overlay</span>
          <p style={{ color: "#7a4828", fontSize: 13, textAlign: "center", margin: 0 }}>
            For initial app loads & page transitions. Frosted-glass card with your real logo,
            rotating phrases and a shimmer progress bar.
          </p>

          {/* Scaled-down live preview */}
          <div style={{
            width: "100%", borderRadius: 16, padding: "32px 0",
            background: "rgba(245,235,215,0.55)",
            border: "1px solid rgba(201,168,122,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            <div style={{ transform: "scale(0.68)", transformOrigin: "center", pointerEvents: "none" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                padding: "36px 48px", borderRadius: 24,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(201,168,122,0.25)",
                boxShadow: "0 8px 32px rgba(90,40,18,0.1)",
              }}>
                <div style={{ position: "relative", width: 108, height: 108 }}>
                  <svg width={108} height={108} viewBox="0 0 108 108" fill="none"
                    style={{ position: "absolute", top: 0, left: 0, animation: "gv-spin 2.6s linear infinite" }} aria-hidden="true">
                    <circle cx="54" cy="54" r="51" stroke="#c9a87a" strokeWidth="3" strokeDasharray="76 244" strokeLinecap="round" opacity="0.75" />
                  </svg>
                  <img src={logoSrc} alt="" width={108} height={108}
                    style={{ borderRadius: "50%", display: "block", animation: "gv-float 3.2s ease-in-out infinite", filter: "drop-shadow(0 6px 18px rgba(90,40,18,0.22))" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: "0.12em",
                    background: "linear-gradient(135deg,#5f3818,#a07845)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    GRAMVARTHA
                  </div>
                  <div style={{ fontSize: 10, color: "#9a6840", letterSpacing: "0.2em" }}>ग्राम वार्ता</div>
                </div>
                <p style={{ fontSize: 13, color: "#7a4828", margin: 0, fontWeight: 500 }}>Connecting your Grampanchayat</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0,1,2].map(i => <span key={i} style={{ display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#c9a87a",animation:"gv-dot 1.4s ease-in-out infinite",animationDelay:`${i*0.18}s` }} />)}
                </div>
                <div style={{ width: 160, height: 3, borderRadius: 99, background: "#edd8b8", overflow: "hidden" }}>
                  <div style={{ height:"100%",borderRadius:99,background:"linear-gradient(90deg,#7a3e25,#c9a87a,#5f9455,#c9a87a,#7a3e25)",backgroundSize:"300% 100%",animation:"gv-shimmer 2s linear infinite" }} />
                </div>
              </div>
            </div>
          </div>

          <button onClick={triggerOverlay} style={BTN}>Preview Full Overlay (4.5 s)</button>
        </div>

        {/* ─ Variant 2 card ─ */}
        <div style={CARD}>
          <span style={BADGE}>Variant 2 — Inline loader</span>
          <p style={{ color: "#7a4828", fontSize: 13, textAlign: "center", margin: 0 }}>
            For button clicks, notice board fetches & card-level states.
            Three sizes, label support, light & dark compatible.
          </p>

          {/* Sizes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
            {[{ s: "sm", l: "" }, { s: "md", l: "Loading notices" }, { s: "lg", l: "" }].map(({ s, l }) => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <GramvarthaLoaderInline size={s} label={l} />
                <span style={{ fontSize: 11, color: "#9a6840" }}>{s}{l ? " + label" : ""}</span>
              </div>
            ))}
          </div>

          {/* Button demo */}
          <button onClick={triggerBtn} disabled={btnLoading} style={{
            ...BTN,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 10, minWidth: 210,
            opacity: btnLoading ? 0.85 : 1,
            cursor: btnLoading ? "default" : "pointer",
          }}>
            {btnLoading
              ? <GramvarthaLoaderInline size="sm" color="white" label="Fetching data…" />
              : "Fetch Notice Board"}
          </button>

          {/* Dark bg demo */}
          <div style={{
            width: "100%", borderRadius: 14, padding: "18px 0",
            background: "linear-gradient(135deg, #3d2010, #1a0a05)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
          }}>
            <GramvarthaLoaderInline size="md" color="white" label="Syncing records" />
            <GramvarthaLoaderInline size="sm" color="white" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Shared styles ─────────────────────────────────────────── */
const CARD = {
  width: "100%", maxWidth: 480,
  display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
  padding: "32px 28px", borderRadius: 22,
  background: "rgba(255,255,255,0.70)",
  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(201,168,122,0.22)",
  boxShadow: "0 6px 28px rgba(90,40,18,0.09)",
};
const BADGE = {
  fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em",
  padding: "4px 14px", borderRadius: 99, background: "#f5e8d0", color: "#7a3e25",
};
const BTN = {
  padding: "10px 28px", borderRadius: 99,
  background: "linear-gradient(135deg, #5f3818, #a07845)",
  color: "#fff", fontFamily: "'Poppins', sans-serif",
  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
  boxShadow: "0 4px 18px rgba(90,40,18,0.28)",
};

/* ─── Keyframes ─────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  @keyframes gv-spin    { to { transform: rotate(360deg); } }
  @keyframes gv-fadeup  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes gv-halo    { 0%{transform:scale(0.85);opacity:.55} 75%{transform:scale(1.14);opacity:0} 100%{opacity:0} }
  @keyframes gv-dot     { 0%,80%,100%{transform:scale(0.55);opacity:.3} 40%{transform:scale(1.2);opacity:1} }
  @keyframes gv-shimmer { 0%{background-position:100% center} 100%{background-position:-100% center} }
  @keyframes gv-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
`;