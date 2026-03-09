const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const donorSchema = new mongoose.Schema(
  {
    // Basic Details
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age:      { type: Number, required: true },
    gender:   { type: String, enum: ["Male", "Female", "Other"], required: true },
    bloodGroup: { type: String, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"], required: true },
    phone:    { type: String, required: true },
    location: { type: String, required: true },
    address:  { type: String },

    // Medical Eligibility
    medicalEligibility: {
      hasMedicalCondition:     { type: Boolean, default: false },
      medicalConditionDetails: { type: String,  default: "" },
      hasHighBP:               { type: Boolean, default: false },
      hasDiabetes:             { type: Boolean, default: false },
      hadRecentSurgery:        { type: Boolean, default: false },
      hasDisease:              { type: Boolean, default: false },
      diseaseDetails:          { type: String,  default: "" },
      hadFeverLast7Days:       { type: Boolean, default: false },
      hasMalariaHistory:       { type: Boolean, default: false },
      hasHIVHistory:           { type: Boolean, default: false },
      isEligible:              { type: Boolean, default: true },
      reason:                  { type: String,  default: "" },
    },

    // Status
  
    isEligible:    { type: Boolean, default: true },
    available:     { type: Boolean, default: true },
    preferredUnits:{ type: Number, enum: [1, 2], default: 1 },
    donationUnits: { type: Number, default: 1 },

    // Sync with BloodBank
    bloodBankDonorId: { type: String, default: null },

    // ✅ donationHistory — date is ALWAYS manually entered, never defaults to Date.now
    donationHistory: [
      {
        requestId:    { type: String },
        bloodGroup:   { type: String },
        units:        { type: Number },
        bloodBankName:{ type: String, default: "LifeCare Blood Bank" },
        hospitalName: { type: String },
        date:         { type: Date, default: null }, // ✅ NO default Date.now — must be set explicitly
        donorAge:     { type: Number },
        status:       { type: String, enum: ["Completed","Pending","Cancelled"], default: "Completed" },
        type:         { type: String, default: "Regular Donation" },
      },
    ],

    // ✅ lastDonationDate — set ONLY from manually entered donationDate
    // NEVER from createdAt or updatedAt
    lastDonationDate: { type: Date, default: null },
  },
  
);

// Hash password
donorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
donorSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ✅ Check donation eligibility — based on lastDonationDate (manual only)
donorSchema.methods.canDonate = function () {
  if (!this.lastDonationDate) return true;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.lastDonationDate < threeMonthsAgo;
};

// ✅ Get lastDonationDate from most recent donationHistory entry (sorted desc)
// This is the canonical getter — never uses createdAt/updatedAt
donorSchema.virtual("latestDonationDate").get(function () {
  if (!this.donationHistory.length) return null;
  const sorted = [...this.donationHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  return sorted[0].date;
});

// Virtuals
donorSchema.virtual("totalDonations").get(function () {
  return this.donationHistory.length;
});
donorSchema.virtual("totalUnits").get(function () {
  return this.donationHistory.reduce((s, d) => s + (d.units || 0), 0);
});
donorSchema.virtual("livesSaved").get(function () {
  return this.totalUnits * 3;
});

module.exports = mongoose.model("Donor", donorSchema);
