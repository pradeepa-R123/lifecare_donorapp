import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("lp_token");
    const stored = localStorage.getItem("lp_donor");
    if (token && stored) {
      try {
        setDonor(JSON.parse(stored));
        // Verify token is still valid
        api.get("/auth/me").then(({ data }) => {
          setDonor(data.donor);
          localStorage.setItem("lp_donor", JSON.stringify(data.donor));
        }).catch(() => {
          localStorage.removeItem("lp_token");
          localStorage.removeItem("lp_donor");
          setDonor(null);
        }).finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, donorData) => {
    localStorage.setItem("lp_token", token);
    localStorage.setItem("lp_donor", JSON.stringify(donorData));
    setDonor(donorData);
  };

  const logout = () => {
    localStorage.removeItem("lp_token");
    localStorage.removeItem("lp_donor");
    setDonor(null);
  };

  const updateDonor = (updates) => {
    const updated = { ...donor, ...updates };
    setDonor(updated);
    localStorage.setItem("lp_donor", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ donor, loading, login, logout, updateDonor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
