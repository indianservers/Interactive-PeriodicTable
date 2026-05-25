import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen, Camera, Clipboard, Download, Eye, EyeOff, HelpCircle,
  Maximize2, RotateCcw, SlidersHorizontal,
} from 'lucide-react';
import MoleculeSelector from './components/MoleculeSelector.jsx';
import MoleculeViewer3D from './components/MoleculeViewer3D.jsx';
import SymmetryElementPanel from './components/SymmetryElementPanel.jsx';
import SymmetryOperationControls from './components/SymmetryOperationControls.jsx';
import AtomMappingTable from './components/AtomMappingTable.jsx';
import PointGroupReasoningPanel from './components/PointGroupReasoningPanel.jsx';
import SymmetryDecisionTree from './components/SymmetryDecisionTree.jsx';
import PracticeQuizPanel from './components/PracticeQuizPanel.jsx';
import ChallengeModePanel from './components/ChallengeModePanel.jsx';
import TheoryCard from './components/TheoryCard.jsx';
import AdvancedTeachingSuite from './components/AdvancedTeachingSuite.jsx';
import ClassroomExtensions from './components/ClassroomExtensions.jsx';
import { getMoleculeById } from './data/moleculeData.js';
import { loadSymmetryProgress } from './utils/localProgressStore.js';
import { validateSymmetryOperation } from './utils/symmetryOperations.js';

const modes = ['Learn', 'Practice', 'Challenge'];

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function exportSummaryPdf(molecule, result) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=880,height=720');
  if (!win) return;
  const mappingRows = (result?.mapping || []).map(row => `<tr><td>${row.from}</td><td>${row.to}</td><td>${row.unchanged ? 'unchanged' : row.valid ? 'swapped' : 'no match'}</td></tr>`).join('');
  win.document.write(`
    <html>
      <head>
        <title>${molecule.name} symmetry summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
          h1 { margin-bottom: 4px; }
          section { margin-top: 24px; }
          li { margin: 6px 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          td, th { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${molecule.name} (${molecule.formula})</h1>
        <p>${molecule.geometry} | Point group: <strong>${molecule.pointGroup}</strong></p>
        <section><h2>Reasoning</h2><ol>${molecule.pointGroupReasoning.map(step => `<li>${step}</li>`).join('')}</ol></section>
        <section><h2>Common mistakes</h2><ul>${molecule.commonMistakes.map(step => `<li>${step}</li>`).join('')}</ul></section>
        <section><h2>Latest atom mapping</h2><table><tr><th>Atom</th><th>Maps to</th><th>Status</th></tr>${mappingRows || '<tr><td colspan="3">No operation applied</td></tr>'}</table></section>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

export function MolecularSymmetryModule() {
  const viewerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);
  const [mode, setMode] = useState('Learn');
  const [moleculeId, setMoleculeId] = useState('water');
  const molecule = useMemo(() => getMoleculeById(moleculeId), [moleculeId]);
  const [selectedElement, setSelectedElement] = useState(() => molecule.symmetryElements[1] || molecule.symmetryElements[0]);
  const [operationResult, setOperationResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showElements, setShowElements] = useState(true);
  const [showGhost, setShowGhost] = useState(true);
  const [bondStyle, setBondStyle] = useState('ball-stick');
  const [hideAnswers, setHideAnswers] = useState(false);
  const [moduleContrast, setModuleContrast] = useState(false);
  const [progressState, setProgressState] = useState(() => loadSymmetryProgress());

  useEffect(() => {
    setSelectedElement(molecule.symmetryElements[1] || molecule.symmetryElements[0]);
    setOperationResult(null);
    setProgress(0);
    setIsPlaying(false);
  }, [molecule]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const tick = (time) => {
      if (!lastTickRef.current) lastTickRef.current = time;
      const delta = time - lastTickRef.current;
      lastTickRef.current = time;
      setProgress(value => {
        const next = Math.min(1, value + delta * 0.00055 * speed);
        if (next >= 1) setIsPlaying(false);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [isPlaying, speed]);

  const applyOperation = useCallback(() => {
    if (!selectedElement) return;
    setOperationResult(validateSymmetryOperation(molecule, selectedElement));
    setProgress(0);
    setIsPlaying(true);
  }, [molecule, selectedElement]);

  const resetOperation = () => {
    setIsPlaying(false);
    setProgress(0);
    setOperationResult(null);
  };

  const selectedIsValid = molecule.symmetryElements.some(element => element.id === selectedElement?.id);
  const availableElement = selectedIsValid
    ? selectedElement
    : { ...selectedElement, description: selectedElement?.description || 'Practice candidate.' };

  const copyExplanation = async () => {
    const text = [
      `${molecule.name} (${molecule.formula}) - ${molecule.pointGroup}`,
      ...molecule.pointGroupReasoning,
      ...(operationResult?.explanation ? [operationResult.explanation] : []),
    ].join('\n');
    await navigator.clipboard?.writeText(text);
  };

  const exportPng = () => {
    const url = viewerRef.current?.exportPNG();
    if (url) downloadDataUrl(url, `${molecule.id}-symmetry.png`);
  };

  const enterFullscreen = () => {
    document.querySelector('[data-symmetry-module]')?.requestFullscreen?.();
  };

  return (
    <div data-symmetry-module className={`page-transition min-h-screen p-4 md:p-6 ${moduleContrast ? 'high-contrast' : ''}`}>
      <div className="mx-auto max-w-[1600px] space-y-3">
        <header className="glass rounded-xl p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-cyan-300" />
                <h1 className="text-xl font-black tracking-tight text-white md:text-2xl">Molecular Symmetry Visualizer</h1>
              </div>
              <p className="mt-1 text-sm text-gray-400">A 3D molecular symmetry laboratory for postgraduate point group reasoning.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-xl border border-white/10">
                {modes.map(item => (
                  <button
                    key={item}
                    onClick={() => setMode(item)}
                    className={`px-3 py-2 text-xs font-bold transition-colors ${mode === item ? 'bg-cyan-500 text-slate-950' : 'bg-white/[0.04] text-gray-400 hover:text-white'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button onClick={resetOperation} className="btn-secondary inline-flex items-center gap-2"><RotateCcw size={15} />Reset</button>
              <button onClick={() => alert('Drag to rotate, scroll to zoom, right-drag to pan. Select an element, apply the operation, then compare atom mapping and point group reasoning.')} className="btn-secondary inline-flex items-center gap-2"><HelpCircle size={15} />Help</button>
            </div>
          </div>
        </header>

        <main className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <aside className="space-y-3">
            <MoleculeSelector selectedId={molecule.id} onSelect={setMoleculeId} />
            <section className="glass rounded-xl p-3">
              <h2 className="text-base font-black text-white">{molecule.name}</h2>
              <p className="mt-1 text-sm text-cyan-200">{molecule.formula} - {molecule.geometry}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Point Group</p>
                  <p className="text-lg font-black text-white">{hideAnswers && mode !== 'Learn' ? 'Hidden' : molecule.pointGroup}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Difficulty</p>
                  <p className="text-sm font-bold text-white">{molecule.difficulty}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-400">{molecule.notes}</p>
            </section>
            <SymmetryElementPanel
              molecule={molecule}
              selectedElementId={selectedElement?.id}
              onSelectElement={setSelectedElement}
              showAnswers={mode === 'Learn' || !hideAnswers}
              showElements={showElements}
              onToggleElements={() => setShowElements(value => !value)}
            />
          </aside>

          <section className="space-y-3 min-w-0">
            <div className="glass rounded-xl p-2">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <button onClick={() => viewerRef.current?.resetCamera()} className="btn-secondary inline-flex items-center gap-2"><RotateCcw size={15} />Camera</button>
                <button onClick={() => setShowLabels(value => !value)} className="btn-secondary inline-flex items-center gap-2">{showLabels ? <Eye size={15} /> : <EyeOff size={15} />}Labels</button>
                <button onClick={() => setShowGhost(value => !value)} className="btn-secondary inline-flex items-center gap-2">{showGhost ? <Eye size={15} /> : <EyeOff size={15} />}Ghost</button>
                <select value={bondStyle} onChange={event => setBondStyle(event.target.value)} className="input max-w-40 text-xs">
                  <option value="ball-stick">Ball and stick</option>
                  <option value="space-fill">Space fill</option>
                  <option value="wireframe">Wireframe</option>
                </select>
                <button onClick={exportPng} className="btn-secondary ml-auto inline-flex items-center gap-2"><Camera size={15} />PNG</button>
                <button onClick={() => exportSummaryPdf(molecule, operationResult)} className="btn-secondary inline-flex items-center gap-2"><Download size={15} />PDF</button>
                <button onClick={enterFullscreen} className="btn-secondary inline-flex items-center gap-2"><Maximize2 size={15} />Fullscreen</button>
              </div>
              <MoleculeViewer3D
                ref={viewerRef}
                molecule={molecule}
                selectedElement={availableElement}
                operationResult={operationResult}
                progress={progress}
                showLabels={showLabels}
                showElements={showElements}
                showGhost={showGhost}
                bondStyle={bondStyle}
                height={580}
              />
            </div>
            <SymmetryOperationControls
              selectedElement={selectedElement}
              isPlaying={isPlaying}
              progress={progress}
              speed={speed}
              onApply={applyOperation}
              onPause={() => setIsPlaying(false)}
              onStep={() => {
                if (!operationResult && selectedElement) setOperationResult(validateSymmetryOperation(molecule, selectedElement));
                setProgress(value => Math.min(1, value + 0.2));
              }}
              onReset={resetOperation}
              onSpeedChange={setSpeed}
            />
            <AdvancedTeachingSuite molecule={molecule} selectedElement={selectedElement} />
            <ClassroomExtensions molecule={molecule} operationResult={operationResult} onSelectMolecule={setMoleculeId} />
          </section>

          <aside className="space-y-3">
            <section className="glass rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">Teaching Controls</h3>
                <SlidersHorizontal size={15} className="text-cyan-300" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setHideAnswers(value => !value)} className={`rounded-lg border px-2 py-2 text-xs ${hideAnswers ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-white/10 text-gray-300'}`}>
                  Hide Answers
                </button>
                <button onClick={() => setModuleContrast(value => !value)} className={`rounded-lg border px-2 py-2 text-xs ${moduleContrast ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-gray-300'}`}>
                  Contrast
                </button>
                <button onClick={copyExplanation} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-gray-300 hover:bg-white/10">
                  <Clipboard size={13} className="mr-1 inline" />Copy Notes
                </button>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs text-gray-300">
                  Score {progressState.score}/{progressState.attempts || 0}
                </div>
              </div>
            </section>

            <TheoryCard type={selectedElement?.type || 'E'} />
            <AtomMappingTable result={operationResult} />
            {mode === 'Learn' && (
              <>
                <PointGroupReasoningPanel molecule={molecule} />
                <SymmetryDecisionTree molecule={molecule} />
                <section className="glass rounded-xl p-3">
                  <h3 className="text-sm font-bold text-white">Common Student Mistakes</h3>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-400">
                    {molecule.commonMistakes.map(mistake => <li key={mistake}>- {mistake}</li>)}
                  </ul>
                </section>
              </>
            )}
            {mode === 'Practice' && (
              <PracticeQuizPanel
                molecule={molecule}
                selectedElement={selectedElement}
                validationResult={operationResult}
                onProgress={setProgressState}
              />
            )}
            {mode === 'Challenge' && (
              <ChallengeModePanel
                molecule={molecule}
                onRandomMolecule={setMoleculeId}
                onProgress={setProgressState}
              />
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

export default MolecularSymmetryModule;
