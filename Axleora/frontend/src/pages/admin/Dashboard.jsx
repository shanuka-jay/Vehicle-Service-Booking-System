import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const statusCards = [
  ["pending", "clock", "Awaiting review", "Needs a workshop decision"],
  ["approved", "circle-check", "Approved", "Scheduled workshop visits"],
  ["completed", "flag-checkered", "Completed", "Finished service records"],
  ["today", "calendar-day", "Today", "Vehicles expected today"]
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/recent-bookings")])
      .then(([statsResult, recentResult]) => { setStats(statsResult.data); setRecent(recentResult.data); })
      .catch(err => setError(err.response?.data?.message || "Dashboard data could not be loaded"));
  }, []);

  return <div className="admin-content dashboard-modern">
    <div className="dashboard-welcome">
      <div><span className="kicker">WORKSHOP OVERVIEW</span><h1>Good day, {user?.fullName?.split(" ")[0] || "team"}.</h1><p>Review what needs attention and keep today&apos;s workshop moving.</p></div>
      <div className="welcome-actions"><Link className="btn ghost" to="/admin/messages"><i className="fa-regular fa-envelope"/> Customer messages</Link><Link className="btn" to="/admin/bookings"><i className="fa-solid fa-calendar-check"/> Manage bookings</Link></div>
    </div>
    {error && <div className="alert error">{error}</div>}
    <section className="ops-grid">
      {statusCards.map(([key, icon, label, detail]) => <Link to={`/admin/bookings?status=${key}`} className={`ops-card ${key}`} key={key}>
        <div className="ops-card-top"><span><i className={`fa-solid fa-${icon}`}/></span><i className="fa-solid fa-arrow-up-right-from-square"/></div>
        <strong>{stats[key] ?? "—"}</strong><h3>{label}</h3><p>{detail}</p>
      </Link>)}
    </section>
    <section className="dashboard-split">
      <div className="admin-panel">
        <div className="panel-head"><div><h2>Latest booking requests</h2><p>The newest activity across the workshop queue.</p></div><Link to="/admin/bookings">View all <i className="fa-solid fa-arrow-right"/></Link></div>
        <div className="booking-feed">
          {recent.slice(0, 6).map(booking => <article key={booking.id}>
            <div className="feed-icon"><i className="fa-solid fa-car-side"/></div>
            <div className="feed-main"><strong>{booking.customerName}</strong><span>{booking.vehicleNumber} · {booking.serviceCategory.name}</span></div>
            <div className="feed-slot"><strong>{booking.preferredDate}</strong><span>{booking.preferredTime}</span></div>
            <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
          </article>)}
          {!recent.length && !error && <div className="empty-mini">No bookings yet.</div>}
        </div>
      </div>
      <aside className="admin-panel today-panel">
        <div className="panel-head"><div><h2>Quick actions</h2><p>Common workshop tasks.</p></div></div>
        <div className="quick-actions">
          <Link to="/admin/bookings"><i className="fa-solid fa-list-check"/><span><strong>Review pending requests</strong><small>Approve, reject or update status</small></span><i className="fa-solid fa-chevron-right"/></Link>
          <Link to="/admin/services"><i className="fa-solid fa-screwdriver-wrench"/><span><strong>Update service catalogue</strong><small>Pricing, duration and availability</small></span><i className="fa-solid fa-chevron-right"/></Link>
          <Link to="/admin/messages"><i className="fa-solid fa-inbox"/><span><strong>Open customer inbox</strong><small>Read and respond outside the system</small></span><i className="fa-solid fa-chevron-right"/></Link>
          {user?.role === "OWNER" && <Link to="/admin/users"><i className="fa-solid fa-user-plus"/><span><strong>Manage team access</strong><small>Add or disable staff accounts</small></span><i className="fa-solid fa-chevron-right"/></Link>}
        </div>
      </aside>
    </section>
  </div>;
}
