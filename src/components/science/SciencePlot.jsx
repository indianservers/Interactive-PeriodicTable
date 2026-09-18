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

const THEMES = {
  studio: {
    paper: "rgba(0,0,0,0)",
    plot: "rgba(6,18,30,0.88)",
    font: "#d5e7f8",
    title: "#e8f4ff",
    grid: "rgba(86,128,158,0.22)",
    axis: "rgba(186,214,232,0.45)",
    hoverBg: "#10283c",
    hoverBorder: "#4db7ff",
  },
  lab: {
    paper: "rgba(255,255,255,0)",
    plot: "#f7fbff",
    font: "#16345a",
    title: "#03205c",
    grid: "rgba(120,160,196,0.28)",
    axis: "rgba(20,70,130,0.35)",
    hoverBg: "#ffffff",
    hoverBorder: "#0866f2",
  },
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
  theme = "studio",
  xTickFormat,
  yTickFormat,
  className = "",
}) {
  const skin = THEMES[theme] || THEMES.studio;
  const data = useMemo(
    () =>
      series
        .filter((item) => item?.data?.length)
        .map((item) => {
          const mode = item.mode || (item.points && !item.hideLine ? "lines+markers" : item.points ? "markers" : "lines");
          const color = item.color || "#34b7ff";
          return {
            type: item.kind || "scatter",
            mode: item.kind === "bar" ? undefined : mode,
            name: item.label || "",
            x: item.data.map((point) => point.x),
            y: item.data.map((point) => point.y),
            width: item.barWidth,
            fill: item.fill ? "tozeroy" : undefined,
            fillcolor: item.fillcolor || (item.fill ? `${color}33` : undefined),
            line: {
              color,
              width: item.width || 2.2,
              dash: dashMap[item.dash] || item.dash || "solid",
              shape: item.smooth ? "spline" : "linear",
            },
            marker: {
              color,
              size: item.markerSize || (item.kind === "bar" ? undefined : 7),
              line: { color: theme === "lab" ? "#fff" : "#06131f", width: item.points ? 1.2 : 0 },
            },
            hovertemplate: item.hover || `%{x}<br>%{y}<extra>${item.label || ""}</extra>`,
          };
        }),
    [series, theme],
  );

  const layout = useMemo(
    () => ({
      title: title ? { text: title, font: { size: 13, color: skin.title, family: "Inter, Segoe UI, sans-serif" }, x: 0, xanchor: "left" } : undefined,
      paper_bgcolor: skin.paper,
      plot_bgcolor: skin.plot,
      font: { color: skin.font, family: "Inter, Segoe UI, system-ui, sans-serif", size: 11 },
      margin: { l: 62, r: 18, t: title ? 38 : 16, b: 52 },
      showlegend: legend && data.length > 1,
      legend: {
        orientation: "h",
        y: 1.14,
        x: 1,
        xanchor: "right",
        font: { size: 11 },
        bgcolor: "rgba(0,0,0,0)",
      },
      hoverlabel: {
        bgcolor: skin.hoverBg,
        bordercolor: skin.hoverBorder,
        font: { size: 11, color: skin.font, family: "Inter, Segoe UI, sans-serif" },
      },
      xaxis: {
        title: { text: xLabel || "", font: { size: 12, color: skin.font }, standoff: 8 },
        range: reverseX && xDomain ? [xDomain[1], xDomain[0]] : xDomain,
        autorange: reverseX && !xDomain ? "reversed" : xDomain ? false : true,
        type: logX ? "log" : "linear",
        tickformat: xTickFormat,
        gridcolor: skin.grid,
        zerolinecolor: skin.axis,
        linecolor: skin.axis,
        tickfont: { size: 10 },
        showspikes: true,
        spikecolor: skin.hoverBorder,
        spikethickness: 1,
        spikedash: "dot",
      },
      yaxis: {
        title: { text: yLabel || "", font: { size: 12, color: skin.font }, standoff: 6 },
        range: yDomain,
        autorange: yDomain ? false : true,
        type: logY ? "log" : "linear",
        tickformat: yTickFormat,
        gridcolor: skin.grid,
        zerolinecolor: skin.axis,
        linecolor: skin.axis,
        tickfont: { size: 10 },
        showspikes: true,
        spikecolor: skin.hoverBorder,
        spikethickness: 1,
        spikedash: "dot",
      },
      shapes,
      annotations: annotations.map((item) => ({
        font: { color: skin.title, size: 11 },
        bgcolor: theme === "lab" ? "rgba(255,255,255,0.85)" : "rgba(8,22,36,0.75)",
        borderpad: 3,
        ...item,
      })),
      hovermode: "closest",
    }),
    [annotations, data.length, legend, logX, logY, reverseX, shapes, skin, theme, title, xDomain, xLabel, xTickFormat, yDomain, yLabel, yTickFormat],
  );

  return (
    <div className={`science-plot theme-${theme} ${className}`.trim()} style={{ height }}>
      <PlotlyChart
        data={data}
        layout={layout}
        config={{ displayModeBar: false, responsive: true, displaylogo: false }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
        onClick={onPointClick}
      />
    </div>
  );
}

export default SciencePlot;
