import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { P } from "./UI";

export default function ProtectedRoute({ children }) {
  const { donor, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: P.warm, flexDirection: "column", gap: 16,
      }}>
        <div className="animate-heartbeat" style={{ fontSize: 48 }}>🩸</div>
        <div style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 20, color: P.dark,
        }}>LifePulse Donor Network</div>
        <div style={{ fontSize: 13, color: P.muted }}>Loading...</div>
      </div>
    );
  }

  return donor ? children : <Navigate to="/login" replace />;
}
