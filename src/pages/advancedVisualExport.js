function download(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}

// Render and read within the same event so WebGL's discarded drawing buffer
// cannot produce a blank export. The listener belongs to this canvas only.
export function bindSceneExport(canvas, draw, filename) {
  const exportScene = () => {
    draw();
    download(canvas.toDataURL('image/png'), filename);
  };
  canvas.addEventListener('avc-export', exportScene);
  return () => canvas.removeEventListener('avc-export', exportScene);
}

export function exportChart(svg, filename) {
  const copy = svg.cloneNode(true);
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const properties = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'font-family', 'font-size', 'font-weight', 'text-anchor'];
  const originals = [svg, ...svg.querySelectorAll('*')];
  [copy, ...copy.querySelectorAll('*')].forEach((element, i) => {
    const styles = getComputedStyle(originals[i]);
    properties.forEach(property => element.style.setProperty(property, styles.getPropertyValue(property)));
  });
  const {width, height} = svg.viewBox.baseVal;
  copy.setAttribute('width', width);
  copy.setAttribute('height', height);
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', '#091a2b');
  copy.prepend(background);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], {type: 'image/svg+xml'}));
  download(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
