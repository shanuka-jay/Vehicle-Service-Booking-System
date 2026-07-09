import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";

export default function Messages() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState();

  const load = () => {
    setLoading(true);
    api.get("/contact", { params: { status } })
      .then(({ data }) => setItems(data))
      .catch(err => setError(err.response?.data?.message || "Could not load messages"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const openMessage = async item => {
    setSelected(item);
    if (!item.isRead) {
      const { data } = await api.put(`/contact/${item.id}/read`, { isRead: true });
      setItems(current => current.map(x => x.id === item.id ? data : x));
      setSelected(data);
      window.dispatchEvent(new Event("admin-counts-refresh"));
    }
  };

  const deleteMessage = async () => {
    try {
      await api.delete(`/contact/${remove.id}`);
      setItems(current => current.filter(x => x.id !== remove.id));
      setSelected(null);
      setRemove(null);
    } catch (err) {
      setNotice({ type: "error", message: err.response?.data?.message || "Could not delete message" });
      setRemove(null);
    }
  };

  return <div className="admin-content">
    {notice && <Toast type={notice.type} message={notice.message} onClose={() => setNotice()}/>}
    <div className="admin-title">
      <div><span className="kicker">CUSTOMER ENQUIRIES</span><h1>Messages</h1><p>Review and respond to enquiries sent from the public website.</p></div>
      <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter messages">
        <option>All</option><option>Unread</option><option>Read</option>
      </select>
    </div>
    {error && <div className="alert error">{error}</div>}
    <div className="message-list">
      {loading ? <div className="empty-mini">Loading messages…</div> : items.map(item =>
        <button className={`message-row ${item.isRead ? "" : "unread"}`} key={item.id} onClick={() => openMessage(item)}>
          <span className="message-dot"/><span><strong>{item.name}</strong><small>{item.email}</small></span>
          <span><strong>{item.subject}</strong><small>{item.message}</small></span>
          <time>{new Date(item.createdAt).toLocaleDateString()}</time>
        </button>)}
      {!loading && !items.length && <div className="empty-state"><i className="fa-regular fa-envelope-open"/><h3>No messages here</h3><p>New customer enquiries will appear in this inbox.</p></div>}
    </div>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
      <div className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="message-title">
        <button className="modal-close" aria-label="Close message" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark"/></button>
        <small className="kicker">CUSTOMER MESSAGE</small><h2 id="message-title">{selected.subject}</h2>
        <div className="detail-grid"><div><small>From</small><strong>{selected.name}</strong></div><div><small>Received</small><strong>{new Date(selected.createdAt).toLocaleString()}</strong></div><div><small>Email</small><strong><a href={`mailto:${selected.email}`}>{selected.email}</a></strong></div><div><small>Phone</small><strong>{selected.phone || "Not provided"}</strong></div></div>
        <div className="message-body">{selected.message}</div>
        <div className="modal-actions spread"><button className="btn danger ghost" onClick={() => setRemove(selected)}><i className="fa-solid fa-trash"/> Delete</button><a className="btn" href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}><i className="fa-solid fa-reply"/> Reply by email</a></div>
      </div>
    </div>}
    {remove && <ConfirmModal title="Delete message?" message="This permanently removes the enquiry from the system." danger confirmText="Delete" onClose={() => setRemove(null)} onConfirm={deleteMessage}/>}
  </div>;
}
