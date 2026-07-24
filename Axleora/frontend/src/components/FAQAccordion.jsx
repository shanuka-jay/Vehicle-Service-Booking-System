import { useState } from "react";

export default function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">
    {items.map((item, index) => {
      const expanded = open === index;
      return <article className={`faq-item ${expanded ? "open" : ""}`} key={item.question}>
        <button aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)}>
          <span>{item.question}</span><i className={`fa-solid fa-${expanded ? "minus" : "plus"}`}/>
        </button>
        <div className="faq-answer" hidden={!expanded}><p>{item.answer}</p></div>
      </article>;
    })}
  </div>;
}
