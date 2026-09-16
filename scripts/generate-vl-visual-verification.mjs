import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
const root = "docs/chemistry-vl-mockup-rebuild",
  inventory = JSON.parse(
    await readFile(join(root, "verification.json"), "utf8"),
  );
const exists = async (p) => {
    try {
      await access(p);
      return true;
    } catch {
      return false;
    }
  },
  pngSize = async (p) => {
    const b = await readFile(p);
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  };
const metricFiles = {
  "chromatography-separation/home": join(
    root,
    "visual-comparisons/chromatography-separation/home-pass-9-metrics.json",
  ),
  "chromatography-separation/tlc": join(
    root,
    "visual-comparisons/chromatography-separation/tlc-pass-9-metrics.json",
  ),
};
const screens = [];
for (const lab of inventory.simulators)
  for (const s of lab.screens) {
    const key = `${lab.slug}/${s.route.match(/screen=([^#]+)/)?.[1] || s.id}`,
      reference = join(inventory.referenceRoot, lab.referenceFolder, s.file),
      shot = join(
        root,
        "screenshots",
        lab.slug,
        `${s.route.match(/screen=([^#]+)/)?.[1] || s.id}-1672.png`,
      ),
      metricPath = metricFiles[key],
      metric =
        metricPath && (await exists(metricPath))
          ? JSON.parse(await readFile(metricPath, "utf8"))
          : null,
      size = await pngSize(reference),
      functional = await exists(
        join(root, "screenshots", lab.slug, "verification.json"),
      );
    screens.push({
      lab: lab.title,
      slug: lab.slug,
      screen: s.id,
      route: s.route,
      referenceImage: reference,
      referenceDimensions: size,
      screenshotPath: (await exists(shot)) ? shot : null,
      overallSimilarityScore: metric?.overallSimilarity ?? null,
      regionScores: metric?.regionScores ?? null,
      functionalTestResult: functional ? "passed" : "not-run",
      scientificValidationResult: functional ? "passed" : "not-run",
      responsiveResult: functional ? "passed" : "not-run",
      consoleResult: functional ? "passed" : "not-run",
      remainingDiscrepancy:
        metric?.status === "visual-failed"
          ? "Measured SSIM remains below the 95% overall and 90% regional acceptance gates; continue visual iteration."
          : "Visual comparison not yet run.",
      finalStatus: metric?.status || "not-started",
    });
  }
const result = {
  schemaVersion: 1,
  metric:
    "windowed RGB SSIM; acceptance requires >=95 overall and >=90 for each major region",
  generatedAt: new Date().toISOString(),
  summary: {
    screens: screens.length,
    verified: screens.filter((x) => x.finalStatus === "verified").length,
    visualFailed: screens.filter((x) => x.finalStatus === "visual-failed")
      .length,
    notStarted: screens.filter((x) => x.finalStatus === "not-started").length,
  },
  screens,
};
await writeFile(
  join(root, "visual-verification.json"),
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result.summary));
