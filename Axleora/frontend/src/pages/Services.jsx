import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import ServiceCard from "../components/ServiceCard";
import EditorialPageHero from "../components/EditorialPageHero";

export default function Services() {
  const [items,setItems]=useState([]),[groups,setGroups]=useState([]),[group,setGroup]=useState("all"),[query,setQuery]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
  useEffect(()=>{Promise.all([api.get("/services/public"),api.get("/services/public/groups")]).then(([services,categories])=>{setItems(services.data);setGroups(categories.data)}).catch(err=>setError(err.response?.data?.message||"Services are temporarily unavailable")).finally(()=>setLoading(false))},[]);
  const filtered=useMemo(()=>items.filter(item=>(group==="all"||item.group?.slug===group)&&(!query.trim()||`${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase().trim()))),[items,group,query]);
  return <main className="services-modern public-consistent">
    <EditorialPageHero
      breadcrumbs={[{label:"Home",to:"/"},{label:"Services"}]}
      kicker="WORKSHOP SERVICES"
      title="Find the right starting point for your vehicle."
      description="Explore routine care, safety checks and diagnostic work with full details before choosing a workshop time."
      image="/images/brake-inspection.jpg"
      alt="Technician inspecting a vehicle"
      noteIcon="comment-dots"
      noteTitle="Need help choosing?"
      noteText="Call the workshop desk"
    />
    <section className="catalogue-body"><div className="container"><div className="catalogue-toolbar modern-toolbar"><div className="service-search"><i className="fa-solid fa-magnifying-glass"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by service or concern" aria-label="Search services"/></div><div className="filter-chips"><button className={group==="all"?"active":""} onClick={()=>setGroup("all")}>All services</button>{groups.map(item=><button className={group===item.slug?"active":""} onClick={()=>setGroup(item.slug)} key={item.id}>{item.name}</button>)}</div></div><div className="results-line"><span>{loading?"Loading services…":`${filtered.length} service${filtered.length===1?"":"s"}`}</span><small>Select a service to read full details</small></div>{error&&<div className="alert error">{error}</div>}<div className="service-grid">{filtered.map(service=><ServiceCard key={service.id} service={service}/>)}</div>{!loading&&!error&&!filtered.length&&<div className="empty-state"><h3>No matching service</h3><p>Try another category or keyword.</p></div>}</div></section>
    <section className="service-cta"><div className="container"><div><span>NOT SURE WHICH ONE?</span><h2>Describe what changed and let the workshop guide the next step.</h2></div><Link className="btn" to="/contact">Ask the workshop</Link></div></section>
  </main>;
}
