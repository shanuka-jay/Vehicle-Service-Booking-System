import { Link } from "react-router-dom";

export default function Footer() {
  return <footer>
    <div className="container footer-intro"><div><span className="kicker">YOUR NEXT SERVICE</span><h2>Plan it before it becomes urgent.</h2></div><Link className="btn" to="/booking">Request a workshop slot</Link></div>
    <div className="container footer-grid expanded">
      <div><div className="brand light"><span><i className="fa-solid fa-car-side"/></span>Axle<span>ora</span></div><p>A practical digital front desk for vehicle servicing: clear service information, organized appointment requests and status tracking from one place.</p><a className="footer-phone" href="tel:+94112345678">+94 11 234 5678</a></div>
      <div><h4>Customer</h4><Link to="/services">Explore services</Link><Link to="/booking">Request a booking</Link><Link to="/status">Track booking status</Link><Link to="/contact">Send an enquiry</Link></div>
      <div><h4>Popular services</h4><Link to="/booking">Full service</Link><Link to="/booking">Engine diagnosis</Link><Link to="/booking">Brake inspection</Link><Link to="/booking">Oil change</Link></div>
      <div><h4>Workshop desk</h4><p>124 Galle Road<br/>Colombo 03, Sri Lanka</p><p>Monday–Saturday<br/>8:00 AM–6:00 PM</p><a href="mailto:hello@axleora.lk">hello@axleora.lk</a></div>
    </div>
    <div className="footer-bottom container"><span>© {new Date().getFullYear()} Axleora Service Centre</span><span>Local workshop booking system · <Link to="/admin/login">Staff login</Link></span></div>
  </footer>;
}
