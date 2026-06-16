export function seasonalChartOption(rows) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sites = [...new Set(rows.map((row) => row.site))];

  return {
    tooltip: { trigger: "axis" },
    legend: { top: 8 },
    grid: { left: 48, right: 24, top: 48, bottom: 40 },
    xAxis: { type: "category", data: months },
    yAxis: { type: "value", name: "Individuals" },
    series: sites.map((site) => ({
      name: site,
      type: "bar",
      data: months.map((monthLabel, index) => {
        const match = rows.find((row) => row.site === site && row.month === index + 1);
        return match ? match.individuals : 0;
      })
    }))
  };
}
