export const formatValue = (value, unit = '') => {
  if (value === null || value === undefined) return 'Data not available';
  const formatted = typeof value === 'number'
    ? (Number.isInteger(value) ? value.toString() : parseFloat(value.toPrecision(6)).toString())
    : value;
  return unit ? `${formatted} ${unit}` : `${formatted}`;
};

export const kelvinToCelsius = (k) => {
  if (k === null || k === undefined) return null;
  return parseFloat((k - 273.15).toFixed(2));
};

export const formatTemperature = (kelvin) => {
  if (kelvin === null || kelvin === undefined) return 'Data not available';
  const c = kelvinToCelsius(kelvin);
  return `${kelvin} K (${c} °C)`;
};

export const formatDensity = (density) => {
  if (density === null || density === undefined) return 'Data not available';
  if (density < 0.01) return `${density.toExponential(3)} g/cm³`;
  return `${density} g/cm³`;
};

export const formatYear = (year) => {
  if (!year) return 'Ancient / Unknown';
  return year.toString();
};
