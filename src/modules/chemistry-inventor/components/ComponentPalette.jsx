import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { paletteGroups } from '../data/studioModes.js';
import { getGradeLevel } from '../data/gradeConceptMap.js';

export function ComponentPalette({ grade, onAddComponent }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const selectedGrade = getGradeLevel(grade);
  const filteredGroups = useMemo(() => paletteGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => (
        (item.gradeLevel || 7) <= selectedGrade
        && (!normalizedQuery || `${item.label} ${item.componentType} ${item.state}`.toLowerCase().includes(normalizedQuery))
      )),
    }))
    .filter(group => group.items.length > 0), [normalizedQuery, selectedGrade]);

  const handleDragStart = (event, group, item) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-chemistry-component', JSON.stringify({ ...item, paletteCategory: group.id }));
  };

  return (
    <aside className="flex min-h-0 flex-col border-r border-white/10 bg-slate-950/70">
      <div className="border-b border-white/10 p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Palette</p>
        <h2 className="mt-1 text-sm font-black text-white">Chemistry Components</h2>
        <div className="relative mt-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="input h-9 rounded-xl pl-8 pr-3 text-xs"
            placeholder="Search palette"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {filteredGroups.map(group => {
          const GroupIcon = group.icon;
          return (
            <section key={group.id}>
              <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold text-gray-400">
                <GroupIcon size={14} className="text-cyan-200" />
                {group.title}
                <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-500">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    draggable
                    onDragStart={event => handleDragStart(event, group, item)}
                    onClick={() => onAddComponent(item, group.id)}
                    className="group flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2 text-left text-xs text-gray-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
                    type="button"
                    title={`Drag ${item.label} to canvas`}
                  >
                    <span className="flex h-9 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-[11px] font-black" style={{ color: item.color }}>
                      {item.visual}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{item.label}</span>
                      <span className="block truncate text-[10px] text-gray-500">{item.componentType} - {item.state}</span>
                    </span>
                    <span className="ml-auto hidden text-[10px] font-bold text-cyan-200 group-hover:block">Drag</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
