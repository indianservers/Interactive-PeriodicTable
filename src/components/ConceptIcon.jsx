import { pngIconPath } from '../data/homeIconManifest.js';
export default function ConceptIcon({ icon, className = '' }) {
 return <img className={`concept-png ${className}`} src={pngIconPath(icon)} width="64" height="64" alt="" aria-hidden="true" loading="lazy" decoding="async" />;
}
