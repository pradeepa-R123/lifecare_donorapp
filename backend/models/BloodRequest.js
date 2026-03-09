const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    // From BloodBank
    bloodBankRequestId: { type: String, required: true, index: true },
    bloodGroup:         { type: String, required: true },
    units:              { type: Number, required: true },
    hospitalName:       { type: String, required: true },
    patientName:        { type: String, default: "Not specified" },
    department:         { type: String, default: "" },
    reason:             { type: String, default: "" },
    priority:           { type: String, enum: ["Critical", "Urgent", "Normal"], default: "Normal" },

    // ✅ DonorRequest._id from BloodBank — required to call /donor-response correctly
    donorRequestId: { type: String, default: null },

    // ✅ DonorNotification._id from BloodBank
    notificationId: { type: String, default: null },

    // ✅ Multi-unit tracking
    unitsRequired:  { type: Number, default: 1 },   // how many units the request needs
    unitsFulfilled: { type: Number, default: 0 },   // how many units accepted so far

    // Which donor this request is assigned to
    assignedDonor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },

    // Status
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Completed", "Cancelled"],
      default: "Pending",
    },

    acceptedAt:    { type: Date },
    declinedAt:    { type: Date },
    declineReason: { type: String },
    cancelReason:  { type: String },   // ✅ reason when cancelled due to fulfillment by another donor
    receivedAt:    { type: Date, default: Date.now },
    expiresAt:     { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);