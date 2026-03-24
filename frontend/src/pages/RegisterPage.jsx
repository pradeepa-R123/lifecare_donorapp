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

// ── Validation ────────────────────────────────────────────────
function validateBasic(basic) {
  const errors = {};

  // Name — letters and spaces only
  if (!basic.name || basic.name.trim().length < 2)
    errors.name = "Full name is required (min 2 characters).";
  else if (!/^[a-zA-Z\s]+$/.test(basic.name.trim()))
    errors.name = "Name must contain letters only.";

  // Email — must have @
  if (!basic.email || basic.email.trim() === "")
    errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basic.email.trim()))
    errors.email = "Enter a valid email (e.g. you@example.com).";

  // Password — min 6 chars
  if (!basic.password || basic.password.length < 6)
    errors.password = "Password must be at least 6 characters.";

  // Confirm Password
  if (!basic.confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (basic.password !== basic.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  // Age — 18 to 65
  if (!basic.age)
    errors.age = "Age is required.";
  else if (isNaN(basic.age) || Number(basic.age) < 18 || Number(basic.age) > 65)
    errors.age = "Age must be between 18 and 65.";

  // Weight — min 50kg
  if (!basic.weight)
    errors.weight = "Weight is required.";
  else if (isNaN(basic.weight) || Number(basic.weight) < 50)
    errors.weight = "Minimum weight is 50 kg.";

  // Gender
  if (!basic.gender)
    errors.gender = "Please select a gender.";

  // Blood Group
  if (!basic.bloodGroup)
    errors.bloodGroup = "Please select a blood group.";

  // Phone — 10-digit Indian number
  if (!basic.phone || basic.phone.trim() === "")
    errors.phone = "Phone number is required.";
  else {
    const cleaned = basic.phone.replace(/[\s\-]/g, "");
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(cleaned))
      errors.phone = "Enter a valid 10-digit mobile number.";
  }

  // Donation Units
  if (!basic.donationUnits)
    errors.donationUnits = "Please select donation units.";

  // Location
  if (!basic.location || basic.location.trim().length < 2)
    errors.location = "Location / City is required.";

  return errors;
}

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
  const [errors,     setErrors]    = useState({});
  const [touched,    setTouched]   = useState({});

  const [basic, setBasic] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    age: "", weight: "", gender: "", bloodGroup: "", phone: "", location: "", address: "",
    donationUnits: "1",
    donationDate:  "",
  });

  const [medical, setMedical] = useState({
    hasMedicalCondition: false, medicalConditionDetails: "",
    hasHighBP: false, hasDiabetes: false, hadRecentSurgery: false,
    hasDisease: false, diseaseDetails: "",
    hadFeverLast7Days: false, hasMalariaHistory: false, hasHIVHistory: false,
  });

  // ── Live field change with instant validation ──────────────
  const handleBasic = (e) => {
    const { name, value } = e.target;
    const updated = { ...basic, [name]: value };
    setBasic(updated);
    // validate only touched fields live
    if (touched[name]) {
      const errs = validateBasic(updated);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (name) => {
    setTouched(t => ({ ...t, [name]: true }));
    const errs = validateBasic(basic);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const handleMedBool = (field, val) => setMedical(p => ({ ...p, [field]: val }));
  const handleMedText = (field, val) => setMedical(p => ({ ...p, [field]: val }));

  // ── Field style helper ─────────────────────────────────────
  const fieldStyle = (name) => ({
    ...inp(),
    border: errors[name] && touched[name]
      ? "1.5px solid #EF4444"
      : `1.5px solid ${P.border}`,
    background: errors[name] && touched[name] ? "#FFF5F5" : "white",
  });

  // ── Inline error message ───────────────────────────────────
  const ErrMsg = ({ name }) => errors[name] && touched[name]
    ? <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4, marginBottom: 6 }}>⚠ {errors[name]}</div>
    : null;

  // ── Step 1 submit ──────────────────────────────────────────
  const goToStep2 = () => {
    // Mark all fields as touched
    const allFields = Object.keys(basic);
    const allTouched = allFields.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errs = validateBasic(basic);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setToast({ msg: "Please fix the errors before continuing.", type: "error" });
      return;
    }
    setStep(2);
  };

  // ── Eligibility check ──────────────────────────────────────
  const checkEligibility = () => {
    const reasons = [];
    Object.entries(INELIGIBLE_REASON_LABELS).forEach(([key, label]) => {
      if (medical[key] === true) reasons.push(label);
    });
    return reasons;
  };

  // ── Final submit ───────────────────────────────────────────
  const submit = async () => {
    const reasons = checkEligibility();
    if (reasons.length > 0) { setIneligible(reasons); return; }

    setLoading(true);
    try {
      const payload = {
        name:          basic.name,
        email:         basic.email,
        password:      basic.password,
        age:           parseInt(basic.age),
        gender:        basic.gender,
        bloodGroup:    basic.bloodGroup,
        phone:         basic.phone,
        location:      basic.location,
        address:       basic.address,
        donationUnits: parseInt(basic.donationUnits) || 1,
        donationDate:  basic.donationDate || null,
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

  // ── Ineligible screen ──────────────────────────────────────
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
              {/* Name */}
              <FG label="Full Name *">
                <input
                  name="name"
                  placeholder="Letters only"
                  value={basic.name}
                  onChange={handleBasic}
                  onBlur={() => handleBlur("name")}
                  style={fieldStyle("name")}
                />
                <ErrMsg name="name" />
              </FG>

              {/* Email */}
              <FG label="Email Address *">
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={basic.email}
                  onChange={handleBasic}
                  onBlur={() => handleBlur("email")}
                  style={fieldStyle("email")}
                />
                <ErrMsg name="email" />
              </FG>

              {/* Password row */}
              <Row2>
                <FG label="Password *">
                  <input
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={basic.password}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("password")}
                    style={fieldStyle("password")}
                  />
                  <ErrMsg name="password" />
                </FG>
                <FG label="Confirm Password *">
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={basic.confirmPassword}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("confirmPassword")}
                    style={fieldStyle("confirmPassword")}
                  />
                  <ErrMsg name="confirmPassword" />
                </FG>
              </Row2>

              {/* Age & Weight */}
              <Row2>
                <FG label="Age * (18–65)">
                  <input
                    name="age"
                    type="number"
                    placeholder="18–65"
                    min={18} max={65}
                    value={basic.age}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("age")}
                    style={fieldStyle("age")}
                  />
                  <ErrMsg name="age" />
                </FG>
                <FG label="Weight (kg) * (min 50)">
                  <input
                    name="weight"
                    type="number"
                    placeholder="≥ 50 kg"
                    min={50}
                    value={basic.weight}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("weight")}
                    style={fieldStyle("weight")}
                  />
                  <ErrMsg name="weight" />
                </FG>
              </Row2>

              {/* Gender & Blood Group */}
              <Row2>
                <FG label="Gender *">
                  <select
                    name="gender"
                    value={basic.gender}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("gender")}
                    style={fieldStyle("gender")}
                  >
                    <option value="">Select</option>
                    {["Male","Female","Other"].map(g => <option key={g}>{g}</option>)}
                  </select>
                  <ErrMsg name="gender" />
                </FG>
                <FG label="Blood Group *">
                  <select
                    name="bloodGroup"
                    value={basic.bloodGroup}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("bloodGroup")}
                    style={fieldStyle("bloodGroup")}
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                  <ErrMsg name="bloodGroup" />
                </FG>
              </Row2>

              {/* Phone & Donation Units */}
              <Row2>
                <FG label="Phone * (10-digit)">
                  <input
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={basic.phone}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("phone")}
                    style={fieldStyle("phone")}
                    maxLength={13}
                  />
                  <ErrMsg name="phone" />
                </FG>
                <FG label="Donation Units *">
                  <select
                    name="donationUnits"
                    value={basic.donationUnits}
                    onChange={handleBasic}
                    onBlur={() => handleBlur("donationUnits")}
                    style={fieldStyle("donationUnits")}
                  >
                    <option value="1">1 Unit</option>
                    <option value="2">2 Units</option>
                  </select>
                  <ErrMsg name="donationUnits" />
                </FG>
              </Row2>

              {/* Location */}
              <FG label="Location / City *">
                <input
                  name="location"
                  placeholder="e.g. T. Nagar, Chennai"
                  value={basic.location}
                  onChange={handleBasic}
                  onBlur={() => handleBlur("location")}
                  style={fieldStyle("location")}
                />
                <ErrMsg name="location" />
              </FG>

              {/* Donation Date */}
              <FG label="Donation Date">
                <input
                  name="donationDate"
                  type="date"
                  value={basic.donationDate}
                  onChange={handleBasic}
                  max={new Date().toISOString().split("T")[0]}
                  style={inp()}
                />
              </FG>

              {/* Address */}
              <FG label="Full Address (optional)">
                <textarea
                  name="address"
                  rows={2}
                  placeholder="Street, Area, City"
                  value={basic.address}
                  onChange={handleBasic}
                  style={{ ...inp(), resize: "vertical", minHeight: 64 }}
                />
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

        {/* Footer buttons */}
        <div style={{ padding: "0 36px 28px", display: "flex", gap: 12 }}>
          {step === 2 && (
            <button onClick={() => setStep(1)}
              style={{ flex: 1, padding: "13px", background: P.warmD, border: `1.5px solid ${P.warmM}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: P.muted }}>
              ← Back
            </button>
          )}
          <button
            onClick={() => { if (step === 1) { goToStep2(); } else { submit(); } }}
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