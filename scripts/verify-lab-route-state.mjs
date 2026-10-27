import assert from "node:assert/strict";
import { labScreenIndex, pushLabScreen } from "../src/utils/labRouteState.js";
const ids = ["home", "setup", "run", "analysis", "report"];
let checks = 0;
for (const [search, hash, expected] of [
  ["", "", "home"],
  ["?screen=run", "", "run"],
  ["?screen=wrong", "", "home"],
  ["", "#/simulations/test?screen=analysis", "analysis"],
  ["?screen=setup", "#/simulations/test", "setup"],
  ["?screen=setup", "#/simulations/test?screen=analysis", "analysis"],
  ["?screen=setup", "#/simulations/test?screen=wrong", "home"],
  ["?screen=setup", "#/simulations/test?screen=", "home"],
  ["?screen=run", "#/simulations/test?note=a%3Fb&screen=report", "report"],
]) {
  assert.equal(ids[labScreenIndex({ search, hash }, ids)], expected);
  checks++;
}
let pushed = 0,
  events = 0;
globalThis.PopStateEvent = class {
  constructor(type) {
    this.type = type;
  }
};
globalThis.window = {
  location: { href: "http://localhost/?screen=home#/simulations/test" },
  history: {
    pushState(_a, _b, url) {
      pushed++;
      window.location.href = url.href;
    },
  },
  dispatchEvent(e) {
    assert.equal(e.type, "popstate");
    events++;
  },
};
const url = new URL("http://localhost/?screen=run#/simulations/test");
pushLabScreen(url);
pushLabScreen(url);
assert.equal(pushed, 1);
assert.equal(events, 1);
checks += 2;
assert.equal(new URL(window.location.href).search, "");
assert.equal(new URL(window.location.href).hash, "#/simulations/test?screen=run");
checks += 2;
const legacy = new URL("http://localhost/?screen=report&keep=yes#/simulations/test?screen=analysis&sample=A");
pushLabScreen(legacy);
const normalized = new URL(window.location.href);
assert.equal(normalized.search, "?keep=yes");
assert.equal(normalized.hash, "#/simulations/test?screen=report&sample=A");
assert.equal(ids[labScreenIndex(normalized, ids)], "report");
pushLabScreen(legacy);
assert.equal(pushed, 2);
assert.equal(events, 2);
checks += 5;
console.log(
  `PASS: ${checks} lab route tests: query lookup, hash deep links, invalid-screen fallback, history insertion, event dispatch and duplicate-navigation avoidance.`,
);
