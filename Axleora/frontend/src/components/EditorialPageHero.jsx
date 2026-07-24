import { Link } from "react-router-dom";

export default function EditorialPageHero({ breadcrumbs = [], kicker, title, description, image, alt, noteIcon = "circle-info", noteTitle, noteText, children, mediaFooter, className = "" }) {
  return <section className={`editorial-page-hero ${className}`}>
    <div className="container editorial-page-hero-grid">
      <div className="editorial-page-hero-copy">
        <div className="breadcrumbs">{breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`}>{index > 0 && <i className="fa-solid fa-chevron-right"/>}{item.to ? <Link to={item.to}>{item.label}</Link> : <b>{item.label}</b>}</span>)}</div>
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children && <div className="editorial-hero-extra">{children}</div>}
      </div>
      <div className="editorial-page-hero-media">
        <img src={image} alt={alt}/>
        {noteTitle && <div className="editorial-hero-note"><i className={`fa-solid fa-${noteIcon}`}/><span><strong>{noteTitle}</strong>{noteText && <small>{noteText}</small>}</span></div>}
        {mediaFooter}
      </div>
    </div>
  </section>;
}
