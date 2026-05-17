import { useState } from 'react';
import { X, Heart, Atom, GitCompare, Info, ZoomIn } from 'lucide-react';
import { getCategoryInfo } from '../../data/categories.js';
import { getPhaseBadge } from '../../utils/colorScales.js';
import { ElementProperties } from './ElementProperties.jsx';
import { ElectronShellDiagram } from '../visualizers/ElectronShellDiagram.jsx';

export const ElementDetailsDrawer = ({
  element,
  onClose,
  onFavoriteToggle,
  isFavorite,
  onViewAtom,
  onCompare,
  reducedMotion,
}) => {
  const [showAtomZoom, setShowAtomZoom] = useState(false);
  if (!element) return null;
  const catInfo = getCategoryInfo(element.category);
  const phase = getPhaseBadge(element.phase);
  const shellRows = element.shells?.map((count, index) => ({ shell: index + 1, electrons: count })) || [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-white/10" style={{ borderColor: `${catInfo.color}30` }}>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border"
            style={{ backgroundColor: `${catInfo.color}20`, borderColor: `${catInfo.color}40`, color: catInfo.color }}
          >
            {element.symbol}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{element.name}</h2>
            <p className="text-sm text-gray-400">#{element.atomicNumber} · {element.atomicMass} u</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full border text-gray-300" style={{ borderColor: `${catInfo.color}40`, backgroundColor: `${catInfo.color}15` }}>
                {element.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${phase.color}`}>{phase.label}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Atom diagram */}
        <div className="flex justify-center py-4 px-4 bg-white/[0.02]">
          <div className="relative w-48 h-48">
            <ElectronShellDiagram element={element} reducedMotion={reducedMotion} />
            <button
              onClick={() => setShowAtomZoom(true)}
              className="absolute right-0 top-0 p-2 rounded-xl bg-gray-950/80 border border-white/10 text-gray-200 hover:text-white hover:border-cyan-400/40 transition-colors"
              aria-label="Magnify atom shell diagram"
              title="Magnify shell diagram"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
        <div className="px-2 pb-1 text-center">
          <span className="text-[10px] text-gray-600">Bohr-style educational shell diagram</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-5 py-3">
          <button
            onClick={() => onFavoriteToggle(element)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              isFavorite
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                : 'glass border-white/10 text-gray-300 hover:border-white/20'
            }`}
          >
            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => onViewAtom(element)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-gray-300 hover:border-white/20 transition-all"
          >
            <Atom size={14} />
            Atom
          </button>
          <button
            onClick={() => onCompare(element)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-gray-300 hover:border-white/20 transition-all"
          >
            <GitCompare size={14} />
            Compare
          </button>
        </div>

        {/* Summary */}
        {element.summary && (
          <div className="mx-5 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Info size={12} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-400">Summary</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{element.summary}</p>
          </div>
        )}

        {/* Properties */}
        <div className="px-5 pb-4">
          <ElementProperties element={element} />
        </div>

        {/* Common uses */}
        {element.commonUses && element.commonUses.length > 0 && (
          <div className="px-5 pb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Common Uses</p>
            <div className="flex flex-wrap gap-1.5">
              {element.commonUses.map((use, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAtomZoom && (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-gray-950 border border-white/15 shadow-2xl">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
              <div>
                <p className="text-lg font-black text-white">{element.name} Shell Diagram</p>
                <p className="text-sm text-gray-400">#{element.atomicNumber} - {element.symbol} - {element.category}</p>
              </div>
              <button onClick={() => setShowAtomZoom(false)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white" aria-label="Close magnified atom diagram">
                <X size={18} />
              </button>
            </div>

            <div className="grid lg:grid-cols-[1fr_260px] gap-5 p-5">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-center min-h-[360px]">
                <div className="w-full max-w-[520px] aspect-square">
                  <ElectronShellDiagram element={element} reducedMotion={reducedMotion} />
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 h-fit">
                <div className="flex items-center gap-2 mb-3">
                  <Atom size={16} className="text-cyan-300" />
                  <p className="text-sm font-bold text-white">Shell Electrons</p>
                </div>
                <div className="space-y-2">
                  {shellRows.map(row => (
                    <div key={row.shell} className="flex items-center justify-between rounded-xl bg-black/20 border border-white/10 px-3 py-2">
                      <span className="text-base font-bold text-gray-100">n={row.shell}</span>
                      <span className="text-base text-cyan-200">{row.electrons}e</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                  Large view keeps shell labels readable for elements with many electron shells.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ElementDetailsDrawer;
