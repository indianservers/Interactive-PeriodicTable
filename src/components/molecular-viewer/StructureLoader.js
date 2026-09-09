import { inferStructureFormat, normalizeStructureFormat } from './structureSources.js';

const MOLSTAR_FORMATS = new Set(['pdb', 'mmcif', 'cifCore', 'mol', 'sdf']);

export function resolveStructureSource(source, sourceType, label = 'Structure') {
  const input = typeof source === 'string' ? { data: source } : (source || {});
  const format = normalizeStructureFormat(sourceType || input.format || inferStructureFormat(input.url || input.label || label));
  if (!MOLSTAR_FORMATS.has(format)) throw new Error(`Unsupported structure format: ${format || 'unknown'}.`);
  if (!input.data && !input.url) throw new Error('No coordinate source was provided.');
  return { ...input, format, label: input.label || label };
}

export async function loadStructureIntoPlugin(plugin, source, sourceType, label) {
  const resolved = resolveStructureSource(source, sourceType, label);
  const data = resolved.data
    ? await plugin.builders.data.rawData({ data: resolved.data, label: resolved.label })
    : await plugin.builders.data.download(
        { url: resolved.url, isBinary: false, label: resolved.label },
        { state: { isGhost: true } },
      );
  const trajectory = await plugin.builders.structure.parseTrajectory(data, resolved.format);
  const model = await plugin.builders.structure.createModel(trajectory);
  const structure = await plugin.builders.structure.createStructure(model, resolved.structureParams);
  return { resolved, trajectory, model, structure };
}
