import { 
  CheckCircle2, 
  Award, 
  AlertCircle 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const scoreAndFeedback = () => {
  // Data populated from the provided JSON
  const location = useLocation();
  const rawData = location.state?.report || ""

  // Transform data to match UI structure
  const reportData = {
    ...rawData,
    steps: rawData.step_evaluations.map((step, idx) => ({
      step_content: step.step_content || '',
      isCorrect: step.is_correct,
      eval: {
        awarded_marks: step.awarded_marks,
        critique: step.technical_critique,
        feedback: step.pedagogical_feedback
      }
    }))
  };

  // Add KaTeX styling for dark backgrounds
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .katex-rendering .katex { color: white !important; }
      .katex-rendering .katex * { color: white !important; }
      .katex-rendering .katex-mathml { display: none; }
      .katex-rendering .katex-html { color: inherit; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Helper function to parse and render LaTeX in text
  const renderLatexText = (text) => {
    if (!text) return '';
    
    // Pattern to match both \(...\) and $...$ delimiters
    // Using a more robust approach to handle nested parentheses
    const latexPattern = /\\\(([\s\S]*?)\\\)|\$([^$]+)\$/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Use regex to find all LaTeX expressions
    while ((match = latexPattern.exec(text)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Push the LaTeX expression
      const latexContent = match[1] || match[2]; // match[1] is \(...\), match[2] is $...$
      parts.push({
        type: 'latex',
        content: latexContent
      });
      
      lastIndex = latexPattern.lastIndex;
    }
    
    // Push remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return (
      <span>
        {parts.map((part, idx) => 
          part.type === 'latex' ? 
            <InlineMath key={idx} math={part.content} /> : 
            <span key={idx}>{part.content}</span>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Removed overflow-hidden from this container so comments can overflow */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100">
          
          {/* Header Content */}
          <div className="p-4 md:p-6 pb-3 overflow-hidden rounded-t-[2rem]">
             <div className="flex justify-between items-start mb-4">
               <div>
                <h2 className="text-xl font-black text-[#1e293b] tracking-tight">Mathematical Validation</h2>
                <p className="text-slate-400 text-xs mt-1">Detailed breakdown of step-by-step logic and teacher feedback.</p>
               </div>
               <div className={`${reportData.total_marks_awarded === reportData.total_marks ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-amber-600 border-amber-700 text-white'} border-2 px-4 py-2 rounded-2xl text-right transition-colors shadow-lg`}>
                  <span className="block text-[11px] font-black uppercase tracking-[0.15em] opacity-90 mb-1 text-white">Final Score</span>
                  <span className="text-2xl font-black">{reportData.total_marks_awarded} <span className="text-white/80 mx-1">/</span> {reportData.total_marks}</span>
               </div>
             </div>

             {/* Problem Statement Card */}
             <div className="bg-[#0f172a] rounded-3xl p-4 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex items-center gap-2 mb-3 opacity-40">
                  <div className="w-8 h-[1.5px] bg-blue-400"></div>
                  <span className="text-[8px] uppercase font-black tracking-[0.25em]">Problem Statement</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm md:text-base font-mono tracking-tight font-bold text-white katex-rendering">
                      {reportData.question_data && (
                        <BlockMath math={reportData.question_data.replace(/\\\( /g, '').replace(/ \\\)/g, '')} />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <label className="text-[8px] font-black  uppercase tracking-widest mb-1 text-slate-400">Max Marks</label>
                      <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-black text-blue-400 font-mono text-sm">
                        {reportData.total_marks}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[8px] font-black uppercase tracking-widest mb-1 text-slate-400">Difficulty</label>
                      <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-black text-slate-200 tracking-tight text-sm">
                        {reportData.difficulty_level}
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Steps Timeline - Adjusted max-width and removed overflow-hidden */}
          <div className="px-8 py-10 flex flex-col items-center space-y-8">
            {reportData.steps && reportData.steps.length > 0 ? (
              reportData.steps.map((step, idx) => (
                <div key={idx} className="relative w-full max-w-3xl">
                  
                  {/* Math Step Card */}
                  <div className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-center relative z-10 ${
                    step.isCorrect 
                    ? 'bg-[#f0fdf4] border-[#bbf7d0] text-emerald-900 shadow-sm' 
                    : 'bg-[#fff1f2] border-[#fecdd3] text-rose-900 shadow-md scale-[1.02]'
                  }`}>
                    <div className="text-center font-bold tracking-tight min-h-16 flex items-center justify-center flex-col gap-1">
                      {step.step_content && (
                        <div className="text-xl font-mono">
                          <InlineMath math={step.step_content.replace(/\\\( /g, '').replace(/ \\\)/g, '')} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Card - Always Visible */}
                  <div className="mt-4 px-0">
                      <div className={`p-4 rounded-2xl flex flex-col gap-2 shadow-md border-l-4 ${
                        step.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          {step.isCorrect ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />}
                          <div className="flex flex-col gap-1 flex-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {step.isCorrect ? 'Feedback' : 'Error'}
                            </span>
                            <div className={`text-sm font-bold leading-snug ${step.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>{renderLatexText(step.eval.feedback)}</div>
                          </div>
                        </div>
                        <div className={`text-xs leading-relaxed border-t pt-2 ${step.isCorrect ? 'text-emerald-700 border-emerald-200' : 'text-rose-700 border-rose-200'}`}>
                          <p className="italic font-medium">{renderLatexText(step.eval.critique)}</p>
                        </div>
                        {step.eval.awarded_marks > 0 && (
                          <div className={`mt-1 text-[10px] font-black px-2 py-1 rounded-lg self-start ${step.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                            +{step.eval.awarded_marks} Marks
                          </div>
                        )}
                      </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">No steps available</div>
            )}
          </div>

          {/* Verdict Footer */}
          <div className="bg-slate-50 p-12 border-t border-slate-100 flex flex-col items-center text-center rounded-b-[2rem]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#fbbf24] text-[#78350f] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-md shadow-amber-200">
                <Award size={16} /> Final Teacher's Summary
              </div>
              <p className="text-slate-600 text-md font-medium leading-relaxed italic px-4">
                "{reportData.final_verdict}"
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default scoreAndFeedback;