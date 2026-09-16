import assert from "node:assert/strict";
import { medicineJourney, pharmaCompounds, pharmaSources, recentExperiments } from "../src/modules/pharma-lab/data/compounds.js";

assert.equal(pharmaCompounds.length, 5, "Lab Home must expose the five approved case compounds");
assert.deepEqual(pharmaCompounds.map(({ id }) => id), ["paracetamol", "ibuprofen", "metformin", "amoxicillin", "atorvastatin"]);
assert.equal(medicineJourney.length, 8, "Medicine journey must have eight stages");
assert.equal(new Set(medicineJourney.map(({ route }) => route)).size, 8, "Every journey stage must have a unique route");
assert.ok(pharmaCompounds.every(({ sdf, cid, smiles }) => sdf && cid && smiles), "Each compound needs coordinates, provenance, and a 2D graph source");
assert.ok(pharmaSources.length >= pharmaCompounds.length, "Each compound must be covered by the source register");
assert.ok(recentExperiments.every(({ progress }) => progress >= 0 && progress <= 100), "Experiment progress must be a percentage");

console.log("Pharmaceutical Lab Home data checks passed.");
