import { formatValue, formatTemperature, formatDensity, formatYear } from '../../utils/formatters.js';

const Row = ({ label, value }) => (
  <div className="property-row">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs text-gray-200 text-right max-w-[55%]">{value || 'Data not available'}</span>
  </div>
);

export const ElementProperties = ({ element }) => (
  <div className="space-y-0">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Atomic Structure</p>
    <Row label="Electron Config." value={element.electronConfiguration} />
    <Row label="Shell Distribution" value={element.shells ? `[${element.shells.join(', ')}]` : null} />
    <Row label="Block" value={element.block ? `${element.block}-block` : null} />

    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Physical Properties</p>
    <Row label="Phase (STP)" value={element.phase} />
    <Row label="Density" value={element.density !== null && element.density !== undefined ? formatDensity(element.density) : null} />
    <Row label="Melting Point" value={element.meltingPoint !== null ? formatTemperature(element.meltingPoint) : null} />
    <Row label="Boiling Point" value={element.boilingPoint !== null ? formatTemperature(element.boilingPoint) : null} />
    <Row label="Atomic Radius" value={element.atomicRadius !== null ? formatValue(element.atomicRadius, 'pm') : null} />

    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Chemical Properties</p>
    <Row label="Electronegativity" value={element.electronegativity !== null ? formatValue(element.electronegativity, '(Pauling)') : null} />
    <Row label="Ionization Energy" value={element.ionizationEnergy !== null ? formatValue(element.ionizationEnergy, 'kJ/mol') : null} />

    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Discovery</p>
    <Row label="Discovered By" value={element.discoveredBy} />
    <Row label="Year Discovered" value={formatYear(element.yearDiscovered)} />
  </div>
);
export default ElementProperties;
