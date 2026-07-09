import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OwnerRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "OWNER" ? children : <Navigate to="/admin" replace/>;
}
