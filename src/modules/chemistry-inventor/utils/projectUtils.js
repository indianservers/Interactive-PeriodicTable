export const CANVAS_GRID_SIZE = 20;

export function createCanvasObject(item, position = { x: 120, y: 120 }, options = {}) {
  const id = `${item.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  return {
    id,
    sourceId: item.id,
    paletteCategory: options.paletteCategory || item.componentType || 'component',
    componentType: item.componentType || 'component',
    displayName: item.label,
    visual: item.visual || item.label.slice(0, 2).toUpperCase(),
    x: position.x,
    y: position.y,
    width: item.width || 112,
    height: item.height || 64,
    rotation: 0,
    quantity: item.quantity ?? 1,
    unit: item.unit || 'none',
    state: item.state || 'tool',
    concentration: item.concentration || '',
    capacity: item.capacity || '',
    heatingAllowed: Boolean(item.heatingAllowed),
    safetyNote: item.safetyNote || '',
    possibleActions: item.possibleActions || [],
    containedChemicals: item.componentType === 'apparatus' ? [] : [],
    selected: true,
    color: item.color || '#22d3ee',
  };
}

export function createProjectSnapshot({ projectId, projectName, mode, modeId, grade, components, procedureBlocks = [], selectedTemplateId = '', vivaAnswers = {}, zoom, snapToGrid }) {
  return {
    id: projectId || `inventor-${Date.now()}`,
    name: projectName || `${grade} Chemistry Inventor build`,
    grade,
    mode,
    modeId,
    components,
    procedureBlocks,
    selectedTemplateId,
    vivaAnswers,
    zoom,
    snapToGrid,
    componentCount: components.length,
  };
}

export function duplicateCanvasObject(object) {
  return {
    ...object,
    id: `${object.sourceId || 'copy'}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    displayName: `${object.displayName} Copy`,
    x: object.x + 28,
    y: object.y + 28,
    selected: true,
  };
}

export function snapValue(value, enabled) {
  return enabled ? Math.round(value / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE : Math.round(value);
}

export function clampCanvasObject(object, canvasWidth, canvasHeight) {
  return {
    ...object,
    x: Math.max(0, Math.min(object.x, Math.max(0, canvasWidth - object.width))),
    y: Math.max(0, Math.min(object.y, Math.max(0, canvasHeight - object.height))),
  };
}
