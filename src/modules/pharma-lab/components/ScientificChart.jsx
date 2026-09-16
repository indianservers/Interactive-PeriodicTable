import { SciencePlot } from "../../../components/science/SciencePlot.jsx";

export default function ScientificChart({
  data = [],
  xLabel,
  yLabel,
  color = "#38ddff",
  secondary,
  label = "Scientific chart",
  limits = [],
}) {
  const series = [
    { label, data, color, points: true },
    secondary ? { label: "Secondary", data: secondary, color: "#fbbf24", dash: "dash" } : null,
  ].filter(Boolean);
  const yValues = [...data, ...(secondary || [])].map((point) => point.y).filter(Number.isFinite);
  const shapes = limits.map((limit) => ({
    type: "line",
    xref: "paper",
    x0: 0,
    x1: 1,
    y0: limit,
    y1: limit,
    line: { color: "#fb7185", dash: "dash", width: 1.4 },
  }));
  return (
    <SciencePlot
      series={series}
      xLabel={xLabel}
      yLabel={yLabel}
      yDomain={yValues.length ? [Math.min(0, ...yValues), Math.max(...yValues, 1)] : undefined}
      shapes={shapes}
      height={168}
      legend={Boolean(secondary)}
    />
  );
}
