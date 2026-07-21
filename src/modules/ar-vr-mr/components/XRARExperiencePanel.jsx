import {
  BadgeCheck, Box, Camera, CheckCircle2, Compass, Crosshair, Layers3,
  Lock, MousePointer2, RotateCcw, RotateCw, ScanLine, Smartphone, SunMedium, Unlock,
} from 'lucide-react';

const arStepFlow = [
  ['Scan', 'Find a flat, well-lit table or floor surface.', ScanLine],
  ['Place', 'Lock the molecule or chemistry model at a comfortable scale.', Crosshair],
  ['Walk', 'Move around the model and inspect depth, labels, and hidden vectors.', Compass],
  ['Capture', 'Export a snapshot or report after the checkpoint.', Camera],
];

const arConceptIds = ['ar-periodic-table', 'mechanism-player', 'titration-overlay', 'flame-test', 'drug-docking'];

const placementStates = [
  ['scanning', 'Scanning', 'Looking for a real surface'],
  ['surface-found', 'Surface found', 'Tap the screen to place'],
  ['placed', 'Placed', 'Object is placed and movable'],
  ['locked', 'Locked', 'Anchor is locked in place'],
];

const arScore = ({ support, arPlacement, activeExperience }) => {
  let score = 35;
  if (support.secureContext) score += 15;
  if (support.hasNavigatorXR) score += 15;
  if (support.ar) score += 20;
  if (support.isMobile) score += 5;
  if (activeExperience.mode === 'AR' || activeExperience.mode === 'MR') score += 5;
  if (arPlacement.anchorLocked) score += 5;
  return Math.min(100, score);
};

const PlacementButton = ({ active, icon: Icon, label, onClick }) => (
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

export const XRARExperiencePanel = ({
  support,
  activeExperience,
  experiences,
  arPlacement,
  onPlacementChange,
  onSelectExperience,
}) => {
  const arConcepts = arConceptIds.map(id => experiences.find(item => item.id === id)).filter(Boolean);
  const score = arScore({ support, arPlacement, activeExperience });
  const scoreColor = score >= 75 ? 'text-emerald-200' : score >= 55 ? 'text-cyan-200' : 'text-amber-200';

  const update = (patch) => onPlacementChange(patch);

  const toggleAnchor = () => {
    const nextLocked = !arPlacement.anchorLocked;
    update({
      anchorLocked: nextLocked,
      status: nextLocked && arPlacement.status === 'placed' ? 'locked' : !nextLocked && arPlacement.status === 'locked' ? 'placed' : arPlacement.status,
      statusDetail: nextLocked ? 'Anchor lock enabled.' : 'Anchor unlocked. Tap another surface point to reposition.',
    });
  };

  const resetPlacement = () => update({
    status: 'desktop-preview',
    statusDetail: 'Placement reset. Use desktop tap-to-place or start AR and scan a surface.',
    placedAt: null,
    placedPosition: null,
    placedQuaternion: null,
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20">
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <Smartphone size={14} /> AR experience optimizer
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Surface-first AR workflow</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                Tune placement, scale, labels, and scan confidence before entering AR so mobile users get a clean first launch.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center">
              <p className={`text-3xl font-black ${scoreColor}`}>{score}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AR readiness</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {arStepFlow.map(([title, detail, Icon], index) => (
              <div key={title} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Icon size={16} className="text-cyan-300" />
                  <span className="text-[10px] font-black text-gray-600">0{index + 1}</span>
                </div>
                <p className="mt-2 text-sm font-black text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {placementStates.map(([status, label, detail]) => {
              const active = arPlacement.status === status || (status === 'scanning' && arPlacement.status === 'desktop-preview');
              return (
                <div
                  key={status}
                  className={`rounded-xl border p-3 transition-colors ${
                    active
                      ? 'border-cyan-300/35 bg-cyan-400/15'
                      : 'border-white/10 bg-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-white">{label}</p>
                    <CheckCircle2 size={15} className={active ? 'text-emerald-300' : 'text-gray-600'} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-bold text-cyan-100">
            {arPlacement.statusDetail || 'Tap the canvas for desktop placement, or tap your AR screen after a surface is found.'}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <label className="rounded-xl border border-white/10 bg-black/20 p-3">
              <span className="flex justify-between text-xs font-bold text-gray-300">
                <span>Surface scale</span>
                <span className="text-cyan-200">{arPlacement.surfaceScale.toFixed(1)}x</span>
              </span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={arPlacement.surfaceScale}
                onChange={event => update({ surfaceScale: Number(event.target.value) })}
                className="mt-2 w-full"
              />
            </label>
            <label className="rounded-xl border border-white/10 bg-black/20 p-3">
              <span className="flex justify-between text-xs font-bold text-gray-300">
                <span>Placement height</span>
                <span className="text-cyan-200">{arPlacement.height.toFixed(2)}m</span>
              </span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={arPlacement.height}
                onChange={event => update({ height: Number(event.target.value) })}
                className="mt-2 w-full"
              />
            </label>
            <label className="rounded-xl border border-white/10 bg-black/20 p-3">
              <span className="flex justify-between text-xs font-bold text-gray-300">
                <span>Rotate</span>
                <span className="text-cyan-200">{arPlacement.rotationY || 0} deg</span>
              </span>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={arPlacement.rotationY || 0}
                onChange={event => update({ rotationY: Number(event.target.value) })}
                className="mt-2 w-full"
              />
            </label>
            <label className="rounded-xl border border-white/10 bg-black/20 p-3">
              <span className="flex justify-between text-xs font-bold text-gray-300">
                <span>Overlay density</span>
                <span className="text-cyan-200">{arPlacement.overlayDensity}%</span>
              </span>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={arPlacement.overlayDensity}
                onChange={event => update({ overlayDensity: Number(event.target.value) })}
                className="mt-2 w-full"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-6">
            <PlacementButton active={arPlacement.placementMode !== false} icon={MousePointer2} label={arPlacement.placementMode !== false ? 'Place mode' : 'Inspect mode'} onClick={() => update({ placementMode: arPlacement.placementMode === false })} />
            <PlacementButton active={arPlacement.anchorLocked} icon={arPlacement.anchorLocked ? Lock : Unlock} label={arPlacement.anchorLocked ? 'Locked' : 'Unlocked'} onClick={toggleAnchor} />
            <PlacementButton active={arPlacement.showReticle} icon={ScanLine} label="Reticle" onClick={() => update({ showReticle: !arPlacement.showReticle })} />
            <PlacementButton active={arPlacement.showOcclusionPlane} icon={Layers3} label="Ground plane" onClick={() => update({ showOcclusionPlane: !arPlacement.showOcclusionPlane })} />
            <PlacementButton active={arPlacement.lightingBoost} icon={SunMedium} label="Light boost" onClick={() => update({ lightingBoost: !arPlacement.lightingBoost })} />
            <PlacementButton active={false} icon={RotateCcw} label="Reset place" onClick={resetPlacement} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <Crosshair size={14} /> Tap-to-place
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                In AR/MR, scan until a surface is found, then tap any detected point. In desktop preview, place mode moves the scene to the clicked floor point.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                <RotateCw size={14} /> Live transform
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Scale, rotate, and height controls apply to both the desktop preview and the active AR object.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">AR launch quality</p>
            <div className="mt-3 space-y-2">
              {[
                ['Secure context', support.secureContext, 'HTTPS or localhost'],
                ['WebXR available', support.hasNavigatorXR, 'Browser API present'],
                ['AR session', support.ar, 'immersive-ar support'],
                ['Mobile posture', support.isMobile, 'Best for phone/tablet AR'],
                ['Camera permission', support.cameraPermission !== 'denied', support.cameraPermission],
              ].map(([label, ready, detail]) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
                    ready ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/25 bg-amber-400/10 text-amber-200'
                  }`}>
                    {ready ? <CheckCircle2 size={14} /> : <Box size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{label}</p>
                    <p className="text-xs text-gray-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Best AR scenes</p>
            <div className="mt-3 space-y-2">
              {arConcepts.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectExperience(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    item.id === activeExperience.id
                      ? 'border-cyan-300/35 bg-cyan-400/15'
                      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <BadgeCheck size={15} className={item.id === activeExperience.id ? 'text-emerald-300' : 'text-gray-600'} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{item.wow}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default XRARExperiencePanel;
