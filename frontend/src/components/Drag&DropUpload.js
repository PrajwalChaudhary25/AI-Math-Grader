import React, { useRef, useState, useEffect } from "react";

export default function SingleImageUpload({ onFileSelect, headerText, initialFile = null }) {
  const [image, setImage] = useState(initialFile);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setImage(initialFile);
  }, [initialFile]);

  // This function validates and sets images file
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      alert("Please upload an image only.");
      return;
    }
    setImage(file);
    if (onFileSelect) onFileSelect(file);
  };

  // This function handles events when files are dropped in the drop zone
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0]; // only one file allowed
    handleFile(file);
  };

  /* This function clears the file Uploaded in the Drop Zone 
  when remove button is clicked*/
  const clearFile = () => {
    setImage(null);
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="bg-yellow-100 p-6 rounded-lg max-w-3xl mx-auto">
      <h2 className="text-left font-semibold mb-2">{headerText}</h2>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full h-32 rounded-3xl border-2 border-dashed flex flex-col justify-center items-center cursor-pointer transition
          ${dragOver ? "bg-green-100 border-green-500" : "bg-gray-300 border-gray-500"}
        `}
      >

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {image ? (
          <p className="font-semibold">Selected: {image.name}</p>
        ) : (
          <>
            <p className="font-bold text-lg">Drag and Drop file</p>
            <span className="text-xl">⬆</span>
            <p className="text-xs">or click to browse</p>
          </>
        )}
      </div>

      {/* Preview */}
      {image && (
        <div className="mt-4 flex items-center gap-4">
          <img
            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
            alt="preview"
            className="w-24 h-24 rounded-lg object-cover shadow"
          />

          <button
            className="text-red-600 underline"
            onClick={clearFile}
          >
            Remove
          </button>
        </div>
      )}

    </div>
  );
}