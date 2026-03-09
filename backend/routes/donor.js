const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const Donor   = require("../models/Donor");
const BloodRequest = require("../models/BloodRequest");
const { protect } = require("../middleware/auth");

// ── PATCH /api/donor/availability ────────────────────────────────────────────
router.patch("/availability", protect, async (req, res) => {
  try {
    const { available } = req.body;
    const donor = await Donor.findByIdAndUpdate(
      req.donor._id, { available }, { new: true }
    ).select("-password");

    try {
      const bbUrl = process.env.BLOODBANK_BACKEND_URL;
      if (bbUrl) {
        await axios.patch(`${bbUrl}/api/donors/${donor._id.toString()}/availability`, {
          available,
          donatedInLast3Months: !donor.canDonate?.() ?? false,
          lastDonated:          donor.lastDonationDate || null,
          lastDonationDate:     donor.lastDonationDate || null,
        });
      }
    } catch (syncErr) {
      console.warn("⚠️ BloodBank availability sync failed:", syncErr.message);
    }

    res.json({ available: donor.available, message: "Availability updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update availability" });
  }
});

// ── PATCH /api/donor/preferred-units ────────────────────────────────────────
router.patch("/preferred-units", protect, async (req, res) => {
  try {
    const { preferredUnits } = req.body;
    if (![1, 2].includes(preferredUnits))
      return res.status(400).json({ message: "Units must be 1 or 2" });
    const donor = await Donor.findByIdAndUpdate(
      req.donor._id, { preferredUnits }, { new: true }
    ).select("-password");
    res.json({ preferredUnits: donor.preferredUnits });
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferred units" });
  }
});

// ── GET /api/donor/history ───────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const donor = await Donor.findById(req.donor._id)
      .select("donationHistory lastDonationDate");
    res.json({
      history:          donor.donationHistory,
      lastDonationDate: donor.lastDonationDate,
      todayDonationDate:donor.todayDonationDate,
      totalDonations:   donor.donationHistory.length,
      totalUnits:       donor.donationHistory.reduce((s, d) => s + (d.units || 0), 0),
      livesSaved:       donor.donationHistory.reduce((s, d) => s + (d.units || 0), 0) * 3,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// ── POST /api/donors/donation-confirmed ──────────────────────────────────────
// ✅ Called by BloodBank after staff clicks "Approve & Fulfill" on Donor Accepted request
// Updates donor's lastDonationDate + pushes Emergency Donation to history
router.post("/donation-confirmed", async (req, res) => {
  try {
    const { donorAppId, bloodGroup, units, donationDate, hospitalName, patientName } = req.body;

    const donor = await Donor.findById(donorAppId)
      || await Donor.findOne({ donorAppId });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const now = donationDate ? new Date(donationDate) : new Date();

    // ✅ Push Emergency Donation entry to donationHistory (spec Part 6)
    donor.donationHistory.unshift({
      bloodBankName: "LifeCare Blood Bank",
      bloodGroup:    bloodGroup || donor.bloodGroup,
      units:         parseInt(units) || 1,
      hospitalName:  hospitalName || "LifeCare Hospital",
      date:          now,
      donorAge:      donor.age,
      status:        "Completed",
      type:          "Emergency Donation",   // ✅ emergency type
    });

    // ✅ Update lastDonationDate = today
    donor.lastDonationDate = now;
    donor.available        = false;   // donor just donated — mark unavailable

    await donor.save();

    // ✅ Sync updated availability + lastDonationDate back to BloodBank
    const bbUrl = process.env.BLOODBANK_BACKEND_URL;
    if (bbUrl) {
      axios.patch(`${bbUrl}/api/donors/${donor._id}/availability`, {
        available:            false,
        donatedInLast3Months: true,
        lastDonated:          now,
        lastDonationDate:     now,
      }).catch(err => console.warn("BloodBank sync failed:", err.message));
    }

    // Notify donor via socket
    const io = req.app?.get("io");
    if (io) {
      io.to(`donor_${donor._id}`).emit("donation:completed", {
        requestId:    null,
        hospitalName: hospitalName || "LifeCare Hospital",
        units:        parseInt(units) || 1,
        message:      "Your donation has been confirmed. Thank you for saving a life! 🩸",
      });
    }

    res.json({
      message:          "Donation confirmed and history updated",
      lastDonationDate: donor.lastDonationDate,
      totalDonations:   donor.donationHistory.length,
      totalUnits:       donor.donationHistory.reduce((s, d) => s + (d.units || 0), 0),
    });
  } catch (err) {
    console.error("donation-confirmed error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;




































