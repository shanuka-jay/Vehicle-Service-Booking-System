import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const links = [["/admin","gauge-high","Overview"],["/admin/bookings","calendar-check","Bookings"],["/admin/services","screwdriver-wrench","Services & categories"],["/admin/testimonials","comments","Testimonials"],["/admin/messages","envelope","Messages"],["/admin/gallery","images","Gallery"],["/admin/website","window-maximize","Website","OWNER"],["/admin/users","users-gear","Team","OWNER"],["/admin/settings","user-gear","My account"]];
export default function AdminSidebar({ open, close, pendingCount = 0, messageCount = 0 }) {
  const { logout, user } = useAuth();
  return <aside className={`admin-sidebar admin-sidebar-modern ${open ? "open" : ""}`}>
    <div className="admin-brand-row"><div className="brand light"><span><i className="fa-solid fa-car-side"/></span>Axle<span>ora</span></div><small>WORKSHOP OS</small></div>
    <nav>{links.filter(([, , , role]) => !role || role === user?.role).map(([to, icon, label]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={close}><i className={`fa-solid fa-${icon}`}/><span>{label}</span>{to === "/admin/bookings" && pendingCount > 0 && <b className="nav-count" aria-label={`${pendingCount} pending bookings`}>{pendingCount > 99 ? "99+" : pendingCount}</b>}{to === "/admin/messages" && messageCount > 0 && <b className="nav-count message" aria-label={`${messageCount} unread messages`}>{messageCount > 99 ? "99+" : messageCount}</b>}</NavLink>)}</nav>
    <div className="sidebar-user"><div className="avatar">{user?.fullName?.[0]?.toUpperCase() || "A"}</div><div><strong>{user?.fullName || user?.username}</strong><small>{user?.role === "OWNER" ? "Owner" : "Workshop staff"}</small></div></div>
    <button className="logout" onClick={logout}><i className="fa-solid fa-arrow-right-from-bracket"/> Sign out</button>
  </aside>;
}
