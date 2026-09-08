import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Box,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Layers3,
  ListChecks,
  Printer,
  Route,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  commandCenterStats,
  implementationPhases,
  learnerProfiles,
  learningPathTemplates,
  printableArtifacts,
  readinessChecklist,
  teacherAssignmentTemplates,
} from "../data/learningCommandCenter.js";

const statusStyle = {
  Active: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Next: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  Later: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  "Pilot-ready": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Planned: "border-slate-300/20 bg-slate-300/10 text-slate-200",
  "Ready for build": "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  "In progress": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Needed: "border-amber-300/25 bg-amber-300/10 text-amber-100",
};

const PlannerPreview = ({ path, activeIndex, onSelect }) => (
  <svg
    viewBox="0 0 400 220"
    className="h-64 w-full rounded-2xl border border-white/10 bg-black/20"
  >
    <line x1="54" y1="110" x2="342" y2="110" stroke="#475569" strokeWidth="5" />
    {path.milestones.map((milestone, index) => {
      const x = 58 + index * 70;
      return (
        <g
          key={milestone}
          onClick={() => onSelect?.(index)}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onSelect?.(index);
          }}
        >
          <circle
            cx={x}
            cy="110"
            r={activeIndex === index ? 23 : 18}
            fill={index < 2 ? "#22c55e" : index === 2 ? "#38bdf8" : "#334155"}
            stroke={activeIndex === index ? "#f8fafc" : "#e2e8f0"}
            strokeWidth={activeIndex === index ? 4 : 2}
          />
          <text
            x={x}
            y="115"
            textAnchor="middle"
            fill={index < 3 ? "#020617" : "#cbd5e1"}
            fontSize="12"
            fontWeight="900"
          >
            {index + 1}
          </text>
          <text
            x={x - 28}
            y={index % 2 ? 158 : 64}
            fill="#cbd5e1"
            fontSize="10"
          >
            {milestone.split(" ").slice(0, 2).join(" ")}
          </text>
        </g>
      );
    })}
    <text x="58" y="200" fill="#94a3b8" fontSize="12">
      Milestone path with completion and evidence checkpoints
    </text>
  </svg>
);

export const LearningCommandCenterPage = ({ onNavigate }) => {
  const [activeProfileId, setActiveProfileId] = useState("teacher");
  const [activePathId, setActivePathId] = useState("grade10-board");
  const [activePhaseId, setActivePhaseId] = useState(
    implementationPhases[0]?.id,
  );
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [notice, setNotice] = useState("");
  const activeProfile =
    learnerProfiles.find((profile) => profile.id === activeProfileId) ||
    learnerProfiles[0];
  const visiblePaths = useMemo(
    () =>
      activeProfile.id === "teacher"
        ? learningPathTemplates
        : learningPathTemplates.filter(
            (path) =>
              path.route === activeProfile.route ||
              path.audience
                .toLowerCase()
                .includes(activeProfile.label.split(" ")[0].toLowerCase()),
          ),
    [activeProfile],
  );
  const activePath =
    visiblePaths.find((path) => path.id === activePathId) ||
    visiblePaths[0] ||
    learningPathTemplates[0];
  const announce = (message) => setNotice(message);

  const selectProfile = (profile) => {
    const nextPaths =
      profile.id === "teacher"
        ? learningPathTemplates
        : learningPathTemplates.filter(
            (path) =>
              path.route === profile.route ||
              path.audience
                .toLowerCase()
                .includes(profile.label.split(" ")[0].toLowerCase()),
          );
    setActiveProfileId(profile.id);
    setActivePathId(nextPaths[0]?.id || activePathId);
    setActiveMilestone(0);
  };

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-7xl space-y-4 overflow-hidden p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/45 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Learning Command Center</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              Personal paths, teacher assignments, printable artifacts,
              classroom rubrics, progress checkpoints and classroom-ready
              tracking.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-white">
                {commandCenterStats.profiles}
              </p>
              <p className="text-[10px] text-gray-500">profiles</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-violet-100">
                {commandCenterStats.phases}
              </p>
              <p className="text-[10px] text-gray-500">tracks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-cyan-100">
                {commandCenterStats.paths}
              </p>
              <p className="text-[10px] text-gray-500">paths</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-emerald-100">
                {commandCenterStats.assignments}
              </p>
              <p className="text-[10px] text-gray-500">assignments</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-amber-100">
                {commandCenterStats.artifacts}
              </p>
              <p className="text-[10px] text-gray-500">prints</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-pink-100">
                {commandCenterStats.readiness}
              </p>
              <p className="text-[10px] text-gray-500">checks</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={16} className="text-cyan-300" />
          <h3 className="text-sm font-bold text-white">Learning Launch Plan</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {implementationPhases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => {
                setActivePhaseId(phase.id);
                announce(`${phase.title} selected`);
                onNavigate?.(phase.route);
              }}
              className={`rounded-xl border p-3 text-left hover:bg-white/[0.065] ${activePhaseId === phase.id ? "border-cyan-300/45 bg-cyan-300/10" : "border-white/10 bg-white/[0.035]"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusStyle[phase.status] || statusStyle.Planned}`}
                >
                  {phase.status}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {phase.window}
                </span>
              </div>
              <p className="mt-3 text-sm font-black text-white">
                {phase.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">{phase.goal}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {phase.deliverables.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] font-bold text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-3 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold text-emerald-100">
                {phase.launchGate}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[285px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Profile</h3>
          </div>
          <div className="space-y-2">
            {learnerProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => selectProfile(profile)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  activeProfile.id === profile.id
                    ? "border-cyan-300/40 bg-cyan-300/12"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: profile.color }}
                  />
                  <span className="text-sm font-black text-white">
                    {profile.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{profile.focus}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  {activeProfile.label}
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  Learning path planner
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {visiblePaths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => {
                      setActivePathId(path.id);
                      setActiveMilestone(0);
                      announce(`${path.title} learning path selected`);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                      activePath.id === path.id
                        ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50"
                        : "border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {path.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">
                      {pathDurationLabel(activePath.duration)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300">
                      {activePath.audience}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">
                    {activePath.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Every path connects a milestone to evidence, visual
                    practice, and printable classroom artifacts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    announce(`Opening ${activePath.title}`);
                    onNavigate?.(activePath.route);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15"
                >
                  <Route size={14} /> Open Path
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Target size={14} className="text-cyan-200" />
                    <p className="text-xs font-black text-white">Milestones</p>
                  </div>
                  <div className="space-y-1.5">
                    {activePath.milestones.map((item, index) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setActiveMilestone(index);
                          announce(`${item} milestone selected`);
                        }}
                        className={`flex w-full gap-2 rounded px-1 py-1 text-left text-xs ${activeMilestone === index ? "bg-cyan-300/10 text-cyan-50" : "text-gray-300"}`}
                      >
                        <span className="font-black text-cyan-200">
                          {index + 1}
                        </span>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <BadgeCheck size={14} className="text-emerald-200" />
                    <p className="text-xs font-black text-white">Evidence</p>
                  </div>
                  <div className="space-y-1.5">
                    {activePath.evidence.map((item) => (
                      <p
                        key={item}
                        className="flex gap-2 text-xs text-gray-300"
                      >
                        <CheckCircle2
                          size={13}
                          className="mt-0.5 shrink-0 text-emerald-300"
                        />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Path Preview</h3>
              </div>
              <PlannerPreview
                path={activePath}
                activeIndex={activeMilestone}
                onSelect={(index) => {
                  setActiveMilestone(index);
                  announce(
                    `${activePath.milestones[index]} milestone selected`,
                  );
                }}
              />
              <p className="mt-2 rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
                Selected checkpoint:{" "}
                <b>{activePath.milestones[activeMilestone] || "Start"}</b>
              </p>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  Teacher Assignments
                </h3>
              </div>
              <div className="space-y-2">
                {teacherAssignmentTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      announce(`${template.title} assignment opened`);
                      onNavigate?.(template.route);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]"
                  >
                    <p className="text-sm font-black text-white">
                      {template.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {template.classBand}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.rubric.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[10px] font-bold text-cyan-100"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Printer size={16} className="text-amber-300" />
                <h3 className="text-sm font-bold text-white">
                  Printable Artifacts
                </h3>
              </div>
              <div className="space-y-2">
                {printableArtifacts.map((artifact) => (
                  <button
                    key={artifact.id}
                    type="button"
                    onClick={() => {
                      announce(`${artifact.title} opened`);
                      onNavigate?.(artifact.route);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]"
                  >
                    <div className="flex items-center gap-2">
                      {artifact.id === "worksheet" ? (
                        <FileText size={14} className="text-cyan-200" />
                      ) : artifact.id === "lab-report" ? (
                        <ClipboardList size={14} className="text-emerald-200" />
                      ) : (
                        <Download size={14} className="text-amber-200" />
                      )}
                      <p className="text-sm font-black text-white">
                        {artifact.title}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {artifact.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Settings size={16} className="text-violet-300" />
                <h3 className="text-sm font-bold text-white">Readiness</h3>
              </div>
              <div className="space-y-2">
                {readinessChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-white">
                        {item.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${statusStyle[item.status] || statusStyle.Planned}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-4">
            <button
              type="button"
              onClick={() => {
                announce("Syllabus opened");
                onNavigate?.("syllabus");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs font-black text-gray-200 hover:bg-white/[0.06]"
            >
              <BookOpen size={14} /> Syllabus
            </button>
            <button
              type="button"
              onClick={() => {
                announce("Practice tutor opened");
                onNavigate?.("practice-tutor");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs font-black text-gray-200 hover:bg-white/[0.06]"
            >
              <ListChecks size={14} /> Practice
            </button>
            <button
              type="button"
              onClick={() => {
                announce("Advanced visuals opened");
                onNavigate?.("advanced-visuals");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs font-black text-gray-200 hover:bg-white/[0.06]"
            >
              <Layers3 size={14} /> Visuals
            </button>
            <button
              type="button"
              onClick={() => {
                announce("Lab Builder opened");
                onNavigate?.("chemistry-inventor");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-xs font-black text-gray-200 hover:bg-white/[0.06]"
            >
              <Box size={14} /> Lab Builder
            </button>
          </section>
        </main>
      </section>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 z-20 rounded-full border border-cyan-300/40 bg-slate-950/95 px-4 py-2 text-xs text-cyan-100"
        >
          {notice}
        </div>
      )}
    </div>
  );
};

const pathDurationLabel = (duration) =>
  duration.includes("day") ? duration : `Duration: ${duration}`;

export default LearningCommandCenterPage;
