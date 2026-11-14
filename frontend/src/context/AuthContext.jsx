
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("campusbite_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiRequest("/auth/me");
        setUser(currentUser);
      } catch {
        localStorage.removeItem("campusbite_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);


async function login(email, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  localStorage.setItem("campusbite_token", result.access_token);

  try {
    const currentUser = await apiRequest("/auth/me");
    setUser(currentUser);
    return currentUser;
  } catch (error) {
    localStorage.removeItem("campusbite_token");
    throw error;
  }
}


  async function register(details) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(details),
    });
  }

  function logout() {
    localStorage.removeItem("campusbite_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
