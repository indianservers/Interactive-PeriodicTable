import { useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, ExternalLink, FileText, Play } from 'lucide-react';
import { lectureCompanionSlides, lecturePdfSource } from '../data/lectureCompanion.js';
import { getMoleculeById } from '../data/moleculeData.js';

export function LecturePdfCompanion({ molecule, onSelectMolecule, onSelectElement, onSetOperationPower, onApplyOperation }) {
  const [activePage, setActivePage] = useState(lectureCompanionSlides[0].page);
  const activeSlide = useMemo(
    () => lectureCompanionSlides.find(slide => slide.page === activePage) || lectureCompanionSlides[0],
    [activePage],
  );

  const loadSlide = (slide) => {
    setActivePage(slide.page);
    if (slide.moleculeId) onSelectMolecule?.(slide.moleculeId);
    window.setTimeout(() => {
      if (slide.elementId) {
        const nextMolecule = slide.moleculeId ? getMoleculeById(slide.moleculeId) : molecule;
        const element = nextMolecule?.symmetryElements?.find(item => item.id === slide.elementId);
        if (element) onSelectElement?.(element);
      }
      if (slide.title.includes('C3^2')) onSetOperationPower?.(2);
    }, 0);
  };

  const operateLectureExample = () => {
    const element = molecule.symmetryElements.find(item => item.id === activeSlide.elementId);
    if (element) onSelectElement?.(element);
    if (activeSlide.title.includes('C3')) onSetOperationPower?.(activeSlide.title.includes('powers') ? 2 : 1);
    if (activeSlide.title.includes('Even axes')) onSetOperationPower?.(2);
    window.setTimeout(() => onApplyOperation?.(), 0);
  };

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked size={18} className="text-emerald-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Lecture 11 and 12 PDF Companion</p>
          </div>
          <h2 className="mt-1 text-base font-black text-white">Symmetry operations, point groups, and character tables</h2>
          <p className="mt-1 text-xs text-gray-400">Mapped from the supplied lecture PDF into clickable visual demonstrations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={lecturePdfSource.url}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex items-center gap-2 text-xs"
            title={lecturePdfSource.title}
          >
            <ExternalLink size={14} />
            Open PDF
          </a>
          <button
            onClick={operateLectureExample}
            disabled={!activeSlide.elementId}
            className="btn-primary inline-flex items-center gap-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={14} />
            Operate Example
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {lectureCompanionSlides.map(slide => (
            <button
              key={slide.page}
              onClick={() => loadSlide(slide)}
              className={`w-full rounded-lg border p-2 text-left transition-colors ${activePage === slide.page ? 'border-emerald-400/35 bg-emerald-400/10' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'}`}
            >
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-emerald-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page {slide.page}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-white">{slide.title}</p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Page {activeSlide.page}</p>
              <h3 className="text-lg font-black text-white">{activeSlide.title}</h3>
            </div>
            {activeSlide.moleculeId && (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-100">
                opens {activeSlide.moleculeId}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-300">{activeSlide.summary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {activeSlide.actions.map(action => (
              <div key={action} className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-950/40 p-2 text-xs text-gray-300">
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-300" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LecturePdfCompanion;
