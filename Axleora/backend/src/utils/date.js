export function getColomboDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function isPastServiceSlot(date, time) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time || "");
  if (!match) return true;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  const slot = new Date(`${date}T${String(hour).padStart(2, "0")}:${match[2]}:00+05:30`);
  return Number.isNaN(slot.getTime()) || slot <= new Date();
}
