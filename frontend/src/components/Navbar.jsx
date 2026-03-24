import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { P } from "./UI";

export default function Navbar() {
  const { donor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: isActive(to) ? P.red : "rgba(255,255,255,0.65)",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: isActive(to) ? 700 : 500,
        padding: "6px 14px",
        borderRadius: 8,
        background: isActive(to) ? "rgba(229,73,52,0.15)" : "transparent",
        transition: "all .2s",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: "rgba(26,10,8,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(229,73,52,0.25)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="animate-heartbeat" style={{
            width: 38, height: 38,
            background: `linear-gradient(135deg, ${P.red}, ${P.redD})`,
            borderRadius: 10, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(229,73,52,.4)",
          }}>
            🩸
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18, fontWeight: 700, color: "white",
              lineHeight: 1.1,
            }}>
              LifePulse
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Donor Network
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!donor ? (
            <>
              {navLink("/", "Home")}

              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: isActive("/login") ? "rgba(229,73,52,0.15)" : "transparent",
                  color: isActive("/login") ? P.red : "rgba(255,255,255,0.65)",
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  background: `linear-gradient(135deg,${P.red},${P.redD})`,
                  color: "white", textDecoration: "none",
                  fontSize: 14, fontWeight: 700,
                  padding: "8px 20px", borderRadius: 10,
                  boxShadow: "0 4px 14px rgba(229,73,52,.35)",
                  transition: "all .2s",
                }}
              >
                Become a Donor
              </Link>
            </>
          ) : (
            <>
              {navLink("/dashboard", "Dashboard")}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginLeft: 8, paddingLeft: 14,
                borderLeft: "1.5px solid rgba(255,255,255,0.12)",
              }}>
                <div style={{
                  width: 36, height: 36,
                  background: `linear-gradient(135deg,${P.red},${P.redD})`,
                  borderRadius: 10, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 15,
                }}>
                  {donor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{donor.name}</div>
                  <div style={{ fontSize: 11, color: P.red, fontWeight: 700 }}>{donor.bloodGroup}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: 4, padding: "6px 14px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, cursor: "pointer",
                    fontSize: 12.5, fontWeight: 600,
                    color: "rgba(255,255,255,0.65)", fontFamily: "inherit",
                    transition: "all .2s",
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}