import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { P, Spinner, inp, FG, Toast } from "../components/UI";
import api from "../utils/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.password) {
      return setToast({ msg: "Please fill in all fields", type: "error" });
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.donor);
      navigate("/dashboard");
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Login failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
      background: `linear-gradient(160deg, ${P.warmD} 0%, ${P.warm} 60%, ${P.redL} 100%)`,
    }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="animate-popUp" style={{
        background: "white", borderRadius: 24,
        width: "100%", maxWidth: 440,
        boxShadow: "0 24px 64px rgba(28,10,6,.12)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${P.darkM}, ${P.darkL})`,
          padding: "36px 36px 28px",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>🩸</div>
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 26, color: "white",
            textAlign: "center", marginBottom: 6,
          }}>
            Welcome Back
          </h1>
          <p style={{ color: "rgba(255,255,255,.55)", textAlign: "center", fontSize: 14 }}>
            Sign in to your donor account
          </p>
        </div>

        <div style={{ padding: "32px 36px" }}>
          <FG label="Email Address">
            <input
              name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={handle}
              style={inp()}
            />
          </FG>

          <FG label="Password">
            <input
              name="password" type="password"
              placeholder="Your password"
              value={form.password} onChange={handle}
              style={inp()}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </FG>

          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(135deg, ${P.red}, ${P.redD})`,
              color: "white", border: "none",
              borderRadius: 12, cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 15,
              boxShadow: "0 6px 20px rgba(229,73,52,.4)",
              transition: "all .2s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {loading && <Spinner />}
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div style={{
            textAlign: "center", marginTop: 20,
            fontSize: 14, color: P.muted,
          }}>
            Not a donor yet?{" "}
            <Link to="/register" style={{ color: P.red, fontWeight: 700, textDecoration: "none" }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
