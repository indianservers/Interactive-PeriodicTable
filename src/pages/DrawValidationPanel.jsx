export default function DrawValidationPanel({ issues, empty, pending, onHighlight }) {
  return <section className="draw-validation" aria-label="Structure validation"><h3>Structure check</h3>
    <p role="status">{empty ? 'Draw a molecule to check it.' : pending ? 'Checking structure…' : issues.length ? `${issues.filter(i => i.severity === 'error').length} errors · ${issues.filter(i => i.severity === 'warning').length} warnings` : 'Structure valid · no detected issues.'}</p>
    {issues.map((issue, i) => <button key={i} className={`issue-${issue.severity}`} onClick={() => onHighlight(issue.atomIds)}>{issue.severity === 'error' ? 'Error: ' : 'Check: '}{issue.message}</button>)}
  </section>;
}
