export function frequencyByMonthOption(rows) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sites = [...new Set(rows.map((row) => row.site))];

  return {
    tooltip: { trigger: "axis", valueFormatter: (value) => `${(value * 100).toFixed(1)}%` },
    legend: { top: 8 },
    grid: { left: 48, right: 24, top: 48, bottom: 40 },
    xAxis: { type: "category", data: months },
    yAxis: { type: "value", name: "Frequency", axisLabel: { formatter: (value) => `${Math.round(value * 100)}%` } },
    series: sites.map((site) => ({
      name: site,
      type: "bar",
      data: months.map((_, index) => {
        const match = rows.find((row) => row.site === site && row.month === index + 1);
        return match ? match.frequency : 0;
      })
    }))
  };
}
