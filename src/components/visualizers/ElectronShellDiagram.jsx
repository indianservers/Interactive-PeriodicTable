import { useMemo } from 'react';
import { getCategoryInfo } from '../../data/categories.js';

export const ElectronShellDiagram = ({ element, reducedMotion = false }) => {
  const catInfo = getCategoryInfo(element.category);
  const shells = element.shells || [];
  const maxShells = shells.length;

  const svgSize = 280;
  const center = svgSize / 2;
  const nucleusR = maxShells > 5 ? 16 : 20;
  const minShellR = nucleusR + 22;
  const maxShellR = (svgSize / 2) - 18;
  const shellStep = maxShells > 1 ? (maxShellR - minShellR) / (maxShells - 1) : 0;

  const shellData = useMemo(() => shells.map((count, i) => {
    const r = maxShells === 1 ? minShellR + 20 : minShellR + i * shellStep;
    const electrons = Array.from({ length: count }, (_, j) => {
      const angle = (2 * Math.PI * j) / count;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        angle,
      };
    });
    return { r, electrons, count };
  }), [shells, shellStep, minShellR, center, maxShells]);

  const electronR = maxShells > 6 ? 3 : 4;

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width="100%"
      height="100%"
      aria-label={`Electron shell diagram for ${element.name} with ${maxShells} shells`}
    >
      {/* Background glow */}
      <circle cx={center} cy={center} r={nucleusR + 8} fill={catInfo.color} opacity="0.1" />

      {/* Shell rings */}
      {shellData.map((shell, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={shell.r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* Nucleus */}
      <circle cx={center} cy={center} r={nucleusR} fill={catInfo.color} opacity="0.85" />
      <text
        x={center}
        y={center - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={maxShells > 5 ? "9" : "11"}
        fontWeight="bold"
        fill="white"
      >
        {element.symbol}
      </text>
      <text
        x={center}
        y={center + (maxShells > 5 ? 8 : 10)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={maxShells > 5 ? "7" : "8"}
        fill="rgba(255,255,255,0.7)"
      >
        {element.atomicNumber}
      </text>

      {/* Electron orbits + electrons */}
      {shellData.map((shell, i) => {
        const animDuration = [4, 7, 11, 15, 20, 25, 31][i] || 35;
        return (
          <g key={i}>
            {reducedMotion ? (
              shell.electrons.map((e, j) => (
                <circle key={j} cx={e.x} cy={e.y} r={electronR} fill="white" opacity="0.9" />
              ))
            ) : (
              <g
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  animation: `electronOrbit ${animDuration}s linear infinite`,
                }}
              >
                {shell.electrons.map((e, j) => (
                  <circle key={j} cx={e.x} cy={e.y} r={electronR} fill="white" opacity="0.9" />
                ))}
              </g>
            )}
            {/* Shell label */}
            <text
              x={center + shell.r + 5}
              y={center - 4}
              fontSize="7"
              fill="rgba(255,255,255,0.45)"
              dominantBaseline="middle"
            >
              n={i + 1}
            </text>
            <text
              x={center + shell.r + 5}
              y={center + 5}
              fontSize="7"
              fill="rgba(255,255,255,0.3)"
              dominantBaseline="middle"
            >
              {shell.count}e⁻
            </text>
          </g>
        );
      })}
    </svg>
  );
};
export default ElectronShellDiagram;
