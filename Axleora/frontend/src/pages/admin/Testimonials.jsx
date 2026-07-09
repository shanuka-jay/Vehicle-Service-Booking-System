import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";

const blank = { customerName: "", vehicleLabel: "", quote: "", rating: 5, sortOrder: 0, isFeatured: true, isActive: true };
const messageFor = error => error.response?.data?.message || "The request could not be completed";

export default function Testimonials() {
  const [items, setItems] = useState([]), [form, setForm] = useState(blank), [editing, setEditing] = useState(), [remove, setRemove] = useState(), [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [toast, setToast] = useState();
  const load = () => api.get("/testimonials").then(({ data }) => setItems(data)).catch(error => setToast({ type: "error", message: messageFor(error) }));
  useEffect(() => { load(); }, []);
  const open = item => { setEditing(item || {}); setForm(item ? { ...item, vehicleLabel: item.vehicleLabel || "" } : blank); setErrors({}); };
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const save = async event => {
    event.preventDefault();
    const local = {};
    if (form.customerName.trim().length < 2) local.customerName = "Enter the customer’s name (at least 2 characters).";
    if (form.quote.trim().length < 20) local.quote = "Add a useful testimonial of at least 20 characters.";
    if (form.quote.trim().length > 600) local.quote = "Keep the testimonial under 600 characters.";
    if (Object.keys(local).length) return setErrors(local);
    setBusy(true); setErrors({});
    try {
      editing.id ? await api.put(`/testimonials/${editing.id}`, form) : await api.post("/testimonials", form);
      setToast({ type: "success", message: editing.id ? "Testimonial updated" : "Testimonial published" });
      setEditing(); await load();
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setToast({ type: "error", message: messageFor(error) });
    } finally { setBusy(false); }
  };
  const confirmDelete = async () => {
    try { await api.delete(`/testimonials/${remove.id}`); setToast({ type: "success", message: "Testimonial deleted" }); setRemove(); await load(); }
    catch (error) { setToast({ type: "error", message: messageFor(error) }); setRemove(); }
  };
  const fieldError = key => errors[key] && <small className="field-error">{Array.isArray(errors[key]) ? errors[key][0] : errors[key]}</small>;

  return <div className="admin-content testimonials-admin">
    {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast()}/>}
    <div className="admin-title"><div><span className="kicker">TRUST CONTENT</span><h1>Testimonials</h1><p>Publish genuine customer feedback on the home page. Hidden items stay saved in admin.</p></div><button className="btn" onClick={() => open()}><i className="fa-solid fa-plus"/> Add testimonial</button></div>
    {items.length ? <div className="testimonial-admin-grid">{items.map(item => <article className="admin-panel testimonial-admin-card" key={item.id}>
      <div className="testimonial-admin-top"><div className="testimonial-stars">{Array.from({ length: 5 }, (_, index) => <i key={index} className={`${index < item.rating ? "fa-solid" : "fa-regular"} fa-star`}/>)}</div><span className={`badge ${item.isActive ? "completed" : "rejected"}`}>{item.isActive ? "Published" : "Hidden"}</span></div>
      <blockquote>“{item.quote}”</blockquote><strong>{item.customerName}</strong><small>{item.vehicleLabel || "Vehicle not specified"}</small>
      <div className="card-actions"><button onClick={() => open(item)}><i className="fa-solid fa-pen"/> Edit</button><button className="red" onClick={() => setRemove(item)}><i className="fa-solid fa-trash"/> Delete</button></div>
    </article>)}</div> : <div className="admin-panel empty-state"><i className="fa-regular fa-comments"/><h3>No testimonials yet</h3><p>Add verified feedback when a customer gives permission to publish it.</p></div>}
    {editing && <div className="modal-backdrop"><form className="modal testimonial-modal" onSubmit={save} noValidate>
      <button type="button" className="modal-close" onClick={() => setEditing()} aria-label="Close"><i className="fa-solid fa-xmark"/></button><span className="kicker">CUSTOMER FEEDBACK</span><h2>{editing.id ? "Edit testimonial" : "Add testimonial"}</h2>
      <div className="form-grid"><label>Customer name *<input value={form.customerName} maxLength="80" aria-invalid={!!errors.customerName} onChange={e => change("customerName", e.target.value)}/>{fieldError("customerName")}</label><label>Vehicle / service<input value={form.vehicleLabel} maxLength="100" placeholder="e.g. Toyota Aqua · Full Service" onChange={e => change("vehicleLabel", e.target.value)}/>{fieldError("vehicleLabel")}</label>
      <label className="wide">Testimonial *<textarea rows="6" value={form.quote} maxLength="600" aria-invalid={!!errors.quote} onChange={e => change("quote", e.target.value)}/><span className="field-hint">{form.quote.length}/600 characters</span>{fieldError("quote")}</label>
      <label>Rating<select value={form.rating} onChange={e => change("rating", Number(e.target.value))}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select>{fieldError("rating")}</label><label>Display order<input type="number" min="0" max="999" value={form.sortOrder} onChange={e => change("sortOrder", Number(e.target.value))}/>{fieldError("sortOrder")}</label></div>
      <div className="form-grid toggle-grid"><label className="check-line"><input type="checkbox" checked={form.isFeatured} onChange={e => change("isFeatured", e.target.checked)}/> Feature on home page</label><label className="check-line"><input type="checkbox" checked={form.isActive} onChange={e => change("isActive", e.target.checked)}/> Published</label></div>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setEditing()}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Saving…" : "Save testimonial"}</button></div>
    </form></div>}
    {remove && <ConfirmModal title="Delete testimonial?" message={`Remove the feedback from ${remove.customerName}? This cannot be undone.`} danger confirmText="Delete" onClose={() => setRemove()} onConfirm={confirmDelete}/>}
  </div>;
}
