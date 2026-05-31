import { Clipboard, FileText, FolderOpen, Printer, Save } from 'lucide-react';
import { formatLabReport } from '../utils/reportUtils.js';

export function LabReportPanel({
  currentReport,
  reports,
  onGenerate,
  onCopy,
  onSave,
  onLoad,
  onPrint,
}) {
  return (
    <section className="border-t border-white/10 bg-slate-950/90 p-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_0.75fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-cyan-200" />
              <div>
                <p className="text-sm font-black text-white">Lab Report Generator</p>
                <p className="text-xs text-gray-500">Frontend-only text report with print-friendly browser output.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={onGenerate} className="btn-primary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button"><FileText size={14} /> Generate</button>
              <button onClick={onCopy} disabled={!currentReport} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs disabled:opacity-40" type="button"><Clipboard size={14} /> Copy</button>
              <button onClick={onSave} disabled={!currentReport} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs disabled:opacity-40" type="button"><Save size={14} /> Save</button>
              <button onClick={onPrint} disabled={!currentReport} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs disabled:opacity-40" type="button"><Printer size={14} /> Print</button>
            </div>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-gray-300">
            {currentReport ? formatLabReport(currentReport) : 'Generate a report after running a simulation or logic block sequence.'}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-3 flex items-center gap-2">
            <FolderOpen size={15} className="text-amber-200" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Reload Previous Reports</p>
          </div>
          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {reports.length ? reports.map(report => (
              <button key={report.id} onClick={() => onLoad(report.id)} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-left text-xs hover:bg-white/[0.06]" type="button">
                <span className="block font-bold text-white">{report.title}</span>
                <span className="text-gray-500">{report.grade} - {report.score}% - {report.savedAt || report.dateTime}</span>
              </button>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-gray-500">No saved reports yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
