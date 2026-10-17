import { useMemo, useState } from "react";

import { shuffleOptions } from "../../utils/shuffleOptions.js";

export default function KnowledgeCheck({ questions, onChecked }) {
  const signature = JSON.stringify(questions);
  const ordered = useMemo(
    () => questions.map((q) => ({ ...q, options: shuffleOptions(q.options) })),
    [signature],
  );
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  return (
    <div className="knowledge-check">
      {ordered.map((q, i) => (
        <fieldset key={q.prompt} style={{ marginBottom: 16 }}>
          <legend>{q.prompt}</legend>
          {q.options.map((option) => (
            <label
              key={option.id}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                margin: "8px 0",
              }}
            >
              <input
                type="radio"
                name={`question-${i}-${q.prompt}`}
                checked={answers[i] === option.id}
                onChange={() => {
                  setAnswers((a) => ({ ...a, [i]: option.id }));
                  setChecked(false);
                  setRevealed(false);
                }}
              />
              {option.label}
            </label>
          ))}
          {checked && (
            <p role="status">
              {answers[i] === q.correct ? "Correct." : "Try again."}
            </p>
          )}
          {revealed && (
            <p>
              Answer: {q.options.find((o) => o.id === q.correct)?.label}{" "}
              {q.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <button
        disabled={Object.keys(answers).length !== questions.length}
        onClick={() => {
          setChecked(true);
          onChecked?.(answers);
        }}
      >
        Check Answer
      </button>
      {checked && (
        <>
          <p role="status">
            Score: {score}/{questions.length}
          </p>
          {score < questions.length && (
            <button onClick={() => setRevealed(true)}>Reveal Answer</button>
          )}
        </>
      )}
    </div>
  );
}
