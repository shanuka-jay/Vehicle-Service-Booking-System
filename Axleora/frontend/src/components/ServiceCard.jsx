import { Link } from "react-router-dom";
import { fileUrl } from "../api/axios";

const fallbacks = {
  "Oil Change": "/images/oil-change.jpg",
  "Full Service": "/images/full-service.jpg",
  "Engine Diagnosis": "/images/engine-diagnosis.jpg",
  "Brake Inspection": "/images/brake-inspection.jpg",
  "Wheel Alignment": "/images/wheel-alignment.jpg",
  "Battery Check": "/images/battery-check.jpg",
  "Car Wash & Detailing": "/images/detailing.jpg"
};

export default function ServiceCard({ service }) {
  const image = service.imageUrl ? fileUrl(service.imageUrl) : fallbacks[service.name] || fallbacks["Full Service"];
  const detail = service.slug ? `/services/${encodeURIComponent(service.slug)}` : `/services/${service.id}`;

  return (
    <article className="service-card service-card-premium">
      <Link className="service-image-link" to={detail}>
        <img src={image} alt={service.name} loading="lazy" />
        {service.group && <span>{service.group.name}</span>}
        <div className="image-hover"><i className="fa-solid fa-arrow-up-right-from-square" /></div>
      </Link>
      <div className="service-body">
        <div className="service-card-meta">
          <span><i className="fa-regular fa-clock" /> {service.estimatedDuration || "Assessment required"}</span>
          {service.images?.length > 0 && <span><i className="fa-regular fa-images" /> {service.images.length + 1} photos</span>}
        </div>
        <h3><Link to={detail}>{service.name}</Link></h3>
        <p>{service.description}</p>
        <div className="service-price">
          <small>INDICATIVE RANGE</small>
          <strong>{service.priceRange || "Request estimate"}</strong>
        </div>
        <Link className="service-card-cta" to={detail}>
          <span>View service details</span>
          <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>
    </article>
  );
}
