const jwt   = require("jsonwebtoken");
const Donor = require("../models/Donor");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const donor = await Donor.findById(decoded.id).select("-password");
    if (!donor) {
      return res.status(401).json({ message: "Donor not found" });
    }

    req.donor = donor;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };