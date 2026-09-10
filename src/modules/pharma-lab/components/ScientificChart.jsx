import { useId, useMemo } from "react";

export default function ScientificChart({ data, xLabel, yLabel, color = "#38ddff", secondary, label = "Scientific chart", limits = [] }) {
  const gradientId = useId().replaceAll(":", "");
  const geometry = useMemo(() => {
    const values = [...data, ...(secondary || [])];
    const xs = values.map((point) => point.x), ys = values.map((point) => point.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(0, ...ys), yMax = Math.max(...ys, 1);
    const point = ({ x, y }) => `${42 + (x - xMin) / (xMax - xMin || 1) * 338},${12 + (1 - (y - yMin) / (yMax - yMin || 1)) * 112}`;
    return { primary: data.map(point).join(" "), secondary: secondary?.map(point).join(" "), xMin, xMax, yMin, yMax, point };
  }, [data, secondary]);
  return <svg className="plab-scientific-chart" viewBox="0 0 400 154" role="img" aria-label={label}>
    <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    {[0,1,2,3,4].map((line) => <line key={line} x1="42" y1={12+line*28} x2="380" y2={12+line*28} stroke="rgba(145,203,226,.12)" />)}
    <line x1="42" y1="124" x2="380" y2="124" stroke="rgba(186,225,238,.35)"/><line x1="42" y1="12" x2="42" y2="124" stroke="rgba(186,225,238,.35)"/>
    {limits.map((limit) => <line key={limit} x1="42" x2="380" y1={geometry.point({x:geometry.xMin,y:limit}).split(",")[1]} y2={geometry.point({x:geometry.xMax,y:limit}).split(",")[1]} stroke="#fb7185" strokeDasharray="4 4"/>)}
    <polyline points={geometry.primary} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke"/>{geometry.secondary&&<polyline points={geometry.secondary} fill="none" stroke="#fbbf24" strokeWidth="1.7" strokeDasharray="5 3" vectorEffect="non-scaling-stroke"/>}
    {data.map((point,index)=><circle key={index} cx={geometry.point(point).split(",")[0]} cy={geometry.point(point).split(",")[1]} r="2.5" fill={color}><title>{point.x}, {point.y.toFixed?.(2) ?? point.y}</title></circle>)}
    <text x="210" y="150" textAnchor="middle">{xLabel}</text><text x="10" y="68" textAnchor="middle" transform="rotate(-90 10 68)">{yLabel}</text><text x="42" y="138">{geometry.xMin}</text><text x="380" y="138" textAnchor="end">{geometry.xMax}</text><text x="36" y="18" textAnchor="end">{geometry.yMax.toFixed(1)}</text>
  </svg>;
}
