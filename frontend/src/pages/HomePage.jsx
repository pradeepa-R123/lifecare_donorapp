import { useState } from "react";
import { Link } from "react-router-dom";

const P = {
  red: "#E54934",
  redD: "#C23A28",
  dark: "#1A0A08",
  darkM: "#2D1410",
  darkL: "#3D1E19",
  muted: "#6B7280",
  warm: "#FDF6F0",
  warmM: "#d9b5a5",
};

const STATS = [
  { value: "12,400+", label: "Units Donated" },
  { value: "4,100+",  label: "Lives Saved"   },
  { value: "920+",    label: "Active Donors"  },
  { value: "24/7",    label: "Always Ready"   },
];

const TRUST_POINTS = [
  { icon: "🤝", title: "Trusted by 900+ Donors",  desc: "A growing community of heroes dedicated to saving lives every day." },
  { icon: "🏥", title: "Official Partner",          desc: "Directly connected with LifeCare BloodBank for real-time local needs." },
  { icon: "🔒", title: "Secure & Private",          desc: "Your data is encrypted and only shared when you choose to donate." },
];

const ELIGIBILITY = [
  { icon: "🎂", title: "Age 18–65",         desc: "Donors must be within the eligible age range." },
  { icon: "⚖️", title: "Weight 50kg+",      desc: "Minimum weight requirement for safe donation." },
  { icon: "💊", title: "No Major Illness",  desc: "No active diseases, HIV, or blood disorders." },
  { icon: "🩺", title: "Normal BP & Sugar", desc: "BP and sugar levels must be normal." },
  { icon: "🌡️", title: "No Recent Fever",  desc: "No fever or malaria in the past 7 days." },
  { icon: "🔪", title: "No Recent Surgery", desc: "No surgical procedures in the last 6 months." },
];

const NAVS = ["Home", "About", "Eligibility", "Contact"];

/*
  Visible chrome inside THIS component:
    ticker  : 28px
    navbar  : 52px
    footer  : 36px
    ─────────────
    subtotal: 116px

  The parent app renders an extra navbar (~60px) above this component.
  So total reserved = 116 + 60 = 176px.
  Content height = calc(100vh - 176px)
*/
const CONTENT_H = "calc(100vh - 176px)";

/* ── Single Navbar ── */
function Navbar({ active, setActive }) {
  return (
    <nav style={{
      background: P.dark,
      height: 52,
      display: "flex", alignItems: "center",
      padding: "0 28px",
      justifyContent: "space-between",
      flexShrink: 0,
      borderBottom: "1px solid rgba(229,73,52,.2)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg,${P.red},${P.redD})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>🩸</div>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: 14, lineHeight: 1 }}>LifePulse</div>
          <div style={{ color: "rgba(255,255,255,.38)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>Donor Network</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3 }}>
        {NAVS.map(n => (
          <button key={n} onClick={() => setActive(n)} style={{
            background: active === n ? P.warm : "transparent",
            color: active === n ? P.red : "rgba(200,140,130,.65)",
            border: active === n ? `1.5px solid ${P.warmM}` : "1.5px solid transparent",
            borderRadius: 7, padding: "5px 15px",
            fontSize: 13, fontWeight: active === n ? 700 : 500,
            cursor: "pointer", transition: "all .18s", fontFamily: "inherit",
          }}>{n}</button>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: "flex", gap: 8 }}>
        <Link to="/login" style={{
          color: "rgba(255,255,255,.7)", textDecoration: "none",
          padding: "6px 16px", borderRadius: 7,
          border: "1px solid rgba(255,255,255,.18)",
          fontSize: 13, fontWeight: 500,
        }}>Login</Link>
        <Link to="/register" style={{
          background: `linear-gradient(135deg,${P.red},${P.redD})`,
          color: "white", textDecoration: "none",
          padding: "6px 16px", borderRadius: 7,
          fontSize: 13, fontWeight: 700,
          boxShadow: "0 3px 10px rgba(229,73,52,.4)",
        }}>Become a Donor</Link>
      </div>
    </nav>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <div style={{
      background: P.dark,
      borderTop: "1px solid rgba(255,255,255,.07)",
      height: 36,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px", flexShrink: 0,
    }}>
      <span style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>
        🩸 <strong style={{ color: "rgba(255,255,255,.5)" }}>LifePulse</strong> — Powered by <span style={{ color: P.red }}>LifeCare BloodBank</span>
      </span>
      <span style={{ color: "rgba(255,255,255,.22)", fontSize: 11 }}>© 2026 All rights reserved.</span>
      <span style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>🚨 Emergency: 1800-HEALTHCARE</span>
    </div>
  );
}

/* ══════════ HOME ══════════ */
function HomeSection() {
  return (
    /* Use flex column so hero stretches and stats is pinned at bottom */
    <div style={{ height: CONTENT_H, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Hero — flex:1 fills all space above stats */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg,${P.dark} 0%,${P.darkM} 55%,${P.darkL} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {[260, 170, 100].map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            right: (-20 + i * 15) + "px", top: (-40 + i * 22) + "px",
            width: s, height: s, borderRadius: "50%",
            background: "rgba(229,73,52,.05)", pointerEvents: "none",
          }} />
        ))}

        <div style={{ textAlign: "center", maxWidth: 540, padding: "0 24px", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(229,73,52,.15)", border: "1px solid rgba(229,73,52,.3)",
            borderRadius: 40, padding: "5px 16px", marginBottom: 14,
            color: "#FFAA96", fontSize: 12, fontWeight: 600,
          }}>
            <span>🩸</span> Connected with LifeCare BloodBank
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 38, color: "white", lineHeight: 1.1,
            margin: "0 0 11px",
          }}>
            Be the Reason<br />
            <span style={{ color: P.red }}>Someone Lives</span>
          </h1>

          <p style={{
            fontSize: 13.5, color: "rgba(255,255,255,.58)",
            lineHeight: 1.6, margin: "0 auto 20px", maxWidth: 400,
          }}>
            Join the LifePulse Donor Network. Receive real-time donation requests
            and help save lives in your community.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link to="/register" style={{
              background: `linear-gradient(135deg,${P.red},${P.redD})`,
              color: "white", textDecoration: "none",
              padding: "9px 24px", borderRadius: 9,
              fontWeight: 700, fontSize: 13.5,
              boxShadow: "0 5px 16px rgba(229,73,52,.4)",
            }}>Register as Donor</Link>
            <Link to="/login" style={{
              background: "rgba(255,255,255,.09)",
              border: "1.5px solid rgba(255,255,255,.18)",
              color: "white", textDecoration: "none",
              padding: "9px 24px", borderRadius: 9,
              fontWeight: 600, fontSize: 13.5,
            }}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* Stats bar — fixed height, always fully visible */}
      <div style={{ background: P.red, padding: "10px 24px", flexShrink: 0 }}>
        <div style={{
          maxWidth: 820, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,.2)" : "none",
              padding: "2px 12px",
            }}>
              <div style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22, color: "white", fontWeight: 900,
                lineHeight: 1.2,
              }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,.82)", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ ABOUT ══════════ */
function AboutSection() {
  return (
    <div style={{
      height: CONTENT_H, overflow: "hidden", background: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 40px",
    }}>
      <div style={{ maxWidth: 1020, width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>WHO WE ARE</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: P.dark, margin: "0 0 5px" }}>A Network You Can Trust</h2>
          <p style={{ color: P.muted, fontSize: 13, margin: 0 }}>Simplifying blood donation through technology and community.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
          {TRUST_POINTS.map((pt, i) => (
            <div key={i} style={{
              background: P.warm, border: `1.5px solid ${P.warmM}`,
              borderRadius: 13, padding: "18px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{pt.icon}</div>
              <h3 style={{ fontSize: 14, color: P.dark, fontWeight: 700, margin: "0 0 6px" }}>{pt.title}</h3>
              <p style={{ color: P.muted, lineHeight: 1.55, fontSize: 12.5, margin: 0 }}>{pt.desc}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: `linear-gradient(135deg,${P.dark},${P.darkM})`,
          borderRadius: 13, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
        }}>
          <div>
            <div style={{ color: P.red, fontWeight: 700, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Our Mission</div>
            <div style={{ color: "white", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>
              To connect every donor with those in critical need — faster, safer, and with zero friction.
            </div>
          </div>
          <Link to="/register" style={{
            background: `linear-gradient(135deg,${P.red},${P.redD})`,
            color: "white", textDecoration: "none",
            padding: "8px 18px", borderRadius: 8,
            fontWeight: 700, fontSize: 13, flexShrink: 0,
            boxShadow: "0 4px 12px rgba(229,73,52,.38)",
          }}>Join Now →</Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════ ELIGIBILITY ══════════ */
function EligibilitySection() {
  return (
    <div style={{
      height: CONTENT_H, overflow: "hidden", background: P.warm,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 40px",
    }}>
      <div style={{ maxWidth: 920, width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>QUICK CHECK</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: P.dark, margin: "0 0 4px" }}>Who Can Donate?</h2>
          <p style={{ color: P.muted, fontSize: 13, margin: 0 }}>Make sure you meet these basic requirements before registering.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
          {ELIGIBILITY.map((e, i) => (
            <div key={i} style={{
              display: "flex", gap: 11, alignItems: "center",
              background: "white", borderRadius: 10, padding: "11px 13px",
              border: `1.5px solid ${P.warmM}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(229,73,52,.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>{e.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: P.dark, marginBottom: 2 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: P.muted, lineHeight: 1.4 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: P.red, borderRadius: 10,
          padding: "13px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,.78)", fontSize: 11.5 }}>Think you're eligible?</div>
            <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Ready to Make a Difference? It only takes 3 minutes.</div>
          </div>
          <Link to="/register" style={{
            background: "white", color: P.red,
            textDecoration: "none", padding: "8px 18px",
            borderRadius: 8, fontWeight: 800, fontSize: 13, flexShrink: 0,
          }}>Register Now →</Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════ CONTACT ══════════ */
function ContactSection() {
  return (
    <div style={{
      height: CONTENT_H, overflow: "hidden", background: "white",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 40px",
    }}>
      <div style={{ maxWidth: 760, width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>REACH US</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: P.dark, margin: 0 }}>Contact Us</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "📞", label: "Emergency Hotline", value: "1800-HEALTHCARE" },
            { icon: "🩸", label: "Blood Bank Direct",  value: "+91-44-2345-6700" },
            { icon: "📧", label: "Email",              value: "support@lifepulse.in" },
            { icon: "📍", label: "Address",            value: "No. 12, Anna Salai, Chennai – 600002" },
            { icon: "🕐", label: "Working Hours",      value: "24/7 Emergency · OPD Mon–Sat 9AM–5PM" },
            { icon: "🌐", label: "Website",            value: "www.lifepulse.in" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              display: "flex", gap: 11, alignItems: "center",
              background: P.warm, border: `1.5px solid ${P.warmM}`,
              borderRadius: 10, padding: "11px 13px",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: "rgba(229,73,52,.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>{icon}</div>
              <div>
                <div style={{ color: P.muted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: .6 }}>{label}</div>
                <div style={{ color: P.dark, fontSize: 13, fontWeight: 600 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ ROOT ══════════ */
export default function HomePage() {
  const [active, setActive] = useState("Home");

  const renderSection = () => {
    switch (active) {
      case "Home":        return <HomeSection />;
      case "About":       return <AboutSection />;
      case "Eligibility": return <EligibilitySection />;
      case "Contact":     return <ContactSection />;
      default:            return <HomeSection />;
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans',sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        a { font-family: inherit; }
        @keyframes marquee { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
      `}</style>

      {/* Ticker — 28px */}
      <div style={{
        background: P.red, color: "white",
        height: 28, overflow: "hidden", flexShrink: 0,
        display: "flex", alignItems: "center",
      }}>
        <span style={{
          background: "rgba(255,255,255,.15)", padding: "0 14px",
          fontSize: 10.5, fontWeight: 700, flexShrink: 0,
          letterSpacing: .8, height: "100%",
          display: "flex", alignItems: "center",
        }}>🚨 EMERGENCY</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{
            display: "inline-block", fontSize: 11, paddingLeft: 28,
            whiteSpace: "nowrap", animation: "marquee 22s linear infinite",
          }}>
            🩸 Blood Needed: O+ve · B-ve &nbsp;|&nbsp; 📞 Emergency: 1800-HEALTHCARE &nbsp;|&nbsp; 🚑 Ambulance: +91-44-2345-6789 &nbsp;|&nbsp; 🏥 LifeCare BloodBank: 24/7 Active
          </div>
        </div>
      </div>

      {/* Navbar — 52px */}
      <Navbar active={active} setActive={setActive} />

      {/* Content */}
      <div style={{ overflow: "hidden" }}>
        {renderSection()}
      </div>

      {/* Footer — 36px */}
      <Footer />
    </div>
  );
}