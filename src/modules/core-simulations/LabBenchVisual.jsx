export default function LabBenchVisual({ kind = "titration", running = false, fill = "#4ea3ff", label = "Sample", apparatus = [] }) {
  if (kind === 'water-bath') return <div className={`lab-bench water-bath ${running ? 'is-live' : ''}`}>
    <svg viewBox="0 0 600 360" role="img" aria-label="Acetylation flask in a heated water bath with filtration apparatus">
      <g fill="none" stroke="#385c72" strokeWidth="4"><path d="M85 115V280H290V115"/><path d="M165 45V135L125 235Q120 250 140 250H230Q250 250 245 235L205 135V45"/><path d="M425 180V230L380 310H500L455 230V180"/><path d="M400 115H480V155H400Z M440 155V195"/><path d="M470 240H540"/></g>
      <path d="M90 180H285V275H90Z" fill="#63bfff66"/><path d="M144 205H227L242 240H127Z" fill={fill}/><rect x="75" y="285" width="225" height="28" rx="6" fill={running?'#d5572b':'#465d6f'}/>
      <g fill="#102e45" fontSize="15"><text x="90" y="335">Hot plate / water bath</text><text x="95" y="28">Acetylation flask</text><text x="365" y="92">Büchner funnel</text><text x="365" y="338">Vacuum filter flask</text><text x="490" y="225">To vacuum</text></g>
    </svg><span>{running ? 'Water bath heating the reaction mixture' : label}</span><ApparatusNames items={apparatus}/>
  </div>;
  if (kind === "electrodes") {
    return (
      <div className={`lab-bench electrodes ${running ? "is-live" : ""}`} role="img" aria-label={`${label} electrode cell`}>
        <div className="lab-cell">
          <i className="lab-probe" />
          <i className="lab-probe right" />
          <div className="lab-solution" style={{ "--fill": fill }} />
        </div>
        <span>Electrodes · measurement cell · {running ? "Measuring" : label}</span><ApparatusNames items={apparatus}/>
      </div>
    );
  }
  if (kind === "cuvette") {
    return (
      <div className={`lab-bench cuvette ${running ? "is-live" : ""}`} role="img" aria-label={`${label} spectrophotometer`}>
        <div className="lab-beam" />
        <div className="lab-cuvette" style={{ "--fill": fill }} />
        <div className="lab-beam" />
        <span>Light source → cuvette → detector · {running ? "Absorbance live" : label}</span><ApparatusNames items={apparatus}/>
      </div>
    );
  }
  if (kind === "organic") {
    return (
      <div className={`lab-bench organic ${running ? "is-live" : ""}`} role="img" aria-label={`${label} organic prep`}>
        <div className="lab-stand" />
        <div className="lab-condenser" />
        <div className="lab-rbf" style={{ "--fill": fill }} />
        <span>Reflux condenser · round-bottom flask · stand · {running ? "Reaction running" : label}</span><ApparatusNames items={apparatus}/>
      </div>
    );
  }
  if (kind === "flask") {
    return (
      <div className={`lab-bench flask ${running ? "is-live" : ""}`} role="img" aria-label={`${label} reaction flask`}>
        <div className="lab-erlenmeyer" style={{ "--fill": fill }} />
        {running && <i className="lab-drip" />}
        <span>Reaction flask · {running ? "In progress" : label}</span><ApparatusNames items={apparatus}/>
      </div>
    );
  }
  return (
    <div className={`lab-bench titration ${running ? "is-live" : ""}`} role="img" aria-label={`${label} titration bench`}>
      <div className="lab-burette"><i style={{ height: running ? "38%" : "62%" }} /></div>
      <div className="lab-flask" style={{ "--fill": fill }} />
      {running && <i className="lab-drip" />}
      <span>Burette above conical flask · {running ? "Approaching end-point" : label}</span><ApparatusNames items={apparatus}/>
    </div>
  );
}
function ApparatusNames({items}) { return items.length > 0 && <div className="lab-apparatus-names">{items.map(item => <small key={item}>{item}</small>)}</div>; }
