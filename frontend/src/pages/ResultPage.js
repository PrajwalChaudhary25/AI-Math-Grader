import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const RobustLatexRenderer = ({ input, isQuestion = false }) => {
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
  const hasNoDelimiters = !input.includes('$') && !input.includes('\\(') && !input.includes('\\[');
  const looksLikeRawLatex = input.includes('\\frac') || input.includes('\\text') || input.includes('\\log');

  if (hasNoDelimiters && looksLikeRawLatex) {
    return (
      <div className={`overflow-x-auto ${isQuestion ? "text-xl my-2" : "text-base my-1"}`}>
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
          segments.push({ type: "block", content: input.slice(i, endIndex + endTag.length) });
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
        segments.push({ type: "block", content: input.slice(i + 2, closerIndex).trim() });
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
        segments.push({ type: "inline", content: input.slice(i + (isShort ? 1 : 2), closerIndex).trim() });
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
    <div className={`leading-snug ${isQuestion ? "text-lg md:text-xl" : "text-base"}`}>
      {segments.map((seg, idx) => {
        if (seg.type === "text") {
          return <span key={idx} className="font-medium align-middle">{seg.content}</span>;
        }
        
        if (seg.type === "inline") {
          return (
            <span key={idx} className="mx-1 inline-block align-middle">
              <InlineMath math={seg.content} />
            </span>
          );
        }

        return (
          <div key={idx} className={`overflow-x-auto text-left ${isQuestion ? "my-2" : "my-1"}`}>
            {/* The wrapper below controls the math size specifically */}
            <div style={{ fontSize: isQuestion ? '1.15em' : '1em' }} className="inline-block">
              <BlockMath math={seg.content} />
            </div>
          </div>
        );
      })}
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
    <div className="flex items-center gap-4 mb-4 w-full group">
      {/* Math Container Box */}
      <div
        className={`flex-1 p-5 rounded-lg border-2 transition-all duration-300 ${
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
        isQuestion={true} // This triggers the bigger font
      />
    </div>
  </div>
</div>
      </header>

      <div className="space-y-4">
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
  );
};

export default EquationViewer;
