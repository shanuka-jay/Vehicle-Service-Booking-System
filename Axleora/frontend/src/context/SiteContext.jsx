import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";
const SiteContext = createContext({});
export function SiteProvider({ children }) {
  const [site, setSite] = useState({});
  useEffect(() => { api.get("/site/public").then(({ data }) => setSite(data)).catch(() => {}); }, []);
  return <SiteContext.Provider value={{ site, setSite }}>{children}</SiteContext.Provider>;
}
export const useSite = () => useContext(SiteContext);
