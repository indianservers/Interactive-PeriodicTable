import { useMemo } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";
import "./SciencePlot.css";

const PlotlyChart = createPlotlyComponent(Plotly);

const dashMap = {
  "5 4": "dash",
  "5,4": "dash",
  "4 3": "dash",
  dash: "dash",
  dot: "dot",
  "2 2": "dot",
};

export function SciencePlot({
  title,
  series = [],
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  logX = false,
  logY = false,
  reverseX = false,
  legend = true,
  height = 280,
  shapes = [],
  annotations = [],
  onPointClick,
}) {
  const data = useMemo(
    () =>
      series
        .filter((item) => item?.data?.length)
        .map((item) => {
          const mode = item.mode || (item.points && !item.hideLine ? "lines+markers" : item.points ? "markers" : "lines");
          return {
            type: item.kind || "scatter",
            mode: item.kind === "bar" ? undefined : mode,
            name: item.label || "",
            x: item.data.map((point) => point.x),
            y: item.data.map((point) => point.y),
            line: {
              color: item.color || "#34b7ff",
              width: item.width || 2,
              dash: dashMap[item.dash] || item.dash || "solid",
            },
            marker: {
              color: item.color || "#34b7ff",
              size: item.markerSize || (item.kind === "bar" ? undefined : 6),
            },
            hovertemplate: `%{x}<br>%{y}<extra>${item.label || ""}</extra>`,
          };
        }),
    [series],
  );

  const layout = useMemo(
    () => ({
      title: title ? { text: title, font: { size: 13, color: "#d7ebff" }, x: 0, xanchor: "left" } : undefined,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(8,24,38,0.72)",
      font: { color: "#c4d8ec", family: "Inter, Segoe UI, system-ui, sans-serif", size: 11 },
      margin: { l: 58, r: 16, t: title ? 36 : 18, b: 46 },
      showlegend: legend && data.length > 1,
      legend: { orientation: "h", y: 1.12, font: { size: 10 }, bgcolor: "rgba(0,0,0,0)" },
      xaxis: {
        title: { text: xLabel || "", font: { size: 11 } },
        range: reverseX && xDomain ? [xDomain[1], xDomain[0]] : xDomain,
        autorange: reverseX && !xDomain ? "reversed" : xDomain ? false : true,
        type: logX ? "log" : "linear",
        gridcolor: "rgba(70,110,140,0.28)",
        zerolinecolor: "rgba(180,210,230,0.25)",
        linecolor: "rgba(180,210,230,0.35)",
        tickfont: { size: 10 },
      },
      yaxis: {
        title: { text: yLabel || "", font: { size: 11 } },
        range: yDomain,
        autorange: yDomain ? false : true,
        type: logY ? "log" : "linear",
        gridcolor: "rgba(70,110,140,0.28)",
        zerolinecolor: "rgba(180,210,230,0.25)",
        linecolor: "rgba(180,210,230,0.35)",
        tickfont: { size: 10 },
      },
      shapes,
      annotations,
      hovermode: "closest",
    }),
    [annotations, data.length, legend, logX, logY, reverseX, shapes, title, xDomain, xLabel, yDomain, yLabel],
  );

  return (
    <div className="science-plot" style={{ height }}>
      <PlotlyChart
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
        onClick={onPointClick}
      />
    </div>
  );
}

export default SciencePlot;
