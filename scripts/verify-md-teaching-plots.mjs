import assert from "node:assert/strict";
import { mdTeachingPlot } from "../src/modules/core-simulations/mdTeachingPlots.js";
const maxwell = mdTeachingPlot("maxwell", { temperature: 120 }).series[0]
  .points;
const area = maxwell
  .slice(1)
  .reduce(
    (s, p, i) => s + ((p.x - maxwell[i].x) * (p.y + maxwell[i].y)) / 2,
    0,
  );
assert.ok(Math.abs(area - 1) < 0.001);
const peak = maxwell.reduce((a, b) => (a.y > b.y ? a : b));
assert.ok(Math.abs(peak.x - Math.sqrt((2 * 8.314462618 * 120) / 0.039948)) < 5);
const msd = mdTeachingPlot("msd", { diffusion: 0.061 }).series[0].points;
assert.equal(msd[0].y, 0);
assert.ok(Math.abs(msd.at(-1).y - 36.6) < 1e-10);
assert.equal(mdTeachingPlot("vacf").series[0].points[0].y, 1);
assert.equal(mdTeachingPlot("energy").series.length, 3);
for (const kind of [
  "lj",
  "rdf",
  "msd",
  "vacf",
  "maxwell",
  "temperature",
  "pressure",
  "energy",
])
  assert.ok(
    mdTeachingPlot(kind).series.every((s) =>
      s.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    ),
  );
console.log(
  "PASS: Maxwell speed distribution normalized with correct thermal mode; MSD slope = 6D; VACF normalized; three energy curves and all plots finite.",
);

const energy=mdTeachingPlot("energy").series;energy[0].points.forEach((p,i)=>assert.ok(Math.abs(p.y-energy[1].points[i].y-energy[2].points[i].y)<1e-10));
