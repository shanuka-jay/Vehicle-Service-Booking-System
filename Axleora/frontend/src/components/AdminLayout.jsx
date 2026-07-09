import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Toast from "./Toast";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios";

export default function AdminLayout() {
  const [open, setOpen] = useState(false), [pendingCount, setPendingCount] = useState(0), [messageCount, setMessageCount] = useState(0), [notice, setNotice] = useState();
  const previousPending = useRef(), previousMessages = useRef();
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat("en-LK", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        if (!active) return;
        const before = previousPending.current;
        setPendingCount(data.pending || 0); setMessageCount(data.unreadMessages || 0);
        if (before !== undefined && data.pending > before) {
          const added = data.pending - before;
          setNotice(`${added} new booking request${added === 1 ? "" : "s"} received`);
        }
        if (previousMessages.current !== undefined && data.unreadMessages > previousMessages.current) { const added = data.unreadMessages - previousMessages.current; setNotice(`${added} new contact message${added === 1 ? "" : "s"} received`); }
        previousPending.current = data.pending || 0; previousMessages.current = data.unreadMessages || 0;
      } catch {}
    };
    refresh();
    const timer = setInterval(refresh, 20000);
    const visible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", visible); window.addEventListener("admin-counts-refresh", refresh);
    return () => { active = false; clearInterval(timer); document.removeEventListener("visibilitychange", visible); window.removeEventListener("admin-counts-refresh", refresh); };
  }, []);
  return <div className="admin-shell admin-shell-modern">
    {notice && <Toast message={notice} onClose={() => setNotice()}/>}
    <AdminSidebar open={open} close={() => setOpen(false)} pendingCount={pendingCount} messageCount={messageCount}/>
    {open && <div className="drawer-shade" onClick={() => setOpen(false)}/>}
    <main className="admin-main">
      <header className="admin-header admin-header-modern">
        <div className="admin-header-left"><button className="icon-btn mobile-only" aria-label="Open navigation" onClick={() => setOpen(true)}><i className="fa-solid fa-bars"/></button><div><strong>Workshop operations</strong><small>{today}</small></div></div>
        <div className="admin-header-actions"><Link to="/admin/bookings?status=Pending" className="header-booking-alert" title={`${pendingCount} pending bookings`}><i className="fa-regular fa-bell"/>{pendingCount > 0 && <span>{pendingCount > 99 ? "99+" : pendingCount}</span>}</Link><Link to="/" target="_blank" className="view-site"><i className="fa-solid fa-arrow-up-right-from-square"/> View website</Link><Link to="/admin/settings" className="header-profile"><div className="avatar">{user?.fullName?.[0]?.toUpperCase() || "A"}</div><span><strong>{user?.fullName || user?.username}</strong><small>{user?.role}</small></span></Link></div>
      </header><Outlet/>
    </main>
  </div>;
}
