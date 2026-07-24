import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`toast ${type}`} role="status">
    <i className={`fa-solid fa-${type === "success" ? "circle-check" : "circle-exclamation"}`}/>
    <span>{message}</span>
    <button aria-label="Dismiss notification" onClick={onClose}><i className="fa-solid fa-xmark"/></button>
  </div>;
}
