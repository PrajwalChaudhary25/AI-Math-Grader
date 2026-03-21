import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const RobustLatexRenderer = ({
  input,
  isQuestion = false,
  marks,
  difficulty_level,
}) => {
  const [marksValue, setMarksValue] = React.useState(
    marks === "unknown" ? "set_marks" : marks || "",
  );
  const [difficultyValue, setDifficultyValue] = React.useState(
    difficulty_level || "Not specified",
  );

  console.log(difficulty_level);
  if (!input) return null;

  const segments = [];
  let i = 0;
  let textBuf = "";

  const pushText = () => {
    if (textBuf.trim()) {
      segments.push({ type: "text", content: textBuf });
      textBuf = "";
    }
  };

  // --- 1. PRE-CHECK ---
  const hasNoDelimiters =
    !input.includes("$") && !input.includes("\\(") && !input.includes("\\[");
  const looksLikeRawLatex =
    input.includes("\\frac") ||
    input.includes("\\text") ||
    input.includes("\\log");

  if (hasNoDelimiters && looksLikeRawLatex) {
    return (
      <div
        className={`overflow-x-auto ${isQuestion ? "text-xl my-2" : "text-base my-1"}`}
      >
        <BlockMath math={input} />
      </div>
    );
  }

  // --- 2. STANDARD PARSING ---
  while (i < input.length) {
    if (input.slice(i, i + 7) === "\\begin{") {
      const envStart = i + 7;
      const envNameEnd = input.indexOf("}", envStart);
      if (envNameEnd !== -1) {
        const envName = input.slice(envStart, envNameEnd);
        const endTag = `\\end{${envName}}`;
        const endIndex = input.indexOf(endTag, envNameEnd);
        if (endIndex !== -1) {
          pushText();
          segments.push({
            type: "block",
            content: input.slice(i, endIndex + endTag.length),
          });
          i = endIndex + endTag.length;
          continue;
        }
      }
    }
    if (input.slice(i, i + 2) === "$$" || input.slice(i, i + 2) === "\\[") {
      const closer = input.slice(i, i + 2) === "$$" ? "$$" : "\\]";
      const closerIndex = input.indexOf(closer, i + 2);
      if (closerIndex !== -1) {
        pushText();
        segments.push({
          type: "block",
          content: input.slice(i + 2, closerIndex).trim(),
        });
        i = closerIndex + 2;
        continue;
      }
    }
    if (input[i] === "$" || input.slice(i, i + 2) === "\\(") {
      const isShort = input[i] === "$";
      const closer = isShort ? "$" : "\\)";
      const closerIndex = input.indexOf(closer, i + (isShort ? 1 : 2));
      if (closerIndex !== -1) {
        pushText();
        segments.push({
          type: "inline",
          content: input.slice(i + (isShort ? 1 : 2), closerIndex).trim(),
        });
        i = closerIndex + (isShort ? 1 : 2);
        continue;
      }
    }
    textBuf += input[i];
    i++;
  }
  pushText();

  // --- 3. RENDERING ---
  return (
    <div
      className={`leading-snug ${isQuestion ? "text-lg md:text-xl" : "text-base"}`}
    >
      {segments.map((seg, idx) => {
        if (seg.type === "text") {
          return (
            <span key={idx} className="font-medium align-middle">
              {seg.content}
            </span>
          );
        }

        if (seg.type === "inline") {
          return (
            <span key={idx} className="mx-1 inline-block align-middle">
              <InlineMath math={seg.content} />
            </span>
          );
        }

        return (
          <div
            key={idx}
            className={`overflow-x-auto text-left ${isQuestion ? "my-2" : "my-1"}`}
          >
            {/* The wrapper below controls the math size specifically */}
            <div
              style={{ fontSize: isQuestion ? "1.15em" : "1em" }}
              className="inline-block"
            >
              <BlockMath math={seg.content} />
            </div>
          </div>
        );
      })}

      {/* Marks and Difficulty Level Display/Inputs (only shown for questions) */}
      {isQuestion && (
        <div className="mt-6 flex gap-4 items-center flex-wrap">
          {/* Marks Display or Input */}
          {marks && marks !== "unknown" ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Marks
              </span>
              <span className="text-xl font-bold text-blue-100">{marks}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">Marks</label>
              <input
                type="text"
                value={marksValue}
                onChange={(e) => setMarksValue(e.target.value)}
                placeholder="set_marks"
                className="px-4 py-2 w-32 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Difficulty Level Display or Select */}
          {difficulty_level && difficulty_level !== "Not specified" ? (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                difficulty_level === "Easy"
                  ? "bg-green-500/20 border-green-500/50"
                  : difficulty_level === "Medium"
                    ? "bg-amber-500/20 border-amber-500/50"
                    : difficulty_level === "Hard"
                      ? "bg-red-500/20 border-red-500/50"
                      : "bg-slate-500/20 border-slate-500/50"
              }`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  difficulty_level === "Easy"
                    ? "text-green-300"
                    : difficulty_level === "Medium"
                      ? "text-amber-300"
                      : difficulty_level === "Hard"
                        ? "text-red-300"
                        : "text-slate-300"
                }`}
              >
                Difficulty
              </span>
              <span
                className={`text-lg font-bold ${
                  difficulty_level === "Easy"
                    ? "text-green-100"
                    : difficulty_level === "Medium"
                      ? "text-amber-100"
                      : difficulty_level === "Hard"
                        ? "text-red-100"
                        : "text-slate-100"
                }`}
              >
                {difficulty_level}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">
                Difficulty Level
              </label>
              <select
                value={difficultyValue}
                onChange={(e) => setDifficultyValue(e.target.value)}
                className="px-4 py-2 w-40 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Not specified">Not specified</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MathStep = ({ step, isValid, comment }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Render LaTeX using KaTeX
      katex.render(step, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [step]);

  return (
    <div className="flex items-center gap-4 mb-4 group">
      {/* Math Container Box */}
      <div
        className={`w-96 px-6 py-8 rounded-lg border-2 transition-all duration-300 ${
          isValid
            ? "border-green-500 bg-green-50 shadow-sm" // Green box for valid steps
            : "border-red-600 bg-red-50 shadow-md scale-[1.01]" // Red rectangle for invalid steps
        }`}
      >
        <div ref={containerRef} className="overflow-x-auto text-slate-800" />
      </div>

      {/* Comment Section (Only shown if invalid) */}
      {!isValid ? (
        <div className="w-1/3 flex items-center">
          <div className="bg-red-600 text-white text-xs px-3 py-2 rounded-md relative shadow-sm">
            {/* Small arrow pointing to the box */}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
            <span className="font-semibold uppercase tracking-wider block text-[10px] mb-1 opacity-80">
              Error
            </span>
            {comment}
          </div>
        </div>
      ) : (
        /* Empty space to keep alignment consistent if needed, or omit for full width */
        <div className="w-1/3 invisible" />
      )}
    </div>
  );
};

const EquationViewer = () => {
  const location = useLocation();
  const latexData = location.state?.latex || "";
  // console.log("solution", latexData);
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-slate-100">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mathematical Validation
          </h2>
          <p className="text-slate-500 mt-2">
            Detailed breakdown of step-by-step logic.
          </p>
          {/* --- PREMIUM QUESTION CONTAINER --- */}
          <div className="mt-8 relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-700">
            {/* Decorative background element for "pop" */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-blue-500"></span>
                <span className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
                  Problem Statement
                </span>
              </div>

              <div className="text-white drop-shadow-md">
                <RobustLatexRenderer
                  input={location.state?.question || "No question Provided"}
                  isQuestion={true}
                  marks={location.state?.marks}
                  difficulty_level={location.state?.level}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-4 flex flex-col items-center">
          {latexData.map((item, index) => (
            <MathStep
              key={index}
              step={item.step}
              isValid={item.valid}
              comment={item.comment}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons - Outside white container and centered */}
      <div className="mt-8 flex justify-center">
          <button
            className="px-10 py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
            >
            Scoring & Feedback
          </button>
      </div>
    </div>
  );
};

export default EquationViewer;
