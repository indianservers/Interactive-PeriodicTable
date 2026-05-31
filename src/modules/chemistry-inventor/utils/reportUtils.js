const label = value => String(value || '').replace(/-/g, ' ');

export function calculateBadges({ validation, simulationResult, procedureTimeline, report }) {
  const badges = [];
  if ((validation?.score || 0) >= 50 || procedureTimeline.length >= 3) badges.push('Experiment Builder');
  if ((validation?.categories?.safetyAwareness || 0) >= 80 && !procedureTimeline.some(entry => entry.warning)) badges.push('Safe Chemist');
  if (simulationResult?.wordEquation && simulationResult.wordEquation !== 'No supported school-level equation for this setup yet.') badges.push('Equation Expert');
  if (procedureTimeline.some(entry => /observ|record|turn|forms|bubbles|milky|precipitate|crystal/i.test(`${entry.action} ${entry.observation}`))) badges.push('Observation Master');
  if (report) badges.push('Report Ready');
  return badges;
}

export function createLabReport({
  projectName,
  grade,
  selectedTemplate,
  components,
  procedureBlocks,
  procedureTimeline,
  simulationResult,
  validation,
  vivaAnswers,
}) {
  const apparatus = components.filter(item => item.componentType === 'apparatus');
  const chemicals = components.filter(item => item.componentType === 'chemical' || item.componentType === 'indicator');
  const observations = procedureTimeline.map(entry => entry.observation).filter(Boolean);
  const viva = (selectedTemplate?.vivaQuestions || []).map((question, index) => ({
    question,
    answered: Boolean(vivaAnswers[index]),
    answer: Boolean(vivaAnswers[index]) ? 'Answered during viva practice.' : 'Pending student answer.',
  }));
  const report = {
    id: `report-${Date.now()}`,
    title: selectedTemplate?.title || projectName || 'Chemistry Inventor Lab Report',
    grade,
    dateTime: new Date().toLocaleString(),
    aim: selectedTemplate?.aim || 'Explore a school-level chemistry setup using the Chemistry Inventor Studio.',
    theory: selectedTemplate?.explanation || simulationResult?.teacherExplanation || 'The activity links apparatus, chemicals, procedure, observation, and explanation.',
    apparatusUsed: apparatus.map(item => item.displayName),
    chemicalsUsed: chemicals.map(item => item.displayName),
    procedureFollowed: procedureBlocks.map((block, index) => `${index + 1}. ${block.label}`),
    observations: observations.length ? observations : [simulationResult?.observation || 'No observation recorded yet.'],
    equations: {
      word: simulationResult?.wordEquation || selectedTemplate?.equations?.[0] || 'Not generated yet.',
      balanced: simulationResult?.balancedEquation || selectedTemplate?.equations?.[0] || '',
    },
    particleExplanation: simulationResult?.particleExplanation || 'Run a supported simulation to generate a particle-level explanation.',
    result: simulationResult?.learningTakeaway || selectedTemplate?.learningOutcomes?.join('; ') || 'Result pending.',
    precautions: simulationResult?.safetyWarnings || ['Use small quantities and follow teacher instructions.'],
    commonMistakes: simulationResult?.commonMistakes || selectedTemplate?.commonMistakes || [],
    viva,
    score: validation?.score || 0,
    badges: [],
    canvasSummary: components.map(item => `${item.displayName} (${item.componentType}) at ${Math.round(item.x)}, ${Math.round(item.y)}`),
    timeline: procedureTimeline.map(entry => ({
      step: entry.stepNumber,
      action: entry.action,
      valid: entry.valid,
      observation: entry.observation,
      warning: entry.warning,
      explanation: entry.explanation,
    })),
  };
  report.badges = calculateBadges({ validation, simulationResult, procedureTimeline, report });
  return report;
}

export function formatLabReport(report) {
  if (!report) return 'No report generated yet.';
  const lines = [
    `# ${report.title}`,
    `Grade: ${report.grade}`,
    `Date/Time: ${report.dateTime}`,
    '',
    `Aim: ${report.aim}`,
    '',
    `Theory: ${report.theory}`,
    '',
    `Apparatus Used: ${report.apparatusUsed.join(', ') || 'Not listed'}`,
    `Chemicals Used: ${report.chemicalsUsed.join(', ') || 'Not listed'}`,
    '',
    'Procedure Followed:',
    ...(report.procedureFollowed.length ? report.procedureFollowed : ['No procedure blocks recorded.']),
    '',
    'Observations:',
    ...report.observations.map(item => `- ${item}`),
    '',
    `Word Equation: ${report.equations.word}`,
    report.equations.balanced ? `Balanced Equation: ${report.equations.balanced}` : 'Balanced Equation: Not required or not available.',
    '',
    `Particle Explanation: ${report.particleExplanation}`,
    '',
    `Result: ${report.result}`,
    '',
    'Precautions:',
    ...report.precautions.map(item => `- ${item}`),
    '',
    'Common Mistakes:',
    ...(report.commonMistakes.length ? report.commonMistakes.map(item => `- ${item}`) : ['- Not recorded.']),
    '',
    'Viva Questions:',
    ...(report.viva.length ? report.viva.map(item => `- ${item.question} Answer: ${item.answer}`) : ['- Not added.']),
    '',
    `Score: ${report.score}%`,
    `Badges: ${report.badges.join(', ') || 'None yet'}`,
    '',
    'Canvas Setup Summary:',
    ...(report.canvasSummary.length ? report.canvasSummary.map(item => `- ${item}`) : ['- Empty canvas.']),
    '',
    'Executed Block Timeline:',
    ...(report.timeline.length ? report.timeline.map(item => `- Step ${item.step}: ${item.action} | ${item.valid ? 'Valid' : 'Needs review'} | ${item.observation || item.warning || 'No note'}`) : ['- No executed steps.']),
  ];
  return lines.join('\n');
}

export function openPrintReport(report) {
  const text = formatLabReport(report)
    .split('\n')
    .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'}</p>`)
    .join('');
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return false;
  win.document.write(`
    <html>
      <head>
        <title>${label(report?.title || 'Lab Report')}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          p { margin: 0 0 6px; line-height: 1.45; white-space: pre-wrap; }
          p:first-child { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
        </style>
      </head>
      <body>${text}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
