export function AtomMappingTable({ result }) {
  const rows = result?.mapping || [];
  return (
    <section className="glass rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Atom Mapping</h3>
        {result && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${result.valid ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>
            {result.valid ? 'valid' : 'invalid'}
          </span>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500">Apply an operation to see equivalent atom mapping.</p>
      ) : (
        <div className="max-h-56 overflow-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-[10px] uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-2 py-2">Atom</th>
                <th className="px-2 py-2">Maps to</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map(row => (
                <tr key={row.from} className={row.unchanged ? 'text-emerald-200' : row.valid ? 'text-orange-200' : 'text-rose-200'}>
                  <td className="px-2 py-2 font-mono">{row.from}</td>
                  <td className="px-2 py-2 font-mono">{row.to}</td>
                  <td className="px-2 py-2">{row.unchanged ? 'unchanged' : row.valid ? 'swapped' : 'no match'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result?.explanation && <p className="mt-3 text-xs leading-5 text-gray-300">{result.explanation}</p>}
    </section>
  );
}

export default AtomMappingTable;
