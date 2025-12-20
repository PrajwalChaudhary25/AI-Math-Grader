import React from "react";
import { useLocation } from "react-router-dom";
import { InlineMath, BlockMath } from "react-katex";
import { useNavigate } from "react-router-dom";
import "katex/dist/katex.min.css";

function RenderLatexPage() {
        const navigate = useNavigate();
        const location = useLocation();
        const latexData = location.state?.latex || "";

        // Robust parser: supports $...$, $$...$$, \(...\), \[...\] and escaped delimiters
        function parseLatexSegments(input) {
          const out = [];
          let i = 0;
          let textBuf = "";

          const pushText = () => {
            if (textBuf.length) {
              out.push({ type: "text", content: textBuf });
              textBuf = "";
            }
          };

          const findClosing = (startIdx, closer) => {
            let j = startIdx;
            let res = -1;
            while (j < input.length) {
              const ch = input[j];
              if (ch === "\\") {
                // skip escaped char
                j += 2;
                continue;
              }
              if (input.startsWith(closer, j)) {
                res = j;
                break;
              }
              j++;
            }
            return res;
          };

          while (i < input.length) {
            const ch = input[i];

            // detect \( or \[
            if (ch === "\\" && (input[i + 1] === "(" || input[i + 1] === "[")) {
              const opener = input[i + 1];
              const closer = opener === "(" ? "\\)" : "\\]";
              const start = i + 2;
              const end = findClosing(start, closer);
              if (end !== -1) {
                pushText();
                const content = input.slice(start, end);
                out.push({ type: opener === "(" ? "inline" : "block", content });
                i = end + closer.length;
                continue;
              }
              // no closer found; treat as literal
              textBuf += ch;
              i++;
              continue;
            }

            // detect $$ (display)
            if (ch === "$") {
              const isDouble = input[i + 1] === "$";
              if (isDouble) {
                const start = i + 2;
                const end = findClosing(start, "$$");
                if (end !== -1) {
                  pushText();
                  const content = input.slice(start, end);
                  out.push({ type: "block", content });
                  i = end + 2;
                  continue;
                }
                // no closer -> treat as literal
                textBuf += "$$";
                i += 2;
                continue;
              } else {
                // single $ inline
                const start = i + 1;
                let j = start;
                let found = -1;
                while (j < input.length) {
                  if (input[j] === "\\") { j += 2; continue; }
                  if (input[j] === "$") { found = j; break; }
                  j++;
                }
                if (found !== -1) {
                  pushText();
                  const content = input.slice(start, found);
                  out.push({ type: "inline", content });
                  i = found + 1;
                  continue;
                }
                // no closing $ -> treat as literal
                textBuf += "$";
                i++;
                continue;
              }
            }

            // default: append to text buffer
            textBuf += ch;
            i++;
          }

          pushText();
          return out;
        }

        const rawInput = latexData || "";

        // Fix common layout: convert a standalone "& \text{ Solve: }\\\n & \begin{aligned}..."
        // into "\text{Solve:}\quad & \begin{aligned}..." so the label sits beside the block.
        const solveInlineRegex = /&\s*\\text\s*\{\s*Solve:\s*\}\s*\\\\\s*&\s*\\begin\{aligned\}/g;
        const preprocessedInput = rawInput.replace(solveInlineRegex, "\\text{Solve:}\\quad &\\begin{aligned}");

        // If the input is a raw LaTeX environment (e.g. "\\begin{aligned}..."),
        // render it as a single display/block math segment so KaTeX can parse it.
        let segments;
        if (/\\begin\{.+?\}/.test(preprocessedInput.trim())) {
          segments = [{ type: "block", content: preprocessedInput }];
        } else {
          segments = parseLatexSegments(preprocessedInput);
        }

        const renderedSegments = segments.map((seg, idx) => {
          if (seg.type === "text") {
            return (
              <span key={`txt-${idx}`} className="text-gray-900 break-words mr-1">
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
            <div key={`bmath-${idx}`} className="my-4 p-4 bg-gray-50 rounded border border-gray-200">
              <BlockMath math={seg.content} />
            </div>
          );
        });

        return (
          <div className="min-h-screen bg-gray-400 py-8">
            <div className="max-w-3xl mx-auto px-4">
              <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
            Rendered LaTeX
              </h1>

              <div className="bg-gray-100 p-6 rounded-xl shadow-lg leading-relaxed text-lg text-gray-900">
            {renderedSegments.length ? (
              <div className="prose prose-lg max-w-none">
                {renderedSegments}
              </div>
            ) : (
              <p className="text-gray-500">No LaTeX data to render.</p>
            )}
              </div>
              <div className="flex justify-center mt-6">
            <button
              className="px-10 py-2 bg-[#976507] text-black text-[20px] rounded-3xl hover:bg-[#6b4703] hover:text-white active:scale-110 transition duration-300"
              onClick={() => navigate('/result')}
            >
              Start Grading
            </button>
              </div>
            </div>
          </div>
        );
}

export default RenderLatexPage;
