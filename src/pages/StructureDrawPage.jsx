import { useEffect, useMemo, useRef, useState } from "react";
import {
  Atom,
  Search,
  Home,
  Box,
  FlaskConical,
  Activity,
  FileText,
  Library,
  LayoutTemplate,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
  Save,
  FolderOpen,
  Copy,
  Clipboard,
  Maximize,
  Settings,
  HelpCircle,
  User,
  Plus,
  MousePointer2,
  Hexagon,
  Eraser,
  Minus,
  Link,
  Pencil,
  Ruler,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  RotateCw,
  Download,
} from "lucide-react";
import { downloadBlob } from "../utils/labExports.js";
import {
  addRing,
  bondSegments,
  emptyStructure,
  parseMolfile,
  structureMolfile,
} from "../utils/structureDrawing.js";
import { getRDKit } from "../modules/drug-discovery/rdkitService.js";
import DrawMoleculePreview from "./DrawMoleculePreview.jsx";
import "./structureDraw.css";
import { templates, conformers } from "../utils/structureDrawLibrary.js";
import {
  loadStructureLibrary,
  filterLibrary,
  featuredLibrary,
} from "../utils/expandedStructureLibrary.js";
import StructureLibrary from "./StructureLibrary.jsx";
import DrawResearchWorkbench from "./DrawResearchWorkbench.jsx";
import { validateDrawWorkspace } from "../utils/drawWorkspace.js";
import { canonicalSmiles, parseSdf3D } from "../utils/drawResearch.js";
const atomColors = {
  N: "#152bed",
  O: "#f01520",
  Cl: "#14aa59",
  S: "#c49c00",
  F: "#38b543",
  Br: "#9441c1",
};
function StereoBond({ a, b, stereo }) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy) || 1,
    nx = -dy / length,
    ny = dx / length;
  if (stereo === 1)
    return (
      <polygon
        points={`${a.x},${a.y} ${b.x + nx * 7},${b.y + ny * 7} ${b.x - nx * 7},${b.y - ny * 7}`}
        fill="#111827"
      />
    );
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i + 1) / 8,
          x = a.x + dx * t,
          y = a.y + dy * t,
          w = t * 7;
        return (
          <line
            key={i}
            x1={x - nx * w}
            y1={y - ny * w}
            x2={x + nx * w}
            y2={y + ny * w}
            stroke="#111827"
            strokeWidth="2"
          />
        );
      })}
    </g>
  );
}
export default function StructureDrawPage({ onNavigate }) {
  const [model, setModel] = useState(emptyStructure),
    [tool, setTool] = useState("Select / Move"),
    [element, setElement] = useState("C"),
    [selected, setSelected] = useState(null),
    [undo, setUndo] = useState([]),
    [redo, setRedo] = useState([]),
    [zoom, setZoom] = useState(1),
    [name, setName] = useState("Caffeine"),
    [smiles, setSmiles] = useState(""),
    [descriptors, setDescriptors] = useState({}),
    [notice, setNotice] = useState(
      "Drag atoms to move. Choose a tool to edit.",
    ),
    [busy, setBusy] = useState(false),
    [panel, setPanel] = useState("2D View"),
    [representation, setRepresentation] = useState("Ball & Stick"),
    [labels, setLabels] = useState(true),
    [grid, setGrid] = useState(false),
    [dialog, setDialog] = useState(""),
    [input, setInput] = useState(""),
    [elementSearch, setElementSearch] = useState(""),
    [query, setQuery] = useState(""),
    [searchCatalogue, setSearchCatalogue] = useState(null),
    [thumbnails, setThumbnails] = useState({}),
    [documents, setDocuments] = useState([
      { id: 1, title: "Untitled-1", model: null, name: "Caffeine" },
    ]),
    [documentId, setDocumentId] = useState(1),
    [spin, setSpin] = useState(false),
    [annotation, setAnnotation] = useState(""),
    [feature, setFeature] = useState("Draw"),
    [databaseSearch, setDatabaseSearch] = useState(null),
    [sdfText, setSdfText] = useState(""),
    [highlightAtoms, setHighlightAtoms] = useState([]),
    [loaded, setLoaded] = useState(false),
    [ringSize, setRingSize] = useState(6),
    [transparentExport, setTransparentExport] = useState(false),
    [exportSize, setExportSize] = useState(1600);
  const graphSignature =
    model.atoms
      .map((a) => `${a.id}:${a.element}:${a.charge || 0}:${a.isotope || 0}`)
      .join("|") +
    "/" +
    model.bonds.map((b) => `${b.a}:${b.b}:${b.order}`).join("|");
  const svg = useRef(),
    drag = useRef(),
    preview = useRef(),
    loadSequence = useRef(0),
    importFile = useRef();
  const commit = (next) => {
    setUndo((u) => [...u, { model, name, sdfText }].slice(-80));
    setRedo([]);
    setModel(next);
    setSdfText("");
    setHighlightAtoms([]);
    if (!next.atoms.some((a) => a.id === selected)) setSelected(null);
    setName("Edited structure");
  };
  useEffect(() => {
    if (query.length >= 2 && !searchCatalogue)
      loadStructureLibrary()
        .then((data) => setSearchCatalogue(data.entries))
        .catch(() => {});
  }, [query, searchCatalogue]);
  const quickLibraryMatches = useMemo(
    () =>
      query
        ? filterLibrary(searchCatalogue || featuredLibrary, { query }).slice(
            0,
            10,
          )
        : [],
    [query, searchCatalogue],
  );
  const load = async (value, label = "Imported structure") => {
    const sequence = ++loadSequence.current;
    setBusy(true);
    let mol;
    try {
      const rd = await getRDKit();
      mol = rd.get_mol(value);
      if (!mol)
        throw Error("Invalid structure. Check SMILES and atom valences.");
      mol.set_new_coords();
      const next = parseMolfile(mol.get_molblock());
      const scale = 1.3;
      next.atoms = next.atoms.map((a) => ({
        ...a,
        x: 400 - (a.y - 300) * scale,
        y: 300 + (a.x - 400) * scale,
      }));
      if (label === "Caffeine" && value === templates[5][1]) {
        const positions = [
          [570, 375],
          [510, 340],
          [430, 385],
          [430, 450],
          [350, 340],
          [350, 250],
          [270, 225],
          [220, 295],
          [270, 365],
          [220, 415],
          [430, 205],
          [430, 140],
          [510, 250],
          [570, 210],
        ];
        next.atoms = next.atoms.map((a, i) => ({
          ...a,
          x: 400 + (positions[i][0] - 400) * 1.3,
          y: 291 + (positions[i][1] - 300) * 1.3,
        }));
      } else if (next.atoms.length) {
        const cx =
            (Math.min(...next.atoms.map((a) => a.x)) +
              Math.max(...next.atoms.map((a) => a.x))) /
            2,
          cy =
            (Math.min(...next.atoms.map((a) => a.y)) +
              Math.max(...next.atoms.map((a) => a.y))) /
            2;
        const width =
            Math.max(...next.atoms.map((a) => a.x)) -
            Math.min(...next.atoms.map((a) => a.x)),
          height =
            Math.max(...next.atoms.map((a) => a.y)) -
            Math.min(...next.atoms.map((a) => a.y)),
          fit = Math.min(
            1,
            650 / Math.max(1, width),
            420 / Math.max(1, height),
          );
        next.atoms = next.atoms.map((a) => ({
          ...a,
          x: (a.x - cx) * fit + 400,
          y: (a.y - cy) * fit + 300,
        }));
      }
      if (sequence !== loadSequence.current) return;
      if (canonicalSmiles(rd, structureMolfile(next)) !== mol.get_smiles())
        throw Error(
          "This structure cannot retain its chemical identity in the drawing editor.",
        );
      commit(next);
      setName(label);
      setSelected(null);
      setNotice(`Loaded ${label}.`);
      return true;
    } catch (e) {
      setNotice(e.message);
      return false;
    } finally {
      mol?.delete();
      if (sequence === loadSequence.current) setBusy(false);
    }
  };
  useEffect(() => {
    let restored = false;
    try {
      const stored =
        sessionStorage.getItem("chemistry-draw-workspace") ||
        localStorage.getItem("chemistry-draw-workspace");
      if (stored) {
        restoreWorkspace(validateDrawWorkspace(JSON.parse(stored)));
        restored = true;
      }
    } catch {
      setNotice("Workspace recovery failed. Starting a new drawing.");
    }
    if (!restored)
      load(templates[5][1], "Caffeine").finally(() => setLoaded(true));
    else setLoaded(true);
    let active = true;
    getRDKit().then((rd) => {
      const images = {};
      for (const [n, v] of templates) {
        const mol = rd.get_mol(v);
        if (mol) {
          images[n] = mol.get_svg(140, 90);
          mol.delete();
        }
      }
      if (active) setThumbnails(images);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!model.atoms.length) {
      setDescriptors({});
      setSmiles("");
      return;
    }
    getRDKit()
      .then((rd) => {
        const mol = rd.get_mol(structureMolfile(model));
        if (!mol) {
          if (active) {
            setDescriptors({ invalid: true });
            setSmiles("");
          }
          return;
        }
        let normalized;
        try {
          normalized = rd.get_mol(mol.remove_hs());
          if (!normalized) throw Error("Cannot normalize molecular hydrogens.");
          if (active) {
            setSmiles(normalized.get_smiles());
            const desc = JSON.parse(normalized.get_descriptors());
            const graph = JSON.parse(mol.get_json());
            const defaults = graph.defaults.atom;
            desc.graphSignature = graphSignature;
            desc.atomHydrogens = graph.molecules[0].atoms.map(
              (a) => a.impHs ?? defaults.impHs ?? 0,
            );
            const counts = {};
            for (const atom of graph.molecules[0].atoms) {
              const z = atom.z ?? defaults.z;
              const symbol =
                [
                  "",
                  "H",
                  "He",
                  "Li",
                  "Be",
                  "B",
                  "C",
                  "N",
                  "O",
                  "F",
                  "Ne",
                  "Na",
                  "Mg",
                  "Al",
                  "Si",
                  "P",
                  "S",
                  "Cl",
                  "Ar",
                  "K",
                  "Ca",
                ][z] ||
                model.atoms[graph.molecules[0].atoms.indexOf(atom)]?.element ||
                "?";
              counts[symbol] = (counts[symbol] || 0) + 1;
              counts.H = (counts.H || 0) + (atom.impHs ?? defaults.impHs ?? 0);
            }
            desc.formula = Object.keys(counts)
              .filter((k) => counts[k] > 0)
              .sort((a, b) =>
                a === "C"
                  ? -1
                  : b === "C"
                    ? 1
                    : a === "H"
                      ? -1
                      : b === "H"
                        ? 1
                        : a.localeCompare(b),
              )
              .map(
                (k) =>
                  k +
                  (counts[k] > 1
                    ? String(counts[k]).replace(
                        /[0-9]/g,
                        (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)],
                      )
                    : ""),
              )
              .join("");
            setDescriptors(desc);
          }
        } finally {
          normalized?.delete();
          mol.delete();
        }
      })
      .catch((e) => setNotice(e.message));
    return () => {
      active = false;
    };
  }, [model]);
  const point = (e) => {
    const p = svg.current.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const local = p.matrixTransform(svg.current.getScreenCTM().inverse());
    return {
      x: (local.x - 400 * (1 - zoom)) / zoom,
      y: (local.y - 300 * (1 - zoom)) / zoom,
    };
  };
  const addAt = (e) => {
    if (e.target !== svg.current) return;
    const { x, y } = point(e);
    if (tool === "Select / Move") {
      setSelected(null);
      return;
    }
    if (tool === "Erase") return;
    if (tool.includes("ring")) {
      commit(addRing(model, x, y, tool === "Benzene ring", ringSize));
      return;
    }
    const id = Math.max(0, ...model.atoms.map((a) => a.id)) + 1,
      order = tool === "Double bond" ? 2 : tool === "Triple bond" ? 3 : 1;
    commit({
      atoms: [...model.atoms, { id, x, y, element }],
      bonds:
        selected && tool !== "Atom"
          ? [
              ...model.bonds,
              {
                a: selected,
                b: id,
                order,
                stereo:
                  tool === "Wedge bond" ? 1 : tool === "Dashed bond" ? 6 : 0,
              },
            ]
          : model.bonds,
    });
    setSelected(id);
  };
  const atomClick = (e, a) => {
    e.stopPropagation();
    if (tool === "Erase") {
      commit({
        atoms: model.atoms.filter((v) => v.id !== a.id),
        bonds: model.bonds.filter((b) => b.a !== a.id && b.b !== a.id),
      });
      setSelected(null);
      return;
    }
    if (tool === "Atom") {
      commit({
        ...model,
        atoms: model.atoms.map((v) => (v.id === a.id ? { ...v, element } : v)),
      });
      return;
    }
    if (tool.includes("bond") && selected && selected !== a.id) {
      const order = tool === "Double bond" ? 2 : tool === "Triple bond" ? 3 : 1,
        match = (b) =>
          (b.a === selected && b.b === a.id) ||
          (b.b === selected && b.a === a.id);
      commit({
        ...model,
        bonds: model.bonds.some(match)
          ? model.bonds.map((b) =>
              match(b)
                ? {
                    ...b,
                    order,
                    stereo:
                      tool === "Wedge bond"
                        ? 1
                        : tool === "Dashed bond"
                          ? 6
                          : 0,
                  }
                : b,
            )
          : [
              ...model.bonds,
              {
                a: selected,
                b: a.id,
                order,
                stereo:
                  tool === "Wedge bond" ? 1 : tool === "Dashed bond" ? 6 : 0,
              },
            ],
      });
    }
    setSelected(a.id);
  };
  const undoAction = () => {
    if (!undo.length) return;
    setRedo((r) => [...r, { model, name, sdfText }]);
    setModel(undo.at(-1).model);
    setSdfText(undo.at(-1).sdfText || "");
    setHighlightAtoms([]);
    setName(undo.at(-1).name);
    setUndo((u) => u.slice(0, -1));
    setSelected(null);
  };
  const redoAction = () => {
    if (!redo.length) return;
    setUndo((u) => [...u, { model, name, sdfText }]);
    setModel(redo.at(-1).model);
    setSdfText(redo.at(-1).sdfText || "");
    setHighlightAtoms([]);
    setName(redo.at(-1).name);
    setRedo((r) => r.slice(0, -1));
    setSelected(null);
  };
  const save = () => {
    if (busy) {
      setNotice("Finish loading the structure before saving.");
      return;
    }
    try {
      localStorage.setItem(
        "chemistry-drawing",
        JSON.stringify({ model, name }),
      );
      sessionStorage.setItem(
        "chemistry-draw-workspace",
        JSON.stringify(workspaceData()),
      );
      localStorage.setItem(
        "chemistry-draw-workspace",
        JSON.stringify(workspaceData()),
      );
      setNotice("Drawing and all document tabs saved locally.");
    } catch {
      setNotice("Local storage unavailable. Export a workspace backup.");
    }
  };
  const download = () =>
    downloadBlob(
      new Blob([structureMolfile(model)], { type: "chemical/x-mdl-molfile" }),
      `${name}.mol`,
    );
  const clear = () => {
    commit(emptyStructure());
    setName("Untitled structure");
    setSdfText("");
    setHighlightAtoms([]);
    setSelected(null);
  };
  const iconButton = (Icon, label, action, extra = {}) => (
    <button key={label} onClick={action} title={label} {...extra}>
      <Icon size={21} />
      <span>{label}</span>
    </button>
  );
  const openDialog = (label) => {
    setInput("");
    setDialog(label);
  };
  const copy = () =>
    navigator.clipboard
      .writeText(structureMolfile(model))
      .then(() => setNotice("MOL copied."))
      .catch(() => openDialog("Copy MOL"));
  const paste = () =>
    navigator.clipboard
      .readText()
      .then((text) => load(text, "Pasted structure"))
      .catch(() => openDialog("Load SMILES / MOL"));
  const switchDocument = (id) => {
    if (id === documentId) return;
    ++loadSequence.current;
    setBusy(false);
    setDocuments((ds) =>
      ds.map((d) => (d.id === documentId ? { ...d, model, name, sdfText } : d)),
    );
    const doc = documents.find((d) => d.id === id);
    setDocumentId(id);
    setModel(doc.model || emptyStructure());
    setSdfText(doc.sdfText || "");
    setHighlightAtoms([]);
    setName(doc.name);
    setUndo([]);
    setRedo([]);
    setSelected(null);
  };
  const newDocument = () => {
    if (documents.length >= 30) {
      setNotice(
        "This workspace supports up to 30 documents. Export a backup before starting another workspace.",
      );
      return;
    }
    setFeature("Draw");
    ++loadSequence.current;
    setBusy(false);
    const id = Math.max(...documents.map((d) => d.id)) + 1;
    setDocuments((ds) => [
      ...ds.map((d) =>
        d.id === documentId ? { ...d, model, name, sdfText } : d,
      ),
      {
        id,
        title: `Untitled-${id}`,
        model: emptyStructure(),
        name: "Untitled structure",
      },
    ]);
    setDocumentId(id);
    setModel(emptyStructure());
    setName("Untitled structure");
    setSdfText("");
    setHighlightAtoms([]);
    setUndo([]);
    setRedo([]);
    setSelected(null);
  };
  const hydrogen = async (add) => {
    let mol;
    try {
      const rd = await getRDKit();
      mol = rd.get_mol(structureMolfile(model));
      if (!mol) throw Error("Validate the structure first.");
      const block = add ? mol.add_hs() : mol.remove_hs();
      commit(parseMolfile(block));
      setNotice(
        add ? "Explicit hydrogens added." : "Explicit hydrogens removed.",
      );
    } catch (e) {
      setNotice(e.message);
    } finally {
      mol?.delete();
    }
  };
  const formula = () => {
    if (!model.atoms.length) return "—";
    if (descriptors.invalid) return "Invalid valence";
    if (name === "Caffeine") return "C₈H₁₀N₄O₂";
    return descriptors.formula || "—";
  };
  const workspaceData = () => ({
    version: 1,
    activeDocumentId: documentId,
    documents: documents
      .map((d) => (d.id === documentId ? { ...d, model, name, sdfText } : d))
      .map((d) => ({ ...d, model: d.model || emptyStructure() })),
    annotation,
    settings: { grid, labels },
  });
  const restoreWorkspace = (data) => {
    ++loadSequence.current;
    const doc = data.documents.find((d) => d.id === data.activeDocumentId);
    setDocuments(data.documents);
    setDocumentId(doc.id);
    setModel(doc.model);
    setName(doc.name);
    setSdfText(doc.sdfText || "");
    setAnnotation(data.annotation);
    setGrid(data.settings.grid);
    setLabels(data.settings.labels);
    setUndo([]);
    setRedo([]);
    setSelected(null);
    setFeature("Draw");
    setNotice("Workspace restored.");
  };
  const downloadText = (text, file, type) =>
    downloadBlob(new Blob([text], { type }), file);
  const svgMarkup = () => {
    const clone = svg.current.cloneNode(true);
    clone.removeAttribute("style");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "800");
    clone.setAttribute("height", "600");
    return new XMLSerializer().serializeToString(clone);
  };
  const exportPng = () => {
    const url = URL.createObjectURL(
        new Blob([svgMarkup()], { type: "image/svg+xml" }),
      ),
      image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = exportSize;
        canvas.height = exportSize * 0.75;
        const ctx = canvas.getContext("2d");
        if (!transparentExport) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) downloadBlob(blob, `${name}.png`);
        }, "image/png");
      } catch (e) {
        setNotice(e.message);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setNotice("PNG export failed. Try SVG export.");
    };
    image.src = url;
  };
  const readMolecularFile = async (file) => {
    try {
      if (file.size > 5e6) throw Error("Use a file smaller than 5 MB.");
      const text = await file.text();
      if (file.name.toLowerCase().endsWith(".json")) {
        restoreWorkspace(validateDrawWorkspace(JSON.parse(text)));
        setLoaded(true);
      } else {
        const value = text.includes("V2000")
          ? text.split("$$$$")[0]
          : text.trim().split(/\r?\n/)[0].split(/\s+/)[0];
        if (await load(value, file.name.replace(/\.[^.]+$/, ""))) {
          if (
            text.includes("V2000") &&
            /3D/.test(text.split(/\r?\n/)[1] || "")
          ) {
            parseSdf3D(text);
            setSdfText(text);
          }
          setFeature("Draw");
        }
      }
    } catch (e) {
      setNotice(e.message);
    }
  };
  const changeCharge = (delta) => {
    if (!selected) return;
    commit({
      ...model,
      atoms: model.atoms.map((a) =>
        a.id === selected
          ? { ...a, charge: Math.max(-8, Math.min(8, (a.charge || 0) + delta)) }
          : a,
      ),
    });
  };
  useEffect(() => {
    if (!loaded) return;
    const flush = () => {
      try {
        sessionStorage.setItem(
          "chemistry-draw-workspace",
          JSON.stringify(workspaceData()),
        );
        localStorage.setItem(
          "chemistry-draw-workspace",
          JSON.stringify(workspaceData()),
        );
      } catch {
        setNotice("Workspace autosave unavailable. Export a workspace backup.");
      }
    };
    const timer = setTimeout(flush, 600);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
    };
  }, [
    loaded,
    model,
    name,
    sdfText,
    documents,
    documentId,
    annotation,
    grid,
    labels,
  ]);
  useEffect(() => {
    const key = (e) => {
      const editing = e.target.closest?.(
        "input,textarea,select,[contenteditable=true]",
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
        return;
      }
      if (editing || dialog || feature !== "Draw") return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          e.shiftKey ? redoAction() : undoAction();
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          redoAction();
        }
        return;
      }
      if (e.key === "Delete" && selected) {
        e.preventDefault();
        commit({
          atoms: model.atoms.filter((a) => a.id !== selected),
          bonds: model.bonds.filter(
            (b) => b.a !== selected && b.b !== selected,
          ),
        });
      }
      const tools = {
        v: "Select / Move",
        a: "Atom",
        e: "Erase",
        r: "Six-membered ring",
        1: "Single bond",
        2: "Double bond",
        3: "Triple bond",
      };
      if (tools[e.key.toLowerCase()]) setTool(tools[e.key.toLowerCase()]);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  return (
    <div
      className="draw-app"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          readMolecularFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <header className="draw-head">
        <div className="draw-brand">
          <svg width="37" height="38" viewBox="0 0 40 42" aria-hidden="true">
            <g fill="none" stroke="#0790ff" strokeWidth="2">
              <path d="M20 6 8 14v14l12 8 12-8V14zM20 6v14M8 14l12 6 12-6M8 28l12-8 12 8M20 20v16" />
            </g>
            {[
              [20, 5],
              [7, 13],
              [7, 29],
              [20, 37],
              [33, 29],
              [33, 13],
              [20, 21],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === 6 ? 6 : 4.5}
                fill={i % 2 ? "#0c6fff" : "#00a6ff"}
                stroke="white"
                strokeWidth="1.3"
              />
            ))}
          </svg>
          <strong>
            Chemistry Universe <b>Pro</b>
          </strong>
        </div>
        <div className="draw-search">
          <Search size={20} />
          <input
            aria-label="Search molecules"
            placeholder="Search molecules, templates, reactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <div className="draw-search-results">
              {quickLibraryMatches.map(({ id, name: n, smiles: v }) => (
                <button
                  key={id}
                  onClick={() => {
                    load(v, n);
                    setQuery("");
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => {
                  setDatabaseSearch({ query });
                  setFeature("Database");
                  setQuery("");
                }}
              >
                Search PubChem for “{query}” ↗
              </button>
            </div>
          )}
        </div>
        <div className="draw-head-actions">
          {iconButton(FileText, "New", newDocument)}
          {iconButton(FolderOpen, "Open", () =>
            openDialog("Load SMILES / MOL"),
          )}
          {iconButton(Save, "Save", save, { disabled: busy })}
          {iconButton(Download, "Export", () => openDialog("Export drawing"))}
          {iconButton(Settings, "Settings", () =>
            openDialog("Canvas settings"),
          )}
          {iconButton(HelpCircle, "Help", () => openDialog("Drawing help"))}
          {iconButton(User, "Profile", () => openDialog("Local workspace"))}
        </div>
      </header>
      <nav className="draw-nav">
        {[
          [Home, "Home"],
          [Atom, "Structure Draw"],
          [Box, "3D Viewer"],
          [FlaskConical, "Reactions"],
          [Activity, "Spectra"],
          [FileText, "Properties"],
          [Library, "Library"],
          [LayoutTemplate, "Templates"],
          [Sparkles, "AI Assistant"],
        ].map(([I, label]) =>
          iconButton(
            I,
            label,
            () =>
              label === "Home"
                ? onNavigate?.("dashboard")
                : label === "3D Viewer"
                  ? setFeature("3D Lab")
                  : label === "Properties"
                    ? setFeature("Analysis")
                    : label === "Reactions"
                      ? onNavigate?.("organic-reaction-visualizer")
                      : label === "Spectra"
                        ? onNavigate?.("spectroscopy-interpreter")
                        : label === "Structure Draw"
                          ? (setFeature("Draw"), setPanel("2D View"))
                          : openDialog(
                              label === "Templates" || label === "Library"
                                ? "Structure library"
                                : label === "AI Assistant"
                                  ? "Draw by name"
                                  : label,
                            ),
            { "aria-current": label === "Structure Draw" ? "page" : undefined },
          ),
        )}
      </nav>
      <input
        ref={importFile}
        className="draw-file-import"
        type="file"
        accept=".json,.mol,.sdf,.smi,.smiles,.txt"
        aria-label="Import molecular file"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await readMolecularFile(file);
          e.target.value = "";
        }}
      />
      <div className="draw-body">
        <aside className="draw-rail">
          <h2>
            ◧ Drawing tools <HelpCircle size={17} />
          </h2>
          <div className="draw-tools">
            {[
              [MousePointer2, "Select / Move", "Select / Move"],
              [Plus, "Atom", "Atom"],
              [Minus, "Single", "Single bond"],
              [Minus, "Double", "Double bond"],
              [Minus, "Triple", "Triple bond"],
              [Hexagon, "Aromatic", "Benzene ring"],
              [Hexagon, "Ring", "Six-membered ring"],
              [Link, "Chain", "Single bond"],
              [Eraser, "Erase", "Erase"],
              [Undo2, "Undo", "undo"],
            ].map(([I, label, t], i) =>
              iconButton(
                I,
                label,
                () => {
                  if (t === "undo") undoAction();
                  else {
                    setTool(t);
                    setSelected(null);
                  }
                },
                { className: i < 2 ? "wide" : "", "aria-pressed": tool === t },
              ),
            )}
          </div>
          <h2>Atom elements</h2>
          <div className="element-search">
            <Search size={17} />
            <input
              placeholder="Search elements..."
              aria-label="Search elements"
              value={elementSearch}
              onChange={(e) => setElementSearch(e.target.value)}
            />
          </div>
          <div className="draw-elements">
            {[
              "H",
              "C",
              "N",
              "O",
              "S",
              "P",
              "F",
              "Cl",
              "Br",
              "I",
              "B",
              "Si",
              "Na",
              "K",
              "Ca",
              "Fe",
              "Cu",
              "Zn",
            ]
              .filter((e) =>
                e.toLowerCase().includes(elementSearch.toLowerCase()),
              )
              .map((el) => (
                <button
                  key={el}
                  data-element={el}
                  aria-pressed={element === el && tool === "Atom"}
                  onClick={() => {
                    setElement(el);
                    setTool("Atom");
                  }}
                >
                  {el}
                </button>
              ))}
          </div>
          <h2>
            Templates{" "}
            <button onClick={() => openDialog("Structure library")}>
              View all
            </button>
          </h2>
          <div className="draw-templates">
            {templates.slice(0, 8).map(([n, v]) => (
              <button key={n} onClick={() => load(v, n)}>
                <span
                  className="draw-mini-template"
                  dangerouslySetInnerHTML={{ __html: thumbnails[n] || "" }}
                />
                {n}
              </button>
            ))}
            <button onClick={() => openDialog("Load SMILES / MOL")}>
              <Pencil size={20} />
              Custom...
            </button>
          </div>
          <h2>Advanced</h2>
          <div className="draw-advanced">
            {iconButton(FileText, "Load SMILES / MOL", () =>
              openDialog("Load SMILES / MOL"),
            )}
            {iconButton(Atom, "Draw by Name (IUPAC)", () =>
              setFeature("Database"),
            )}
            {iconButton(Sparkles, "AI Generate Structure", () =>
              openDialog("Draw by name"),
            )}
            {iconButton(FlaskConical, "Reaction to Product", () =>
              onNavigate?.("retrosynthesis-planner"),
            )}
          </div>
        </aside>
        <main className="draw-workspace">
          <div className="draw-documents">
            <div role="tablist">
              {documents.map((d) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={documentId === d.id}
                  onClick={() => switchDocument(d.id)}
                >
                  <Hexagon size={16} />
                  {d.title}*<i />
                </button>
              ))}
              <button aria-label="New document" onClick={newDocument}>
                <Plus size={21} />
              </button>
            </div>
            <button onClick={() => openDialog("Canvas settings")}>
              <Settings size={17} />
              Canvas settings
            </button>
            <button
              aria-label="Fullscreen workspace"
              onClick={() =>
                document.querySelector(".draw-app")?.requestFullscreen?.()
              }
            >
              <Maximize size={19} />
            </button>
          </div>
          <div className="draw-toolbar">
            {iconButton(Undo2, "Undo", undoAction, { disabled: !undo.length })}
            {iconButton(Redo2, "Redo", redoAction, { disabled: !redo.length })}
            {iconButton(Trash2, "Clear", clear)}
            {iconButton(Save, "Save", save, { disabled: busy })}
            {iconButton(FolderOpen, "Load", () => openDialog("Load drawing"))}
            {iconButton(Copy, "Copy", copy)}
            {iconButton(Clipboard, "Paste", paste)}
            {iconButton(Trash2, "Delete", () =>
              selected
                ? commit({
                    atoms: model.atoms.filter((a) => a.id !== selected),
                    bonds: model.bonds.filter(
                      (b) => b.a !== selected && b.b !== selected,
                    ),
                  })
                : clear(),
            )}
            {iconButton(Box, "2D ↔ 3D", () =>
              setPanel(panel === "3D View" ? "2D View" : "3D View"),
            )}
            {iconButton(Atom, "Optimize", () => smiles && load(smiles, name))}
            {iconButton(Plus, "Add H", () => hydrogen(true))}
            {iconButton(Minus, "Remove H", () => hydrogen(false))}
            {iconButton(Plus, "Charge", () => openDialog("Bond & atom tools"))}
            {iconButton(Pencil, "Annotate", () => openDialog("Annotation"))}
            {iconButton(Ruler, "Measure", () => setFeature("3D Lab"))}
          </div>
          <div
            className="draw-feature-tabs"
            role="tablist"
            aria-label="Research workspace tabs"
          >
            {[
              "Draw",
              "Analysis",
              "Compare",
              "Batch",
              "Mass Lab",
              "3D Lab",
              "Notebook",
              "Database",
            ].map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={feature === f}
                onClick={() => setFeature(f)}
              >
                {f}
              </button>
            ))}
            {highlightAtoms.length > 0 && (
              <button
                className="draw-highlight-clear"
                onClick={() => setHighlightAtoms([])}
              >
                Clear {highlightAtoms.length} highlights
              </button>
            )}
            <button
              className="draw-backup"
              onClick={() => openDialog("Bond & atom tools")}
            >
              Bond & atom tools
            </button>
            <button onClick={() => openDialog("Export drawing")}>
              Export / backup
            </button>
          </div>
          <DrawResearchWorkbench
            active={feature}
            model={model}
            molfile={structureMolfile(model)}
            name={name}
            smiles={smiles}
            sdfText={sdfText}
            databaseSearch={databaseSearch}
            onNotice={setNotice}
            onLoad={async (value, label) => {
              if (await load(value, label)) setFeature("Draw");
            }}
            onHighlight={(indices, label) => {
              setHighlightAtoms(
                indices.map((i) => model.atoms[i]?.id).filter(Boolean),
              );
              setNotice(label);
              setFeature("Draw");
            }}
            onResolve={async (result) => {
              if (
                await load(
                  result.canonical,
                  result.IUPACName || `PubChem ${result.CID}`,
                )
              ) {
                setSdfText(result.conformer || "");
                setFeature("Draw");
                setPanel(result.conformer ? "3D View" : "2D View");
                setNotice(
                  `Loaded PubChem CID ${result.CID}${result.conformer ? " with a validated 3D conformer" : ""}.`,
                );
              }
            }}
          />
          <div className="draw-editor-grid" hidden={feature !== "Draw"}>
            <div className="draw-left">
              <section className={`draw-canvas ${grid ? "has-grid" : ""}`}>
                <span className="draw-canvas-badge">
                  <Box size={16} />
                  {panel === "3D View" ? "3D Structure" : "2D Structure"}
                </span>
                {panel === "3D View" && (
                  <div className="draw-large-preview">
                    <DrawMoleculePreview
                      model={model}
                      name={name}
                      sdfText={sdfText}
                      representation={representation}
                      spin={spin}
                    />
                  </div>
                )}
                <svg
                  ref={svg}
                  className="drawing-surface"
                  style={{
                    visibility: panel === "3D View" ? "hidden" : "visible",
                  }}
                  viewBox="0 0 800 600"
                  aria-label="Structure drawing canvas"
                  onClick={addAt}
                  onPointerMove={(e) => {
                    if (!drag.current) return;
                    const p = point(e);
                    setModel((m) => ({
                      ...m,
                      atoms: m.atoms.map((a) =>
                        a.id === drag.current ? { ...a, ...p } : a,
                      ),
                    }));
                    setName("Edited structure");
                  }}
                  onPointerUp={() => (drag.current = null)}
                  onPointerCancel={() => (drag.current = null)}
                >
                  <g
                    transform={`translate(${400 * (1 - zoom)},${300 * (1 - zoom)}) scale(${zoom})`}
                  >
                    {model.bonds.map((b, i) => {
                      const a = model.atoms.find((a) => a.id === b.a),
                        c = model.atoms.find((a) => a.id === b.b);
                      if (!a || !c) return null;
                      return (
                        <g
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tool === "Erase")
                              commit({
                                ...model,
                                bonds: model.bonds.filter((_, j) => j !== i),
                              });
                            else if (tool.includes("bond"))
                              commit({
                                ...model,
                                bonds: model.bonds.map((v, j) =>
                                  j === i
                                    ? {
                                        ...v,
                                        stereo:
                                          tool === "Wedge bond"
                                            ? 1
                                            : tool === "Dashed bond"
                                              ? 6
                                              : 0,
                                        order:
                                          tool === "Double bond"
                                            ? 2
                                            : tool === "Triple bond"
                                              ? 3
                                              : 1,
                                      }
                                    : v,
                                ),
                              });
                          }}
                        >
                          {[1, 6].includes(b.stereo) ? (
                            <StereoBond a={a} b={c} stereo={b.stereo} />
                          ) : (
                            bondSegments(a, c, b.order).map((seg, j) => (
                              <line
                                key={j}
                                {...seg}
                                stroke="#111827"
                                strokeWidth="3.2"
                              />
                            ))
                          )}
                          <line
                            x1={a.x}
                            y1={a.y}
                            x2={c.x}
                            y2={c.y}
                            stroke="transparent"
                            strokeWidth="16"
                          />
                        </g>
                      );
                    })}
                    {model.atoms.map((a, atomIndex) => {
                      const count = model.bonds.filter(
                        (b) => b.a === a.id || b.b === a.id,
                      ).length;
                      const valence = model.bonds
                        .filter((b) => b.a === a.id || b.b === a.id)
                        .reduce((sum, b) => sum + b.order, 0);
                      const normalValence =
                        {
                          C: 4,
                          N: 3,
                          O: 2,
                          S: 2,
                          P: 3,
                          B: 3,
                          Si: 4,
                          F: 1,
                          Cl: 1,
                          Br: 1,
                          I: 1,
                        }[a.element] || 0;
                      const chargeShift =
                        a.element === "N" || a.element === "O"
                          ? a.charge || 0
                          : 0;
                      const h =
                        descriptors.graphSignature === graphSignature
                          ? descriptors.atomHydrogens[atomIndex]
                          : Math.max(0, normalValence + chargeShift - valence);
                      const suffix = h
                        ? `H${h > 1 ? String(h).replace(/[0-9]/g, (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)]) : ""}`
                        : "";
                      const text =
                        a.element === "C"
                          ? (labels && count <= 1) || a.isotope
                            ? `C${suffix}`
                            : ""
                          : a.element === "O" && h === 2 && !count
                            ? "H₂O"
                            : a.element + suffix;
                      return (
                        <g
                          key={a.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Atom ${a.id}: ${a.element}`}
                          onClick={(e) => atomClick(e, a)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              atomClick(e, a);
                          }}
                          onPointerDown={(e) => {
                            if (tool === "Select / Move") {
                              setUndo((u) => [...u, { model, name, sdfText }]);
                              setRedo([]);
                              drag.current = a.id;
                              e.currentTarget.setPointerCapture(e.pointerId);
                            }
                          }}
                        >
                          <circle
                            cx={a.x}
                            cy={a.y}
                            r={text ? 16 : 9}
                            fill={
                              highlightAtoms.includes(a.id)
                                ? "#b1f1c8"
                                : selected === a.id
                                  ? "#dbeafe"
                                  : text
                                    ? "white"
                                    : "transparent"
                            }
                          />
                          {text && (
                            <text
                              x={a.x}
                              y={a.y + 7}
                              textAnchor="middle"
                              fill={atomColors[a.element] || "#0b1220"}
                              fontSize="33"
                              fontWeight="600"
                              paintOrder="stroke"
                              stroke="white"
                              strokeWidth="5"
                              strokeLinejoin="round"
                            >
                              {a.isotope ? (
                                <tspan fontSize="15" baselineShift="super">
                                  {a.isotope}
                                </tspan>
                              ) : null}
                              {text}
                              {a.charge ? (
                                <tspan fontSize="13" dy="-11">
                                  {Math.abs(a.charge) > 1
                                    ? Math.abs(a.charge)
                                    : ""}
                                  {a.charge > 0 ? "+" : "−"}
                                </tspan>
                              ) : null}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                  {annotation && (
                    <text x="30" y="45" fill="#334155">
                      {annotation}
                    </text>
                  )}
                </svg>
                <div className="draw-zoom">
                  {iconButton(ZoomOut, "Zoom out", () =>
                    setZoom((z) => Math.max(0.4, z - 0.1)),
                  )}
                  <button onClick={() => setZoom(1)}>
                    {Math.round(zoom * 100)}%⌄
                  </button>
                  {iconButton(ZoomIn, "Zoom in", () =>
                    setZoom((z) => Math.min(3, z + 0.1)),
                  )}
                  {iconButton(Maximize, "Fit", () => setZoom(1))}
                  <button
                    className={panel !== "3D View" ? "active" : ""}
                    onClick={() => setPanel("2D View")}
                  >
                    2D
                  </button>
                  <button
                    className={panel === "3D View" ? "active" : ""}
                    onClick={() => setPanel("3D View")}
                  >
                    3D
                  </button>
                  {iconButton(Grid3X3, "Grid", () => setGrid((v) => !v))}
                  <label>
                    <input
                      type="checkbox"
                      checked={labels}
                      onChange={(e) => setLabels(e.target.checked)}
                    />
                    Show atom labels
                  </label>
                </div>
              </section>
              <section className="draw-common">
                <h3>Common Structures</h3>
                <div>
                  {templates.map(([n, v]) => (
                    <button
                      key={n}
                      className={name === n ? "selected" : ""}
                      onClick={() => load(v, n)}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: thumbnails[n] || "",
                        }}
                      />
                      {n}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <aside className="draw-inspector">
              <div className="draw-panel-tabs" role="tablist">
                {["2D View", "3D View", "Properties"].map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={panel === t}
                    onClick={() => setPanel(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {panel !== "Properties" && (
                <>
                  <div className="draw-preview">
                    <DrawMoleculePreview
                      ref={preview}
                      model={model}
                      name={name}
                      sdfText={sdfText}
                      representation={representation}
                      spin={spin}
                    />
                    <div className="draw-preview-actions">
                      {iconButton(Box, "Reset 3D", () =>
                        preview.current?.reset(),
                      )}
                      {iconButton(RotateCw, "Animate", () =>
                        setSpin((v) => !v),
                      )}
                      {iconButton(Maximize, "Fullscreen 3D", () =>
                        preview.current?.fullscreen(),
                      )}
                    </div>
                  </div>
                  <div className="draw-representations">
                    {["Ball & Stick", "Space Fill", "Sticks", "Wireframe"].map(
                      (r) => (
                        <button
                          key={r}
                          aria-pressed={representation === r}
                          onClick={() => setRepresentation(r)}
                        >
                          {r}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}
              <section className="draw-info">
                <h3>
                  Molecule Information <Pencil size={15} />
                </h3>
                <table>
                  <tbody>
                    {[
                      ["Name", name],
                      ["Formula", formula()],
                      [
                        "Molecular Weight",
                        descriptors.amw
                          ? `${descriptors.amw.toFixed(2)} g/mol`
                          : "—",
                      ],
                      [
                        "IUPAC Name",
                        name === "Caffeine"
                          ? "1,3,7-trimethylpurine-2,6-dione"
                          : "—",
                      ],
                      ["SMILES", smiles || "—"],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td title={v}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h3>Computed Properties (Estimated)</h3>
                <table>
                  <tbody>
                    {[
                      ["LogP", descriptors.CrippenClogP?.toFixed(2)],
                      ["H-bond Donors", descriptors.NumHBD],
                      ["H-bond Acceptors", descriptors.NumHBA],
                      ["Rotatable Bonds", descriptors.NumRotatableBonds],
                      [
                        "TPSA",
                        descriptors.tpsa === undefined
                          ? null
                          : `${descriptors.tpsa.toFixed(2)} Å²`,
                      ],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </aside>
          </div>
          <div className="draw-status" role="status">
            {busy ? "Validating structure…" : notice}
          </div>
        </main>
      </div>
      {dialog && (
        <div className="draw-modal-backdrop">
          <section
            className={
              dialog === "Structure library"
                ? "draw-modal draw-library-modal"
                : "draw-modal"
            }
            role="dialog"
            aria-label={dialog}
          >
            <h2>
              {dialog}
              <button aria-label="Close dialog" onClick={() => setDialog("")}>
                ×
              </button>
            </h2>
            {dialog === "Export drawing" ? (
              <>
                <p>
                  Export the active molecule, image, or all document tabs.
                  Workspaces include structures, conformers and canvas settings.
                </p>
                <div className="draw-export-options">
                  <button onClick={download}>MOL · active structure</button>
                  <button
                    onClick={() =>
                      downloadText(
                        smiles,
                        `${name}.smi`,
                        "chemical/x-daylight-smiles",
                      )
                    }
                  >
                    Canonical SMILES
                  </button>
                  <button
                    onClick={() =>
                      downloadText(svgMarkup(), `${name}.svg`, "image/svg+xml")
                    }
                  >
                    SVG · editable vector
                  </button>
                  <button onClick={exportPng}>PNG · 2D diagram</button>
                  <button
                    onClick={async () => {
                      try {
                        let block = sdfText;
                        if (!block && conformers[name]) {
                          const response = await fetch(conformers[name]);
                          if (!response.ok)
                            throw Error("Conformer unavailable.");
                          block = await response.text();
                        }
                        downloadText(
                          block || structureMolfile(model) + "\n$$$$\n",
                          `${name}.sdf`,
                          "chemical/x-mdl-sdfile",
                        );
                      } catch (e) {
                        setNotice(e.message);
                      }
                    }}
                  >
                    SDF · available coordinates
                  </button>
                  <button
                    onClick={() =>
                      downloadText(
                        JSON.stringify(workspaceData(), null, 2),
                        "chemistry-workspace.json",
                        "application/json",
                      )
                    }
                  >
                    Workspace JSON · all tabs
                  </button>
                  <button
                    onClick={() => {
                      setDialog("");
                      importFile.current?.click();
                    }}
                  >
                    Import file / workspace
                  </button>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={transparentExport}
                    onChange={(e) => setTransparentExport(e.target.checked)}
                  />
                  Transparent PNG background
                </label>
                <label>
                  PNG width{" "}
                  <select
                    value={exportSize}
                    onChange={(e) => setExportSize(Number(e.target.value))}
                  >
                    {[800, 1600, 2400, 3200].map((n) => (
                      <option key={n} value={n}>
                        {n} px
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : dialog === "Bond & atom tools" ? (
              <>
                <h3>Bond stereochemistry</h3>
                <div className="draw-bond-options">
                  {[
                    "Single bond",
                    "Double bond",
                    "Triple bond",
                    "Wedge bond",
                    "Dashed bond",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTool(t);
                        setSelected(null);
                        setDialog("");
                        setNotice(
                          `${t}: connect atoms or click an existing bond.`,
                        );
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <h3>Ring size</h3>
                <div className="draw-bond-options">
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <button
                      key={n}
                      aria-pressed={ringSize === n}
                      onClick={() => {
                        setRingSize(n);
                        setTool("Six-membered ring");
                        setDialog("");
                        setNotice(
                          `Click the canvas to add a ${n}-membered ring.`,
                        );
                      }}
                    >
                      {n}-membered
                    </button>
                  ))}
                </div>
                <h3>Selected atom</h3>
                {selected ? (
                  <div className="draw-charge-editor">
                    <strong>
                      Atom {selected} ·{" "}
                      {model.atoms.find((a) => a.id === selected)?.element}
                    </strong>
                    <button onClick={() => changeCharge(-1)}>Charge −</button>
                    <button onClick={() => changeCharge(1)}>Charge +</button>
                    <span>
                      Charge:{" "}
                      {model.atoms.find((a) => a.id === selected)?.charge || 0}
                    </span>
                  </div>
                ) : (
                  <p>
                    Select an atom with Select / Move to edit its formal charge.
                  </p>
                )}
                <p>
                  Keyboard: V move · A atom · E erase · R ring · 1/2/3 bonds ·
                  Ctrl/⌘ Z undo · Ctrl/⌘ Shift Z redo · Ctrl/⌘ S save · Delete
                  selected atom.
                </p>
              </>
            ) : dialog === "Structure library" ? (
              <StructureLibrary
                currentName={name}
                currentMolfile={structureMolfile(model)}
                onDatabase={(query) => {
                  setDatabaseSearch({ query });
                  setFeature("Database");
                  setDialog("");
                }}
                onLoad={async (entry, threeD) => {
                  let block = "";
                  if (threeD) {
                    const response = await fetch(
                      entry.sdf ||
                        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${entry.cid}/SDF?record_type=3d`,
                      { signal: AbortSignal.timeout(25000) },
                    );
                    if (!response.ok)
                      throw Error(
                        "No calculated 3D conformer is available for this compound. Open its 2D structure instead.",
                      );
                    block = await response.text();
                    parseSdf3D(block);
                    const rd = await getRDKit();
                    if (
                      canonicalSmiles(rd, block) !==
                      canonicalSmiles(rd, entry.smiles)
                    )
                      throw Error(
                        "The 3D conformer has a different chemical identity and was not loaded.",
                      );
                  }
                  const success = await load(entry.smiles, entry.name);
                  if (success === false) return false;
                  if (block) setSdfText(block);
                  setFeature("Draw");
                  setPanel(threeD ? "3D View" : "2D View");
                  setDialog("");
                  return true;
                }}
              />
            ) : dialog === "Canvas settings" ? (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={grid}
                    onChange={(e) => setGrid(e.target.checked)}
                  />
                  Show grid
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={labels}
                    onChange={(e) => setLabels(e.target.checked)}
                  />
                  Show atom labels
                </label>
              </>
            ) : dialog === "Drawing help" ? (
              <p>
                Choose a bond tool, click an atom, then empty space to extend a
                chain. Select / Move drags atoms. Erase removes atoms or bonds.
                Drag the 3D model to rotate; scroll to zoom. Formal charges are
                supported. Use Bond & atom tools for wedge/dashed bonds and ring
                sizes. Research tabs provide local analysis, comparison, batch
                screening, isotope patterns, notebooks and 3D measurements.
              </p>
            ) : dialog === "Measure" ? (
              <p>
                {model.atoms.length} atoms · {model.bonds.length} bonds. Canvas
                distances describe a 2D diagram and cannot determine physical
                bond lengths.
              </p>
            ) : dialog === "Local workspace" ? (
              <p>
                Your drawings are stored on this device. Use Save to store a
                drawing and Export to download a MOL file.
              </p>
            ) : dialog === "Load drawing" ? (
              <>
                <button
                  className="primary"
                  onClick={() => {
                    try {
                      const saved = JSON.parse(
                        localStorage.getItem("chemistry-drawing"),
                      );
                      if (!saved) throw Error("No saved drawing.");
                      const next = saved.model || saved;
                      parseMolfile(structureMolfile(next));
                      commit(next);
                      setName(saved.name || "Saved drawing");
                      setDialog("");
                      setNotice("Saved drawing restored.");
                    } catch (e) {
                      setNotice(e.message);
                    }
                  }}
                >
                  Restore saved drawing
                </button>
                <button
                  onClick={() => {
                    setDialog("");
                    importFile.current?.click();
                  }}
                >
                  Open file / workspace
                </button>
                <button onClick={() => openDialog("Load SMILES / MOL")}>
                  Import SMILES / MOL
                </button>
              </>
            ) : dialog === "Reactions" || dialog === "Spectra" ? (
              <p>
                {dialog === "Reactions"
                  ? "Reaction prediction requires a reaction model and is not available in this drawing editor."
                  : "Spectral prediction is not available in this drawing editor."}{" "}
                Export the molecule to use it in the appropriate chemistry
                studio.
              </p>
            ) : (
              <>
                <p>
                  {dialog === "Draw by name"
                    ? "Enter a library molecule name or valid SMILES. This uses local name lookup; an AI service is not connected."
                    : dialog === "Formal charge"
                      ? "Enter charged SMILES, for example [NH4+]."
                      : dialog === "Annotation"
                        ? "Enter an annotation to place on the canvas."
                        : "Enter SMILES or a V2000 MOL structure."}
                </p>
                <textarea
                  aria-label="Structure input"
                  readOnly={dialog === "Copy MOL"}
                  value={
                    dialog === "Copy MOL" ? structureMolfile(model) : input
                  }
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
                {dialog !== "Copy MOL" && (
                  <button
                    className="primary"
                    onClick={() => {
                      if (dialog === "Annotation") {
                        setAnnotation(input);
                        setDialog("");
                        return;
                      }
                      const found = templates.find(
                        (t) =>
                          t[0].toLowerCase() === input.trim().toLowerCase(),
                      );
                      load(
                        found?.[1] || input,
                        found?.[0] || "Imported structure",
                      );
                      setDialog("");
                    }}
                  >
                    {dialog === "Annotation"
                      ? "Add annotation"
                      : "Load structure"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
