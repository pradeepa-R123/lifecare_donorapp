import { useState } from "react";
import { Link } from "react-router-dom";

/* ── Design tokens ── */
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
  { value: "12,400+", label: "Units Donated",  icon: "🩸" },
  { value: "4,100+",  label: "Lives Saved",    icon: "❤️" },
  { value: "920+",    label: "Active Donors",  icon: "🧑‍🤝‍🧑" },
  { value: "24/7",    label: "Always Ready",   icon: "🚨" },
];

const TRUST_POINTS = [
  { icon: "🤝", title: "Trusted by 900+ Donors",  desc: "A growing community of heroes dedicated to saving lives every day." },
  { icon: "🏥", title: "Official Partner",          desc: "Directly connected with LifeCare BloodBank for real-time local needs." },
  { icon: "🔒", title: "Secure & Private",          desc: "Your data is encrypted and only shared when you choose to donate." },
];

const ELIGIBILITY = [
  { icon: "🎂", title: "Age 18–65",          desc: "Donors must be within the eligible age range." },
  { icon: "⚖️", title: "Weight 50kg+",       desc: "Minimum weight requirement for safe donation." },
  { icon: "💊", title: "No Major Illness",   desc: "No active diseases, HIV, or blood disorders." },
  { icon: "🩺", title: "Normal BP & Sugar",  desc: "Blood pressure and sugar levels must be normal." },
  { icon: "🌡️", title: "No Recent Fever",   desc: "No fever or malaria in the past 7 days." },
  { icon: "🔪", title: "No Recent Surgery",  desc: "No surgical procedures in the last 6 months." },
];

const NAVS = ["Home", "About", "Eligibility", "Contact"];

/* ── Shared Header ── */
function Header({ active, setActive }) {
  return (
    <nav style={{
      background: P.dark,
      borderBottom: "1px solid rgba(229,73,52,.25)",
      padding: "11px 0",
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
       

        {/* Nav tabs — ✅ FIXED active background color */}
        <div style={{ display: "flex", gap: 4 }}>
          {NAVS.map(n => (
            <button key={n} onClick={() => setActive(n)} style={{
              background: active === n ? "#FDF6F0" : "transparent",
              color: active === n ? P.red : "rgba(152, 112, 112, 0.65)",
              border: active === n ? `1.5px solid ${P.warmM}` : "1.5px solid transparent",
              borderRadius: 8,
              padding: "7px 18px", fontSize: 13.5,
              fontWeight: active === n ? 700 : 500,
              cursor: "pointer", transition: "all .18s",
              fontFamily: "inherit",
            }}>{n}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ── Shared Footer ── */
function Footer() {
  return (
    <div style={{
      background: P.dark,
      borderTop: "1px solid rgba(255,255,255,.07)",
      padding: "12px 28px", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>
        🩸 <strong style={{ color: "rgba(255,255,255,.55)" }}>LifePulse Donor Network</strong> — Powered by <span style={{ color: P.red }}>LifeCare BloodBank</span>
      </span>
      <span style={{ color: "rgba(255,255,255,.22)", fontSize: 12 }}>© 2026 All rights reserved.</span>
      <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>🚨 Emergency: 1800-HEALTHCARE</span>
    </div>
  );
}

/* ── HOME section ── */
function HomeSection() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Hero */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg,${P.dark} 0%,${P.darkM} 50%,${P.darkL} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {[300, 200, 130].map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            right: (-40 + i * 20) + "px", top: (-60 + i * 30) + "px",
            width: s, height: s, borderRadius: "50%",
            background: "rgba(229,73,52,.06)", pointerEvents: "none",
          }}/>
        ))}

        <div style={{ textAlign: "center", maxWidth: 680, padding: "0 24px", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(229,73,52,.15)", border: "1px solid rgba(229,73,52,.3)",
            borderRadius: 40, padding: "7px 18px", marginBottom: 26,
            color: "#FFAA96", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ fontSize: 16 }}>🩸</span> Connected with LifeCare BloodBank
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(36px,5.5vw,62px)",
            color: "white", lineHeight: 1.12, marginBottom: 20, marginTop: 0,
          }}>
            Be the Reason<br />
            <span style={{ color: P.red }}>Someone Lives</span>
          </h1>

          <p style={{
            fontSize: 16, color: "rgba(255,255,255,.6)",
            lineHeight: 1.75, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px",
          }}>
            Join the LifePulse Donor Network. Receive real-time donation requests
            and help save lives in your community.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{
              background: `linear-gradient(135deg,${P.red},${P.redD})`,
              color: "white", textDecoration: "none",
              padding: "13px 32px", borderRadius: 12,
              fontWeight: 700, fontSize: 15,
              boxShadow: "0 8px 24px rgba(229,73,52,.45)",
            }}>Register as Donor</Link>
            <Link to="/login" style={{
              background: "rgba(255,255,255,.1)",
              border: "1.5px solid rgba(255,255,255,.2)",
              color: "white", textDecoration: "none",
              padding: "13px 32px", borderRadius: 12,
              fontWeight: 600, fontSize: 15,
            }}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: P.red, padding: "20px 24px", flexShrink: 0 }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: "white", fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 12.5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer/>
    </div>
  );
}

/* ── ABOUT section ── */
function AboutSection() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", overflow: "hidden" }}>
      <div style={{
        flex: 1, maxWidth: 1100, margin: "0 auto",
        padding: "40px 36px 24px", width: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32, flexShrink: 0 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>WHO WE ARE</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: P.dark, margin: 0 }}>A Network You Can Trust</h2>
          <p style={{ color: P.muted, fontSize: 15, marginTop: 10 }}>Simplifying blood donation through technology and community.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, flex: 1, alignContent: "start" }}>
          {TRUST_POINTS.map((pt, i) => (
            <div key={i} style={{
              background: P.warm, border: `1.5px solid ${P.warmM}`,
              borderRadius: 16, padding: "28px 22px", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{pt.icon}</div>
              <h3 style={{ fontSize: 17, color: P.dark, marginBottom: 10, fontWeight: 700, margin: "0 0 10px" }}>{pt.title}</h3>
              <p style={{ color: P.muted, lineHeight: 1.65, fontSize: 13.5, margin: 0 }}>{pt.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission strip */}
        <div style={{
          marginTop: 24, background: `linear-gradient(135deg,${P.dark},${P.darkM})`,
          borderRadius: 16, padding: "24px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexShrink: 0,
        }}>
          <div>
            <div style={{ color: P.red, fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Our Mission</div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>
              To connect every donor with those in critical need — faster, safer, and with zero friction.
            </div>
          </div>
          <Link to="/register" style={{
            background: `linear-gradient(135deg,${P.red},${P.redD})`,
            color: "white", textDecoration: "none",
            padding: "12px 26px", borderRadius: 10,
            fontWeight: 700, fontSize: 14, flexShrink: 0,
            boxShadow: "0 6px 20px rgba(229,73,52,.4)",
          }}>Join Now →</Link>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

/* ── ELIGIBILITY section ── */
function EligibilitySection() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: P.warm, overflow: "hidden" }}>
      <div style={{
        flex: 1, maxWidth: 1000, margin: "0 auto",
        padding: "40px 36px 24px", width: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28, flexShrink: 0 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>QUICK CHECK</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: P.dark, margin: 0 }}>Who Can Donate?</h2>
          <p style={{ color: P.muted, fontSize: 14.5, marginTop: 8 }}>Make sure you meet these basic requirements before registering.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, flex: 1, alignContent: "start" }}>
          {ELIGIBILITY.map((e, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              background: "white", borderRadius: 14, padding: "16px 18px",
              border: `1.5px solid ${P.warmM}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(229,73,52,.08)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>{e.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: P.dark, marginBottom: 3 }}>{e.title}</div>
                <div style={{ fontSize: 12.5, color: P.muted, lineHeight: 1.5 }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div style={{
          marginTop: 20, background: P.red, borderRadius: 14,
          padding: "20px 28px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 13 }}>Think you're eligible?</div>
            <div style={{ color: "white", fontSize: 17, fontWeight: 700 }}>Ready to Make a Difference? It only takes 3 minutes.</div>
          </div>
          <Link to="/register" style={{
            background: "white", color: P.red,
            textDecoration: "none", padding: "11px 26px",
            borderRadius: 10, fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>Register Now →</Link>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

/* ── CONTACT section ── */
function ContactSection() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", overflow: "hidden" }}>
      <div style={{
        flex: 1, maxWidth: 1000, margin: "0 auto",
        padding: "40px 36px 24px", width: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28, flexShrink: 0 }}>
          <div style={{ color: P.red, fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>REACH US</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: P.dark, margin: 0 }}>Contact Us</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1, alignContent: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "📞", label: "Emergency Hotline",  value: "1800-HEALTHCARE" },
              { icon: "🩸", label: "Blood Bank Direct",  value: "+91-44-2345-6700" },
              { icon: "📧", label: "Email",              value: "support@lifepulse.in" },
              { icon: "📍", label: "Address",            value: "No. 12, Anna Salai, Chennai – 600002" },
              { icon: "🕐", label: "Working Hours",      value: "24/7 Emergency · OPD Mon–Sat 9AM–5PM" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                display: "flex", gap: 14, alignItems: "center",
                background: P.warm, border: `1.5px solid ${P.warmM}`,
                borderRadius: 13, padding: "14px 16px",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                  background: "rgba(229,73,52,.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{icon}</div>
                <div>
                  <div style={{ color: P.muted, fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: .6 }}>{label}</div>
                  <div style={{ color: P.dark, fontSize: 14, fontWeight: 600 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

/* ── ROOT ── */
export default function HomePage() {
  const [active, setActive] = useState("Home");

  const renderSection = () => {
    switch (active) {
      case "Home":        return <HomeSection/>;
      case "About":       return <AboutSection/>;
      case "Eligibility": return <EligibilitySection/>;
      case "Contact":     return <ContactSection/>;
      default:            return <HomeSection/>;
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans',sans-serif",
      height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow: hidden; height: 100%; }
        ::-webkit-scrollbar { display: none; }
        a { font-family: inherit; }
      `}</style>

      {/* Emergency ticker */}
      <div style={{ background: P.red, color: "white", padding: "7px 0", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ background: "rgba(255,255,255,.15)", padding: "0 16px", fontSize: 11.5, fontWeight: 700, flexShrink: 0, letterSpacing: .8 }}>
            🚨 EMERGENCY
          </span>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{
              display: "inline-block", fontSize: 11.5, paddingLeft: 32,
              whiteSpace: "nowrap", animation: "marquee 22s linear infinite",
            }}>
              🩸 Blood Needed: O+ve · B-ve &nbsp;|&nbsp; 📞 Emergency: 1800-HEALTHCARE &nbsp;|&nbsp; 🚑 Ambulance: +91-44-2345-6789 &nbsp;|&nbsp; 🏥 LifeCare BloodBank: 24/7 Active
            </div>
          </div>
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(100%)}to{transform:translateX(-100%)}}`}</style>
      </div>

      {/* Navbar / Header */}
      <Header active={active} setActive={setActive}/>

      {/* Page content fills remaining height */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {renderSection()}
      </div>
    </div>
  );
}