export function toMultilineText(value) {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).join("\n");
      if (typeof parsed === "string") return parsed;
    } catch {
      // fall back to the raw string value below
    }
    return trimmed;
  }
  return String(value);
}

export function toListItems(value) {
  const text = toMultilineText(value);
  if (!text) return [];
  return text.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
}
