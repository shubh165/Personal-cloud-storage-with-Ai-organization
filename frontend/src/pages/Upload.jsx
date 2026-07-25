import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";
import api from "../api/axios";

function Upload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully");

      setFile(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex items-center justify-center flex-1">
          <div className="bg-white shadow-lg rounded-xl p-10 w-[450px] text-center">
            <h1 className="text-2xl font-bold mb-6">Upload File</h1>

            {/* Drag Area */}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 mb-6 transition 
              ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"}`}
            >
              <p className="text-gray-500 mb-3">Drag & Drop files here</p>

              <p className="text-sm text-gray-400">or</p>

              <label className="cursor-pointer text-purple-600 font-medium">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {file && (
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Upload File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
