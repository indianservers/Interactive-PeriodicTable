import ResourceDialog from './ResourceDialog.jsx';
const rows = [
  ['Amount of substance','n = m / M','m in g; M in g mol⁻¹'],
  ['Particle count','N = n Nₐ','Nₐ = 6.02214076 × 10²³ mol⁻¹'],
  ['Concentration','c = n / V','V in L; c in mol L⁻¹'],
  ['Dilution','c₁V₁ = c₂V₂','Same solute; consistent volume units'],
  ['Ideal gas','pV = nRT','R = 8.314462618 J mol⁻¹ K⁻¹; p in Pa, V in m³, T in K'],
  ['Heat transfer','q = mcΔT','Match mass and heat-capacity units'],
  ['Gibbs energy','ΔG = ΔH − TΔS','T in K; consistent energy units'],
  ['Acidity','pH = −log₁₀ a(H⁺)','For dilute ideal solutions, a ≈ [H⁺] / 1 M'],
  ['Equilibrium','K = ∏ a(products)^ν / ∏ a(reactants)^ν','Use dimensionless activities; omit pure solids and liquids'],
  ['First-order kinetics','ln([A]ₜ / [A]₀) = −kt','t½ = ln(2) / k'],
  ['Beer–Lambert law','A = εlc','Use matching path-length and concentration units'],
  ['Electrochemistry','E = E° − (RT / nF) ln Q','F = 96485.33212 C mol⁻¹'],
  ['Percent yield','100 × actual yield / theoretical yield','Use the same units'],
  ['Temperature','T(K) = t(°C) + 273.15','Kelvin has no degree symbol'],
];
export default function FormulaSheet({ onClose }) {
  return <ResourceDialog title="Chemistry Formula Sheet" onClose={onClose}><p>Core equations and constants. Check each equation’s assumptions before applying it.</p><div style={{overflowX:'auto',marginTop:16}}><table style={{width:'100%',textAlign:'left'}}><thead><tr><th>Topic</th><th>Equation</th><th>Units / conditions</th></tr></thead><tbody>{rows.map(([name,equation,note])=><tr key={name}><th style={{padding:'12px 8px',borderBottom:'1px solid #345'}}>{name}</th><td style={{padding:12,borderBottom:'1px solid #345'}}>{equation}</td><td style={{padding:12,borderBottom:'1px solid #345'}}>{note}</td></tr>)}</tbody></table></div></ResourceDialog>;
}
