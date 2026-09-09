const conceptMap = {
  apparatus: 'Apparatus setup and lab handling',
  chemical: 'Chemical identity, quantity, and safety',
  indicator: 'Indicator colour observations',
  measurement: 'Measurement with units and records',
  action: 'Experiment procedure planning',
  observation: 'Observation and conclusion writing',
};

export function createSimulationReport({ mode, grade, components, lastAction = 'Workspace ready' }) {
  const typeCounts = components.reduce((counts, component) => ({
    ...counts,
    [component.componentType]: (counts[component.componentType] || 0) + 1,
  }), {});
  const containers = components.filter(component => component.componentType === 'apparatus' && Array.isArray(component.containedChemicals));
  const chemicals = components.filter(component => component.componentType === 'chemical');
  const actions = components.filter(component => component.componentType === 'action');
  const observations = [];

  if (chemicals.length && containers.length) observations.push('Chemicals and containers are both present. Add a pour or mix block to describe the procedure.');
  if (actions.length) observations.push(`${actions.length} action block${actions.length === 1 ? '' : 's'} ready for step-by-step planning.`);
  if (components.some(component => component.heatingAllowed)) observations.push('Heating-capable item present. Keep teacher supervision and safety notes visible.');
  if (components.some(component => component.componentType === 'indicator')) observations.push('Indicator present. Record colour before and after adding chemicals.');
  if (!components.length) observations.push('Drag items from the palette into the canvas to begin building.');

  const concepts = Object.keys(typeCounts).map(type => conceptMap[type]).filter(Boolean);

  return {
    status: components.length > 0 ? 'Builder ready' : 'Empty canvas',
    summary: `${grade} ${mode} workspace with ${components.length} object${components.length === 1 ? '' : 's'}.`,
    lastAction,
    typeCounts,
    observations,
    concepts: concepts.length ? concepts : ['Scientific observation', 'Lab safety', 'Cause and effect'],
  };
}
