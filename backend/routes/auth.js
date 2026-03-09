const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const axios   = require("axios");
const Donor   = require("../models/Donor");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// ── Helper: format donor response ──────────────────────────────────────────
const formatDonor = (donor) => ({
  _id:              donor._id,
  name:             donor.name,
  email:            donor.email,
  bloodGroup:       donor.bloodGroup,
  age:              donor.age,
  gender:           donor.gender,
  phone:            donor.phone,
  location:         donor.location,
  available:        donor.available,
  isEligible:       donor.isEligible,
  donationUnits:    donor.donationUnits,
  preferredUnits:   donor.preferredUnits,
  donationHistory:  donor.donationHistory,
  // ✅ lastDonationDate — always from most recent donationHistory entry (sorted desc)
  // NOT from createdAt or updatedAt
  lastDonationDate: donor.donationHistory.length > 0
    ? [...donor.donationHistory]
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
    : null,
  totalDonations:   donor.donationHistory.length,
  totalUnits:       donor.donationHistory.reduce((s, d) => s + (d.units || 0), 0),
  livesSaved:       donor.donationHistory.reduce((s, d) => s + (d.units || 0), 0) * 3,
  createdAt:        donor.createdAt,
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const {
      name, email, password, age, gender, bloodGroup, phone, location, address,
      medicalEligibility,
      donationUnits,
      donationDate,   // ✅ Manual donation date from calendar — single source of truth
    } = req.body;

    // Check existing
    const existing = await Donor.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Eligibility check
    const med = medicalEligibility || {};
    const ineligibleReasons = [];
    if (age < 18 || age > 65)    ineligibleReasons.push("Age must be between 18–65");
    if (med.hasMedicalCondition)  ineligibleReasons.push("Active medical condition");
    if (med.hasHighBP)            ineligibleReasons.push("High blood pressure");
    if (med.hasDiabetes)          ineligibleReasons.push("Diabetes");
    if (med.hadRecentSurgery)     ineligibleReasons.push("Recent surgery");
    if (med.hasDisease)           ineligibleReasons.push("Active disease");
    if (med.hadFeverLast7Days)    ineligibleReasons.push("Fever in last 7 days");
    if (med.hasMalariaHistory)    ineligibleReasons.push("Malaria history");
    if (med.hasHIVHistory)        ineligibleReasons.push("HIV history");

    if (ineligibleReasons.length > 0) {
      return res.status(400).json({
        message: "Not eligible to donate blood based on medical history.",
        reasons: ineligibleReasons,
      });
    }

    const units = parseInt(donationUnits) || 1;

    // ✅ Build donationHistory from donationDate (manual calendar input)
    // This is the ONLY source — NOT createdAt, NOT updatedAt
    const initialHistory = [];
    if (donationDate) {
      initialHistory.push({
        bloodBankName: "LifeCare Blood Bank",
        bloodGroup,
        units,
        date:          new Date(donationDate),  // ✅ manually entered date
        donorAge:      parseInt(age),
        status:        "Completed",
        type:          "Regular Donation",
      });
    }

    // ✅ lastDonationDate = the manually entered donationDate
    // NOT createdAt, NOT Date.now()
    const lastDonationDate = donationDate ? new Date(donationDate) : null;

    // ✅ 3-month eligibility check from donationDate
    let donatedInLast3Months = false;
    if (donationDate) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      donatedInLast3Months = new Date(donationDate) > threeMonthsAgo;
    }

    med.isEligible = true;
    med.reason     = "";

    // Save donor
    const donor = await Donor.create({
      name, email, password,
      age:      parseInt(age),
      gender, bloodGroup, phone, location, address,
      medicalEligibility: med,
      isEligible:      true,
      available:       true,
      donationUnits:   units,
      preferredUnits:  units,
      donationHistory: initialHistory,   // ✅ built from donationDate
      lastDonationDate,                  // ✅ set from donationDate (manual)
    });

    // ✅ Sync to BloodBank — sends donationDate as lastDonationDate
    const bbUrl = process.env.BLOODBANK_BACKEND_URL || "http://localhost:5002";
    try {
      await axios.post(`${bbUrl}/api/donors/sync`, {
        donorAppId:           donor._id.toString(),
        name:                 donor.name,
        age:                  donor.age,
        gender:               donor.gender,
        bloodGroup:           donor.bloodGroup,
        phone:                donor.phone,
        location:             donor.location,
        available:            true,
        willingToDonate:      true,
        donatedInLast3Months,
        lastDonationDate:     donationDate || null,  // ✅ manual date → BloodBank
        donationUnits:        units,
        status:               "Active",
        medicalEligibility:   { isEligible: true, reason: "" },
        totalDonations:       initialHistory.length,
        totalUnits:           initialHistory.length > 0 ? units : 0,
        livesSaved:           (initialHistory.length > 0 ? units : 0) * 3,
      });
      console.log(`✅ Donor synced to BloodBank: ${donor.name} (${donor.bloodGroup} x${units})`);
    } catch (syncErr) {
      console.warn("⚠️ BloodBank sync failed (non-fatal):", syncErr.message);
    }

    res.status(201).json({
      message: "Registration successful",
      token:   generateToken(donor._id),
      donor:   formatDonor(donor),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email });
    if (!donor) return res.status(400).json({ message: "Invalid email or password" });

    const match = await donor.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    res.json({ token: generateToken(donor._id), donor: formatDonor(donor) });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  const donor = await Donor.findById(req.donor._id).select("-password");
  res.json({ donor: formatDonor(donor) });
});

module.exports = router;
