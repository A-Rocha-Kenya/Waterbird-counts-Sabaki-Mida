export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatDate(value) {
  if (!value) return "NA";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(new Date(value));
}

export function sentenceCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
