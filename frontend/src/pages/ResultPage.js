import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
            ? 'border-green-500 bg-green-50 shadow-sm' // Green box for valid steps
            : 'border-red-600 bg-red-50 shadow-md scale-[1.01]' // Red rectangle for invalid steps
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
            <span className="font-semibold uppercase tracking-wider block text-[10px] mb-1 opacity-80">Error</span>
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
        <p className="text-slate-500 mt-2">Detailed breakdown of step-by-step logic.</p>
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