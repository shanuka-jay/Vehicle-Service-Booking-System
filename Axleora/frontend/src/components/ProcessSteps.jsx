const steps = [
  ["01", "Choose your service", "Review active services, expected time and indicative price range."],
  ["02", "Request a workshop slot", "Send vehicle details and choose a preferred date and time."],
  ["03", "Receive admin approval", "The workshop checks capacity and approves or rejects the request."],
  ["04", "Track through completion", "Use your reference or phone number to follow the current status."]
];

export default function ProcessSteps() {
  return <div className="process-grid">{steps.map(([number, title, text], index) =>
    <article className="process-step" key={number}><div className="step-top"><span>{number}</span>{index < steps.length - 1 && <i className="fa-solid fa-arrow-right-long"/>}</div><h3>{title}</h3><p>{text}</p></article>)}</div>;
}
