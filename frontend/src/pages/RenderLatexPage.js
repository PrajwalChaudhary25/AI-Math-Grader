import React from "react";
import { useLocation } from "react-router-dom";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function RenderLatexPage() {
        const location = useLocation();
        const latexData = location.state?.latex || "";

        // Split into text + inline math + block math
        const segments = latexData.split(/(\\\(|\\\[|\\\)|\\\])/);

        const renderedSegments = [];
        let mathMode = null;
        let buffer = "";

        segments.forEach((seg, idx) => {
            if (seg === "\\(") {
                mathMode = "inline";
                return;
            }
            if (seg === "\\[") {
                mathMode = "block";
                return;
            }
            if (seg === "\\)" || seg === "\\]") {
                if (mathMode === "inline") {
                    renderedSegments.push(
                        <span key={`imath-${idx}`} className="inline-block mx-1 text-indigo-900">
                            <InlineMath math={buffer} />
                        </span>
                    );
                } else {
                    renderedSegments.push(
                        <div key={`bmath-${idx}`} className="my-4 p-4 bg-gray-50 rounded border border-gray-200">
                            <BlockMath math={buffer} />
                        </div>
                    );
                }
                buffer = "";
                mathMode = null;
                return;
            }

            if (mathMode) {
                buffer += seg;
            } else {
                // wrap plain text segments for better typography and contrast
                renderedSegments.push(
                    <span key={`txt-${idx}`} className="text-gray-900 break-words mr-1">
                        {seg}
                    </span>
                );
            }
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
            >
              Start Grading
            </button>
              </div>
            </div>
          </div>
        );
}

export default RenderLatexPage;
