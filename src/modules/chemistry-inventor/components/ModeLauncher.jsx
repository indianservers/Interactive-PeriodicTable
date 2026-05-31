import { studioModes } from '../data/studioModes.js';

export function ModeLauncher({ activeMode, onModeChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {studioModes.map(({ id, title, description, icon: Icon, accent }) => {
        const active = activeMode === id;
        return (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              active
                ? 'border-cyan-300/45 bg-cyan-400/10 shadow-lg shadow-cyan-950/30'
                : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
            }`}
          >
            <span className="flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${accent}55`, background: `${accent}18`, color: accent }}>
                <Icon size={19} />
              </span>
              <span>
                <span className="block text-sm font-black text-white">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-400">{description}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
