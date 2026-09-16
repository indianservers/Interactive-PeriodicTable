export default function LabBenchVisual({ kind = "titration", running = false, fill = "#4ea3ff", label = "Sample" }) {
  if (kind === "electrodes") {
    return (
      <div className={`lab-bench electrodes ${running ? "is-live" : ""}`} role="img" aria-label={`${label} electrode cell`}>
        <div className="lab-cell">
          <i className="lab-probe" />
          <i className="lab-probe right" />
          <div className="lab-solution" style={{ "--fill": fill }} />
        </div>
        <span>{running ? "Measuring" : label}</span>
      </div>
    );
  }
  if (kind === "cuvette") {
    return (
      <div className={`lab-bench cuvette ${running ? "is-live" : ""}`} role="img" aria-label={`${label} spectrophotometer`}>
        <div className="lab-beam" />
        <div className="lab-cuvette" style={{ "--fill": fill }} />
        <div className="lab-beam" />
        <span>{running ? "Absorbance live" : label}</span>
      </div>
    );
  }
  if (kind === "organic") {
    return (
      <div className={`lab-bench organic ${running ? "is-live" : ""}`} role="img" aria-label={`${label} organic prep`}>
        <div className="lab-stand" />
        <div className="lab-condenser" />
        <div className="lab-rbf" style={{ "--fill": fill }} />
        <span>{running ? "Reaction running" : label}</span>
      </div>
    );
  }
  if (kind === "flask") {
    return (
      <div className={`lab-bench flask ${running ? "is-live" : ""}`} role="img" aria-label={`${label} reaction flask`}>
        <div className="lab-erlenmeyer" style={{ "--fill": fill }} />
        {running && <i className="lab-drip" />}
        <span>{running ? "In progress" : label}</span>
      </div>
    );
  }
  return (
    <div className={`lab-bench titration ${running ? "is-live" : ""}`} role="img" aria-label={`${label} titration bench`}>
      <div className="lab-burette"><i style={{ height: running ? "38%" : "62%" }} /></div>
      <div className="lab-flask" style={{ "--fill": fill }} />
      {running && <i className="lab-drip" />}
      <span>{running ? "Approaching end-point" : label}</span>
    </div>
  );
}
