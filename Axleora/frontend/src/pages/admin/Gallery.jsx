import { useEffect, useState } from "react";
import { api, fileUrl } from "../../api/axios";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/gallery")
      .then(({ data }) => setItems(data))
      .catch(err => setError(err.response?.data?.message || "Could not load gallery"))
      .finally(() => setLoading(false));
  }, []);

  return <div className="admin-content">
    <div className="admin-title"><div><span className="kicker">MEDIA LIBRARY</span><h1>Uploaded photos</h1><p>Service catalogue imagery and customer-supplied problem photos.</p></div></div>
    {error && <div className="alert error">{error}</div>}
    {loading ? <div className="empty-mini">Loading photos…</div> : items.length ? <div className="gallery-grid">{items.map((item, index) =>
      <button key={`${item.type}-${item.id}-${index}`} onClick={() => setView(item)}><img src={fileUrl(item.url)} alt={item.label}/><span><small>{item.type}</small><strong>{item.label}</strong></span></button>)}</div>
      : <div className="empty-state"><i className="fa-regular fa-images"/><h3>No uploaded photos yet</h3><p>Images added to services or bookings will appear here.</p></div>}
    {view && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && setView(null)}>
      <div className="image-modal" role="dialog" aria-modal="true" aria-label={view.label}>
        <button className="modal-close" aria-label="Close image preview" onClick={() => setView(null)}><i className="fa-solid fa-xmark"/></button>
        <img src={fileUrl(view.url)} alt={view.label}/><strong>{view.label}</strong>
      </div>
    </div>}
  </div>;
}
