// Frame the deposited coordinates along their principal axis without modifying geometry.
export function frameMolecularStructure(
  plugin,
  loaded,
  { horizontal = false, scale = 0.85 } = {},
) {
  const structure = loaded?.structure?.obj?.data,
    canvas = plugin.canvas3d;
  if (!structure || !canvas) return;
  const points = [],
    tmp = [0, 0, 0];
  for (const unit of structure.units) {
    if (unit.kind !== 0) continue;
    for (const element of unit.elements) {
      unit.conformation.position(element, tmp);
      if (tmp.every(Number.isFinite)) points.push([...tmp]);
    }
  }
  if (!points.length) return;
  const center = [0, 0, 0];
  for (const p of points)
    for (let i = 0; i < 3; i++) center[i] += p[i] / points.length;
  const covariance = Array.from({ length: 3 }, () => [0, 0, 0]);
  let radius = 0;
  for (const p of points) {
    const d = p.map((v, i) => v - center[i]);
    radius = Math.max(radius, Math.hypot(...d));
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) covariance[i][j] += d[i] * d[j];
  }
  let axis = [0.3, 0.5, 0.8];
  for (let n = 0; n < 32; n++) {
    const next = covariance.map((row) =>
        row.reduce((sum, v, i) => sum + v * axis[i], 0),
      ),
      length = Math.hypot(...next);
    if (length < 1e-12) break;
    axis = next.map((v) => v / length);
  }
  const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ],
    normalize = (a) => {
      const length = Math.hypot(...a) || 1;
      return a.map((v) => v / length);
    };
  const reference = Math.abs(axis[1]) < 0.85 ? [0, 1, 0] : [0, 0, 1],
    direction = normalize(cross(axis, reference)),
    up = horizontal ? normalize(cross(direction, axis)) : normalize(axis);
  canvas.requestCameraReset({
    snapshot: canvas.camera.getFocus(
      center,
      Math.max(0.1, radius * scale),
      up,
      direction,
    ),
    durationMs: 0,
  });
}
