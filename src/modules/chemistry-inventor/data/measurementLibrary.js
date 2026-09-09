export const measurementLibrary = [
  ['ph-measurement', 'pH Measurement', 'pH', 'pH', 'Conceptual pH reading from indicator or meter.', 7],
  ['mass-measurement', 'Mass Measurement', 'mass', 'g', 'Measure mass before dissolving or reacting.', 8],
  ['temperature-measurement', 'Temperature Measurement', 'temperature', 'C', 'Track heat change during reaction.', 8],
  ['volume-measurement', 'Volume Measurement', 'volume', 'mL', 'Measure liquid volume with cylinder or beaker markings.', 7],
  ['time-measurement', 'Time Measurement', 'time', 'seconds', 'Record duration of reaction or heating.', 8],
  ['conductivity-measurement', 'Conductivity Measurement', 'conductivity', 'conceptual', 'Basic concept: ions in solution conduct electricity.', 10],
  ['observation-recorder', 'Observation Recorder', 'observation', 'text', 'Record colour, gas, precipitate, smell note, or temperature change.', 7],
].map(([id, name, measures, unit, description, gradeLevel]) => ({
  id, name, measures, unit, description, gradeLevel,
  defaultProperties: { quantity: 1, unit, state: 'tool' },
}));
