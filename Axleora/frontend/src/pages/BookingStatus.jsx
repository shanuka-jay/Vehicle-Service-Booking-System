import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import EditorialPageHero from "../components/EditorialPageHero";

const stages = [
  ["Pending", "hourglass-half", "Waiting for review", "The workshop has received the request."],
  ["Approved", "circle-check", "Workshop time approved", "Arrive at the confirmed date and time."],
  ["Completed", "flag-checkered", "Service completed", "The workshop workflow is closed."],
  ["Rejected", "circle-xmark", "Request not accepted", "Read the workshop note or contact the desk."]
];

export default function BookingStatus() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState("referenceNo");
  const [query, setQuery] = useState(params.get("reference") || "");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const search = async event => {
    event?.preventDefault(); setBusy(true); setError(""); setItems([]);
    try { const { data } = await api.get("/bookings/status/search", { params: { [mode]: query } }); setItems(data); }
    catch (err) { setError(err.response?.data?.message || "Search failed"); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (params.get("reference")) search(); }, []);

  return <main className="status-modern public-consistent">
    <EditorialPageHero className="editorial-status-hero" breadcrumbs={[{label:"Home",to:"/"},{label:"Booking status"}]} kicker="YOUR WORKSHOP REQUEST" title="Check where things stand." description="Use the AX reference from your confirmation—or the same phone number used when booking—to see the latest workshop update." image="/images/engine-diagnosis.jpg" alt="Workshop technician reviewing vehicle information" noteIcon="receipt" noteTitle="Keep your AX reference" noteText="Use it anytime to view the latest workshop update"/>
    <section className="tracker-search-zone"><div className="container">
      <form className="status-search tracker-search-card" onSubmit={search}>
        <div className="tracker-form-copy"><small>FIND A BOOKING</small><strong>Enter the details from your confirmation.</strong></div>
        <div className="tracker-controls"><div className="tabs"><button type="button" className={mode === "referenceNo" ? "active" : ""} onClick={() => setMode("referenceNo")}>Reference number</button><button type="button" className={mode === "phone" ? "active" : ""} onClick={() => setMode("phone")}>Phone number</button></div><div className="search-line"><i className="fa-solid fa-magnifying-glass"/><input required value={query} onChange={e => setQuery(e.target.value)} placeholder={mode === "referenceNo" ? "AX-260702-A1B2C3" : "+94 77 123 4567"}/><button className="btn" disabled={busy}>{busy ? "Searching…" : "Check status"}</button></div></div>
      </form>
    </div></section>
    <section className="status-results"><div className="container status-layout"><div>
      {error && <div className="empty-state search-empty"><i className="fa-regular fa-folder-open"/><h3>We could not find that booking</h3><p>{error}. Check the details and try again.</p></div>}
      <div className="result-list">{items.map(booking => <article className="status-card status-card-modern" key={booking.id}><div className="status-top"><div><small>BOOKING REFERENCE</small><h3>{booking.referenceNo}</h3></div><span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span></div><div className="progress-track"><span className={["Pending", "Approved", "Completed"].includes(booking.status) ? "done" : ""}>Requested</span><span className={["Approved", "Completed"].includes(booking.status) ? "done" : ""}>Approved</span><span className={booking.status === "Completed" ? "done" : ""}>Completed</span></div><div className="detail-grid"><div><small>Customer</small><strong>{booking.customerName}</strong></div><div><small>Vehicle</small><strong>{booking.vehicleNumber} · {booking.vehicleType}</strong></div><div><small>Service</small><strong>{booking.serviceCategory.name}</strong></div><div><small>Preferred slot</small><strong>{booking.preferredDate} · {booking.preferredTime}</strong></div></div>{booking.adminRemark && <div className="remark"><i className="fa-regular fa-message"/> {booking.adminRemark}</div>}</article>)}</div>
      {!items.length && !error && <div className="tracker-placeholder"><i className="fa-solid fa-receipt"/><h2>Your result will appear here.</h2><p>Booking details are shown only after a matching reference or phone number is entered.</p></div>}
    </div><aside className="tracker-help"><span className="feature-icon"><i className="fa-solid fa-headset"/></span><h3>Need a human answer?</h3><p>If the booking note does not answer your question, contact the workshop and include the AX reference.</p><a href="tel:+94112345678">+94 11 234 5678</a><Link to="/contact">Send an enquiry <i className="fa-solid fa-arrow-right"/></Link></aside></div></section>
    <section className="section status-meaning"><div className="container"><div className="editorial-heading"><div><span className="kicker">STATUS GUIDE</span><h2>What the workshop update means.</h2></div><p>No guesswork: each status reflects a specific point in the appointment workflow.</p></div><div className="status-guide">{stages.map(([status, icon, title, text]) => <article key={status}><span className={`status-guide-icon ${status.toLowerCase()}`}><i className={`fa-solid fa-${icon}`}/></span><small>{status}</small><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
  </main>;
}

