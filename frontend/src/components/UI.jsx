import { useState, useEffect } from "react";

// ── Colors ──
export const P = {
  red: "#E54934", redD: "#C73B29", redL: "#FEF2F0", redM: "#FDDDD9",
  warm: "#FDF8F5", warmD: "#F5ECE6", warmM: "#EDD8CE",
  dark: "#1C0A06", darkM: "#2E1108", darkL: "#3D1A10",
  white: "#FFFFFF", border: "#EDD8CE", text: "#1C0A06",
  muted: "#7C5040", light: "#A87060",
  green: "#059669", greenL: "#ECFDF5",
  amber: "#D97706", amberL: "#FFFBEB",
  blue: "#2563EB", blueL: "#EFF6FF",
  teal: "#0D9488", tealL: "#F0FDFA",
};

export function Spinner({ size = 16, color = "white" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2.5px solid rgba(255,255,255,.35)`,
      borderTopColor: color,
      borderRadius: "50%", animation: "spin .7s linear infinite",
      verticalAlign: "middle", marginRight: 7,
    }} />
  );
}

export function Badge({ label, bg, color, size = 12 }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 11px", borderRadius: 20,
      fontSize: size, fontWeight: 700,
      whiteSpace: "nowrap", background: bg, color, letterSpacing: 0.3,
    }}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: { bg: P.amberL, color: P.amber },
    Accepted: { bg: P.greenL, color: P.green },
    Declined: { bg: "#FEE2E2", color: "#B91C1C" },
    Completed: { bg: P.blueL, color: P.blue },
    Cancelled: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return <Badge label={status} bg={s.bg} color={s.color} />;
}

export function PriorityBadge({ priority }) {
  const map = {
    Critical: { bg: "#3B0000", color: "#FFB3B3" },
    Urgent: { bg: P.amberL, color: P.amber },
    Normal: { bg: P.greenL, color: P.green },
  };
  const s = map[priority] || { bg: "#F3F4F6", color: "#6B7280" };
  return <Badge label={priority} bg={s.bg} color={s.color} />;
}

export function Modal({ title, subtitle, onClose, wide, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(28,10,6,.85)",
        backdropFilter: "blur(10px)", zIndex: 3000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-popUp" style={{
        background: P.white, borderRadius: 22,
        width: "100%", maxWidth: wide ? 680 : 520,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 36px 80px rgba(0,0,0,.45)",
      }}>
        <div style={{
          background: `linear-gradient(135deg,${P.darkM},${P.darkL})`,
          padding: "24px 30px", borderRadius: "22px 22px 0 0",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 20 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,.12)", cursor: "pointer",
              fontSize: 18, color: "white", flexShrink: 0,
            }}
          >×</button>
        </div>
        <div style={{ padding: "24px 30px 30px" }}>{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: P.green, border: "#047857" },
    error: { bg: P.red, border: P.redD },
    info: { bg: P.blue, border: "#1D4ED8" },
  };
  const c = colors[type] || colors.info;

  return (
    <div className="toast" style={{
      position: "fixed", top: 22, right: 22, zIndex: 9999,
      background: c.bg, border: `1.5px solid ${c.border}`,
      color: "white", padding: "14px 20px", borderRadius: 14,
      fontSize: 14, fontWeight: 600, maxWidth: 360,
      boxShadow: "0 8px 32px rgba(0,0,0,.2)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "auto", background: "none", border: "none",
          color: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 16,
        }}
      >×</button>
    </div>
  );
}

export const inp = (extra = {}) => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${P.border}`, borderRadius: 9,
  fontSize: 14, fontFamily: "inherit",
  background: "white", color: P.text,
  transition: "border-color .2s, box-shadow .2s",
  ...extra,
});

export const lbl = {
  display: "block", fontSize: 12.5, fontWeight: 600,
  color: P.text, marginBottom: 5,
};

export function FG({ label, children, mb = 16 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

export function Row2({ children, gap = 14 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
      {children}
    </div>
  );
}

export function BloodGroupBadge({ group }) {
  return (
    <span style={{
      fontFamily: "'Playfair Display',serif",
      fontWeight: 900, color: P.red, fontSize: 22,
    }}>
      {group}
    </span>
  );
}
