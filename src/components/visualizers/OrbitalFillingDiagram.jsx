import { useMemo } from 'react';

const orbitalOrder = [
  ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2],
  ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2],
  ['4f', 14], ['5d', 10], ['6p', 6], ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6],
];

const boxCount = { s: 1, p: 3, d: 5, f: 7 };

const fillOrbital = (electrons, boxes) => {
  const slots = Array.from({ length: boxes }, () => []);
  for (let i = 0; i < Math.min(electrons, boxes); i += 1) slots[i].push('up');
  for (let i = boxes; i < electrons; i += 1) slots[i - boxes].push('down');
  return slots;
};

export const buildAufbauDiagram = (atomicNumber = 1) => {
  let remaining = Math.max(0, atomicNumber);
  return orbitalOrder
    .map(([label, capacity]) => {
      const electrons = Math.min(remaining, capacity);
      remaining -= electrons;
      const type = label.at(-1);
      return {
        label,
        electrons,
        capacity,
        boxes: fillOrbital(electrons, boxCount[type] || 1),
      };
    })
    .filter(item => item.electrons > 0 || remaining > 0);
};

export const OrbitalFillingDiagram = ({ element, reducedMotion }) => {
  const orbitals = useMemo(() => buildAufbauDiagram(element?.atomicNumber || 1), [element]);

  return (
    <div className="w-full rounded-2xl bg-white/[0.035] border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-white">Aufbau Orbital Filling</p>
          <p className="text-xs text-gray-500">Boxes fill singly first, then pair by Hund's rule.</p>
        </div>
        <span className="text-xs font-mono text-cyan-200">{element?.atomicNumber || 0}e</span>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {orbitals.map((orbital, orbitalIndex) => (
          <div key={orbital.label} className="grid grid-cols-[42px_1fr_42px] items-center gap-2 text-xs">
            <span className="font-mono text-gray-400">{orbital.label}</span>
            <div className="flex gap-1.5">
              {orbital.boxes.map((box, boxIndex) => (
                <span
                  key={`${orbital.label}-${boxIndex}`}
                  className="relative h-8 w-8 rounded-lg border border-white/15 bg-black/20 flex items-center justify-center overflow-hidden"
                >
                  {box.map((spin, spinIndex) => (
                    <span
                      key={spin}
                      className={`text-cyan-200 text-base leading-none ${reducedMotion ? '' : 'animate-[slideInUp_0.35s_ease-out_both]'}`}
                      style={{ animationDelay: `${(orbitalIndex * 0.07) + (boxIndex * 0.04) + (spinIndex * 0.05)}s` }}
                    >
                      {spin === 'up' ? '^' : 'v'}
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <span className="text-right text-gray-500">{orbital.electrons}/{orbital.capacity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrbitalFillingDiagram;
