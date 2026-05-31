import { useCallback, useEffect, useMemo, useState } from 'react';
import { BuilderCanvas } from '../components/BuilderCanvas.jsx';
import { ComponentPalette } from '../components/ComponentPalette.jsx';
import { LabReportPanel } from '../components/LabReportPanel.jsx';
import { LogicBlocksPanel } from '../components/LogicBlocksPanel.jsx';
import { PropertiesInspector } from '../components/PropertiesInspector.jsx';
import { SimulationPanel } from '../components/SimulationPanel.jsx';
import { StudioDashboard } from '../components/StudioDashboard.jsx';
import { TemplateGallery } from '../components/TemplateGallery.jsx';
import { TopStudioToolbar } from '../components/TopStudioToolbar.jsx';
import { experimentTemplates } from '../data/experimentTemplates.js';
import { paletteGroups, starterComponents, studioModes } from '../data/studioModes.js';
import { createLogicBlock, createRecommendedBlocksForTemplate } from '../data/logicBlockLibrary.js';
import { createInitialExperimentState, runLogicSequence } from '../engines/experimentBlockEngine.js';
import { getExpectedIndicatorIds, validateGuidedExperiment } from '../engines/guidedValidationEngine.js';
import { simulateAction } from '../engines/chemistryRuleEngine.js';
import { createSimulationReport } from '../engines/simulationEngine.js';
import { useInventorProjects } from '../hooks/useInventorProjects.js';
import { useInventorReports } from '../hooks/useInventorReports.js';
import {
  clampCanvasObject,
  createCanvasObject,
  createProjectSnapshot,
  duplicateCanvasObject,
  snapValue,
} from '../utils/projectUtils.js';
import { calculateBadges, createLabReport, formatLabReport, openPrintReport } from '../utils/reportUtils.js';
import '../styles/chemistryInventor.css';

const CANVAS_WIDTH = 1120;
const CANVAS_HEIGHT = 720;
const modeLabelMap = Object.fromEntries(studioModes.map(mode => [mode.id, mode.title]));
const paletteItemsById = Object.fromEntries(paletteGroups.flatMap(group => group.items.map(item => [item.id, { ...item, paletteCategory: group.id }])));

const createLogEntry = text => ({
  id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  text,
});

const createTimelineLog = entry => ({
  id: entry.id,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  text: `Step ${entry.stepNumber}: ${entry.action}${entry.warning ? ` Warning: ${entry.warning}` : ''}`,
});

export default function ChemistryInventorStudioPage() {
  const { projects, draft, saveProject, loadProject, persistDraft } = useInventorProjects();
  const { reports, saveReport, loadReport } = useInventorReports();
  const [projectId, setProjectId] = useState(draft?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectName, setProjectName] = useState(draft?.name || 'Untitled Chemistry Build');
  const [activeMode, setActiveMode] = useState(draft?.modeId || 'guided');
  const [grade, setGrade] = useState(draft?.grade || 'Class 8');
  const [components, setComponents] = useState(draft?.components || starterComponents);
  const [procedureBlocks, setProcedureBlocks] = useState(draft?.procedureBlocks || [createLogicBlock('start')]);
  const [procedureStep, setProcedureStep] = useState(0);
  const [procedurePaused, setProcedurePaused] = useState(false);
  const [experimentState, setExperimentState] = useState(createInitialExperimentState);
  const [procedureTimeline, setProcedureTimeline] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [vivaAnswers, setVivaAnswers] = useState({});
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [zoom, setZoom] = useState(draft?.zoom || 1);
  const [snapToGrid, setSnapToGrid] = useState(draft?.snapToGrid ?? true);
  const [lastAction, setLastAction] = useState('Workspace ready. Drag a component into the canvas.');
  const [outputLog, setOutputLog] = useState([createLogEntry('Builder opened.')]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);

  const activeComponent = components.find(component => component.id === activeComponentId) || null;
  const report = useMemo(() => createSimulationReport({
    mode: modeLabelMap[activeMode] || 'Free Build',
    grade,
    components,
    lastAction,
  }), [activeMode, grade, components, lastAction]);
  const guidedValidation = useMemo(() => validateGuidedExperiment({
    template: selectedTemplate,
    canvasObjects: components,
    procedureBlocks,
    procedureTimeline,
    vivaAnswers,
  }), [components, procedureBlocks, procedureTimeline, selectedTemplate, vivaAnswers]);
  const badges = useMemo(() => calculateBadges({
    validation: guidedValidation,
    simulationResult,
    procedureTimeline,
    report: currentReport,
  }), [currentReport, guidedValidation, procedureTimeline, simulationResult]);

  const log = useCallback(text => {
    setLastAction(text);
    setOutputLog(previous => [createLogEntry(text), ...previous].slice(0, 12));
  }, []);

  const selectObject = useCallback(id => {
    setActiveComponentId(id);
    setComponents(previous => previous.map(component => ({ ...component, selected: component.id === id })));
  }, []);

  const addCanvasObject = useCallback((item, paletteCategory, position = null) => {
    const index = components.length;
    const fallbackPosition = {
      x: 80 + ((index * 34) % 420),
      y: 90 + ((index * 28) % 260),
    };
    const rawPosition = position || fallbackPosition;
    const object = createCanvasObject(item, {
      x: snapValue(rawPosition.x, snapToGrid),
      y: snapValue(rawPosition.y, snapToGrid),
    }, { paletteCategory: paletteCategory || item.paletteCategory });
    const clamped = clampCanvasObject(object, CANVAS_WIDTH, CANVAS_HEIGHT);
    setComponents(previous => [...previous.map(component => ({ ...component, selected: false })), clamped]);
    setActiveComponentId(clamped.id);
    log(`Added ${clamped.displayName} to canvas.`);
  }, [components.length, log, snapToGrid]);

  const createBlockWithDefaults = useCallback(type => {
    const firstApparatus = components.find(component => component.componentType === 'apparatus');
    const firstChemical = components.find(component => component.componentType === 'chemical');
    const firstIndicator = components.find(component => component.componentType === 'indicator');
    return createLogicBlock(type, {
      targetId: firstApparatus?.id || '',
      apparatusId: firstApparatus?.id || '',
      chemicalId: firstChemical?.id || '',
      indicatorId: firstIndicator?.id || '',
    });
  }, [components]);

  const addProcedureBlock = useCallback(type => {
    const block = createBlockWithDefaults(type);
    setProcedureBlocks(previous => [...previous, block]);
    log(`Added logic block: ${block.label}.`);
  }, [createBlockWithDefaults, log]);

  const updateProcedureBlock = useCallback((id, patch) => {
    setProcedureBlocks(previous => previous.map(block => block.id === id ? { ...block, ...patch } : block));
  }, []);

  const deleteProcedureBlock = useCallback(id => {
    setProcedureBlocks(previous => previous.filter(block => block.id !== id));
    log('Deleted logic block.');
  }, [log]);

  const reorderProcedureBlocks = useCallback((fromIndex, toIndex) => {
    setProcedureBlocks(previous => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= previous.length || toIndex >= previous.length) return previous;
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const moveObject = useCallback((id, position) => {
    setComponents(previous => previous.map(component => {
      if (component.id !== id) return component;
      return clampCanvasObject({
        ...component,
        x: snapValue(position.x, snapToGrid),
        y: snapValue(position.y, snapToGrid),
      }, CANVAS_WIDTH, CANVAS_HEIGHT);
    }));
  }, [snapToGrid]);

  const updateObject = useCallback((id, patch) => {
    setComponents(previous => previous.map(component => component.id === id ? { ...component, ...patch } : component));
  }, []);

  const deleteObject = useCallback(id => {
    setComponents(previous => previous.filter(component => component.id !== id));
    setActiveComponentId(current => current === id ? null : current);
    log('Deleted selected object.');
  }, [log]);

  const duplicateObject = useCallback(id => {
    const source = components.find(component => component.id === id);
    if (!source) return;
    const copy = clampCanvasObject(duplicateCanvasObject(source), CANVAS_WIDTH, CANVAS_HEIGHT);
    setComponents(previous => [...previous.map(component => ({ ...component, selected: false })), copy]);
    setActiveComponentId(copy.id);
    log('Duplicated selected object.');
  }, [components, log]);

  const resetCanvas = useCallback(() => {
    setComponents([]);
    setActiveComponentId(null);
    log('Canvas reset.');
  }, [log]);

  const newProject = useCallback(() => {
    setProjectId('');
    setSelectedProjectId('');
    setProjectName('Untitled Chemistry Build');
    setActiveMode('guided');
    setGrade('Class 8');
    setComponents([]);
    setProcedureBlocks([createLogicBlock('start')]);
    setProcedureStep(0);
    setProcedureTimeline([]);
    setExperimentState(createInitialExperimentState());
    setSelectedTemplate(null);
    setVivaAnswers({});
    setActiveComponentId(null);
    setZoom(1);
    setSnapToGrid(true);
    log('New workspace created.');
  }, [log]);

  const saveCurrentProject = useCallback(() => {
    const saved = saveProject(createProjectSnapshot({
      projectId,
      projectName,
      mode: modeLabelMap[activeMode] || 'Free Build',
      modeId: activeMode,
      grade,
      components,
      procedureBlocks,
      selectedTemplateId: selectedTemplate?.id || '',
      vivaAnswers,
      zoom,
      snapToGrid,
    }));
    setProjectId(saved.id);
    setSelectedProjectId(saved.id);
    log(`Saved ${saved.name}.`);
  }, [activeMode, components, grade, log, procedureBlocks, projectId, projectName, saveProject, selectedTemplate, snapToGrid, vivaAnswers, zoom]);

  const loadSavedProject = useCallback(id => {
    setSelectedProjectId(id);
    if (!id) return;
    const project = loadProject(id);
    if (!project) return;
    setProjectId(project.id);
    setProjectName(project.name);
    setActiveMode(project.modeId || 'guided');
    setGrade(project.grade || 'Class 8');
    setComponents((project.components || []).map(component => ({ ...component, selected: false })));
    setProcedureBlocks(project.procedureBlocks || [createLogicBlock('start')]);
    setProcedureStep(0);
    setProcedureTimeline([]);
    setExperimentState(createInitialExperimentState());
    setSelectedTemplate(experimentTemplates.find(template => template.id === project.selectedTemplateId) || null);
    setVivaAnswers(project.vivaAnswers || {});
    setActiveComponentId(null);
    setZoom(project.zoom || 1);
    setSnapToGrid(project.snapToGrid ?? true);
    log(`Loaded ${project.name}.`);
  }, [loadProject, log]);

  const loadTemplate = useCallback((template, options = {}) => {
    const templateItems = [...new Set([...template.requiredApparatus, ...template.requiredChemicals, ...getExpectedIndicatorIds(template)])]
      .map(id => paletteItemsById[id])
      .filter(Boolean);
    const nextComponents = templateItems.map((item, index) => createCanvasObject(item, {
      x: 80 + ((index % 5) * 150),
      y: 90 + (Math.floor(index / 5) * 100),
    }, { paletteCategory: item.paletteCategory }));
    const recommendedBlocks = createRecommendedBlocksForTemplate(template, nextComponents);
    setProjectId('');
    setProjectName(template.title);
    setActiveMode(options.mode || 'guided');
    setGrade(`Class ${template.grade}`);
    setComponents(nextComponents);
    setProcedureBlocks(recommendedBlocks);
    setProcedureStep(0);
    setProcedureTimeline([]);
    setExperimentState(createInitialExperimentState());
    setSelectedTemplate(template);
    setVivaAnswers({});
    setActiveComponentId(nextComponents[0]?.id || null);
    log(`${options.teacherDemo ? 'Loaded teacher demo' : 'Loaded guided template'}: ${template.title}.`);
  }, [log]);

  const selectTemplate = useCallback(template => {
    setSelectedTemplate(template);
    setProjectName(template.title);
    setGrade(`Class ${template.grade}`);
    setVivaAnswers({});
    log(`Selected guided experiment: ${template.title}.`);
  }, [log]);

  const runSimulation = useCallback(() => {
    const result = simulateAction(components, 'run-simulation');
    setSimulationResult(result);
    log(result.supported ? `Simulation detected: ${result.title}.` : result.learningTakeaway);
  }, [components, log]);

  const runStep = useCallback(() => {
    if (procedurePaused) {
      log('Procedure is paused. Press Pause again to resume.');
      return;
    }
    if (procedureStep >= procedureBlocks.length) {
      log('Procedure complete. Reset steps to run again.');
      return;
    }
    const run = runLogicSequence({ blocks: procedureBlocks, canvasObjects: components, initialState: experimentState, startIndex: procedureStep, maxSteps: 1 });
    setExperimentState(run.state);
    setProcedureStep(run.nextIndex);
    setProcedureTimeline(previous => [...previous, ...run.entries]);
    const latest = run.entries[run.entries.length - 1];
    if (latest?.result) setSimulationResult(latest.result);
    setOutputLog(previous => [...run.entries.map(createTimelineLog), ...previous].slice(0, 16));
    if (latest) log(`${latest.valid ? 'Ran' : 'Blocked'} step ${latest.stepNumber}: ${latest.action}${latest.warning ? ` ${latest.warning}` : ''}`);
  }, [components, experimentState, log, procedureBlocks, procedurePaused, procedureStep]);

  const runAllBlocks = useCallback(() => {
    if (procedurePaused) {
      log('Procedure is paused. Press Pause again to resume.');
      return;
    }
    const run = runLogicSequence({ blocks: procedureBlocks, canvasObjects: components, initialState: experimentState, startIndex: procedureStep });
    setExperimentState(run.state);
    setProcedureStep(run.nextIndex);
    setProcedureTimeline(previous => [...previous, ...run.entries]);
    const latestWithResult = [...run.entries].reverse().find(entry => entry.result);
    if (latestWithResult?.result) setSimulationResult(latestWithResult.result);
    setOutputLog(previous => [...run.entries.map(createTimelineLog), ...previous].slice(0, 16));
    log(run.entries.length ? `Ran ${run.entries.length} logic block${run.entries.length === 1 ? '' : 's'}.` : 'No logic blocks to run.');
  }, [components, experimentState, log, procedureBlocks, procedurePaused, procedureStep]);

  const resetProcedureSteps = useCallback(() => {
    setProcedureStep(0);
    setProcedureTimeline([]);
    setExperimentState(createInitialExperimentState());
    log('Logic block steps reset.');
  }, [log]);

  const explainCurrentStep = useCallback(() => {
    const block = procedureBlocks[procedureStep] || procedureBlocks[procedureBlocks.length - 1];
    if (!block) {
      log('Add a logic block to get a step explanation.');
      return;
    }
    log(`Current block explanation: ${block.label} uses canvas objects to update the experiment state and then asks the rule engine for observations.`);
  }, [log, procedureBlocks, procedureStep]);

  const generateReport = useCallback(() => {
    const report = createLabReport({
      projectName,
      grade,
      selectedTemplate,
      components,
      procedureBlocks,
      procedureTimeline,
      simulationResult,
      validation: guidedValidation,
      vivaAnswers,
    });
    setCurrentReport(report);
    log(`Generated lab report: ${report.title}.`);
  }, [components, grade, guidedValidation, log, procedureBlocks, procedureTimeline, projectName, selectedTemplate, simulationResult, vivaAnswers]);

  const copyReport = useCallback(async () => {
    if (!currentReport) return;
    const text = formatLabReport(currentReport);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text).catch(() => null);
      log('Copied report text to clipboard.');
    } else {
      log('Clipboard is unavailable in this browser. Select the report text manually.');
    }
  }, [currentReport, log]);

  const saveCurrentReport = useCallback(() => {
    if (!currentReport) return;
    const saved = saveReport(currentReport);
    setCurrentReport(saved);
    log(`Saved report: ${saved.title}.`);
  }, [currentReport, log, saveReport]);

  const loadSavedReport = useCallback(id => {
    const report = loadReport(id);
    if (!report) return;
    setCurrentReport(report);
    log(`Loaded report: ${report.title}.`);
  }, [loadReport, log]);

  const printReport = useCallback(() => {
    if (!currentReport) return;
    const opened = openPrintReport(currentReport);
    log(opened ? 'Opened print-friendly report view.' : 'Pop-up blocked. Allow pop-ups to print the report.');
  }, [currentReport, log]);

  const showHelp = useCallback(() => {
    log('Help: drag from palette, click to select, drag objects to move, edit properties on the right, press Delete to remove.');
  }, [log]);

  useEffect(() => {
    const handleKeyDown = event => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && activeComponentId) {
        event.preventDefault();
        deleteObject(activeComponentId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeComponentId, deleteObject]);

  useEffect(() => {
    persistDraft(createProjectSnapshot({
      projectId: projectId || 'draft-current-workspace',
      projectName,
      mode: modeLabelMap[activeMode] || 'Free Build',
      modeId: activeMode,
      grade,
      components,
      procedureBlocks,
      selectedTemplateId: selectedTemplate?.id || '',
      vivaAnswers,
      zoom,
      snapToGrid,
    }));
  }, [activeMode, components, grade, persistDraft, procedureBlocks, projectId, projectName, selectedTemplate, snapToGrid, vivaAnswers, zoom]);

  return (
    <div className="chemistry-inventor-studio p-3 md:p-4">
      <div className="mx-auto max-w-[1640px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
        <TopStudioToolbar
          grade={grade}
          activeMode={activeMode}
          projectName={projectName}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onGradeChange={setGrade}
          onModeChange={setActiveMode}
          onProjectNameChange={setProjectName}
          onNew={newProject}
          onSave={saveCurrentProject}
          onLoad={loadSavedProject}
          onReset={resetCanvas}
          onRunSimulation={runSimulation}
          onRunStep={runStep}
          onGenerateReport={generateReport}
          onHelp={showHelp}
        />
        <StudioDashboard
          grade={grade}
          projects={projects}
          reports={reports}
          badges={badges}
          onLoadProject={loadSavedProject}
          onLoadReport={loadSavedReport}
          onSelectTemplate={selectTemplate}
        />
        <TemplateGallery
          grade={grade}
          activeMode={activeMode}
          selectedTemplate={selectedTemplate}
          validation={guidedValidation}
          vivaAnswers={vivaAnswers}
          onLoadTemplate={template => loadTemplate(template, { mode: 'guided' })}
          onSelectTemplate={selectTemplate}
          onTeacherDemo={template => loadTemplate(template, { mode: 'teacher-demo', teacherDemo: true })}
          onToggleViva={index => setVivaAnswers(previous => ({ ...previous, [index]: !previous[index] }))}
        />
        <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)_320px]">
          <ComponentPalette grade={grade} onAddComponent={addCanvasObject} />
          <BuilderCanvas
            components={components}
            activeId={activeComponentId}
            zoom={zoom}
            snapToGrid={snapToGrid}
            onDropComponent={(item, position) => addCanvasObject(item, item.paletteCategory, position)}
            onMoveComponent={moveObject}
            onSelect={selectObject}
            onDuplicate={duplicateObject}
            onDelete={deleteObject}
            onZoomChange={value => setZoom(Number(value.toFixed(2)))}
            onSnapToggle={() => setSnapToGrid(value => !value)}
          />
          <PropertiesInspector
            activeComponent={activeComponent}
            grade={grade}
            projectCount={projects.length}
            onUpdate={updateObject}
            onDuplicate={duplicateObject}
            onDelete={deleteObject}
          />
        </div>
        <LogicBlocksPanel
          blocks={procedureBlocks}
          canvasObjects={components}
          currentStep={procedureStep}
          paused={procedurePaused}
          onAddBlock={addProcedureBlock}
          onUpdateBlock={updateProcedureBlock}
          onDeleteBlock={deleteProcedureBlock}
          onReorderBlocks={reorderProcedureBlocks}
          onRunAll={runAllBlocks}
          onRunStep={runStep}
          onPause={() => setProcedurePaused(value => !value)}
          onResetSteps={resetProcedureSteps}
          onExplainStep={explainCurrentStep}
        />
        <SimulationPanel
          report={report}
          projects={projects}
          outputLog={outputLog}
          simulationResult={simulationResult}
          procedureTimeline={procedureTimeline}
          selectedTemplate={selectedTemplate}
          grade={grade}
        />
        <LabReportPanel
          currentReport={currentReport}
          reports={reports}
          onGenerate={generateReport}
          onCopy={copyReport}
          onSave={saveCurrentReport}
          onLoad={loadSavedReport}
          onPrint={printReport}
        />
      </div>
    </div>
  );
}
