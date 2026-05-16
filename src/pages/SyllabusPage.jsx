import { useMemo, useState } from 'react';
import { BookOpen, Filter, FlaskConical, GraduationCap, Search, Target, Tags } from 'lucide-react';
import {
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

const trackGroups = ['School', 'Senior Secondary', 'Entrance'];

export const SyllabusPage = ({ onNavigate }) => {
  const [activeTrack, setActiveTrack] = useState('class10');
  const [activeUnit, setActiveUnit] = useState('all');
  const [query, setQuery] = useState('');

  const unitOptions = useMemo(() => syllabusUnits.filter(unit => unit.tracks.includes(activeTrack)), [activeTrack]);

  const taggedTools = useMemo(() => labToolCatalog.map(tool => ({
    ...tool,
    syllabus: getSyllabusTagsForLab(tool.id),
  })), []);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return taggedTools.filter(tool => {
      const inTrack = tool.syllabus.tracks.includes(activeTrack);
      const inUnit = activeUnit === 'all' || tool.syllabus.units.includes(activeUnit);
      const text = [
        tool.title,
        tool.type,
        ...tool.syllabus.tracks.map(id => syllabusTrackMap[id]?.label || id),
        ...tool.syllabus.units.map(getUnitTitle),
      ].join(' ').toLowerCase();
      return inTrack && inUnit && (!q || text.includes(q));
    });
  }, [activeTrack, activeUnit, query, taggedTools]);

  const coveredUnits = unitOptions.filter(unit => taggedTools.some(tool =>
    tool.syllabus.tracks.includes(activeTrack) && tool.syllabus.units.includes(unit.id)
  ));

  const track = syllabusTrackMap[activeTrack];
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
              See how every Chemistry Lab tool connects to Class 8-12, NEET, JEE Main, and JEE Advanced chemistry topics.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black text-white">{labToolCatalog.length}</p>
              <p className="text-[10px] text-gray-500">tagged tools</p>
            </div>
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black text-white">{coveredUnits.length}/{unitOptions.length}</p>
              <p className="text-[10px] text-gray-500">units covered</p>
            </div>
            <div className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2">
              <p className="text-lg font-black" style={{ color: track.color }}>{coveragePercent}%</p>
              <p className="text-[10px] text-gray-500">{track.label}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[280px_1fr] gap-4">
        <aside className="glass rounded-2xl p-4 h-fit space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-cyan-300" />
              <h3 className="text-sm font-bold text-white">Track</h3>
            </div>
            <div className="space-y-3">
              {trackGroups.map(group => (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">{group}</p>
                  <div className="space-y-1">
                    {syllabusTracks.filter(item => item.group === group).map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTrack(item.id); setActiveUnit('all'); }}
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
              const tools = taggedTools.filter(tool => tool.syllabus.tracks.includes(activeTrack) && tool.syllabus.units.includes(unit.id));
              const active = activeUnit === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => setActiveUnit(active ? 'all' : unit.id)}
                  className={`text-left rounded-2xl border p-4 transition-colors ${
                    active ? 'bg-indigo-600/20 border-indigo-500/40' : 'glass border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
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
              );
            })}
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
