export default function HplcInstrument({
  running,
  progress,
  pressure,
  flow,
  temperature,
  wavelength,
  primed,
}) {
  return (
    <div className={`plab-hplc-stack ${running ? "running" : ""}`}>
      <div className="plab-solvents">
        {["A · Buffer", "B · Methanol", "C · Wash"].map((name) => (
          <div key={name}>
            <i />
            <b>{name}</b>
          </div>
        ))}
      </div>
      <div className="plab-hplc-module pump">
        <b>QUATERNARY PUMP</b>
        <span>
          {flow.toFixed(2)} mL/min · {pressure.toFixed(1)} MPa
        </span>
        <i />
        <i />
      </div>
      <div className="plab-hplc-module degasser">
        <b>DEGASSER</b>
        <span>{primed ? "PRIMED" : "DRY"}</span>
      </div>
      <div className="plab-hplc-module autosampler">
        <b>AUTOSAMPLER</b>
        <span>Injection 20 µL</span>
        <div>
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <div className="plab-hplc-module detector">
        <b>UV DETECTOR</b>
        <span>{wavelength} nm</span>
        <i />
      </div>
      <div className="plab-column">
        <b>C18 COLUMN OVEN</b>
        <span>{temperature.toFixed(1)} °C</span>
      </div>
      <svg
        viewBox="0 0 500 360"
        aria-label="Animated HPLC solvent and sample path"
      >
        <path d="M85 55V125H190V170H390V265H270V315" />
        <circle cx={85 + progress * 3.05} cy="125" r="5" />
      </svg>
    </div>
  );
}
