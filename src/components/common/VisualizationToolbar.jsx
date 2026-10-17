import { Download, Maximize2, Printer } from 'lucide-react';

export const VisualizationToolbar = ({ targetSelector = 'main svg, main canvas', title = 'visualization', extra = null, fullscreenSelector }) => {
  const findTarget = () => document.querySelector(targetSelector);

  const openFullscreen = () => {
    const target = document.querySelector(fullscreenSelector || targetSelector);
    if (target?.requestFullscreen) target.requestFullscreen().catch(() => {});
  };

  const exportImage = () => {
    let target = findTarget();
    if (!target) return;
    if (!["svg", "canvas"].includes(target.tagName?.toLowerCase())) {
      const clone = target.cloneNode(true);
      const original = [target, ...target.querySelectorAll("*")];
      [clone, ...clone.querySelectorAll("*")].forEach((el, i) => { el.setAttribute("style", Array.from(getComputedStyle(original[i])).map(key => `${key}:${getComputedStyle(original[i]).getPropertyValue(key)}`).join(";")); });
      const bounds = target.getBoundingClientRect();
      const markup = new XMLSerializer().serializeToString(clone);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(bounds.width,target.scrollWidth)}" height="${target.scrollHeight}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([svg], {type:"image/svg+xml"}));
      link.download = `${title}.svg`;link.click();setTimeout(() => URL.revokeObjectURL(link.href),1000);return;
    }
    const isCanvas = target.tagName?.toLowerCase() === 'canvas';
    const a = document.createElement('a');
    if (isCanvas) {
      a.href = target.toDataURL('image/png');
      a.download = `${title}.png`;
    } else {
      const blob = new Blob([new XMLSerializer().serializeToString(target)], { type: 'image/svg+xml;charset=utf-8' });
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.svg`;
    }
    a.click();
    if (!isCanvas) URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      {extra}
      <button onClick={openFullscreen} className="btn-secondary flex items-center gap-2 text-xs" title="Open visualization fullscreen">
        <Maximize2 size={13} /> Fullscreen
      </button>
      <button onClick={exportImage} className="btn-secondary flex items-center gap-2 text-xs" title="Export visualization image">
        <Download size={13} /> Export image
      </button>
      <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-xs" title="Print worksheet">
        <Printer size={13} /> Print
      </button>
    </div>
  );
};

export default VisualizationToolbar;
