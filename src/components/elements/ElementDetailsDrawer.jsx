import { useState } from 'react';
import { X, Heart, Atom, GitCompare, Info, ZoomIn, RadioTower, Download, Pin } from 'lucide-react';
import { getCategoryInfo } from '../../data/categories.js';
import { getPhaseBadge } from '../../utils/colorScales.js';
import { ElementProperties } from './ElementProperties.jsx';
import { ElectronShellDiagram } from '../visualizers/ElectronShellDiagram.jsx';
import { likelyIsotopes } from '../../utils/chemistryTools.js';

const abundanceValue = (abundance = '') => {
  const parsed = Number(String(abundance).replace(/[^\d.]/g, ''));
  if (Number.isFinite(parsed) && parsed > 0) return Math.min(100, parsed);
  return abundance === 'trace' ? 2 : abundance === 'synthetic' ? 6 : 12;
};

const exportElementCard = (element, catInfo) => {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#08111f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 720, 1024);
  gradient.addColorStop(0, `${catInfo.color}44`);
  gradient.addColorStop(1, '#020617');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = catInfo.color;
  ctx.lineWidth = 10;
  ctx.strokeRect(36, 36, 648, 952);
  ctx.fillStyle = catInfo.color;
  ctx.font = '700 42px Arial';
  ctx.fillText(`#${element.atomicNumber}`, 72, 110);
  ctx.textAlign = 'center';
  ctx.font = '900 210px Arial';
  ctx.fillText(element.symbol, 360, 365);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 58px Arial';
  ctx.fillText(element.name, 360, 455);
  ctx.font = '24px Arial';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(element.category, 360, 500);
  ctx.textAlign = 'left';
  const rows = [
    ['Atomic mass', `${element.atomicMass} u`],
    ['Phase', element.phase],
    ['Group / Period', `${element.group ?? 'f-block'} / ${element.period}`],
    ['Electron config', element.electronConfiguration],
    ['Discovered', element.yearDiscovered ? `${element.yearDiscovered}, ${element.discoveredBy}` : element.discoveredBy || 'Ancient'],
  ];
  ctx.font = '700 24px Arial';
  rows.forEach(([label, value], index) => {
    const y = 610 + index * 58;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(label, 80, y);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(String(value).slice(0, 42), 285, y);
  });
  ctx.font = '20px Arial';
  ctx.fillStyle = '#cbd5e1';
  const summary = element.summary || `${element.name} is a ${element.category}.`;
  const words = summary.split(' ');
  let line = '';
  let y = 900;
  words.forEach(word => {
    const next = `${line} ${word}`.trim();
    if (ctx.measureText(next).width > 560) {
      ctx.fillText(line, 80, y);
      line = word;
      y += 28;
    } else {
      line = next;
    }
  });
  ctx.fillText(line, 80, y);
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `${element.symbol}-element-card.png`;
  a.click();
};

const printElementCardPdf = (element, catInfo) => {
  const win = window.open('', '_blank', 'width=760,height=980');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${element.symbol} card</title><style>
    body{margin:0;background:#0f172a;color:#f8fafc;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh}
    .card{width:560px;min-height:760px;border:8px solid ${catInfo.color};border-radius:28px;padding:36px;background:linear-gradient(145deg,${catInfo.color}44,#020617)}
    .num{color:${catInfo.color};font-weight:800;font-size:34px}.sym{text-align:center;color:${catInfo.color};font-weight:900;font-size:170px;line-height:1}
    h1{text-align:center;font-size:48px;margin:0 0 8px}.cat{text-align:center;color:#cbd5e1;margin-bottom:36px}
    .row{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.15);padding:12px 0;font-size:18px}.label{color:#94a3b8}
    p{color:#cbd5e1;line-height:1.5;margin-top:28px}@media print{body{background:white}.card{break-inside:avoid}}
  </style></head><body><main class="card">
    <div class="num">#${element.atomicNumber}</div><div class="sym">${element.symbol}</div><h1>${element.name}</h1><div class="cat">${element.category}</div>
    <div class="row"><span class="label">Atomic mass</span><span>${element.atomicMass} u</span></div>
    <div class="row"><span class="label">Phase</span><span>${element.phase}</span></div>
    <div class="row"><span class="label">Group / Period</span><span>${element.group ?? 'f-block'} / ${element.period}</span></div>
    <div class="row"><span class="label">Electron config</span><span>${element.electronConfiguration}</span></div>
    <p>${element.summary || ''}</p>
  </main><script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
};

export const ElementDetailsDrawer = ({
  element,
  onClose,
  onFavoriteToggle,
  isFavorite,
  onViewAtom,
  onCompare,
  onPinToggle,
  isPinned,
  reducedMotion,
}) => {
  const [showAtomZoom, setShowAtomZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  if (!element) return null;
  const catInfo = getCategoryInfo(element.category);
  const phase = getPhaseBadge(element.phase);
  const shellRows = element.shells?.map((count, index) => ({ shell: index + 1, electrons: count })) || [];
  const isotopes = likelyIsotopes(element);

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

        <div className="px-5 pt-2">
          <div className="grid grid-cols-3 rounded-xl bg-white/[0.04] border border-white/10 p-1">
            {[
              ['overview', 'Overview'],
              ['isotopes', 'Isotopes'],
              ['biology', 'Biology'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTab === id ? 'bg-indigo-500/20 text-indigo-200' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
        <div className={`grid ${onPinToggle ? 'grid-cols-3' : 'grid-cols-2'} gap-2 px-5 pb-3`}>
          {onPinToggle && (
            <button
              onClick={() => onPinToggle(element)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                isPinned ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : 'glass border-white/10 text-gray-300 hover:border-white/20'
              }`}
            >
              <Pin size={14} />
              {isPinned ? 'Pinned' : 'Pin'}
            </button>
          )}
          <button
            onClick={() => exportElementCard(element, catInfo)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-gray-300 hover:border-white/20 transition-all"
          >
            <Download size={14} />
            PNG
          </button>
          <button
            onClick={() => printElementCardPdf(element, catInfo)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-gray-300 hover:border-white/20 transition-all"
          >
            <Download size={14} />
            PDF
          </button>
        </div>

        {activeTab === 'biology' ? (
          <div className="px-5 pb-6">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-4">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Biological Role</p>
              <p className="text-sm text-emerald-50 leading-relaxed">{element.biologicalRole}</p>
            </div>
            <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-400">
              NEET anchor: connect the element to biomolecules, electrolytes, enzymes, deficiency/toxicity, and body systems where applicable.
            </div>
          </div>
        ) : activeTab === 'isotopes' ? (
          <div className="px-5 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <RadioTower size={14} className="text-cyan-300" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Known Isotopes</p>
            </div>
            {isotopes.length ? (
              <div className="space-y-2">
                {isotopes.map(iso => (
                  <div key={iso.label} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-white">{iso.label}</span>
                      <span className="text-[10px] text-gray-500">{iso.protons}p / {iso.neutrons ?? '?'}n</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-black/30 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${abundanceValue(iso.abundance)}%`, background: catInfo.color }}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                      <span>Abundance: <span className="text-gray-200">{iso.abundance}</span></span>
                      <span>Half-life: <span className="text-gray-200">{iso.halfLife}</span></span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">Decay mode: {iso.decay || 'stable'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-xs text-gray-400">
                No curated isotope records are loaded for {element.name} yet.
              </div>
            )}
          </div>
        ) : (
        <>
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
        </>
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
