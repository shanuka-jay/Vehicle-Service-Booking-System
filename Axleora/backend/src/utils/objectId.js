const objectIdPattern = /^[a-f\d]{24}$/i;

export const isObjectId = value => objectIdPattern.test(String(value || ""));

export function requireObjectId(res, value, label = "record") {
  if (isObjectId(value)) return String(value);
  res.status(400).json({ message: `Invalid ${label} identifier` });
  return null;
}
