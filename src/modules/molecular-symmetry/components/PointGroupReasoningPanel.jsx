export function PointGroupReasoningPanel({ molecule }) {
  return (
    <section className="glass rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Point Group Reasoning</h3>
        <span className="rounded-full border border-indigo-400/25 bg-indigo-400/10 px-2 py-1 text-xs font-black text-indigo-100">{molecule.pointGroup}</span>
      </div>
      <ol className="space-y-2">
        {molecule.pointGroupReasoning.map((step, index) => (
          <li key={step} className="flex gap-2 text-xs leading-5 text-gray-300">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-[10px] font-black text-cyan-200">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default PointGroupReasoningPanel;
