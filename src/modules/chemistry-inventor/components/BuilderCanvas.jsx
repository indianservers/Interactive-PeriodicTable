import { Copy, Grid3X3, MousePointer2, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function BuilderCanvas({
  components,
  activeId,
  zoom,
  snapToGrid,
  onDropComponent,
  onMoveComponent,
  onSelect,
  onDuplicate,
  onDelete,
  onZoomChange,
  onSnapToggle,
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const handlePointerMove = event => {
      if (!dragRef.current || !canvasRef.current) return;
      const { id, offsetX, offsetY } = dragRef.current;
      const rect = canvasRef.current.getBoundingClientRect();
      onMoveComponent(id, {
        x: (event.clientX - rect.left) / zoom - offsetX,
        y: (event.clientY - rect.top) / zoom - offsetY,
      });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onMoveComponent, zoom]);

  const parseDropItem = event => {
    const raw = event.dataTransfer.getData('application/x-chemistry-component');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handleDrop = event => {
    event.preventDefault();
    setIsDragOver(false);
    const item = parseDropItem(event);
    if (!item || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    onDropComponent(item, {
      x: (event.clientX - rect.left) / zoom,
      y: (event.clientY - rect.top) / zoom,
    });
  };

  const handleObjectPointerDown = (event, object) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(object.id);
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = {
      id: object.id,
      offsetX: (event.clientX - rect.left) / zoom - object.x,
      offsetY: (event.clientY - rect.top) / zoom - object.y,
    };
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/70 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MousePointer2 size={14} className="text-cyan-200" />
          Builder Canvas
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] text-gray-500">{components.length} objects</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onSnapToggle} className={`rounded-lg border px-2 py-1 text-xs font-bold ${snapToGrid ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100' : 'border-white/10 text-gray-400 hover:text-white'}`} type="button">
            <Grid3X3 size={13} className="inline" /> Snap
          </button>
          <button onClick={() => onZoomChange(Math.max(0.65, zoom - 0.1))} className="rounded-lg border border-white/10 p-1.5 text-gray-400 hover:text-white" type="button" title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span className="w-12 text-center text-xs font-bold text-gray-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))} className="rounded-lg border border-white/10 p-1.5 text-gray-400 hover:text-white" type="button" title="Zoom in">
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-3">
        <div className="mx-auto" style={{ width: 1120 * zoom, height: 720 * zoom }}>
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={event => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onPointerDown={() => onSelect(null)}
            className={`chemistry-inventor-canvas relative h-[720px] w-[1120px] overflow-hidden rounded-xl border ${isDragOver ? 'border-cyan-300/70 bg-cyan-300/[0.06]' : 'border-white/10 bg-slate-900/55'}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Drop components here
          </div>

          {components.length === 0 && (
            <div className="absolute left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dashed border-cyan-300/25 bg-black/20 p-5 text-center">
              <p className="text-sm font-black text-white">Start building</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">Drag apparatus, chemicals, indicators, tools, and blocks from the palette into this canvas.</p>
            </div>
          )}

          {components.map(object => {
            const selected = activeId === object.id || object.selected;
            return (
              <div
                key={object.id}
                onPointerDown={event => handleObjectPointerDown(event, object)}
                className={`absolute cursor-grab select-none rounded-2xl border bg-slate-950/90 shadow-lg transition-shadow active:cursor-grabbing ${
                  selected ? 'border-cyan-200 shadow-cyan-950/60 ring-2 ring-cyan-300/35' : 'border-white/15 hover:border-cyan-300/45'
                }`}
                style={{
                  left: object.x,
                  top: object.y,
                  width: object.width,
                  height: object.height,
                  transform: `rotate(${object.rotation || 0}deg)`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                  <span className="text-base font-black" style={{ color: object.color }}>{object.visual}</span>
                  <span className="mt-0.5 max-w-full truncate text-[11px] font-bold text-gray-100">{object.displayName}</span>
                  <span className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-600">{object.componentType}</span>
                </div>
                {selected && (
                  <div className="absolute -right-2 -top-9 flex gap-1 rounded-xl border border-white/10 bg-slate-950/95 p-1 shadow-xl">
                    <button onPointerDown={event => event.stopPropagation()} onClick={() => onDuplicate(object.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white" type="button" title="Duplicate">
                      <Copy size={13} />
                    </button>
                    <button onPointerDown={event => event.stopPropagation()} onClick={() => onDelete(object.id)} className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10 hover:text-rose-100" type="button" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
