import React, { useState } from "react";
import SingleImageUpload from "../components/Drag&DropUpload";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function UploadPage() {
    // Upload Page states starts here
    const { inputType } = useParams();
    const [questionFile, setQuestionFile] = useState(null);
    const [answerFile, setAnswerFile] = useState(null);
    // Upload Page states ends here
    const navigate = useNavigate();

    // Function to handle form submission starts here
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputType === "Q+A") {
            if (!questionFile) return alert("Please provide the image.");
            const form = new FormData();
            form.append("file", questionFile);
            try {
                const res = await fetch("http://127.0.0.1:5000/convert_to_latex", {
                    method: "POST",
                    body: form,
                });
                const data = await res.json();
                console.log("Response from Flask:", data);
                if (data.success) {
                    alert("Conversion successful!");
                    navigate("/render-latex", { state: { latex:data.results.file.latex} });
                }
            } catch (error) {
                console.error(error);
                alert("Error during conversion");
            }
        } else if (inputType === "Q A") {
            if (!questionFile || !answerFile)
                return alert("Please provide both question and answer images.");

            const form = new FormData();
            form.append("question", questionFile);
            form.append("answer", answerFile);

            try {
                const res = await fetch("http://127.0.0.1:5000/convert_to_latex", {
                    method: "POST",
                    body: form,
                });
                const data = await res.json();
                console.log("Response from Flask:", data);
                if (data.success) {
                    alert("Conversion successful!");
                }
            } catch (error) {
                console.error(error);
                alert("Error during conversion");
            }
        }
    };
    // function to handle form submission ends here


  return (
    <>
      {inputType === "Q+A" ? (
        <form onSubmit={handleSubmit}>
            <SingleImageUpload
                onFileSelect={setQuestionFile}
                headerText={"Enter Handwritten Question and Answer"}
            />
            <div className="mt-4 text-center">
                <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded"
                >
                Submit
                </button>
            </div>
        </form>
      ) : inputType === "Q A" ? (
        <form onSubmit={handleSubmit}>
            <SingleImageUpload
                onFileSelect={setQuestionFile}
                headerText={"Enter Handwritten Question"}
            />
            <SingleImageUpload
                onFileSelect={setAnswerFile}
                headerText={"Enter Handwritten Answer"}
            />
            <div className="mt-4 text-center">
                <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded"
                >
                Submit
                </button>
            </div>
        </form>
        ) : (
            <div>Other input type</div>
     )}
    </>
  );
}

export default UploadPage;
