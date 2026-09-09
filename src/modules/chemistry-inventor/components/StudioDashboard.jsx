import { Clock, FileText, FlaskConical, FolderOpen, GraduationCap, Sparkles, Trophy } from 'lucide-react';
import { experimentTemplates } from '../data/experimentTemplates.js';
import { getGradeLevel } from '../data/gradeConceptMap.js';

export function StudioDashboard({
  grade,
  projects,
  reports,
  badges,
  onLoadProject,
  onLoadReport,
  onSelectTemplate,
}) {
  const gradeLevel = getGradeLevel(grade);
  const quickTemplates = experimentTemplates.filter(template => template.grade <= gradeLevel).slice(0, 6);

  return (
    <section className="border-b border-white/10 bg-slate-950/80 p-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr]">
        <DashboardCard icon={FolderOpen} title="Saved Projects" detail={`${projects.length} browser-saved project${projects.length === 1 ? '' : 's'}`}>
          <div className="space-y-1.5">
            {projects.slice(0, 4).map(project => (
              <button key={project.id} onClick={() => onLoadProject(project.id)} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-left text-xs hover:bg-white/[0.06]" type="button">
                <span className="block font-bold text-white">{project.name}</span>
                <span className="text-gray-500">{project.grade} - {project.componentCount || 0} objects</span>
              </button>
            ))}
            {projects.length === 0 && <Empty text="No saved projects yet." />}
          </div>
        </DashboardCard>

        <DashboardCard icon={FileText} title="Recent Reports" detail={`${reports.length} saved report${reports.length === 1 ? '' : 's'}`}>
          <div className="space-y-1.5">
            {reports.slice(0, 4).map(report => (
              <button key={report.id} onClick={() => onLoadReport(report.id)} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-left text-xs hover:bg-white/[0.06]" type="button">
                <span className="block font-bold text-white">{report.title}</span>
                <span className="text-gray-500">{report.score}% - {report.savedAt || report.dateTime}</span>
              </button>
            ))}
            {reports.length === 0 && <Empty text="Generate a report to see it here." />}
          </div>
        </DashboardCard>

        <DashboardCard icon={Trophy} title="Assessment Badges" detail="Earned from setup, safety, equations, observations, and reports">
          <div className="flex flex-wrap gap-1.5">
            {badges.length ? badges.map(badge => (
              <span key={badge} className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[11px] font-bold text-amber-100">{badge}</span>
            )) : <Empty text="Badges appear after simulation and reporting." />}
          </div>
        </DashboardCard>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={15} className="text-cyan-200" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Quick Start Templates</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickTemplates.map(template => (
            <button key={template.id} onClick={() => onSelectTemplate(template)} className="min-w-60 rounded-2xl border border-white/10 bg-black/15 p-3 text-left hover:border-cyan-300/30 hover:bg-cyan-300/10" type="button">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-200"><GraduationCap size={12} /> Grade {template.grade}</span>
              <span className="mt-1 block text-sm font-black text-white">{template.title}</span>
              <span className="mt-1 line-clamp-2 text-xs text-gray-500">{template.aim}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardCard({ icon: Icon, title, detail, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <Icon size={18} />
        </span>
        <span>
          <span className="block text-sm font-black text-white">{title}</span>
          <span className="mt-0.5 block text-xs text-gray-500">{detail}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-gray-500">
      <Clock size={12} /> {text}
    </span>
  );
}
