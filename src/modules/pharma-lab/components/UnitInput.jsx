export default function UnitInput({ label, value, onChange, unit, units = [unit], min = 0, max, step = "any", onUnitChange, help }) {
  return <label className="plab-unit-input"><span>{label}<small>{help}</small></span><span><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))}/><select aria-label={`${label} unit`} value={unit} onChange={(event) => onUnitChange?.(event.target.value)}>{units.map((item) => <option key={item}>{item}</option>)}</select></span></label>;
}
