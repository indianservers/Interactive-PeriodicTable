import {
  Activity, Atom, BadgeCheck, BarChart3, FlaskConical, GitCompare, Magnet,
  Move3D, Orbit, Pill, SlidersHorizontal, Sparkles, Zap,
} from 'lucide-react';

export const flagshipConceptIds = [
  'ar-periodic-table',
  'vsepr-room',
  'mechanism-player',
  'electrochemical-cell',
  'drug-docking',
];

const profileByScene = {
  'periodic-grid': {
    title: 'AR Trend Lens',
    icon: Atom,
    primaryLabel: 'Atomic radius trend',
    secondaryLabel: 'Reactivity glow',
    tertiaryLabel: 'Element expansion',
    units: ['%', '%', 'x'],
  },
  vsepr: {
    title: 'Geometry Force Lab',
    icon: Orbit,
    primaryLabel: 'Lone-pair pressure',
    secondaryLabel: 'Bond angle spread',
    tertiaryLabel: 'Shape relaxation',
    units: ['%', 'deg', '%'],
  },
  reaction: {
    title: 'Electron-Flow Engine',
    icon: GitCompare,
    primaryLabel: 'Attack progress',
    secondaryLabel: 'Leaving-group break',
    tertiaryLabel: 'Transition-state energy',
    units: ['%', '%', 'kJ'],
  },
  electrochem: {
    title: 'Redox Flow Console',
    icon: Zap,
    primaryLabel: 'Electron flux',
    secondaryLabel: 'Salt bridge migration',
    tertiaryLabel: 'Cell potential',
    units: ['%', '%', 'V'],
  },
  docking: {
    title: 'Docking Fit Console',
    icon: Pill,
    primaryLabel: 'Pose fit',
    secondaryLabel: 'H-bond alignment',
    tertiaryLabel: 'Risk penalty',
    units: ['%', '%', '%'],
  },
};

const defaultProfile = {
  title: 'XR Interaction Console',
  icon: Move3D,
  primaryLabel: 'Immersion intensity',
  secondaryLabel: 'Effect clarity',
  tertiaryLabel: 'Challenge depth',
  units: ['%', '%', '%'],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const createDefaultSimulationState = () => ({
  primary: 58,
  secondary: 44,
  tertiary: 62,
  mode: 'guided',
});

export const getSimulationMetrics = (experience, simulation) => {
  const primary = Number(simulation.primary || 0);
  const secondary = Number(simulation.secondary || 0);
  const tertiary = Number(simulation.tertiary || 0);

  switch (experience.sceneType) {
    case 'periodic-grid':
      return [
        ['Trend contrast', `${primary}%`, primary > 70 ? 'Strong group contrast' : 'Subtle comparison mode'],
        ['Reactivity cue', `${secondary}%`, secondary > 60 ? 'High activity glow' : 'Calm trend view'],
        ['Expanded atom', `${tertiary.toFixed(1)}x`, 'Desk-to-atom bridge'],
      ];
    case 'vsepr': {
      const angle = clamp(109.5 - primary * 0.22 + secondary * 0.08, 92, 180);
      return [
        ['Predicted angle', `${angle.toFixed(1)} deg`, 'Repulsion-adjusted classroom estimate'],
        ['Domain pressure', `${primary}%`, primary > 65 ? 'Lone-pair dominance visible' : 'Bond-pair view'],
        ['Relaxation', `${tertiary}%`, 'Shape settling animation strength'],
      ];
    }
    case 'reaction': {
      const energy = clamp(95 - primary * 0.42 + tertiary * 0.35, 18, 110);
      return [
        ['Bond formation', `${primary}%`, primary > 65 ? 'New bond nearly formed' : 'Approach phase'],
        ['Leaving group', `${secondary}%`, secondary > 60 ? 'C-Br weakening shown' : 'Leaving group attached'],
        ['Barrier', `${energy.toFixed(0)} kJ`, 'Teaching energy estimate'],
      ];
    }
    case 'electrochem': {
      const voltage = clamp(0.62 + primary * 0.006 + secondary * 0.003 - tertiary * 0.002, 0.4, 1.52);
      return [
        ['Electron flux', `${primary}%`, 'External circuit intensity'],
        ['Ion balance', `${secondary}%`, secondary > 55 ? 'Salt bridge active' : 'Charge buildup risk'],
        ['Cell potential', `${voltage.toFixed(2)} V`, 'Nernst-style teaching proxy'],
      ];
    }
    case 'docking': {
      const score = clamp((primary * 0.52 + secondary * 0.38 - tertiary * 0.2) / 10, 0.5, 9.8);
      return [
        ['Pose fit', `${primary}%`, primary > 70 ? 'Pocket complementarity high' : 'Search better pose'],
        ['Interactions', `${secondary}%`, 'H-bond and contact alignment'],
        ['Fit score', `${score.toFixed(1)}/10`, 'Teaching score, not clinical proof'],
      ];
    }
    default:
      return [
        ['Immersion', `${primary}%`, 'Scene intensity'],
        ['Clarity', `${secondary}%`, 'Overlay strength'],
        ['Challenge', `${tertiary}%`, 'Assessment depth'],
      ];
  }
};

const ModeButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
      active
        ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100'
        : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
    }`}
  >
    <Icon size={14} /> {label}
  </button>
);

const SliderRow = ({ label, value, unit, onChange }) => (
  <label className="block rounded-xl border border-white/10 bg-black/20 p-3">
    <span className="flex justify-between gap-3 text-xs font-bold text-gray-300">
      <span>{label}</span>
      <span className="text-cyan-200">{unit === 'x' ? (value / 50).toFixed(1) : value}{unit}</span>
    </span>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      className="mt-2 w-full"
    />
  </label>
);

export const XRInteractionWorkbench = ({
  experience,
  simulation,
  onSimulationChange,
  onSelectFlagship,
  flagshipExperiences,
}) => {
  const profile = profileByScene[experience.sceneType] || defaultProfile;
  const ProfileIcon = profile.icon;
  const metrics = getSimulationMetrics(experience, simulation);
  const isFlagship = flagshipConceptIds.includes(experience.id);

  const update = (key, value) => onSimulationChange({ ...simulation, [key]: value });

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <Sparkles size={14} /> Flagship interaction
              </p>
              <h3 className="mt-2 flex items-center gap-2 text-2xl font-black text-white">
                <ProfileIcon size={22} className="text-cyan-300" /> {profile.title}
              </h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
              isFlagship
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
            }`}>
              {isFlagship ? 'Flagship-ready' : 'Base interaction'}
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <SliderRow label={profile.primaryLabel} value={simulation.primary} unit={profile.units[0]} onChange={value => update('primary', value)} />
            <SliderRow label={profile.secondaryLabel} value={simulation.secondary} unit={profile.units[1]} onChange={value => update('secondary', value)} />
            <SliderRow label={profile.tertiaryLabel} value={simulation.tertiary} unit={profile.units[2]} onChange={value => update('tertiary', value)} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <ModeButton active={simulation.mode === 'guided'} label="Guided" icon={BadgeCheck} onClick={() => update('mode', 'guided')} />
            <ModeButton active={simulation.mode === 'explore'} label="Explore" icon={SlidersHorizontal} onClick={() => update('mode', 'explore')} />
            <ModeButton active={simulation.mode === 'challenge'} label="Challenge" icon={Activity} onClick={() => update('mode', 'challenge')} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            <BarChart3 size={14} /> Live chemistry readout
          </p>
          <div className="mt-3 space-y-2">
            {metrics.map(([label, value, detail]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-gray-400">{label}</p>
                  <p className="text-sm font-black text-white">{value}</p>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Flagship jump list</p>
        <div className="grid gap-2 md:grid-cols-5">
          {flagshipExperiences.map(item => {
            const Icon = item.sceneType === 'electrochem' ? Zap
              : item.sceneType === 'docking' ? Pill
                : item.sceneType === 'reaction' ? GitCompare
                  : item.sceneType === 'vsepr' ? Orbit
                    : Magnet;
            return (
              <button
                key={item.id}
                onClick={() => onSelectFlagship(item.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  item.id === experience.id
                    ? 'border-cyan-300/35 bg-cyan-400/15'
                    : 'border-white/10 bg-black/20 hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={16} className="text-cyan-300" />
                <p className="mt-2 text-xs font-black text-white">{item.title}</p>
                <p className="mt-1 text-[10px] text-gray-500">{item.mode} / {item.category}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default XRInteractionWorkbench;
