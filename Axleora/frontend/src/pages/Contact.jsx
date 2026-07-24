import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/axios";
import { useSite } from "../context/SiteContext";
import FAQAccordion from "../components/FAQAccordion";
import EditorialPageHero from "../components/EditorialPageHero";

const initial={name:"",phone:"",email:"",subject:"",message:""};
const phonePattern=/^[+()0-9][+()0-9\s.-]{7,29}$/;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const faqs=[{question:"Can the workshop confirm a price by message?",answer:"Catalogue prices are guidance. A reliable final amount may require vehicle details or inspection."},{question:"Should I use this form for an urgent safety problem?",answer:"For a vehicle that may be unsafe to drive, call the workshop and avoid driving until you receive professional guidance."},{question:"Where can I ask about an existing booking?",answer:"Use Booking Status first. If the workshop note does not answer the question, include your AX reference in the message."}];

export default function Contact(){
  const{site}=useSite();
  const[form,setForm]=useState(initial),[errors,setErrors]=useState({}),[busy,setBusy]=useState(false);
  const phone=site.phone||"+94 11 234 5678",email=site.email||"hello@axleora.lk",address=site.address||"124 Galle Road, Colombo 03",hours=site.openingHours||"Monday–Saturday · 8:00 AM–6:00 PM",map=site.mapQuery||address;
  const fieldError=key=>errors[key]&&<small className="field-error">{Array.isArray(errors[key])?errors[key][0]:errors[key]}</small>;
  const change=(key,value)=>{setForm(current=>({...current,[key]:value}));setErrors(current=>({...current,[key]:undefined}))};
  const validate=()=>{
    const next={};
    if(form.name.trim().length<2)next.name="Enter your name using at least 2 characters.";
    if(form.phone.trim()&&!phonePattern.test(form.phone.trim()))next.phone="Enter a valid phone number or leave this blank.";
    if(!emailPattern.test(form.email.trim()))next.email="Enter a valid email address.";
    if(form.subject.trim().length<3)next.subject="Enter a subject using at least 3 characters.";
    if(form.message.trim().length<10)next.message="Explain your question using at least 10 characters.";
    else if(form.message.trim().length>2000)next.message="Keep the message under 2,000 characters.";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const submit=async event=>{
    event.preventDefault();
    if(!validate()){toast.error("Please correct the highlighted contact details.",{toastId:"contact-validation"});return}
    setBusy(true);
    try{
      const payload=Object.fromEntries(Object.entries(form).map(([key,value])=>[key,value.trim()]));
      const{data}=await api.post("/contact",payload);
      toast.success(data.message||"Message sent successfully.");
      setForm(initial);setErrors({});
    }catch(error){
      setErrors(error.response?.data?.errors||{});
      toast.error(error.response?.data?.message||"Could not send your message. Please try again.",{toastId:"contact-submit"});
    }finally{setBusy(false)}
  };
  return <main className="contact-modern public-consistent">
    <EditorialPageHero className="editorial-contact-hero" breadcrumbs={[{label:"Home",to:"/"},{label:"Contact"}]} kicker="WORKSHOP CONTACT" title={site.contactTitle||"Talk to the workshop before you make the trip."} description={site.contactIntro||"Ask about a service, follow up on a booking or explain a concern."} image="/images/engine-diagnosis.jpg" alt="Technician diagnosing a vehicle" noteIcon="clock" noteTitle="Workshop hours" noteText={hours}>
      <a className="contact-phone" href={`tel:${phone.replace(/\s/g,"")}`}><i className="fa-solid fa-phone"/><span><small>WORKSHOP DESK</small><strong>{phone}</strong></span></a>
    </EditorialPageHero>
    <section className="contact-methods contact-methods-light"><div className="container method-grid"><a href={`mailto:${email}`}><span><i className="fa-solid fa-envelope"/></span><div><small>EMAIL</small><strong>{email}</strong><p>For non-urgent questions.</p></div></a><div><span><i className="fa-solid fa-location-dot"/></span><div><small>VISIT</small><strong>{address}</strong><p>Bring your approved reference.</p></div></div><Link to="/status"><span><i className="fa-solid fa-magnifying-glass"/></span><div><small>TRACK</small><strong>Check booking status</strong><p>For an existing request.</p></div></Link></div></section>
    <section className="section"><div className="container contact-workspace"><div className="visit-panel"><span className="kicker">FIND THE WORKSHOP</span><h2>Plan your visit.</h2><p>{hours}. Online requests can be sent at any time.</p><div className="google-map-card"><iframe title="Axleora workshop location" src={`https://www.google.com/maps?q=${encodeURIComponent(map)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><div><i className="fa-solid fa-location-dot"/><span><strong>{address}</strong><small>Open in Google Maps for directions</small></span><a href={`https://maps.google.com/?q=${encodeURIComponent(map)}`} target="_blank" rel="noreferrer"><i className="fa-solid fa-arrow-up-right-from-square"/></a></div></div></div>
      <form className="form-card contact-form-rich" onSubmit={submit} noValidate><span className="kicker">SEND A MESSAGE</span><h2>What can we help with?</h2><p>Include the AX reference for an existing booking.</p><div className="form-grid">
        <label>Name *<input value={form.name} maxLength="80" aria-invalid={!!errors.name} onChange={e=>change("name",e.target.value)}/>{fieldError("name")}</label>
        <label>Phone<input value={form.phone} maxLength="30" inputMode="tel" placeholder="077 123 4567" aria-invalid={!!errors.phone} onChange={e=>change("phone",e.target.value)}/>{fieldError("phone")}</label>
        <label className="wide">Email *<input type="email" value={form.email} maxLength="120" aria-invalid={!!errors.email} onChange={e=>change("email",e.target.value)}/>{fieldError("email")}</label>
        <label className="wide">Subject *<input value={form.subject} maxLength="120" aria-invalid={!!errors.subject} onChange={e=>change("subject",e.target.value)}/>{fieldError("subject")}</label>
        <label className="wide">Message *<textarea rows="6" value={form.message} maxLength="2000" aria-invalid={!!errors.message} onChange={e=>change("message",e.target.value)}/><span className="field-hint">{form.message.length}/2000 characters</span>{fieldError("message")}</label>
      </div><button className="btn full" disabled={busy}>{busy?<><span className="spinner small"/> Sending…</>:"Send message"}</button></form>
    </div></section>
    <section className="section contact-faq"><div className="container faq-layout"><div><span className="kicker">CONTACT GUIDANCE</span><h2>Choose the quickest route.</h2><p>Track status online, message for detail, or call for time-sensitive workshop guidance.</p></div><FAQAccordion items={faqs}/></div></section>
  </main>
}
