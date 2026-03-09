import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const P = {
  red: "#E54934", redD: "#C73B29", redL: "#FEF2F0", redM: "#FDDDD9",
  warm: "#FDF8F5", warmD: "#F5ECE6", warmM: "#EDD8CE",
  dark: "#1C0A06", darkM: "#2E1108", darkL: "#3D1A10",
  white: "#FFFFFF", border: "#EDD8CE", text: "#1C0A06",
  muted: "#7C5040", light: "#A87060",
  green: "#059669", greenL: "#ECFDF5",
  amber: "#D97706", amberL: "#FFFBEB",
  blue: "#2563EB", blueL: "#EFF6FF",
};

function Badge({ label, bg, color, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 11px", borderRadius: 20, fontSize: size, fontWeight: 700, whiteSpace: "nowrap", background: bg, color }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending:   { bg: P.amberL, color: P.amber },
    Accepted:  { bg: P.greenL, color: P.green },
    Declined:  { bg: "#FEE2E2", color: "#B91C1C" },
    Completed: { bg: P.blueL,  color: P.blue },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return <Badge label={status} bg={s.bg} color={s.color} />;
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: { bg: "#3B0000", color: "#FFB3B3" },
    Urgent:   { bg: P.amberL,  color: P.amber },
    Normal:   { bg: P.greenL,  color: P.green },
  };
  const s = map[priority] || { bg: "#F3F4F6", color: "#6B7280" };
  return <Badge label={priority} bg={s.bg} color={s.color} />;
}

export default function DashboardPage() {
  const { donor, logout, updateDonor } = useAuth();
  const navigate   = useNavigate();
  const socketRef  = useRef(null);

  const [tab,           setTab]          = useState("requests");
  const [requests,      setRequests]     = useState([]);
  const [medicalModal,  setMedicalModal] = useState(null);
  const [declineModal,  setDeclineModal] = useState(null);
  const [declineReason, setDeclineReason]= useState("");
  const [medConfirmed,  setMedConfirmed] = useState(false);
  const [toast,         setToast]        = useState(null);
  const [loading,       setLoading]      = useState(true);

  const totalDonations = donor?.donationHistory?.length || 0;
  const totalUnits     = donor?.donationHistory?.reduce((s, d) => s + (d.units || 0), 0) || 0;
  const livesSaved     = totalUnits * 1;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ FIX: correct route /requests/my (not /donor/requests)
  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get("/requests/my");
      setRequests(Array.isArray(data) ? data : (data.requests || []));
    } catch (err) {
      console.error("Failed to fetch requests:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!donor) { navigate("/login"); return; }
    fetchRequests();

    // ✅ FIX: connect socket and immediately emit donor:join
    //         so the server adds this socket to room donor_${_id}
    const socket = io("http://localhost:5300", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      // ✅ This is the critical line — without it the room is never joined
      //    and io.to(`donor_${id}`).emit(...) goes to nobody
      socket.emit("donor:join", donor._id);
      console.log(`✅ Joined donor room: donor_${donor._id}`);
    });

    // ✅ FIX: listen for new:blood:request from BloodBank via donor app server
    socket.on("new:blood:request", (newReq) => {
      console.log("🔔 New blood request:", newReq);
      // Add to top of list if not already there
      setRequests(prev => {
        const exists = prev.find(r => r._id === newReq._id);
        return exists ? prev : [newReq, ...prev];
      });
      // Switch to requests tab automatically
      setTab("requests");
      showToast(
        `🚨 New ${newReq.bloodGroup} request from ${newReq.hospitalName}!`,
        "error"
      );
    });

    socket.on("request:status:updated", ({ requestId, status }) => {
      setRequests(prev =>
        prev.map(r => r._id === requestId ? { ...r, status } : r)
      );
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return () => socket.disconnect();
  }, [donor]);

  // ✅ FIX: correct route /requests/:id/accept
  const handleConfirmAccept = async (requestId) => {
    try {
      await api.patch(`/requests/${requestId}/accept`);
      setRequests(prev =>
        prev.map(r => r._id === requestId ? { ...r, status: "Accepted" } : r)
      );
      setMedicalModal(null);
      setMedConfirmed(false);
      showToast("✅ Accepted! BloodBank has been notified.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to accept.", "error");
    }
  };

  // ✅ FIX: correct route /requests/:id/decline
  const handleDecline = async () => {
    try {
      await api.patch(`/requests/${declineModal}/decline`, { reason: declineReason });
      setRequests(prev =>
        prev.map(r => r._id === declineModal ? { ...r, status: "Declined" } : r)
      );
      setDeclineModal(null);
      setDeclineReason("");
      showToast("Request declined.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to decline.", "error");
    }
  };

  const handleToggleAvailable = async () => {
    try {
      const { data } = await api.patch("/donor/availability", { available: !donor.available });
      updateDonor({ available: data.available });
      showToast(data.available ? "🟢 You are now available" : "🔴 You are now unavailable");
    } catch (err) {
      showToast("Failed to update availability.", "error");
    }
  };

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const TABS = [
    { id: "requests", label: "Blood Requests",  icon: "🩸", badge: pendingCount },
    { id: "profile",  label: "My Profile",       icon: "👤" },
    { id: "history",  label: "Donation History", icon: "📋" },
  ];

  if (!donor) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: P.warm, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 22, right: 22, zIndex: 9999, background: toast.type === "success" ? P.green : P.red, color: "white", padding: "14px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 10 }}>
          {toast.type === "success" ? "✅" : "🚨"} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: P.muted, marginBottom: 4 }}>Welcome back,</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: P.dark, margin: 0 }}>{donor.name}</h1>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ background: P.redL, border: `1.5px solid ${P.redM}`, borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: P.red, fontSize: 22 }}>{donor.bloodGroup}</span>
              <span style={{ fontSize: 12, color: P.muted, fontWeight: 600 }}>Blood Group</span>
            </div>
            <div style={{ background: donor.available ? P.greenL : P.warmD, border: `1.5px solid ${donor.available ? "#A7F3D0" : P.warmM}`, borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700, color: donor.available ? P.green : P.muted }}>
              {donor.available ? "🟢 Available" : "🔴 Unavailable"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", marginBottom: 6, background: tab === t.id ? P.red : "white", border: `1.5px solid ${tab === t.id ? P.red : P.warmM}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: tab === t.id ? "white" : P.muted, textAlign: "left", transition: "all .2s", boxShadow: tab === t.id ? "0 4px 14px rgba(229,73,52,.3)" : "none" }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                {t.label}
                {t.badge > 0 && (
                  <span style={{ marginLeft: "auto", background: tab === t.id ? "rgba(255,255,255,.25)" : P.red, color: "white", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* REQUESTS TAB */}
            {tab === "requests" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: P.dark, marginBottom: 20 }}>Blood Requests</h2>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 60, color: P.muted }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div style={{ background: "white", borderRadius: 18, padding: 60, textAlign: "center", border: `1.5px solid ${P.warmM}` }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🩸</div>
                    <div style={{ fontWeight: 700, color: P.dark, fontSize: 15, marginBottom: 6 }}>No requests yet</div>
                    <div style={{ color: P.muted, fontSize: 13 }}>Blood requests matching your group will appear here.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {requests.map(request => {
                      const isPending = request.status === "Pending";
                      return (
                        <div key={request._id} style={{ background: "white", border: `1.5px solid ${isPending ? P.red : P.warmM}`, borderRadius: 18, overflow: "hidden", boxShadow: isPending ? `0 0 0 4px ${P.redL}` : "none" }}>
                          {isPending && (
                            <div style={{ background: P.red, padding: "8px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                              <span>🚨</span>
                              <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>Urgent — Response Needed</span>
                            </div>
                          )}
                          <div style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                              <div>
                                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: P.red, fontSize: 44, lineHeight: 1 }}>{request.bloodGroup}</div>
                                <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>{request.units} Unit{request.units > 1 ? "s" : ""} needed</div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                                <PriorityBadge priority={request.priority} />
                                <StatusBadge status={request.status} />
                              </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                              {[
                                ["🏥 Hospital",   request.hospitalName],
                                ["👤 Patient",    request.patientName],
                                ["📋 Department", request.department],
                                ["📅 Received",   new Date(request.receivedAt || request.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                              ].map(([lbl, val]) => (
                                <div key={lbl} style={{ background: P.warm, borderRadius: 10, padding: "10px 12px" }}>
                                  <div style={{ fontSize: 11, color: P.muted, fontWeight: 600, marginBottom: 2 }}>{lbl}</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{val}</div>
                                </div>
                              ))}
                            </div>
                            {isPending && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <button onClick={() => { setMedicalModal(request); setMedConfirmed(false); }}
                                  style={{ padding: 12, background: P.green, color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>✓ Accept</button>
                                <button onClick={() => setDeclineModal(request._id)}
                                  style={{ padding: 12, background: "#FEE2E2", color: "#B91C1C", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>✕ Decline</button>
                              </div>
                            )}
                            {request.status === "Accepted"  && <div style={{ background: P.greenL, border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 14px", color: P.green, fontWeight: 700, fontSize: 13, textAlign: "center" }}>✅ Accepted — BloodBank notified</div>}
                            {request.status === "Completed" && <div style={{ background: P.blueL, border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", color: P.blue, fontWeight: 700, fontSize: 13, textAlign: "center" }}>💙 Donation Completed — Thank you!</div>}
                            {request.status === "Declined"  && <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", color: "#B91C1C", fontWeight: 700, fontSize: 13, textAlign: "center" }}>✕ Declined</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {tab === "profile" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: P.dark, marginBottom: 20 }}>My Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                  {[
                    { label: "Total Donations", value: totalDonations, icon: "🩸", color: P.red   },
                    { label: "Units Donated",   value: totalUnits,     icon: "💉", color: P.blue  },
                    { label: "Lives Saved",     value: livesSaved,     icon: "❤️", color: P.green },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "white", border: `1.5px solid ${P.warmM}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div onClick={handleToggleAvailable}
                  style={{ display: "flex", alignItems: "center", gap: 14, background: "white", border: `1.5px solid ${P.warmM}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", marginBottom: 16 }}>
                  <div style={{ width: 48, height: 26, borderRadius: 13, background: donor.available ? P.green : "rgba(0,0,0,.15)", position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: donor.available ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: P.dark }}>{donor.available ? "🟢 Available to Donate" : "🔴 Not Available"}</div>
                    <div style={{ fontSize: 12, color: P.muted }}>{donor.available ? "You will receive donation requests" : "You won't receive requests"}</div>
                  </div>
                </div>
                <div style={{ background: "white", border: `1.5px solid ${P.warmM}`, borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(135deg,${P.darkM},${P.darkL})`, padding: "24px 28px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 64, height: 64, background: `linear-gradient(135deg,${P.red},${P.redD})`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white", fontFamily: "'Playfair Display',serif" }}>{donor.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "white" }}>{donor.name}</div>
                      <div style={{ color: P.red, fontWeight: 700, fontSize: 14 }}>{donor.bloodGroup} · Donor</div>
                    </div>
                  </div>
                  <div style={{ padding: "20px 28px" }}>
                    {[
                      ["Email",           donor.email],
                      ["Phone",           donor.phone],
                      ["Blood Group",     donor.bloodGroup],
                      ["Location",        donor.location],
                      ["Age",             donor.age],
                      ["Gender",          donor.gender],
                      ["Eligibility",     donor.isEligible ? "✅ Eligible" : "❌ Not Eligible"],
                      ["Total Donations", totalDonations],
                      ["Total Units",     `${totalUnits} unit(s)`],
                      ["Lives Saved",     livesSaved],
                      ["Last Donation",   donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Never"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${P.warmD}` }}>
                        <span style={{ fontSize: 13.5, color: P.muted }}>{k}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {tab === "history" && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: P.dark, marginBottom: 20 }}>Donation History</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
                  {[
                    { label: "Total Donations", value: totalDonations, icon: "🩸", color: P.red   },
                    { label: "Units Donated",   value: totalUnits,     icon: "💉", color: P.blue  },
                    { label: "Lives Saved",     value: livesSaved,     icon: "❤️", color: P.green },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "white", border: `1.5px solid ${P.warmM}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "white", borderRadius: 18, border: `1.5px solid ${P.warmM}`, overflow: "hidden" }}>
                  {!donor.donationHistory?.length ? (
                    <div style={{ padding: 60, textAlign: "center", color: P.muted }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                      <div style={{ fontWeight: 600, color: P.dark }}>No donation history yet</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: P.warmD }}>
                            {["Date","Blood Group","Units","Blood Bank","Type","Status"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {donor.donationHistory.map((d, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${P.warmD}` }}>
                              <td style={{ padding: "14px 16px", fontSize: 13.5, color: P.muted }}>{new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                              <td style={{ padding: "14px 16px" }}><span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, color: P.red, fontSize: 20 }}>{d.bloodGroup}</span></td>
                              <td style={{ padding: "14px 16px", fontWeight: 700 }}>{d.units} Unit{d.units > 1 ? "s" : ""}</td>
                              <td style={{ padding: "14px 16px", fontSize: 13.5 }}>{d.bloodBankName || "LifeCare Blood Bank"}</td>
                              <td style={{ padding: "14px 16px" }}>
                                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: d.type === "Emergency Donation" ? "#FEF3C7" : P.blueL, color: d.type === "Emergency Donation" ? P.amber : P.blue }}>
                                  {d.type || "Regular Donation"}
                                </span>
                              </td>
                              <td style={{ padding: "14px 16px" }}><StatusBadge status={d.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Medical Modal */}
      {medicalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,6,.85)", backdropFilter: "blur(10px)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 36px 80px rgba(0,0,0,.45)" }}>
            <div style={{ background: `linear-gradient(135deg,${P.darkM},${P.darkL})`, padding: "24px 30px", borderRadius: "22px 22px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 20 }}>Confirm Medical Eligibility</div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginTop: 3 }}>{medicalModal.bloodGroup} request from {medicalModal.hospitalName}</div>
              </div>
              <button onClick={() => setMedicalModal(null)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.12)", cursor: "pointer", fontSize: 18, color: "white" }}>×</button>
            </div>
            <div style={{ padding: "24px 30px 30px" }}>
              <div style={{ background: P.amberL, border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px", fontSize: 13.5, color: P.amber, lineHeight: 1.6, marginBottom: 18 }}>
                <strong>⚠️ Medical Check Required</strong><br />
                Please confirm your current health condition before accepting.
              </div>
              <div style={{ background: P.warm, borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: P.dark, marginBottom: 10, fontSize: 14 }}>Your Current Status</div>
                {[
                  ["Blood Group",      donor.bloodGroup],
                  ["Last Donation",    donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Never"],
                  ["Medical Eligible", "✅ Yes"],
                  ["Available",        "✅ Yes"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${P.warmM}`, fontSize: 13.5 }}>
                    <span style={{ color: P.muted }}>{k}</span>
                    <span style={{ fontWeight: 700, color: P.dark }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: P.dark, marginBottom: 10, fontSize: 14 }}>Please confirm the following:</div>
                {[
                  "I am currently feeling healthy and fit to donate",
                  "I have not had fever or infection in the last 7 days",
                  "I have not consumed alcohol in the last 24 hours",
                  "I have eaten a meal within the last 4 hours",
                  "I confirm my medical information is accurate",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: `1px solid ${P.warmD}`, fontSize: 13.5, color: P.text }}>
                    <span style={{ color: P.green, fontWeight: 700 }}>✓</span> {item}
                  </div>
                ))}
              </div>
              <div onClick={() => setMedConfirmed(!medConfirmed)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: medConfirmed ? P.greenL : P.warm, border: `1.5px solid ${medConfirmed ? P.green : P.warmM}`, borderRadius: 12, cursor: "pointer", marginBottom: 20 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${medConfirmed ? P.green : P.warmM}`, background: medConfirmed ? P.green : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {medConfirmed && <span style={{ color: "white", fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: medConfirmed ? P.green : P.muted }}>I confirm I am medically fit to donate blood right now</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => setMedicalModal(null)} style={{ padding: 13, background: P.warmD, border: `1.5px solid ${P.warmM}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: P.muted }}>Cancel</button>
                <button onClick={() => medConfirmed && handleConfirmAccept(medicalModal._id)} disabled={!medConfirmed}
                  style={{ padding: 13, background: medConfirmed ? P.green : P.warmM, color: "white", border: "none", borderRadius: 10, cursor: medConfirmed ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>
                  ✓ Confirm & Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declineModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,6,.85)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 22, width: "100%", maxWidth: 480, boxShadow: "0 36px 80px rgba(0,0,0,.45)" }}>
            <div style={{ background: `linear-gradient(135deg,${P.darkM},${P.darkL})`, padding: "24px 30px", borderRadius: "22px 22px 0 0", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: 20 }}>Decline Request</div>
              <button onClick={() => setDeclineModal(null)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.12)", cursor: "pointer", fontSize: 18, color: "white" }}>×</button>
            </div>
            <div style={{ padding: "24px 30px 30px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: P.text, marginBottom: 5 }}>Reason for declining (optional)</label>
                <textarea rows={3} placeholder="e.g. Not feeling well, travelling..." value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${P.border}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => setDeclineModal(null)} style={{ padding: 12, background: P.warmD, border: `1.5px solid ${P.warmM}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: P.muted }}>Cancel</button>
                <button onClick={handleDecline} style={{ padding: 12, background: "#B91C1C", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>Confirm Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
