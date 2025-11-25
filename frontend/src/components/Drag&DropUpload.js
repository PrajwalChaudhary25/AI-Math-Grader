import React, { useRef, useState } from "react";

export default function SingleImageUpload({ onUpload, headerText }) {
  const [image, setImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image only.");
      return;
    }
    setImage(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0]; // only one file allowed
    handleFile(file);
  };

  const upload = () => {
    if (!image) return alert("Please select an image.");

    if (onUpload) {
      onUpload(image); // send image to parent
    }
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
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-24 h-24 rounded-lg object-cover shadow"
          />

          <button
            className="text-red-600 underline"
            onClick={() => setImage(null)}
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={upload}
        className="mt-4 bg-green-800 hover:bg-green-700 text-white py-2 px-8 rounded-full text-lg font-medium"
      >
        Upload
      </button>
    </div>
  );
}