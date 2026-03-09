import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { P, Spinner, inp, FG, Row2, Toast } from "../components/UI";
import api from "../utils/api";

const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

const INELIGIBLE_REASON_LABELS = {
  hasMedicalCondition: "Active medical condition",
  hasHighBP:           "High blood pressure",
  hasDiabetes:         "Diabetes",
  hadRecentSurgery:    "Recent surgery",
  hasDisease:          "Active disease",
  hadFeverLast7Days:   "Fever in last 7 days",
  hasMalariaHistory:   "Malaria history",
  hasHIVHistory:       "HIV history",
};

function YesNoField({ label, field, value, onChange, detail, detailField, detailValue, onDetailChange, detailPlaceholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 13.5, fontWeight: 600, color: P.text, flex: 1, paddingRight: 12 }}>{label}</label>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {["Yes","No"].map((opt) => {
            const isYes  = opt === "Yes";
            const active = isYes ? value === true : value === false;
            return (
              <button key={opt} type="button" onClick={() => onChange(field, isYes)}
                style={{
                  padding: "6px 18px", borderRadius: 8, border: "1.5px solid",
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  background: active ? (isYes ? P.redL : P.greenL) : "white",
                  borderColor: active ? (isYes ? P.red : P.green) : P.border,
                  color: active ? (isYes ? P.red : P.green) : P.muted,
                  transition: "all .2s",
                }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      {detail && value === true && (
        <input style={{ ...inp(), marginTop: 8 }}
          placeholder={detailPlaceholder || "Please describe..."}
          value={detailValue || ""}
          onChange={(e) => onDetailChange(detailField, e.target.value)} />
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [step,       setStep]      = useState(1);
  const [loading,    setLoading]   = useState(false);
  const [toast,      setToast]     = useState(null);
  const [ineligible, setIneligible]= useState(null);

  const [basic, setBasic] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    age: "", weight: "", gender: "", bloodGroup: "", phone: "", location: "", address: "",
    donationUnits:  "1",
    donationDate:   "",   // ✅ Manual donation date from calendar — single source of truth
  });

  const [medical, setMedical] = useState({
    hasMedicalCondition: false, medicalConditionDetails: "",
    hasHighBP: false, hasDiabetes: false, hadRecentSurgery: false,
    hasDisease: false, diseaseDetails: "",
    hadFeverLast7Days: false, hasMalariaHistory: false, hasHIVHistory: false,
  });

  const handleBasic   = (e) => setBasic(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleMedBool = (field, val) => setMedical(p => ({ ...p, [field]: val }));
  const handleMedText = (field, val) => setMedical(p => ({ ...p, [field]: val }));

  const validateStep1 = () => {
    const { name, email, password, confirmPassword, age, gender, bloodGroup, phone, location } = basic;
    if (!name || !email || !password || !confirmPassword || !age || !gender || !bloodGroup || !phone || !location) {
      setToast({ msg: "Please fill in all required fields", type: "error" }); return false;
    }
    if (password !== confirmPassword) {
      setToast({ msg: "Passwords do not match", type: "error" }); return false;
    }
    if (password.length < 6) {
      setToast({ msg: "Password must be at least 6 characters", type: "error" }); return false;
    }
    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 65) {
      setToast({ msg: "Age must be between 18 and 65 to donate", type: "error" }); return false;
    }
    return true;
  };

  const checkEligibility = () => {
    const reasons = [];
    Object.entries(INELIGIBLE_REASON_LABELS).forEach(([key, label]) => {
      if (medical[key] === true) reasons.push(label);
    });
    return reasons;
  };

  const submit = async () => {
    const reasons = checkEligibility();
    if (reasons.length > 0) { setIneligible(reasons); return; }

    setLoading(true);
    try {
      const payload = {
        name:           basic.name,
        email:          basic.email,
        password:       basic.password,
        age:            parseInt(basic.age),
        gender:         basic.gender,
        bloodGroup:     basic.bloodGroup,
        phone:          basic.phone,
        location:       basic.location,
        address:        basic.address,
        donationUnits:  parseInt(basic.donationUnits) || 1,
        // ✅ donationDate is the single source of truth — sent to backend
        // backend uses this to build donationHistory + set lastDonationDate
        donationDate:   basic.donationDate || null,
        medicalEligibility: medical,
      };

      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.donor);
      navigate("/dashboard");
    } catch (err) {
      const msg     = err.response?.data?.message || "Registration failed";
      const reasons = err.response?.data?.reasons;
      if (reasons) setIneligible(reasons);
      else setToast({ msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Ineligible screen ──────────────────────────────────────────────────────
  if (ineligible) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: `linear-gradient(160deg, ${P.warmD}, ${P.warm})` }}>
        <div className="animate-popUp" style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(28,10,6,.12)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#7B0000,#B91C1C)", padding: "32px 36px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⛔</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: "white" }}>Not Eligible to Donate</h2>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, marginTop: 8 }}>Based on your medical history, you cannot donate blood at this time.</p>
          </div>
          <div style={{ padding: "28px 36px" }}>
            <p style={{ fontSize: 14, color: P.muted, marginBottom: 16 }}>The following conditions make you ineligible:</p>
            {ineligible.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8, background: "#FEE2E2", borderRadius: 10, color: "#B91C1C", fontSize: 14, fontWeight: 600 }}>
                <span>✕</span> {r}
              </div>
            ))}
            <div style={{ background: P.amberL, borderRadius: 10, padding: "12px 16px", marginTop: 16, fontSize: 13, color: P.amber, lineHeight: 1.55 }}>
              <strong>Note:</strong> Once your condition improves, you can try registering again.
            </div>
            <button onClick={() => { setIneligible(null); setStep(2); }}
              style={{ width: "100%", marginTop: 20, padding: "12px", background: P.warmD, border: `1.5px solid ${P.warmM}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: P.muted }}>
              ← Back to Medical Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: `linear-gradient(160deg, ${P.warmD} 0%, ${P.warm} 60%, ${P.redL} 100%)` }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="animate-popUp" style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(28,10,6,.12)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${P.darkM},${P.darkL})`, padding: "28px 36px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {[1,2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? P.red : "rgba(255,255,255,.2)", transition: "background .3s" }} />
            ))}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: "white", marginBottom: 4 }}>
            {step === 1 ? "Basic Details" : "Medical Eligibility"}
          </h1>
          <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13 }}>
            Step {step} of 2 — {step === 1 ? "Tell us about yourself" : "Quick health check"}
          </p>
        </div>

        <div style={{ padding: "28px 36px", maxHeight: "65vh", overflowY: "auto" }}>

          {/* ── STEP 1 ── */}
          {step === 1 ? (
            <>
              <FG label="Full Name *">
                <input name="name" placeholder="Your full name" value={basic.name} onChange={handleBasic} style={inp()} />
              </FG>

              <FG label="Email Address *">
                <input name="email" type="email" placeholder="you@example.com" value={basic.email} onChange={handleBasic} style={inp()} />
              </FG>

              <Row2>
                <FG label="Password *">
                  <input name="password" type="password" placeholder="Min 6 chars" value={basic.password} onChange={handleBasic} style={inp()} />
                </FG>
                <FG label="Confirm Password *">
                  <input name="confirmPassword" type="password" placeholder="Repeat password" value={basic.confirmPassword} onChange={handleBasic} style={inp()} />
                </FG>
              </Row2>

              <Row2>
                <FG label="Age *">
                  <input name="age" type="number" placeholder="18–65" min={18} max={65} value={basic.age} onChange={handleBasic} style={inp()} />
                </FG>
                <FG label="Weight (kg) *">
                  <input name="weight" type="number" placeholder=">50 kg" min={50} value={basic.weight} onChange={handleBasic} style={inp()} />
                </FG>
              </Row2>

              <Row2>
                <FG label="Gender *">
                  <select name="gender" value={basic.gender} onChange={handleBasic} style={inp()}>
                    <option value="">Select</option>
                    {["Male","Female","Other"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </FG>
                <FG label="Blood Group *">
                  <select name="bloodGroup" value={basic.bloodGroup} onChange={handleBasic} style={inp()}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </FG>
              </Row2>

              <Row2>
                <FG label="Phone *">
                  <input name="phone" placeholder="+91 XXXXX XXXXX" value={basic.phone} onChange={handleBasic} style={inp()} />
                </FG>
                <FG label="Donation Units *">
                  <select name="donationUnits" value={basic.donationUnits} onChange={handleBasic} style={inp()}>
                    <option value="1">1 Unit</option>
                    <option value="2">2 Units</option>
                  </select>
                </FG>
              </Row2>

              <FG label="Location / City *">
                <input name="location" placeholder="e.g. T. Nagar, Chennai" value={basic.location} onChange={handleBasic} style={inp()} />
              </FG>

              {/* ✅ RENAMED: Donation Date (manual calendar input) */}
              <FG label="Donation Date">
                <input
                  name="donationDate"
                  type="date"
                  value={basic.donationDate}
                  onChange={handleBasic}
                  max={new Date().toISOString().split("T")[0]}
                  style={inp()}
                />
                <div style={{ fontSize: 12, color: P.muted, marginTop: 5, lineHeight: 1.5 }}>
                  📅 Select your most recent donation date. This will be saved as your Last Donation Date and shown in BloodBank.
                  Leave blank if this is your first donation.
                </div>
              </FG>

              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#2563EB", lineHeight: 1.6, marginBottom: 14 }}>
                💡 <strong>Donation Units:</strong> Units you select will be added to BloodBank inventory for your blood group after registration.
              </div>

              <FG label="Full Address (optional)">
                <textarea name="address" rows={2} placeholder="Street, Area, City"
                  value={basic.address} onChange={handleBasic}
                  style={{ ...inp(), resize: "vertical", minHeight: 64 }} />
              </FG>
            </>
          ) : (
            // ── STEP 2 — Medical ──
            <>
              <div style={{ background: P.amberL, border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: P.amber, marginBottom: 22, lineHeight: 1.55 }}>
                <strong>Important:</strong> Please answer honestly. Inaccurate information could risk donor and recipient health.
              </div>
              <YesNoField label="Do you have any medical conditions?"       field="hasMedicalCondition" value={medical.hasMedicalCondition} onChange={handleMedBool} detail detailField="medicalConditionDetails" detailValue={medical.medicalConditionDetails} onDetailChange={handleMedText} detailPlaceholder="Describe your condition..." />
              <YesNoField label="Do you have high blood pressure (BP)?"     field="hasHighBP"           value={medical.hasHighBP}           onChange={handleMedBool} />
              <YesNoField label="Do you have diabetes / high sugar?"        field="hasDiabetes"         value={medical.hasDiabetes}         onChange={handleMedBool} />
              <YesNoField label="Had any surgery in the last 6 months?"     field="hadRecentSurgery"    value={medical.hadRecentSurgery}    onChange={handleMedBool} />
              <YesNoField label="Do you have any active disease/infection?" field="hasDisease"          value={medical.hasDisease}          onChange={handleMedBool} detail detailField="diseaseDetails" detailValue={medical.diseaseDetails} onDetailChange={handleMedText} detailPlaceholder="Name the disease..." />
              <YesNoField label="Have you had fever in the last 7 days?"    field="hadFeverLast7Days"   value={medical.hadFeverLast7Days}   onChange={handleMedBool} />
              <YesNoField label="Do you have a history of Malaria?"         field="hasMalariaHistory"   value={medical.hasMalariaHistory}   onChange={handleMedBool} />
              <YesNoField label="Do you have HIV / AIDS history?"           field="hasHIVHistory"       value={medical.hasHIVHistory}       onChange={handleMedBool} />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 36px 28px", display: "flex", gap: 12 }}>
          {step === 2 && (
            <button onClick={() => setStep(1)}
              style={{ flex: 1, padding: "13px", background: P.warmD, border: `1.5px solid ${P.warmM}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: P.muted }}>
              ← Back
            </button>
          )}
          <button
            onClick={() => { if (step === 1) { if (validateStep1()) setStep(2); } else { submit(); } }}
            disabled={loading}
            style={{ flex: 2, padding: "13px", background: `linear-gradient(135deg,${P.red},${P.redD})`, color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 15, boxShadow: "0 6px 20px rgba(229,73,52,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading && <Spinner />}
            {step === 1 ? "Next — Medical Check →" : loading ? "Registering..." : "Complete Registration"}
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "0 36px 24px", fontSize: 13, color: P.muted }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: P.red, fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
