import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/testimonials/public").then(({ data }) => setItems(data)).catch(() => {}); }, []);
  if (!items.length) return null;
  return <section className="section testimonials-section"><div className="container">
    <div className="editorial-heading"><div><span className="kicker">CUSTOMER EXPERIENCES</span><h2>What local drivers say after their visit.</h2></div><p>Published by the workshop team from genuine customer feedback.</p></div>
    <div className="testimonial-grid">{items.map(item => <article className="testimonial-card" key={item.id}>
      <div className="testimonial-stars" aria-label={`${item.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <i key={index} className={`${index < item.rating ? "fa-solid" : "fa-regular"} fa-star`}/>)}</div>
      <blockquote>“{item.quote}”</blockquote>
      <footer><span>{item.customerName.slice(0, 1).toUpperCase()}</span><div><strong>{item.customerName}</strong>{item.vehicleLabel && <small>{item.vehicleLabel}</small>}</div></footer>
    </article>)}</div>
  </div></section>;
}
