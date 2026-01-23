import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function RenderLatexPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const latexData = location.state?.latex || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
      try{
        const res = await fetch("http://127.0.0.1:5000/preprocess",{
          method: "POST",
          headers: {
             "Content-Type": "application/json",
          },
          body: JSON.stringify({ latex: latexData }),
        });
        const data = await res.json();
        console.log("preprocessing result:", data["steps"]);
        if (data.success){
          navigate('/result', { state: { latex: data["steps"] } });
        }        }      
      catch (error) {
        console.error("Error fetching preprocessing result:", error);
      }
  }

  function parseLatexSegments(input) {
    const segments = [];
    let i = 0;
    let textBuf = "";

    const pushText = () => {
      if (textBuf.trim()) {
        segments.push({ type: "text", content: textBuf });
        textBuf = "";
      }
    };

    while (i < input.length) {
      // Check for \begin{...} environments
      if (input.slice(i, i + 7) === "\\begin{") {
        const envStart = i + 7;
        const envNameEnd = input.indexOf("}", envStart);
        
        if (envNameEnd !== -1) {
          const envName = input.slice(envStart, envNameEnd);
          const endTag = `\\end{${envName}}`;
          const contentStart = envNameEnd + 1;
          const endIndex = input.indexOf(endTag, contentStart);
          
          if (endIndex !== -1) {
            pushText();
            const fullEnv = input.slice(i, endIndex + endTag.length);
            segments.push({ type: "block", content: fullEnv });
            i = endIndex + endTag.length;
            continue;
          }
        }
      }

      // Check for \[ ... \] (block math)
      if (input.slice(i, i + 2) === "\\[") {
        const start = i + 2;
        const closerIndex = input.indexOf("\\]", start);
        
        if (closerIndex !== -1) {
          pushText();
          const content = input.slice(start, closerIndex);
          segments.push({ type: "block", content: content.trim() });
          i = closerIndex + 2;
          continue;
        }
      }

      // Check for \( ... \) (inline math)
      if (input.slice(i, i + 2) === "\\(") {
        const start = i + 2;
        const closerIndex = input.indexOf("\\)", start);
        
        if (closerIndex !== -1) {
          pushText();
          const content = input.slice(start, closerIndex);
          segments.push({ type: "inline", content: content.trim() });
          i = closerIndex + 2;
          continue;
        }
      }

      // Check for $$ ... $$ (block math)
      if (input.slice(i, i + 2) === "$$") {
        const start = i + 2;
        const closerIndex = input.indexOf("$$", start);
        
        if (closerIndex !== -1) {
          pushText();
          const content = input.slice(start, closerIndex);
          segments.push({ type: "block", content: content.trim() });
          i = closerIndex + 2;
          continue;
        }
      }

      // Check for $ ... $ (inline math)
      if (input[i] === "$") {
        const start = i + 1;
        let j = start;
        let found = -1;
        
        while (j < input.length) {
          if (input[j] === "\\" && j + 1 < input.length) {
            j += 2;
            continue;
          }
          if (input[j] === "$") {
            found = j;
            break;
          }
          j++;
        }
        
        if (found !== -1) {
          pushText();
          const content = input.slice(start, found);
          segments.push({ type: "inline", content: content.trim() });
          i = found + 1;
          continue;
        }
      }

      textBuf += input[i];
      i++;
    }

    pushText();
    return segments;
  }

  const segments = parseLatexSegments(latexData);

  const renderedSegments = segments.map((seg, idx) => {
    if (seg.type === "text") {
      return (
        <span key={`txt-${idx}`} className="text-gray-900 break-words">
          {seg.content}
        </span>
      );
    }
    if (seg.type === "inline") {
      return (
        <span key={`imath-${idx}`} className="inline-block mx-1 text-indigo-900">
          <InlineMath math={seg.content} />
        </span>
      );
    }
    return (
      <div key={`bmath-${idx}`} className="my-8 p-8 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
        <style>
          {`
            .katex-display {
              margin: 0 !important;
            }
            .katex-display .base {
              line-height: 3.5 !important;
            }
            .katex-display .arraycolsep {
              width: 1rem !important;
            }
          `}
        </style>
        <BlockMath math={seg.content} />
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gray-400 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
          Rendered LaTeX
        </h1>

        <div className="bg-gray-100 p-6 rounded-xl shadow-lg leading-relaxed text-lg text-gray-900">
          {renderedSegments.length ? (
            <div className="prose prose-lg max-w-none space-y-4">
              {renderedSegments}
            </div>
          ) : (
            <p className="text-gray-500">No LaTeX data to render.</p>
          )}
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            className="px-10 py-2 bg-[#976507] text-black text-xl rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
            onClick={() => navigate('/preprocessing-result', { state: { latex: latexData } })}
          >
            Start Grading
          </button>

          <div className="flex justify-center mt-6">
          <button
            className="px-10 py-2 bg-[#976507] text-black text-xl rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
            onClick={handleSubmit}
          >
            stepwise validation
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default RenderLatexPage;