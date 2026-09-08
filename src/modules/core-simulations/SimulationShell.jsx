import { RotateCcw } from 'lucide-react';
import './coreSimulations.css';

export const SimPanel = ({ children, className = '', ...props }) => <section className={`sim-panel ${className}`} {...props}>{children}</section>;
export const Stepper = ({ label, value, color, onChange, min = 0, max = 200 }) => <div className="sim-stepper"><span className="sim-dot" style={{ background: color }} /><span className="sim-stepper-label">{label}</span><button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Remove ${label}`}>−</button><strong>{value}</strong><button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Add ${label}`}>+</button></div>;
export const ResetButton = ({ onClick, label = 'Reset' }) => <button className="sim-reset" onClick={onClick}><RotateCcw size={18} /> {label}</button>;
export const Metric = ({ label, value, accent = '#dbeafe', icon }) => <div className="sim-metric">{icon}<span>{label}</span><strong style={{ color: accent }}>{value}</strong></div>;
