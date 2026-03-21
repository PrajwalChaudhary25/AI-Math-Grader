import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const RobustLatexRenderer = ({
  input,
  isQuestion = false,
  marks,
  difficulty_level,
  marksValue,
  setMarksValue,
  difficultyValue,
  setDifficultyValue,
}) => {

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
  const navigate = useNavigate();
  const latexData = location.state?.latex || "";
  
  const [marksValue, setMarksValue] = React.useState(
    location.state?.marks === "unknown" ? "set_marks" : location.state?.marks || "",
  );
  const [difficultyValue, setDifficultyValue] = React.useState(
    location.state?.level || "Not specified",
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleScoringAndFeedback = async(e) => {
    e.preventDefault();
    const scoringData = {
      question: location.state?.question || "No question provided",
      marks: marksValue || location.state?.marks || "Not specified",
      difficulty: difficultyValue || location.state?.level || "Not specified",
      solution: latexData || [],
    };
    console.log(JSON.stringify(scoringData, null, 2));
    setIsLoading(true);
    try{
        const res = await fetch("http://127.0.0.1:5000/score-and-feedback",{
          method: "POST",
          headers: {
             "Content-Type": "application/json",
          },
          body: JSON.stringify({ Data: scoringData }),
        });
        const data = await res.json();
        console.log(data)
        navigate('/score-and-feedback', { state: { report: data } });

        }      
      catch (error) {
        console.error("Error fetching preprocessing result:", error);
        setIsLoading(false);
      }

  };

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
                  marksValue={marksValue}
                  setMarksValue={setMarksValue}
                  difficultyValue={difficultyValue}
                  setDifficultyValue={setDifficultyValue}
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
            onClick={handleScoringAndFeedback}
            disabled={isLoading}
            className="px-10 py-2 bg-[#FFA500] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
            {isLoading && (
              <div className="w-5 h-5 border-2 border-transparent border-t-black border-r-black rounded-full animate-spin" />
            )}
            {isLoading ? 'Processing...' : 'Scoring & Feedback'}
          </button>
      </div>

      {/* Overlay Loader - AI Math Grader Theme */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Main Content Card */}
          <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-md border border-blue-200/50">
            {/* Header with gradient text */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent mb-2">
                AI Math Grader
              </h3>
              <p className="text-slate-600 font-semibold text-sm">Processing Your Solution</p>
            </div>

            {/* Animated Math Equations Container */}
            <div className="flex justify-center gap-6 mb-8 h-12">
              {/* Equation 1 */}
              <div className="text-2xl font-mono text-blue-600 animate-bounce" style={{ animationDelay: '0s' }}>
                ∫
              </div>
              {/* AI Node - Central Spinner */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-3 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                <span className="text-xl">⚙️</span>
              </div>
              {/* Equation 2 */}
              <div className="text-2xl font-mono text-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }}>
                π
              </div>
            </div>

            {/* Status Messages with animation */}
            <div className="text-center space-y-3">
              <p className="text-slate-800 font-bold text-lg">
                Analyzing Mathematical Steps
                <span className="inline-block ml-1">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Running AI evaluation on step correctness and providing detailed pedagogical feedback
              </p>
            </div>

            {/* Progress indicators */}
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Neural Analysis</span>
                <span>Grade: <span className="text-blue-600 font-bold">∞%</span></span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-full animate-pulse"
                  style={{
                    width: '100%',
                    backgroundSize: '200% 100%',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationViewer;
