import { useState } from "react";
import { Link } from "react-router-dom";

const concerns = [
  { id: "warning", icon: "gauge-high", label: "Warning light", service: "Engine Diagnosis", text: "Start with a diagnostic scan and technician inspection before replacing parts." },
  { id: "brakes", icon: "car-burst", label: "Braking feels different", service: "Brake Inspection", text: "Changes in pedal feel, noise or stopping distance should be checked promptly." },
  { id: "steering", icon: "arrows-left-right", label: "Pulling or uneven tyres", service: "Wheel Alignment", text: "Alignment and tyre condition checks can identify pulling, vibration and uneven wear." },
  { id: "service", icon: "oil-can", label: "Routine service due", service: "Full Service", text: "A scheduled service covers fluids, brakes, tyres and general vehicle condition." }
];

export default function SymptomFinder() {
  const [selected, setSelected] = useState(concerns[0]);
  return <div className="symptom-finder">
    <div className="symptom-tabs" role="tablist" aria-label="Vehicle concerns">
      {concerns.map(item => <button role="tab" aria-selected={selected.id === item.id} className={selected.id === item.id ? "active" : ""} onClick={() => setSelected(item)} key={item.id}>
        <i className={`fa-solid fa-${item.icon}`}/><span>{item.label}</span>
      </button>)}
    </div>
    <div className="symptom-result" role="tabpanel">
      <div><small>A PRACTICAL STARTING POINT</small><h3>{selected.service}</h3><p>{selected.text}</p></div>
      <Link className="btn" to="/booking">Request this service <i className="fa-solid fa-arrow-right"/></Link>
    </div>
  </div>;
}
