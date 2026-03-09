import { Link } from "react-router-dom";
import { P } from "../components/UI";

const STATS = [
  { value: "12,400+", label: "Units Donated", icon: "🩸" },
  { value: "4,100+", label: "Lives Saved", icon: "❤️" },
  { value: "920+", label: "Active Donors", icon: "🧑‍🤝‍🧑" },
  { value: "24/7", label: "Always Ready", icon: "🚨" },
];

const TRUST_POINTS = [
  {
    icon: "🤝",
    title: "Trusted by 900+ Donors",
    desc: "A growing community of heroes dedicated to saving lives every day."
  },
  {
    icon: "🏥",
    title: "Official Partner",
    desc: "Directly connected with LifeCare BloodBank for real-time local needs."
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your data is encrypted and only shared when you choose to donate."
  }
];

const ELIGIBILITY = [
  { icon: "🎂", title: "Age 18–65", desc: "Donors must be within the eligible age range." },
  { icon: "⚖️", title: "Weight 50kg+", desc: "Minimum weight requirement for safe donation." },
  { icon: "💊", title: "No Major Illness", desc: "No active diseases, HIV, or blood disorders." },
  { icon: "🩺", title: "Normal BP & Sugar", desc: "Blood pressure and sugar levels must be normal." },
  { icon: "🌡️", title: "No Recent Fever", desc: "No fever or malaria in the past 7 days." },
  { icon: "🔪", title: "No Recent Surgery", desc: "No surgical procedures in the last 6 months." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${P.dark} 0%, ${P.darkM} 50%, ${P.darkL} 100%)`,
        minHeight: "85vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 24px",
        position: "relative", overflow: "hidden",
      }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", maxWidth: 720, position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(229,73,52,.15)",
            border: "1px solid rgba(229,73,52,.3)",
            borderRadius: 40, padding: "8px 18px",
            marginBottom: 32, color: "#FFAA96", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ fontSize: 18 }}>🩸</span>
            Connected with LifeCare BloodBank
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(42px, 7vw, 72px)",
            color: "white", lineHeight: 1.1, marginBottom: 24,
          }}>
            Be the Reason<br />
            <span style={{
              background: `linear-gradient(135deg, ${P.red}, #FF8C7A)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Someone Lives
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: "rgba(255,255,255,.65)",
            lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px",
          }}>
            Join the LifePulse Donor Network. Receive real-time donation requests 
            and help save lives in your community.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{
              background: `linear-gradient(135deg, ${P.red}, ${P.redD})`,
              color: "white", textDecoration: "none",
              padding: "16px 36px", borderRadius: 14,
              fontWeight: 700, fontSize: 16,
              boxShadow: "0 8px 28px rgba(229,73,52,.5)",
            }}>
              Register as Donor
            </Link>
            <Link to="/login" style={{
              background: "rgba(255,255,255,.1)",
              border: "1.5px solid rgba(255,255,255,.2)",
              color: "white", textDecoration: "none",
              padding: "16px 36px", borderRadius: 14,
              fontWeight: 600, fontSize: 16,
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: P.red, padding: "40px 24px" }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 34, color: "white", fontWeight: 900,
              }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 14, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified Trust Section */}
      <section style={{ padding: "100px 24px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, color: P.dark, marginBottom: 16 }}>
              A Network You Can Trust
            </h2>
            <p style={{ color: P.muted, fontSize: 18 }}>Simplifying blood donation through technology and community.</p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: 40 
          }}>
            {TRUST_POINTS.map((point, i) => (
              <div key={i} style={{ textAlign: "center", padding: "0 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{point.icon}</div>
                <h3 style={{ fontSize: 22, color: P.dark, marginBottom: 12, fontWeight: 700 }}>{point.title}</h3>
                <p style={{ color: P.muted, lineHeight: 1.6 }}>{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section style={{ padding: "80px 24px", background: P.warm }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: P.red, fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              Quick Check
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, color: P.dark }}>
              Who Can Donate?
            </h2>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}>
            {ELIGIBILITY.map((e, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, alignItems: "center",
                background: "white", borderRadius: 14, padding: "20px",
                border: `1px solid ${P.warmM}`,
              }}>
                <div style={{ fontSize: 24 }}>{e.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: P.dark }}>{e.title}</div>
                  <div style={{ fontSize: 13, color: P.muted }}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", background: P.red, textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, color: "white", marginBottom: 16 }}>
          Ready to Make a Difference?
        </h2>
        <p style={{ color: "rgba(255,255,255,.9)", fontSize: 18, marginBottom: 40 }}>
          It only takes 3 minutes to register and start saving lives.
        </p>
        <Link to="/register" style={{
          background: "white", color: P.red,
          textDecoration: "none", padding: "18px 48px",
          borderRadius: 14, fontWeight: 800, fontSize: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "inline-block",
        }}>
          Register Now
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: P.dark, padding: "40px 24px",
        textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 14,
      }}>
        <div style={{ marginBottom: 12 }}>
          <strong style={{ color: "white" }}>LifePulse Donor Network</strong> — Powered by <span style={{ color: P.red }}>LifeCare BloodBank</span>
        </div>
       
      </footer>
    </div>
  );
}