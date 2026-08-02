import React, { useRef, useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export default function SingleImageUpload({ onFileSelect, headerText, initialFile = null }) {
  const [image, setImage] = useState(initialFile);
  const [dragOver, setDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);
  

  useEffect(() => {
    setImage(initialFile);
  }, [initialFile]);

   useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup when component unmounts
    return () => document.body.classList.remove('overflow-hidden');
  }, [isModalOpen]);

  // This function validates and sets images file
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      alert("Please upload an image only.");
      return;
    }
    setImage(file);
    if (onFileSelect) onFileSelect(file);
  }, [onFileSelect]);

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
              className="w-36 h-36 rounded-lg object-cover shadow-black shadow-xs hover:scale-105 transition-transform duration-300 hover:cursor-pointer hover:shadow-2xl"
              onClick={() => setIsModalOpen(true)}
            />

          <button
            className="text-red-600 underline"
            onClick={clearFile}
          >
            Remove
          </button>
        </div>
      )}

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xl flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-4 right-10 text-red-500 hover:text-red-700 bg-gray-50 w-8 h-8 *: rounded-full flex justify-center items-center shadow hover:scale-110 transition-transform duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            <X size={24} />
          </button>
          <div 
            className="bg-white p-6 rounded-lg max-w-lg max-h-[80vh] w-full  overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt="preview"
              className="w-full rounded-lg object-cover shadow"
            />   
          </div> 
        </div>)
            }

    </div>
  );
}