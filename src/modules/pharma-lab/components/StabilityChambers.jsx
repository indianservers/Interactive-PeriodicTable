export default function StabilityChambers({ active, running, selectedMonth }) {
  return (
    <div className={`plab-chambers ${running ? "running" : ""}`}>
      <div className="plab-lab-backdrop" />
      {[
        {
          key: "accelerated",
          name: "STABILITY CHAMBER 1",
          read: "40.0°C · 75% RH",
        },
        { key: "long", name: "STABILITY CHAMBER 2", read: "25.0°C · 60% RH" },
      ].map((chamber) => (
        <div
          className={`plab-chamber ${active === chamber.key ? "active" : ""}`}
          key={chamber.key}
        >
          <header>
            <b>{chamber.read}</b>
            <span>● NORMAL</span>
          </header>
          <strong>{chamber.name}</strong>
          <div className="plab-chamber-door">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i}>
                PT
                <br />
                {selectedMonth}M
              </i>
            ))}
          </div>
        </div>
      ))}
      <div
        className={`plab-photochamber ${active === "photo" ? "active" : ""}`}
      >
        <header>
          UV-A / Visible
          <br />
          <b>1.2 M lux·h</b>
        </header>
        <div>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i}>PT</i>
          ))}
        </div>
        <span>● NORMAL</span>
      </div>
    </div>
  );
}
