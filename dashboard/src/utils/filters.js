export function matchesFilterSet(value, selected) {
  return selected.length === 0 || selected.includes(value);
}

export function isIdentifiedTaxon(record) {
  if (!record) return false;
  const rank = (record.taxonRank || "").toLowerCase();
  const name = (record.vernacularName || "").toLowerCase();
  return !rank.includes("family") &&
    !rank.includes("order") &&
    !rank.includes("slash") &&
    !name.includes("unidentified") &&
    !name.endsWith(" sp.");
}
