import { ArrowDown, Boxes, CheckCircle2, GitBranch } from 'lucide-react';
import {
  decisionTreeQuestions,
  getOpticalActivityCriteria,
  getPointGroupAssignmentSteps,
  getPointGroupSignature,
  pointGroupFamilies,
  pointGroupSignatures,
} from '../utils/pointGroupRules.js';

export function SymmetryDecisionTree({ molecule }) {
  const assignmentSteps = getPointGroupAssignmentSteps(molecule);
  const opticalActivity = getOpticalActivityCriteria(molecule);
  const activeSignature = getPointGroupSignature(molecule.pointGroup);

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Point Group Assignment</p>
          <h3 className="text-sm font-bold text-white">Flowchart and classification</h3>
        </div>
        <GitBranch size={17} className="text-cyan-300" />
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
        <div className="flex items-start gap-2">
          <Boxes size={16} className="mt-0.5 flex-shrink-0 text-amber-300" />
          <div>
            <p className="text-xs font-bold text-white">Core idea</p>
            <p className="mt-1 text-xs leading-5 text-gray-400">
              After identifying possible symmetry elements, classify the molecule by the combination of elements it actually has. For water, C2 plus two vertical mirror planes gives C2v.
            </p>
          </div>
        </div>
      </div>

      {activeSignature && (
        <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Matching point-group signature</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 text-xs font-black text-amber-50">{activeSignature.group}</span>
            <span className="text-xs font-semibold text-white">{activeSignature.signature}</span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-amber-50/80">{activeSignature.example}</p>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {assignmentSteps.map((step, index) => (
          <div key={step.title}>
            <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 p-2">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[10px] font-black text-slate-950">{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white">{step.title}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-cyan-100">{step.result}</p>
                  <p className="mt-1 text-[11px] leading-4 text-gray-400">{step.detail}</p>
                </div>
              </div>
            </div>
            {index < assignmentSteps.length - 1 && <ArrowDown size={14} className="mx-auto my-1 text-cyan-300/70" />}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">General classification steps</p>
        <div className="mt-2 grid gap-2">
          {decisionTreeQuestions.map(question => (
            <div key={question} className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-1.5 text-[11px] text-gray-300">
              {question}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Common point-group signatures</p>
        <div className="mt-2 space-y-2">
          {pointGroupSignatures.map(signature => (
            <div key={signature.group} className={`rounded-lg border p-2 ${signature.group === molecule.pointGroup ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/[0.025]'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">{signature.group}</span>
                <p className="text-[11px] font-semibold text-white">{signature.signature}</p>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-gray-500">{signature.example}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Point group families</p>
        <div className="mt-2 space-y-2">
          {pointGroupFamilies.map(family => (
            <div key={family.family} className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black text-white">{family.family}</p>
                {family.groups.map(group => <span key={group} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-100">{group}</span>)}
              </div>
              <p className="mt-1 text-[11px] leading-4 text-gray-500">{family.criteria}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-3 rounded-xl border p-3 ${opticalActivity.isPotentiallyOpticallyActive ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-rose-400/25 bg-rose-400/10'}`}>
        <div className="flex items-start gap-2">
          <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${opticalActivity.isPotentiallyOpticallyActive ? 'text-emerald-200' : 'text-rose-200'}`} />
          <div>
            <p className="text-xs font-black text-white">Optical activity criterion</p>
            <p className="mt-1 text-xs font-semibold text-gray-100">{opticalActivity.verdict}</p>
            <p className="mt-1 text-[11px] leading-4 text-gray-300">{opticalActivity.reason}</p>
            {opticalActivity.blockingElements.length > 0 && (
              <p className="mt-2 text-[11px] text-gray-300">Blocking elements: {opticalActivity.blockingElements.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SymmetryDecisionTree;
