require("dotenv").config();
const express   = require("express");
const http      = require("http");
const { Server }= require("socket.io");
const mongoose  = require("mongoose");
const cors      = require("cors");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST","PATCH","PUT","DELETE"] },
});

app.set("io", io);
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
const authRoutes    = require("./routes/auth");
const donorRoutes   = require("./routes/donor");
const requestRoutes = require("./routes/requests");

app.use("/api/auth",    authRoutes);
app.use("/api/donor",   donorRoutes);
app.use("/api/requests",requestRoutes);

// ✅ BloodBank calls /api/donors/donation-confirmed — map it here
app.use("/api/donors",  donorRoutes);

app.get("/", (req, res) => res.json({ status: "LifePulse Donor Backend Running" }));

// Socket.IO
io.on("connection", (socket) => {
  socket.on("donor:join", (donorId) => {
    socket.join(`donor_${donorId}`);
    console.log(`🔌 Donor joined: donor_${donorId}`);
  });
  socket.on("disconnect", () => {});
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5300, () => {
      console.log(`🩸 LifePulse Donor Backend running on port ${process.env.PORT || 5300}`);
      console.log(`🏥 BloodBank URL: ${process.env.BLOODBANK_BACKEND_URL || "http://localhost:5002"}`);
    });
  })
  .catch((err) => console.error("MongoDB error:", err));