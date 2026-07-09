import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/axios";
import { getColomboDate } from "../utils/date";
import EditorialPageHero from "../components/EditorialPageHero";

const initial = { customerName: "", phone: "", email: "", vehicleNumber: "", vehicleType: "Car", vehicleModel: "", serviceCategoryId: "", preferredDate: "", preferredTime: "", notes: "" };
const phonePattern = /^[+()0-9][+()0-9\s.-]{7,24}$/;

export default function Booking() {
  const [params] = useSearchParams();
  const [services, setServices] = useState([]), [form, setForm] = useState(initial), [photo, setPhoto] = useState(), [busy, setBusy] = useState(false), [errors, setErrors] = useState({}), [result, setResult] = useState(null);
  useEffect(() => {
    api.get("/services/public").then(({ data }) => {
      setServices(data);
      const requested = params.get("service");
      setForm(value => ({ ...value, serviceCategoryId: data.some(service => String(service.id) === requested) ? requested : value.serviceCategoryId }));
    }).catch(() => toast.error("Services could not be loaded. Refresh the page and try again.",{toastId:"booking-services"}));
  }, [params]);
  const minDate = getColomboDate();
  const fieldError = key => errors[key] && <small className="field-error">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</small>;
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const validate = () => {
    const next = {};
    if (form.customerName.trim().length < 2) next.customerName = "Enter your full name (at least 2 characters).";
    if (!phonePattern.test(form.phone.trim())) next.phone = "Enter a valid phone number, for example 077 123 4567.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address or leave this blank.";
    if (form.vehicleNumber.trim().length < 3) next.vehicleNumber = "Enter the vehicle registration number.";
    if (!form.serviceCategoryId) next.serviceCategoryId = "Choose the service you need.";
    if (!form.preferredDate) next.preferredDate = "Choose a preferred date.";
    else if (form.preferredDate < minDate) next.preferredDate = "Choose today or a future date.";
    if (!form.preferredTime) next.preferredTime = "Choose a preferred workshop time.";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const submit = async event => {
    event.preventDefault();
    if (!validate()) { toast.error("Please correct the highlighted booking details.",{toastId:"booking-validation"}); return; }
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, typeof value === "string" ? value.trim() : value));
      if (photo) body.append("photo", photo);
      const { data } = await api.post("/bookings", body);
      toast.success("Booking request submitted successfully."); setResult(data); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      toast.error(err.response?.data?.message || "Could not submit booking. Please try again.",{toastId:"booking-submit"});
    } finally { setBusy(false); }
  };
  const choosePhoto = file => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setErrors(current => ({ ...current, photo: "Use a JPG, PNG or WebP image." })); toast.error("Use a JPG, PNG or WebP image.",{toastId:"booking-photo"}); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(current => ({ ...current, photo: "Image must be 5MB or smaller." })); toast.error("Image must be 5MB or smaller.",{toastId:"booking-photo"}); return; }
    setErrors(current => ({ ...current, photo: undefined })); setPhoto(file);
  };
  if (result) return <main className="section"><div className="container narrow"><div className="success-card"><div className="success-icon"><i className="fa-solid fa-check"/></div><span className="kicker">REQUEST RECEIVED</span><h1>Your workshop request is in.</h1><p>Keep this reference while the team checks the service and requested time.</p><div className="reference">{result.referenceNo}</div><div className="summary-row"><span>Service<strong>{result.serviceCategory.name}</strong></span><span>Preferred time<strong>{result.preferredDate} · {result.preferredTime}</strong></span></div><Link className="btn" to={`/status?reference=${result.referenceNo}`}>Track this request</Link></div></div></main>;

  return <main className="booking-modern public-consistent">
    <EditorialPageHero className="editorial-booking-hero" breadcrumbs={[{label:"Home",to:"/"},{label:"Book a service"}]} kicker="WORKSHOP REQUEST" title="Tell us about the vehicle." description="Choose a preferred time and give the team enough context to prepare. The appointment is confirmed after workshop review." image="/images/full-service.jpg" alt="Vehicle receiving workshop service" noteIcon="calendar-check" noteTitle="Preferred time, properly reviewed" noteText="The workshop confirms capacity before approval">
      <div className="booking-progress"><span className="active"><b>1</b>Your details</span><i className="fa-solid fa-chevron-right"/><span><b>2</b>Workshop review</span><i className="fa-solid fa-chevron-right"/><span><b>3</b>Approval</span></div>
    </EditorialPageHero>
    <section className="booking-form-section"><div className="container booking-layout"><form className="form-card booking-form-modern" onSubmit={submit} noValidate>
      <div className="form-title"><span>1</span><div><h3>Contact details</h3><p>Who the workshop should contact about this request.</p></div></div>
      <div className="form-grid"><label>Full name *<input value={form.customerName} maxLength="80" aria-invalid={!!errors.customerName} onChange={e => change("customerName", e.target.value)}/>{fieldError("customerName")}</label><label>Phone number *<input value={form.phone} maxLength="25" inputMode="tel" placeholder="+94 77 123 4567" aria-invalid={!!errors.phone} onChange={e => change("phone", e.target.value)}/>{fieldError("phone")}</label><label className="wide">Email (optional)<input type="email" value={form.email} maxLength="120" aria-invalid={!!errors.email} onChange={e => change("email", e.target.value)}/>{fieldError("email")}</label></div>
      <div className="form-title"><span>2</span><div><h3>Vehicle and service</h3><p>What you are bringing in and the closest service match.</p></div></div>
      <div className="form-grid"><label>Vehicle number *<input value={form.vehicleNumber} maxLength="20" placeholder="CAA-1234" aria-invalid={!!errors.vehicleNumber} onChange={e => change("vehicleNumber", e.target.value.toUpperCase())}/>{fieldError("vehicleNumber")}</label><label>Vehicle type *<select value={form.vehicleType} onChange={e => change("vehicleType", e.target.value)}><option>Car</option><option>SUV</option><option>Van</option><option>Pickup</option><option>Motorcycle</option><option>Other</option></select></label><label>Brand / model<input value={form.vehicleModel} maxLength="80" placeholder="Toyota Aqua 2018" onChange={e => change("vehicleModel", e.target.value)}/>{fieldError("vehicleModel")}</label><label>Service required *<select value={form.serviceCategoryId} aria-invalid={!!errors.serviceCategoryId} onChange={e => change("serviceCategoryId", e.target.value)}><option value="">Select a service</option>{services.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select>{fieldError("serviceCategoryId")}</label></div>
      <div className="form-title"><span>3</span><div><h3>Preferred workshop time</h3><p>The team will confirm availability after review.</p></div></div>
      <div className="form-grid"><label>Preferred date *<input type="date" min={minDate} value={form.preferredDate} aria-invalid={!!errors.preferredDate} onInput={e => change("preferredDate", e.currentTarget.value)} onChange={e => change("preferredDate", e.target.value)}/>{fieldError("preferredDate")}</label><label>Preferred time *<select value={form.preferredTime} aria-invalid={!!errors.preferredTime} onChange={e => change("preferredTime", e.target.value)}><option value="">Choose a time</option>{["08:00 AM", "09:30 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"].map(time => <option key={time}>{time}</option>)}</select>{fieldError("preferredTime")}</label><label className="wide">What should the technician know?<textarea rows="4" maxLength="1000" value={form.notes} placeholder="When did it start? What do you hear, feel or see?" onChange={e => change("notes", e.target.value)}/>{fieldError("notes")}</label><label className="wide upload-box"><i className="fa-solid fa-camera"/><span>{photo ? photo.name : "Add a clear photo if it helps (optional)"}</span><small>JPG, PNG or WebP · maximum 5MB</small><input hidden type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => choosePhoto(e.target.files[0])}/></label>{fieldError("photo")}</div>
      <button className="btn full" disabled={busy}>{busy ? <><span className="spinner small"/> Sending…</> : <>Send workshop request <i className="fa-solid fa-arrow-right"/></>}</button>
    </form>
    <aside className="booking-aside booking-aside-modern"><div className="booking-photo"><img src="/images/full-service.jpg" alt="Vehicle service in progress"/></div><div><span className="kicker">WHAT HAPPENS NEXT</span><ol><li><span>1</span>The team reviews your service and preferred time</li><li><span>2</span>The request becomes approved or receives a response</li><li><span>3</span>Use the AX reference to check the latest status</li></ol></div><div className="help-card"><small>NEED TO SPEAK WITH THE DESK?</small><strong>+94 11 234 5678</strong><span>Monday–Saturday · 8:00 AM–6:00 PM</span></div></aside>
    </div></section>
  </main>;
}
