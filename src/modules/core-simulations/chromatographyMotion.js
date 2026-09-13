// Volumes are µL, time is seconds. Integrate with bounded substeps at any display FPS.
export const initialMotion = () => ({
  phase: "idle",
  time: 0,
  elapsed: 0,
  paused: false,
  x: 0,
  angle: 0,
  velocity: 0,
  angularVelocity: 0,
  slosh: 0,
  sloshVelocity: 0,
  mixing: 0,
  suspension: 1,
  tubeVolume: 1000,
  pipetteVolume: 0,
  plateVolume: 0,
  targetX: 0,
  targetAngle: 0,
  front: 0,
  ethyl: 30,
  developedEthyl: 30,
  viscosity: 1,
  plateInChamber: false,
  uv: false,
  message: "Shake the sample tube, then aspirate 2 µL.",
  history: [],
});
const permitted = {
  shake: ["idle", "settling", "mixed"],
  aspirate: ["mixed"],
  dispense: ["aspirated"],
  place: ["spotted"],
  develop: ["positioned", "inspected"],
  inspect: ["developed"],
  uv: ["inspected"],
};
export function actMotion(s, action, value) {
  if (action === "reset") return initialMotion();
  if (action === "pause") {
    s.paused = !s.paused;
    return s;
  }
  if (action === "stop" && ["shaking", "moving"].includes(s.phase)) {
    s.phase = "settling";
    s.targetX = 0;
    s.targetAngle = 0;
    s.elapsed = 0;
    return s;
  }
  if (action === "ratio") {
    s.ethyl = Math.max(10, Math.min(40, value));
    return s;
  }
  if (
    action === "drag" &&
    ["idle", "mixed", "settling", "moving", "shaking"].includes(s.phase)
  ) {
    s.phase = "moving";
    s.targetX = Math.max(-0.5, Math.min(0.5, value.x));
    s.targetAngle = Math.max(-0.45, Math.min(0.45, value.angle));
    return s;
  }
  if (!permitted[action]?.includes(s.phase)) {
    s.message = `Cannot ${action} while ${s.phase}. Complete the current preparation step first.`;
    return s;
  }
  s.history.push({ action, time: s.time });
  s.elapsed = 0;
  if (action === "shake") s.phase = "shaking";
  if (action === "aspirate") s.phase = "aspirating";
  if (action === "dispense") s.phase = "dispensing";
  if (action === "place") s.phase = "placing";
  if (action === "develop") {
    s.phase = "developing";
    s.front = 0;
    s.plateInChamber = true;
    s.developedEthyl = s.ethyl;
    s.message = 'Solvent is rising through the plate; compounds migrate according to their retention factors.';
  }
  if (action === "inspect") s.phase = "removing";
  if (action === "uv") {
    s.uv = !s.uv;
    s.message = s.uv
      ? "Inspecting under UV 254 nm."
      : "Inspecting in visible light.";
  }
  return s;
}
export function stepMotion(s, dt) {
  if (s.paused) return s;
  let remaining = Math.min(0.25, Math.max(0, dt));
  while (remaining > 1e-8) {
    const h = Math.min(1 / 120, remaining);
    remaining -= h;
    s.time += h;
    s.elapsed += h;
    if (s.phase === "shaking") {
      const envelope = Math.min(
        1,
        s.elapsed * 2,
        Math.max(0, (3 - s.elapsed) * 2),
      );
      s.targetX = 0.27 * Math.sin(s.elapsed * 14) * envelope;
      s.targetAngle = 0.32 * Math.sin(s.elapsed * 14 + 0.5) * envelope;
      if (s.elapsed >= 3) {
        s.phase = "settling";
        s.elapsed = 0;
        s.targetX = 0;
        s.targetAngle = 0;
      }
    }
    const ax = 90 * (s.targetX - s.x) - 15 * s.velocity,
      aa = 90 * (s.targetAngle - s.angle) - 15 * s.angularVelocity;
    s.velocity += ax * h;
    s.x += s.velocity * h;
    s.angularVelocity += aa * h;
    s.angle += s.angularVelocity * h;
    // Surface is gravity-aligned with acceleration-induced lag; spring decays at rest.
    const sa =
      -30 * s.slosh -
      3.8 * s.viscosity * s.sloshVelocity -
      ax * 0.5 -
      aa * 0.12;
    s.sloshVelocity += sa * h;
    s.slosh = Math.max(-0.32, Math.min(0.32, s.slosh + s.sloshVelocity * h));
    const energy = (Math.abs(s.velocity) + Math.abs(s.angularVelocity)) * 0.19;
    s.mixing = Math.min(1, s.mixing + energy * h);
    s.suspension = Math.min(
      1,
      Math.max(0, s.suspension + (energy * 0.6 - 0.07) * h),
    );
    if (s.phase === "settling" && s.elapsed > 3 && Math.abs(s.slosh) < 0.015) {
      s.phase = "mixed";
      s.message = "Sample settled. Aspirate 2 µL with the micropipette.";
    }
    if (s.phase === "aspirating" && s.elapsed > 1) {
      const v = Math.min(2 - s.pipetteVolume, s.tubeVolume, 1.5 * h);
      s.tubeVolume -= v;
      s.pipetteVolume += v;
      if (s.pipetteVolume >= 2 - 1e-8) {
        s.phase = "aspirated";
        s.elapsed = 0;
        s.message = "2 µL aspirated. Dispense onto the TLC origin.";
      }
    }
    if (s.phase === "dispensing" && s.elapsed > 1) {
      const v = Math.min(s.pipetteVolume, 1.5 * h);
      s.pipetteVolume -= v;
      s.plateVolume += v;
      if (s.pipetteVolume < 1e-8) {
        s.phase = "spotted";
        s.elapsed = 0;
        s.message = "Sample spotted. Place the plate in the chamber.";
      }
    }
    if (s.phase === "placing" && s.elapsed >= 1.5) {
      s.phase = "positioned";
      s.plateInChamber = true;
      s.message = "Origin is above solvent level. Develop the plate.";
    }
    if (s.phase === "developing") {
      s.front = Math.min(1, s.front + h / (8 * s.viscosity));
      if (s.front >= 1) {
        s.phase = "developed";
        s.message = "Development complete. Remove and inspect the plate.";
      }
    }
    if (s.phase === "removing" && s.elapsed >= 1.5) {
      s.phase = "inspected";
      s.plateInChamber = false;
      s.message = "Inspect the separated spots in visible light or UV.";
    }
  }
  return s;
}
