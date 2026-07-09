import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("axleora_user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("axleora_token")));

  const storeUser = nextUser => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem("axleora_user", JSON.stringify(nextUser));
    else localStorage.removeItem("axleora_user");
  };

  useEffect(() => {
    if (!localStorage.getItem("axleora_token")) return setLoading(false);
    api.get("/auth/me")
      .then(({ data }) => storeUser(data))
      .catch(() => {
        localStorage.removeItem("axleora_token");
        storeUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async values => {
    const { data } = await api.post("/auth/login", values);
    localStorage.setItem("axleora_token", data.token);
    storeUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem("axleora_token");
    storeUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, updateUser: storeUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
