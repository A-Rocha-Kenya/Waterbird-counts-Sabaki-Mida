export function heatmapOption(rows, metric) {
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lookup = new Map(rows.map((row) => [`${row.year}-${row.month}`, Number(row.value || 0)]));
  const values = [];

  years.forEach((year, yearIndex) => {
    months.forEach((_, monthIndex) => {
      values.push([yearIndex, monthIndex, lookup.get(`${year}-${monthIndex + 1}`) || 0]);
    });
  });

  return {
    tooltip: {
      position: "top",
      formatter: (item) => `${months[item.value[1]]} ${years[item.value[0]]}<br>${metric.label}: ${formatValue(item.value[2], metric)}`
    },
    grid: { left: 72, right: 24, top: 24, bottom: 48 },
    xAxis: { type: "category", data: years },
    yAxis: { type: "category", data: months },
    visualMap: {
      min: 0,
      max: Math.max(...values.map((item) => item[2]), 1),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0
    },
    series: [
      {
        type: "heatmap",
        data: values,
        label: { show: true, formatter: (item) => formatValue(item.value[2], metric) },
        emphasis: { itemStyle: { shadowBlur: 10 } }
      }
    ]
  };
}

export function annualOption(rows, metric) {
  const years = rows.map((row) => row.year);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatValue(value, metric)
    },
    grid: { left: 56, right: 24, top: 24, bottom: 40 },
    xAxis: { type: "category", data: years },
    yAxis: { type: "value", name: metric.label },
    series: [
      {
        type: metric.type || "line",
        smooth: metric.type !== "bar",
        data: rows.map((row) => Number(row.value || 0)),
        itemStyle: { color: "#325d88" },
        areaStyle: metric.type === "bar" ? undefined : { opacity: 0.08 }
      }
    ]
  };
}

export function speciesRankingOption(rows, metric) {
  const visibleRows = rows.slice(0, 25).reverse();

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => formatValue(value, metric)
    },
    grid: { left: 184, right: 24, top: 16, bottom: 28 },
    xAxis: { type: "value", name: metric.label },
    yAxis: {
      type: "category",
      data: visibleRows.map((row) => row.label)
    },
    series: [
      {
        type: "bar",
        data: visibleRows.map((row) => Number(row.value || 0)),
        itemStyle: { color: "#2f6b3f" }
      }
    ]
  };
}

function formatValue(value, metric) {
  if (metric.format === "percent") return `${Math.round(Number(value || 0) * 100)}%`;
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}
