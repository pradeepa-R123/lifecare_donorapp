import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

let socketInstance = null;

// ✅ FIXED: Connect to backend port 5300, not Vite frontend port 5003
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5300";

export function useSocket(onNewRequest, onDonationCompleted) {
  const { donor } = useAuth();
  const callbackRef = useRef({ onNewRequest, onDonationCompleted });

  useEffect(() => {
    callbackRef.current = { onNewRequest, onDonationCompleted };
  });

  useEffect(() => {
    if (!donor?._id) return;

    // ✅ Create socket only once, pointed at backend
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected to backend:", SOCKET_URL);
      });

      socketInstance.on("disconnect", () => {
        console.log("⚠️ Socket disconnected");
      });

      socketInstance.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    }

    // ✅ Join donor room so BloodBank can target this donor
    socketInstance.emit("donor:join", donor._id);
    console.log(`🔌 Joined donor room: donor_${donor._id}`);

    const handleNewRequest = (data) => {
      console.log("📥 New blood request received:", data);
      callbackRef.current.onNewRequest?.(data);
    };

    const handleCompleted = (data) => {
      console.log("✅ Donation completed:", data);
      callbackRef.current.onDonationCompleted?.(data);
    };

    socketInstance.on("new:blood:request", handleNewRequest);
    socketInstance.on("donation:completed", handleCompleted);

    return () => {
      socketInstance.off("new:blood:request", handleNewRequest);
      socketInstance.off("donation:completed", handleCompleted);
    };
  }, [donor?._id]);
}