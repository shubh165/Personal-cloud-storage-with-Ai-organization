import { useState } from "react";
import api from "../api/axios";

function UploadBox({ refreshFiles }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("File uploaded successfully");

      setFile(null);

      refreshFiles();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button
        onClick={handleUpload}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        Upload File
      </button>
    </div>
  );
}

export default UploadBox;
