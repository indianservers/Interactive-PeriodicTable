import { SciencePlot } from '../../components/science/SciencePlot.jsx';

export function Plot({ title, series = [], xLabel, yLabel, xDomain, yDomain, legend = true, logX = false, logY = false }) {
  return (
    <article className="pcs-card pcs-plot" aria-label={title}>
      <SciencePlot
        title={title}
        series={series}
        xLabel={xLabel}
        yLabel={yLabel}
        xDomain={xDomain}
        yDomain={yDomain}
        legend={legend}
        logX={logX}
        logY={logY}
        height={208}
      />
    </article>
  );
}
