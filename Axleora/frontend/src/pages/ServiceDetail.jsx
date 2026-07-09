import { useEffect,useMemo,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { api,fileUrl } from "../api/axios";
import EditorialPageHero from "../components/EditorialPageHero";
import { toListItems } from "../utils/serviceFieldUtils";
const fallbacks={"Oil Change":"/images/oil-change.jpg","Full Service":"/images/full-service.jpg","Engine Diagnosis":"/images/engine-diagnosis.jpg","Brake Inspection":"/images/brake-inspection.jpg","Wheel Alignment":"/images/wheel-alignment.jpg","Battery Check":"/images/battery-check.jpg","Car Wash & Detailing":"/images/detailing.jpg"};
const url=value=>value?.startsWith("/uploads/")?fileUrl(value):value;
export default function ServiceDetail(){
  const{slug}=useParams();const[service,setService]=useState(),[error,setError]=useState(""),[selected,setSelected]=useState("");
  useEffect(()=>{api.get(`/services/public/${slug}`).then(({data})=>{setService(data);setSelected(data.imageUrl?fileUrl(data.imageUrl):fallbacks[data.name]||fallbacks["Full Service"])}).catch(()=>setError("This service is not available."))},[slug]);
  const photos=useMemo(()=>{if(!service)return[];const cover=service.imageUrl?fileUrl(service.imageUrl):fallbacks[service.name]||fallbacks["Full Service"];return[cover,...(service.images||[]).map(image=>url(image.imageUrl))].filter((item,index,array)=>item&&array.indexOf(item)===index)},[service]);
  if(error)return <main className="section container empty-state"><h1>Service not found</h1><p>{error}</p><Link className="btn" to="/services">Back to services</Link></main>;
  if(!service)return <main className="section container"><span className="spinner"/></main>;
  const included=toListItems(service.includedItems),benefits=toListItems(service.benefits);
  const thumbs=photos.length>1?<div className="editorial-hero-thumbs">{photos.slice(0,4).map((photo,index)=><button className={selected===photo?"active":""} onClick={()=>setSelected(photo)} key={photo} aria-label={`View ${service.name} image ${index+1}`}><img src={photo} alt=""/></button>)}</div>:null;
  return <main className="service-detail public-consistent">
    <EditorialPageHero
      className="editorial-service-hero"
      breadcrumbs={[{label:"Home",to:"/"},{label:"Services",to:"/services"},{label:service.name}]}
      kicker={service.group?.name||"WORKSHOP SERVICE"}
      title={service.name}
      description={service.description}
      image={selected||photos[0]}
      alt={`${service.name} workshop view`}
      noteIcon="images"
      noteTitle={`${photos.length} workshop photo${photos.length===1?"":"s"}`}
      noteText="Select a thumbnail for a closer view"
      mediaFooter={thumbs}
    >
      <div className="detail-meta"><span><i className="fa-regular fa-clock"/><small>Typical workshop time</small><strong>{service.estimatedDuration||"Assessment required"}</strong></span><span><i className="fa-solid fa-wallet"/><small>Indicative range</small><strong>{service.priceRange||"Request estimate"}</strong></span></div>
      <Link className="btn" to={`/booking?service=${service.id}`}>Request this service <i className="fa-solid fa-arrow-right"/></Link>
    </EditorialPageHero>
    <section className="section detail-story"><div className="container detail-content-grid"><article><span className="kicker">ABOUT THIS SERVICE</span><h2>What the workshop will look at.</h2><p>{service.longDescription||service.description}</p>{included.length>0&&<><h3>Typical inclusions</h3><ul className="detail-checks">{included.map(item=><li key={item}><i className="fa-solid fa-check"/>{item}</li>)}</ul></>}</article><aside><span className="kicker">WHY IT MATTERS</span><h2>What this visit can help with.</h2>{benefits.map(item=><div className="benefit-item" key={item}><i className="fa-solid fa-shield-halved"/><p>{item}</p></div>)}<div className="detail-note"><strong>Price guidance</strong><p>Final work depends on the vehicle model, parts and inspection findings.</p></div></aside></div></section>
    {photos.length>2&&<section className="section service-photo-story"><div className="container"><div className="editorial-heading"><div><span className="kicker">INSIDE THE SERVICE</span><h2>A closer look at the workshop work.</h2></div><p>These images are maintained by the workshop team from the service editor.</p></div><div className="photo-story-grid">{photos.slice(1,5).map((photo,index)=><button onClick={()=>{setSelected(photo);window.scrollTo({top:0,behavior:"smooth"})}} key={photo}><img src={photo} alt={`${service.name} detail ${index+1}`}/></button>)}</div></div></section>}
    <section className="service-cta"><div className="container"><div><span>READY TO PLAN THE VISIT?</span><h2>Choose a preferred workshop time.</h2></div><Link className="btn" to={`/booking?service=${service.id}`}>Book {service.name}</Link></div></section>
  </main>
}
