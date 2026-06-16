export function speciesRankOption(rows, metric) {
  const label = metric?.label || "Individuals";
  const key = metric?.key || "individuals";

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 180, right: 24, top: 16, bottom: 24 },
    xAxis: { type: "value", name: label },
    yAxis: {
      type: "category",
      data: rows.map((row) => row.vernacularName || row.scientificName).reverse()
    },
    series: [
      {
        type: "bar",
        data: rows.map((row) => Number(row[key] || 0)).reverse(),
        itemStyle: {
          color: "#2f6b3f"
        }
      }
    ]
  };
}
