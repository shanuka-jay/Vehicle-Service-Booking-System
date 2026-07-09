import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import ServiceCard from "../components/ServiceCard";
import FAQAccordion from "../components/FAQAccordion";
import SymptomFinder from "../components/SymptomFinder";
import TestimonialsSection from "../components/TestimonialsSection";
import { useSite } from "../context/SiteContext";

const faqs = [
  { question: "How early should I request a workshop time?", answer: "Earlier is better for planned maintenance. Choose your preferred date and time online; the workshop will review capacity before approving it." },
  { question: "Can I book if I am not sure what is wrong?", answer: "Yes. Select the closest service, describe the symptoms and attach a clear photo if it helps. The technician can confirm the right next step after inspection." },
  { question: "Will I know if the requested time is accepted?", answer: "Yes. Keep the AX reference from your confirmation and use Booking Status to see whether the request is pending, approved, completed or rejected." },
  { question: "Why are service prices shown as ranges?", answer: "Vehicle models, parts and the condition found during inspection can change the final amount. Ranges help you plan before the workshop confirms the required work." }
];

const visitReasons = [
  ["calendar-check", "Planned maintenance", "Oil, filters, fluids and scheduled checks before a long journey or service interval."],
  ["triangle-exclamation", "Something changed", "A warning light, sound, vibration or performance issue that needs a proper starting point."],
  ["shield-halved", "Safety concern", "Brakes, steering, tyres or battery behaviour that should be inspected before it worsens."]
];

export default function Home() {
  const { site } = useSite();
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/services/public").then(({ data }) => setServices(data)).catch(() => setError("The service catalogue is temporarily unavailable.")); }, []);
  const preferred = ["Full Service", "Engine Diagnosis", "Brake Inspection"];
  const cards = preferred.map(name => services.find(item => item.name === name)).filter(Boolean);
  const featured = cards.length === 3 ? cards : services.slice(0, 3);

  return <main className="home-modern public-consistent">
    <section className="workshop-hero">
      <div className="container workshop-hero-grid">
        <div className="workshop-hero-copy">
          <span className="eyebrow">{site.homeEyebrow || "VEHICLE SERVICE · COLOMBO 03"}</span>
          <h1>{site.homeTitle || "Take care of the car that takes care of your day."}</h1>
          <p>{site.homeIntro || "From routine maintenance to unfamiliar warning lights, start with clear service information and a workshop time that fits your week."}</p>
          <div className="hero-actions"><Link className="btn" to="/booking">Book a workshop visit <i className="fa-solid fa-arrow-right"/></Link><a className="phone-link" href={`tel:${(site.phone || "+94 11 234 5678").replace(/\s/g, "")}`}><i className="fa-solid fa-phone"/> {site.phone || "+94 11 234 5678"}</a></div>
          <div className="opening-note"><span className="open-dot"/><strong>Workshop hours</strong><span>{site.openingHours || "Monday–Saturday · 8:00 AM–6:00 PM"}</span></div>
        </div>
        <div className="workshop-hero-media">
          <img src="/images/hero.jpg" alt="Vehicle inside the Axleora workshop"/>
          <div className="hero-service-note"><i className="fa-solid fa-screwdriver-wrench"/><div><small>NOT SURE WHAT TO BOOK?</small><strong>Tell us what the vehicle is doing.</strong><Link to="#vehicle-concerns">Find a starting point <i className="fa-solid fa-arrow-down"/></Link></div></div>
        </div>
      </div>
      <div className="container service-shortcuts">
        {visitReasons.map(([icon, title, text]) => <article key={title}><i className={`fa-solid fa-${icon}`}/><div><strong>{title}</strong><p>{text}</p></div></article>)}
      </div>
    </section>

    <section className="section service-showcase"><div className="container">
      <div className="editorial-heading"><div><span className="kicker">POPULAR WORKSHOP VISITS</span><h2>Care for the miles behind you—and the road ahead.</h2></div><div><p>Browse what each service includes, the typical workshop time and an indicative price range.</p><Link to="/services">Explore every service <i className="fa-solid fa-arrow-right"/></Link></div></div>
      {error && <div className="alert error">{error}</div>}
      <div className="service-grid">{featured.length ? featured.map(service => <ServiceCard key={service.id} service={service}/>) : <div className="loading-block">Loading workshop services…</div>}</div>
    </div></section>

    <section className="section concern-section" id="vehicle-concerns"><div className="container">
      <div className="concern-intro"><span className="kicker">START WITH WHAT YOU NOTICE</span><h2>You do not need to diagnose the vehicle yourself.</h2><p>Choose the closest concern. This is guidance—not a remote diagnosis—and the workshop can confirm the right work after inspection.</p></div>
      <SymptomFinder/>
    </div></section>

    <section className="section workshop-story"><div className="container story-grid">
      <div className="story-collage">
        <img className="story-main" src="/images/full-service.jpg" alt="Technician completing a full vehicle service"/>
        <img className="story-small" src="/images/engine-diagnosis.jpg" alt="Engine diagnostic work"/>
        <div className="story-caption"><span>MON–SAT</span><strong>Workshop care built around real appointment capacity.</strong></div>
      </div>
      <div className="story-copy"><span className="kicker">BEFORE THE KEYS CHANGE HANDS</span><h2>A calmer way to prepare for a workshop visit.</h2><p>Good service starts before the vehicle reaches a ramp. Share the model, the symptoms and your preferred time so the workshop can prepare and respond honestly.</p>
        <ul className="care-principles">
          <li><i className="fa-solid fa-check"/><span><strong>Useful context first</strong>Notes and photos help preserve the details you noticed.</span></li>
          <li><i className="fa-solid fa-check"/><span><strong>Capacity checked by people</strong>The team reviews the requested time before confirming it.</span></li>
          <li><i className="fa-solid fa-check"/><span><strong>A reference you can keep</strong>Check progress later without starting the conversation again.</span></li>
        </ul>
        <Link className="text-link" to="/booking">Prepare your visit <i className="fa-solid fa-arrow-right"/></Link>
      </div>
    </div></section>

    <section className="section road-ready"><div className="container road-grid">
      <div><span className="kicker">BUILT FOR LOCAL DRIVING</span><h2>Heat, traffic and rain ask more from a vehicle.</h2><p>Frequent short trips, stop-start traffic and heavy rain can expose batteries, brakes, tyres and cooling systems sooner than expected.</p></div>
      <div className="road-checklist">
        {[["temperature-high","Cooling and fluid levels"],["car-battery","Battery and charging health"],["cloud-showers-heavy","Wipers, tyres and wet-weather grip"],["car-on","Brakes, steering and warning lights"]].map(([icon,text])=><span key={text}><i className={`fa-solid fa-${icon}`}/>{text}</span>)}
      </div>
    </div></section>

    <section className="section visit-flow"><div className="container">
      <div className="center-heading"><span className="kicker">YOUR NEXT VISIT</span><h2>Simple to request. Properly reviewed.</h2><p>Online convenience without pretending every workshop slot is automatically available.</p></div>
      <div className="visit-steps">
        <article><span>01</span><h3>Choose and describe</h3><p>Select the closest service, add vehicle details and explain anything unusual.</p></article>
        <article><span>02</span><h3>The workshop reviews</h3><p>The team checks the service and capacity, then approves or responds to the request.</p></article>
        <article><span>03</span><h3>Arrive with clarity</h3><p>Bring the vehicle at the approved time and follow the reference through completion.</p></article>
      </div>
    </div></section>

    <TestimonialsSection/>

    <section className="section faq-section"><div className="container faq-layout"><div><span className="kicker">BEFORE YOU BOOK</span><h2>Questions drivers usually ask.</h2><p>A few practical answers before you choose a service or workshop time.</p><Link className="text-link" to="/contact">Ask the workshop <i className="fa-solid fa-arrow-right"/></Link></div><FAQAccordion items={faqs}/></div></section>
  </main>;
}


