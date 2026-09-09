import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import $3Dmol from "3dmol";

const SmallMoleculeViewer = forwardRef(function SmallMoleculeViewer(
  { compound, style = "stick", className = "" },
  ref,
) {
  const hostRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState("loading");

  const applyStyle = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setStyle(
      {},
      style === "sphere"
        ? {
            sphere: { scale: 0.32, colorscheme: "Jmol" },
            stick: { radius: 0.12, colorscheme: "Jmol" },
          }
        : {
            stick: { radius: 0.18, colorscheme: "Jmol" },
            sphere: { scale: 0.25, colorscheme: "Jmol" },
          },
    );
    viewer.render();
  };

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        viewerRef.current?.zoomTo();
        viewerRef.current?.render();
      },
      spin(on = true) {
        viewerRef.current?.spin(on ? "y" : false);
      },
      fullscreen() {
        hostRef.current?.requestFullscreen?.();
      },
    }),
    [],
  );

  useEffect(() => {
    if (!hostRef.current || !compound?.sdf) return undefined;
    let disposed = false;
    setStatus("loading");
    const viewer = $3Dmol.createViewer(hostRef.current, {
      backgroundColor: "#06131f",
      antialias: true,
    });
    viewerRef.current = viewer;
    fetch(compound.sdf)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((sdf) => {
        if (disposed) return;
        viewer.addModel(sdf, "sdf");
        applyStyle();
        viewer.zoomTo();
        viewer.render();
        setStatus("ready");
      })
      .catch(() => !disposed && setStatus("error"));
    const resize = new ResizeObserver(() => viewer.resize());
    resize.observe(hostRef.current);
    return () => {
      disposed = true;
      resize.disconnect();
      viewer.spin(false);
      viewer.clear();
      viewerRef.current = null;
    };
  }, [compound?.sdf]);

  useEffect(applyStyle, [style]);

  return (
    <div
      className={`dds-small-viewer ${className}`}
      data-ready={status === "ready"}
    >
      <div
        ref={hostRef}
        role="img"
        aria-label={`Interactive 3D conformer of ${compound?.name || "compound"}`}
      />
      {status === "loading" && (
        <span className="dds-viewer-status">Loading PubChem conformer…</span>
      )}
      {status === "error" && (
        <span className="dds-viewer-status is-error">
          Conformer unavailable · retry by reloading
        </span>
      )}
      {compound && (
        <small>3DMOL · PUBCHEM CID {compound.cid} · COMPUTED CONFORMER</small>
      )}
    </div>
  );
});

export default SmallMoleculeViewer;
