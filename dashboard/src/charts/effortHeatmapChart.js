export function effortHeatmapOption(rows) {
  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const lookup = new Map();
  rows.forEach((row) => {
    const key = `${row.year}-${row.month}`;
    lookup.set(key, (lookup.get(key) || 0) + 1);
  });

  const seriesData = [];
  years.forEach((year, yearIndex) => {
    months.forEach((_, monthIndex) => {
      const key = `${year}-${monthIndex + 1}`;
      seriesData.push([yearIndex, monthIndex, lookup.get(key) || 0]);
    });
  });

  return {
    tooltip: { position: "top" },
    grid: { left: 72, right: 24, top: 24, bottom: 40 },
    xAxis: {
      type: "category",
      data: years
    },
    yAxis: {
      type: "category",
      data: months
    },
    visualMap: {
      min: 0,
      max: Math.max(...seriesData.map((item) => item[2]), 1),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0
    },
    series: [
      {
        type: "heatmap",
        data: seriesData,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10
          }
        }
      }
    ]
  };
}
