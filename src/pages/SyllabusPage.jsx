import { useMemo, useState } from 'react';
import { BadgeCheck, BookOpen, Box, Filter, FlaskConical, GraduationCap, Layers3, Route, Search, Target, Tags } from 'lucide-react';
import {
  curriculumBoards,
  curriculumVisualizationMap,
  getCurriculumPlan,
  getSyllabusTagsForLab,
  getUnitTitle,
  labToolCatalog,
  syllabusTrackMap,
  syllabusTracks,
  syllabusUnits,
} from '../data/syllabus.js';

const Pill = ({ children, color = '#64748b' }) => (
  <span
    className="inline-flex items-center rounded-full border bg-black/15 px-2 py-0.5 text-[10px] font-semibold"
    style={{ borderColor: `${color}66`, color }}
  >
    {children}
  </span>
);

const trackGroups = ['School', 'Senior Secondary', 'Entrance', 'Applied'];
const gradeOptions = [6, 7, 8, 9, 10, 11, 12];

const boardStageLabel = (boardId, grade) => {
  if (boardId === 'igcse' && grade <= 8) return 'Lower Secondary bridge';
  if (boardId === 'igcse' && grade <= 10) return 'IGCSE Chemistry 0620';
  if (boardId === 'ib' && grade <= 10) return 'IB MYP chemistry bridge';
  if (boardId === 'ib') return 'IB DP Chemistry';
  if (boardId === 'ap' && grade >= 11) return 'AP Intermediate Chemistry';
  if (boardId === 'cbse' && grade >= 11) return 'CBSE Chemistry 043';
  return 'School Science chemistry strand';
};

export const SyllabusPage = ({ onNavigate }) => {
  const [activeBoard, setActiveBoard] = useState('cbse');
  const [activeGrade, setActiveGrade] = useState(10);
  const [activeTrack, setActiveTrack] = useState('class10');
  const [activeUnit, setActiveUnit] = useState('all');
  const [query, setQuery] = useState('');

  const curriculumPlan = useMemo(() => getCurriculumPlan(activeBoard, activeGrade), [activeBoard, activeGrade]);

  const unitOptions = useMemo(() => {
    const curriculumUnits = syllabusUnits.filter(unit => curriculumPlan.unitIds.includes(unit.id));
    if (curriculumUnits.length > 0) return curriculumUnits;
    return syllabusUnits.filter(unit => unit.tracks.includes(activeTrack));
  }, [activeTrack, curriculumPlan.unitIds]);

  const taggedTools = useMemo(() => labToolCatalog.map(tool => ({
    ...tool,
    syllabus: getSyllabusTagsForLab(tool.id),
  })), []);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return taggedTools.filter(tool => {
      const inTrack = tool.syllabus.tracks.includes(activeTrack) || tool.syllabus.tracks.includes(curriculumPlan.baseTrack);
      const inCurriculum = tool.syllabus.units.some(unitId => curriculumPlan.unitIds.includes(unitId));
      const inUnit = activeUnit === 'all' ? inCurriculum : tool.syllabus.units.includes(activeUnit);
      const text = [
        tool.title,
        tool.type,
        curriculumPlan.board.label,
        `Grade ${curriculumPlan.grade}`,
        ...tool.syllabus.tracks.map(id => syllabusTrackMap[id]?.label || id),
        ...tool.syllabus.units.map(getUnitTitle),
      ].join(' ').toLowerCase();
      return (inTrack || inCurriculum) && inUnit && (!q || text.includes(q));
    });
  }, [activeTrack, activeUnit, curriculumPlan, query, taggedTools]);

  const coveredUnits = unitOptions.filter(unit => taggedTools.some(tool => tool.syllabus.units.includes(unit.id)));

  const coveragePercent = unitOptions.length ? Math.round((coveredUnits.length / unitOptions.length) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Syllabus Map</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              See AP State, CBSE, IGCSE/Cambridge, and IB chemistry coverage from Grade 6 to 12, with direct 2D and 3D interactive visualizations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black text-white">{labToolCatalog.length}</p>
              <p className="text-[10px] text-gray-500">tagged tools</p>
            </div>
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black text-white">{coveredUnits.length}/{unitOptions.length}</p>
              <p className="text-[10px] text-gray-500">grade units covered</p>
            </div>
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black" style={{ color: curriculumPlan.board.color }}>{coveragePercent}%</p>
              <p className="text-[10px] text-gray-500">{curriculumPlan.board.label} G{curriculumPlan.grade}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[280px_1fr] gap-4">
        <aside className="glass rounded-2xl p-4 h-fit space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck size={16} className="text-emerald-300" />
              <h3 className="text-sm font-bold text-white">Board</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {curriculumBoards.map(board => (
                <button
                  key={board.id}
                  onClick={() => { setActiveBoard(board.id); setActiveTrack(`class${activeGrade}`); setActiveUnit('all'); }}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                    activeBoard === board.id ? 'bg-white/[0.09] border-white/20 text-white' : 'bg-white/[0.025] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="mb-1 block h-1.5 w-8 rounded-full" style={{ background: board.color }} />
                  {board.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">{curriculumPlan.board.detail}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Route size={16} className="text-cyan-300" />
              <h3 className="text-sm font-bold text-white">Grade 6-12</h3>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {gradeOptions.map(grade => (
                <button
                  key={grade}
                  onClick={() => { setActiveGrade(grade); setActiveTrack(`class${grade}`); setActiveUnit('all'); }}
                  className={`rounded-lg border px-2 py-2 text-xs font-black transition-colors ${
                    activeGrade === grade ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.025] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-gray-500">{boardStageLabel(activeBoard, activeGrade)}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-cyan-300" />
              <h3 className="text-sm font-bold text-white">Extra Track</h3>
            </div>
            <div className="space-y-3">
              {trackGroups.map(group => (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{group}</p>
                  <div className="space-y-1">
                    {syllabusTracks.filter(item => item.group === group).map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTrack(item.id); setActiveGrade(Number(item.id.replace('class', '')) || activeGrade); setActiveUnit('all'); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                          activeTrack === item.id ? 'bg-white/[0.09] border-white/20 text-white' : 'bg-white/[0.025] border-white/10 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-4 min-w-0">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Curriculum Coverage</p>
                <h3 className="mt-1 text-lg font-black text-white">{curriculumPlan.board.label} Grade {curriculumPlan.grade}</h3>
                <p className="mt-1 text-sm text-gray-400">{curriculumPlan.summary}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-lg font-black text-white">{curriculumPlan.unitIds.length}</p>
                  <p className="text-[10px] text-gray-500">topics</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-lg font-black text-cyan-100">{curriculumPlan.visuals.length}</p>
                  <p className="text-[10px] text-gray-500">2D maps</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-lg font-black text-emerald-100">{curriculumPlan.visuals.length}</p>
                  <p className="text-[10px] text-gray-500">3D maps</p>
                </div>
              </div>
            </div>
          </section>

          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search tools, units, exams, or classes"
                  className="input text-sm pl-9"
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Filter size={14} className="text-gray-500 flex-shrink-0" />
                <select value={activeUnit} onChange={e => setActiveUnit(e.target.value)} className="input text-sm lg:w-80">
                  <option value="all">All mapped units</option>
                  {unitOptions.map(unit => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
                </select>
              </div>
            </div>
          </div>

          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {unitOptions.map(unit => {
              const tools = taggedTools.filter(tool => tool.syllabus.units.includes(unit.id));
              const active = activeUnit === unit.id;
              const visual = curriculumVisualizationMap[unit.id] || { twoD: 'chemistry-visuals', threeD: 'molecule' };
              return (
                <div
                  key={unit.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    active ? 'bg-indigo-600/20 border-indigo-500/40' : 'glass border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  <button type="button" onClick={() => setActiveUnit(active ? 'all' : unit.id)} className="w-full text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <BookOpen size={16} className="text-cyan-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">{unit.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{tools.length} connected lab tools</p>
                      </div>
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onNavigate?.(visual.twoD)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-2 py-2 text-[11px] font-black text-cyan-100 hover:bg-cyan-300/15">
                      <Box size={13} /> 2D
                    </button>
                    <button type="button" onClick={() => onNavigate?.(visual.threeD)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-2 py-2 text-[11px] font-black text-emerald-100 hover:bg-emerald-300/15">
                      <Layers3 size={13} /> 3D
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Layers3 size={16} className="text-emerald-300" />
                <h3 className="text-sm font-bold text-white">2D + 3D Visualization Map</h3>
              </div>
              <span className="text-xs text-gray-500">{curriculumPlan.visuals.length} mapped topics</span>
            </div>
            <div className="grid gap-2 lg:grid-cols-2">
              {curriculumPlan.visuals.map(visual => (
                <div key={visual.unitId} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-sm font-bold text-white">{visual.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{visual.title === getUnitTitle(visual.unitId) ? 'Interactive chemistry visualization' : getUnitTitle(visual.unitId)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onNavigate?.(visual.twoD)} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15">
                      <Box size={14} /> Open 2D
                    </button>
                    <button type="button" onClick={() => onNavigate?.(visual.threeD)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15">
                      <Layers3 size={14} /> Open 3D
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FlaskConical size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Connected Lab Tools</h3>
              </div>
              <span className="text-xs text-gray-500">{filteredTools.length} results</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-2">
              {filteredTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => onNavigate?.('lab')}
                  className="text-left rounded-xl bg-white/[0.035] border border-white/10 p-3 hover:bg-white/[0.065] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      <Tags size={15} className="text-cyan-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{tool.title}</p>
                        <span className="text-[10px] text-gray-500 flex-shrink-0">{tool.type}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tool.syllabus.tracks.map(trackId => (
                          <Pill key={trackId} color={syllabusTrackMap[trackId]?.color}>{syllabusTrackMap[trackId]?.label}</Pill>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tool.syllabus.units.map(unitId => (
                          <span key={unitId} className="rounded-lg bg-white/[0.04] border border-white/10 px-2 py-1 text-[10px] text-gray-400">
                            {getUnitTitle(unitId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-500">No tools match this syllabus filter yet.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default SyllabusPage;
