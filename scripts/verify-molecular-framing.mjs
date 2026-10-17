import assert from "node:assert/strict";
import { frameMolecularStructure } from "../src/utils/molecularFraming.js";
const coordinates = Array.from({ length: 101 }, (_, i) => [
    i / 10,
    Math.sin(i) * 0.1,
    Math.cos(i) * 0.1,
  ]),
  copy = JSON.stringify(coordinates);
let captured;
const plugin = {
  canvas3d: {
    camera: {
      getFocus(center, radius, up, direction) {
        return { center, radius, up, direction };
      },
    },
    requestCameraReset(options) {
      captured = options;
    },
  },
};
const loaded = {
  structure: {
    obj: {
      data: {
        units: [
          {
            kind: 0,
            elements: coordinates.map((_, i) => i),
            conformation: {
              position(i, out) {
                coordinates[i].forEach((v, j) => (out[j] = v));
              },
            },
          },
        ],
      },
    },
  },
};
frameMolecularStructure(plugin, loaded, { horizontal: true, scale: 0.7 });
assert.ok(Math.abs(captured.snapshot.center[0] - 5) < 1e-10);
assert.ok(captured.snapshot.radius > 3 && captured.snapshot.radius < 4);
assert.ok(Math.abs(captured.snapshot.up[0]) < 0.01);
assert.ok(
  Math.abs(
    captured.snapshot.up.reduce(
      (v, x, i) => v + x * captured.snapshot.direction[i],
      0,
    ),
  ) < 1e-10,
);
assert.equal(JSON.stringify(coordinates), copy);
assert.equal(captured.durationMs, 0);
assert.doesNotThrow(() => frameMolecularStructure(plugin, {}));
console.log(
  "PASS: molecular framing preserves deposited coordinates, centers correctly, aligns the long axis horizontally, and yields finite orthogonal camera vectors.",
);
