export function richnessByYearOption(rows) {
  const sites = [...new Set(rows.map((row) => row.site))];
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);

  return {
    tooltip: { trigger: "axis" },
    legend: { top: 8 },
    grid: { left: 48, right: 24, top: 48, bottom: 40 },
    xAxis: { type: "category", data: years },
    yAxis: { type: "value", name: "Taxa" },
    series: sites.map((site) => ({
      name: site,
      type: "line",
      smooth: true,
      data: years.map((year) => {
        const match = rows.find((row) => row.site === site && row.year === year);
        return match ? match.taxa : 0;
      })
    }))
  };
}
