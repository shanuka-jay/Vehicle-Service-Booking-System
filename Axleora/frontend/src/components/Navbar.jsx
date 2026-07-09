import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = [["Home","/"],["Services","/services"],["Book Service","/booking"],["Booking Status","/status"],["Contact","/contact"]];

  return <>
    <div className="utility-bar"><div className="container utility-wrap">
      <div><span><i className="fa-regular fa-clock"/> Mon–Sat, 8:00 AM–6:00 PM</span><span className="utility-location"><i className="fa-solid fa-location-dot"/> Colombo 03</span></div>
      <div><Link to="/status"><i className="fa-solid fa-magnifying-glass"/> Track a booking</Link><a href="tel:+94112345678"><i className="fa-solid fa-phone"/> +94 11 234 5678</a></div>
    </div></div>
    <header className="site-header"><div className="container nav-wrap">
      <Link className="brand" to="/" onClick={close}><span><i className="fa-solid fa-car-side"/></span>Axle<span>ora</span></Link>
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}><i className={`fa-solid fa-${open ? "xmark" : "bars"}`}/></button>
      <nav className={open ? "nav open" : "nav"}>{links.map(([label,to]) =>
        <NavLink key={label} onClick={close} to={to} end={to === "/"}>{label}</NavLink>)}
        <Link className="btn btn-sm" to="/booking" onClick={close}>Book now <i className="fa-solid fa-arrow-right"/></Link>
      </nav>
    </div></header>
  </>;
}
