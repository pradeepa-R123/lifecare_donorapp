const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const BloodRequest = require("../models/BloodRequest");
const Donor        = require("../models/Donor");
const { protect }  = require("../middleware/auth");

// ─── Helper: resolve donor from donorAppId ────────────────────────────────────
async function resolveDonor(donorAppId) {
  if (!donorAppId) return null;
  const idStr = String(donorAppId).trim();

  // 1. Try as MongoDB _id
  if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
    const byId = await Donor.findById(idStr).catch(() => null);
    if (byId) return byId;
  }

  // 2. Try as donorAppId field
  const byField = await Donor.findOne({ donorAppId: idStr }).catch(() => null);
  if (byField) return byField;

  // 3. Try as email
  const byEmail = await Donor.findOne({ email: idStr }).catch(() => null);
  if (byEmail) return byEmail;

  return null;
}

// ─── POST /api/requests/incoming ─────────────────────────────────────────────
router.post("/incoming", async (req, res) => {
  try {
    const {
      bloodBankRequestId, bloodGroup, units, hospitalName,
      patientName, department, reason, priority,
      donorAppId, notificationId, expiresAt,
      donorRequestId, unitsRequired,
    } = req.body;

    console.log(`\n📥 Incoming request | donorAppId: "${donorAppId}" | bloodGroup: ${bloodGroup}`);

    // ✅ FIX 1: Safe null check before anything else
    if (!donorAppId) {
      console.error("❌ donorAppId is missing from request body");
      return res.status(400).json({ message: "donorAppId is required" });
    }

    // ✅ FIX 2: Use helper — no more crash on undefined.match()
    const resolvedDonor = await resolveDonor(donorAppId);

    if (!resolvedDonor) {
      // ✅ FIX 3: Log ALL donors so you can see the ID mismatch in terminal
      const allDonors = await Donor.find({}, { name: 1, donorAppId: 1, email: 1 }).lean();
      console.error(`❌ Donor not found for donorAppId: "${donorAppId}"`);
      console.error(`📋 Donors in DB:\n${JSON.stringify(allDonors, null, 2)}`);
      return res.status(404).json({ message: `Donor not found for donorAppId: ${donorAppId}` });
    }

    console.log(`✅ Found donor: ${resolvedDonor.name} (_id: ${resolvedDonor._id})`);

    // ✅ 90-day rule check
    if (resolvedDonor.lastDonationDate) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (new Date(resolvedDonor.lastDonationDate) > ninetyDaysAgo) {
        console.warn(`⚠️ Donor ${resolvedDonor.name} donated within 90 days — skipping`);
        return res.status(400).json({ message: "Donor donated within last 90 days. Not eligible." });
      }
    }

    // ✅ Availability check
    if (!resolvedDonor.available) {
      console.warn(`⚠️ Donor ${resolvedDonor.name} is not available — skipping`);
      return res.status(400).json({ message: "Donor is not available." });
    }

    // ✅ Duplicate check
    const existing = await BloodRequest.findOne({
      bloodBankRequestId,
      assignedDonor: resolvedDonor._id,
    });
    if (existing) {
      console.log(`⚠️ Duplicate request — already exists for donor ${resolvedDonor.name}`);
      return res.status(200).json({ message: "Request already exists", request: existing });
    }

    const request = await BloodRequest.create({
      bloodBankRequestId,
      donorRequestId:  donorRequestId || null,
      notificationId:  notificationId || null,
      bloodGroup,
      units,
      hospitalName,
      patientName:    patientName  || "Not specified",
      department:     department   || "",
      reason:         reason       || "",
      priority:       priority     || "Normal",
      unitsRequired:  unitsRequired || units || 1,
      unitsFulfilled: 0,
      assignedDonor:  resolvedDonor._id,
      status:         "Pending",
      expiresAt:      expiresAt ? new Date(expiresAt) : null,
    });

    console.log(`✅ BloodRequest created: ${request._id} for donor ${resolvedDonor.name}`);

    // ✅ FIX 4: Emit to correct socket room donor_<_id>
    const io = req.app.get("io");
    if (io) {
      const room = `donor_${resolvedDonor._id}`;
      io.to(room).emit("new:blood:request", {
        _id:                request._id,
        bloodBankRequestId: request.bloodBankRequestId,
        bloodGroup:         request.bloodGroup,
        units:              request.units,
        unitsRequired:      request.unitsRequired,
        hospitalName:       request.hospitalName,
        patientName:        request.patientName,
        department:         request.department,
        reason:             request.reason,
        priority:           request.priority,
        status:             request.status,
        receivedAt:         request.createdAt,
        message: `Urgent: ${bloodGroup} blood needed at ${hospitalName}. ${units} unit(s) required.`,
      });
      console.log(`🔔 Socket emitted to room: ${room}`);
    } else {
      console.warn("⚠️ Socket (io) not available on app");
    }

    res.status(201).json({
      message:   "Request sent to donor",
      requestId: request._id,
      donorId:   resolvedDonor._id,
    });
  } catch (err) {
    console.error("❌ Incoming request error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── GET /api/requests/my ─────────────────────────────────────────────────────
router.get("/my", protect, async (req, res) => {
  try {
    // ✅ FIX 5: Support both req.donor and req.user set by auth middleware
    const donorId = req.donor?._id || req.user?._id;
    if (!donorId) return res.status(401).json({ message: "Unauthorized" });

    const requests = await BloodRequest.find({ assignedDonor: donorId })
      .sort({ createdAt: -1 });

    // ✅ FIX 6: Return plain array so dashboard works with both Array.isArray(data) and data.requests
    res.json(requests);
  } catch (err) {
    console.error("❌ /my error:", err.message);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// ─── GET /api/requests/pending ───────────────────────────────────────────────
router.get("/pending", protect, async (req, res) => {
  try {
    const donorId = req.donor?._id || req.user?._id;
    if (!donorId) return res.status(401).json({ message: "Unauthorized" });

    const requests = await BloodRequest.find({
      assignedDonor: donorId,
      status: "Pending",
    }).sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error("❌ /pending error:", err.message);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

// ─── PATCH /api/requests/:id/accept ─────────────────────────────────────────
router.patch("/:id/accept", protect, async (req, res) => {
  try {
    const donorId = req.donor?._id || req.user?._id;
    const donor   = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    // ✅ 90-day validation
    if (donor.lastDonationDate) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      if (new Date(donor.lastDonationDate) > ninetyDaysAgo) {
        const nextEligible = new Date(donor.lastDonationDate);
        nextEligible.setDate(nextEligible.getDate() + 90);
        return res.status(400).json({
          message: `You donated within the last 90 days. You can donate again after ${nextEligible.toDateString()}.`,
          nextEligibleDate: nextEligible,
        });
      }
    }

    // ✅ Availability check
    if (!donor.available) {
      return res.status(400).json({
        message: "You are currently marked as unavailable for donation.",
      });
    }

    // ✅ Check if donor already has an active accepted request
    const alreadyAccepted = await BloodRequest.findOne({
      assignedDonor: donorId,
      status:        "Accepted",
    });
    if (alreadyAccepted) {
      return res.status(400).json({
        message: "You already have an active accepted request. Please complete it before accepting another.",
      });
    }

    // ✅ Find the request
    const existing = await BloodRequest.findOne({
      _id: req.params.id, assignedDonor: donorId,
    });
    if (!existing)
      return res.status(404).json({ message: "Request not found" });
    if (existing.status !== "Pending")
      return res.status(400).json({ message: "Request is no longer pending" });

    // ✅ Check if already fulfilled
    const unitsRequired  = existing.unitsRequired  || 1;
    const unitsFulfilled = existing.unitsFulfilled || 0;
    if (unitsFulfilled >= unitsRequired) {
      return res.status(400).json({
        message: "Sorry, this request has already been fulfilled by another donor.",
      });
    }

    // ✅ Update — increment unitsFulfilled and mark accepted
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      {
        $inc:       { unitsFulfilled: 1 },
        status:     "Accepted",
        acceptedAt: new Date(),
      },
      { new: true }
    );

    const isFullyFulfilled = request.unitsFulfilled >= request.unitsRequired;

    // ✅ Mark donor as unavailable
    await Donor.findByIdAndUpdate(donorId, { available: false });

    if (isFullyFulfilled) {
      // ✅ Cancel all remaining Pending requests for same blood bank request
      await BloodRequest.updateMany(
        {
          bloodBankRequestId: request.bloodBankRequestId,
          assignedDonor:      { $ne: donorId },
          status:             "Pending",
        },
        {
          status:       "Cancelled",
          cancelReason: "Request fulfilled by other donors",
        }
      );

      const io = req.app.get("io");
      if (io) {
        io.emit("request:fulfilled", {
          bloodBankRequestId: request.bloodBankRequestId,
          message: "This blood request has been fulfilled. Thank you!",
        });
      }
      console.log(`✅ Request ${request.bloodBankRequestId} fully fulfilled (${request.unitsFulfilled}/${request.unitsRequired})`);
    }

    // ✅ Notify blood bank
    try {
      const bbUrl = process.env.BLOODBANK_BACKEND_URL;
      if (bbUrl) {
        await axios.patch(`${bbUrl}/api/requests/donor-response`, {
          requestId:       request.donorRequestId,
          donorAppId:      donor._id.toString(),
          status:          "Accepted",
          unitsFulfilled:  request.unitsFulfilled,
          unitsRequired:   request.unitsRequired,
          isFullyFulfilled,
          donor: {
            donorAppId:         donor._id.toString(),
            name:               donor.name,
            email:              donor.email,
            phone:              donor.phone,
            bloodGroup:         donor.bloodGroup,
            location:           donor.location,
            age:                donor.age,
            gender:             donor.gender,
            lastDonationDate:   donor.lastDonationDate || null,
            medicalEligibility: { isEligible: donor.isEligible },
          },
        });
        console.log(`✅ BloodBank notified: Donor ${donor.name} accepted (${request.unitsFulfilled}/${request.unitsRequired} units)`);
      }
    } catch (bbErr) {
      console.warn("⚠️ BloodBank notify failed:", bbErr.message);
    }

    const io = req.app.get("io");
    if (io) {
      io.to(`donor_${donorId}`).emit("request:status:updated", {
        requestId: request._id,
        status:    "Accepted",
      });
    }

    res.json({
      message:         `Accepted! ${request.unitsFulfilled}/${request.unitsRequired} units fulfilled.`,
      request,
      isFullyFulfilled,
    });
  } catch (err) {
    console.error("❌ Accept error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Failed to accept request" });
  }
});

// ─── PATCH /api/requests/:id/decline ─────────────────────────────────────────
router.patch("/:id/decline", protect, async (req, res) => {
  try {
    const donorId = req.donor?._id || req.user?._id;
    const { reason } = req.body;

    const request = await BloodRequest.findOne({
      _id: req.params.id, assignedDonor: donorId,
    });
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Pending")
      return res.status(400).json({ message: "Request is no longer pending" });

    request.status        = "Declined";
    request.declinedAt    = new Date();
    request.declineReason = reason || "";
    await request.save();

    try {
      const bbUrl = process.env.BLOODBANK_BACKEND_URL;
      if (bbUrl) {
        await axios.patch(`${bbUrl}/api/requests/donor-response`, {
          requestId:     request.donorRequestId,
          donorAppId:    donorId.toString(),
          status:        "Declined",
          declineReason: reason || "",
        });
      }
    } catch (bbErr) {
      console.warn("⚠️ BloodBank notify failed:", bbErr.message);
    }

    res.json({ message: "Request declined", request });
  } catch (err) {
    console.error("❌ Decline error:", err.message);
    res.status(500).json({ message: "Failed to decline request" });
  }
});

// ─── POST /api/requests/donation-confirmed ────────────────────────────────────
router.post("/donation-confirmed", async (req, res) => {
  try {
    const { donorAppId, bloodGroup, units, donationDate, hospitalName, patientName } = req.body;

    console.log(`\n🩸 Donation confirmed | donorAppId: ${donorAppId} | bloodGroup: ${bloodGroup}`);

    // ✅ FIX: Use shared helper
    const donor = await resolveDonor(donorAppId);

    console.log(`Donor found: ${donor?.name || "NOT FOUND"}`);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    const confirmedDate = donationDate ? new Date(donationDate) : new Date();

    const updated = await Donor.findByIdAndUpdate(donor._id, {
      lastDonationDate: confirmedDate,
      available:        false,
      $push: {
        donationHistory: {
          bloodGroup,
          units,
          bloodBankName: "LifeCare Blood Bank",
          hospitalName:  hospitalName || "LifeCare Hospital",
          date:          confirmedDate,
          donorAge:      donor.age || 0,
          status:        "Completed",
          type:          "Emergency Donation",
        },
      },
    }, { new: true });

    console.log(`✅ Donation confirmed for ${donor.name} — history entries: ${updated.donationHistory.length}`);
    res.json({ message: "Donation confirmed and donor history updated." });
  } catch (err) {
    console.error("❌ Donation confirmed error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;