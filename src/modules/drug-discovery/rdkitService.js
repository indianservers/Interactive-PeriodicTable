let rdkitPromise;

const SCRIPT_URL = "/assets/drug-discovery/rdkit/RDKit_minimal.js";
const WASM_URL = "/assets/drug-discovery/rdkit/RDKit_minimal.wasm";

function loadScript() {
  if (window.initRDKitModule) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("RDKit runtime failed to load"));
    document.head.appendChild(script);
  });
}

export function getRDKit() {
  if (!rdkitPromise) {
    rdkitPromise = loadScript().then(() =>
      window.initRDKitModule({ locateFile: () => WASM_URL }),
    );
  }
  return rdkitPromise;
}
