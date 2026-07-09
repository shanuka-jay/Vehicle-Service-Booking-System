import { useState } from "react";
import { Link } from "react-router-dom";

const guides = {
  Routine: {
    icon: "gauge-high",
    title: "Keep small maintenance from becoming a large repair.",
    text: "Regular oil, battery, fluid and tyre checks protect reliability and help technicians spot wear early.",
    signs: ["Service reminder is due", "Slow engine start", "Fluid level or tyre-pressure changes"],
    service: "Oil Change"
  },
  Safety: {
    icon: "shield-halved",
    title: "Treat changes in braking or steering as safety signals.",
    text: "Pulling, vibration, squealing or a soft brake pedal should be inspected before the vehicle returns to heavy use.",
    signs: ["Brake noise or longer stopping distance", "Steering pulls to one side", "Uneven tyre wear"],
    service: "Brake Inspection"
  },
  Performance: {
    icon: "microchip",
    title: "Warning lights and unusual behaviour deserve a proper diagnosis.",
    text: "A structured diagnostic check is more useful than replacing parts by guesswork.",
    signs: ["Engine warning light", "Loss of power or rough idle", "New vibration, smell or fuel-use change"],
    service: "Engine Diagnosis"
  }
};

export default function CareGuide() {
  const [active, setActive] = useState("Routine");
  const guide = guides[active];
  return <div className="care-guide">
    <div className="care-tabs" role="tablist" aria-label="Vehicle care topics">
      {Object.keys(guides).map(label => <button role="tab" aria-selected={active === label} className={active === label ? "active" : ""} key={label} onClick={() => setActive(label)}>{label}</button>)}
    </div>
    <div className="care-panel">
      <div className="care-copy"><span className="care-icon"><i className={`fa-solid fa-${guide.icon}`}/></span><h3>{guide.title}</h3><p>{guide.text}</p><Link to="/booking" className="text-link">Book {guide.service} <i className="fa-solid fa-arrow-right"/></Link></div>
      <div className="signal-list"><small>WATCH FOR THESE SIGNS</small>{guide.signs.map(sign => <div key={sign}><i className="fa-solid fa-circle-check"/><span>{sign}</span></div>)}</div>
    </div>
  </div>;
}
