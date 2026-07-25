import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FileCard from "../components/FileCard";
import api from "../api/axios";

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("all");

  const filters = [
    { key: "all", label: "All", icon: "📁" },
    { key: "image", label: "Images", icon: "🖼️" },
    { key: "document", label: "Docs", icon: "📄" },
    { key: "video", label: "Videos", icon: "🎬" },
    { key: "audio", label: "Audio", icon: "🎵" },
  ];

  const counts = {
    all: files.length,
    image: files.filter((f) => f.mimeType?.startsWith("image/")).length,
    video: files.filter((f) => f.mimeType?.startsWith("video/")).length,
    audio: files.filter((f) => f.mimeType?.startsWith("audio/")).length,
    document: files.filter(
      (f) =>
        f.mimeType?.includes("pdf") ||
        f.mimeType?.includes("text") ||
        f.mimeType?.includes("application"),
    ).length,
  };

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files");
      setFiles(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 🔥 FILTER LOGIC
  const filteredFiles = files.filter((file) => {
    const type = file.mimeType || "";

    if (filter === "all") return true;
    if (filter === "image") return type.startsWith("image/");
    if (filter === "video") return type.startsWith("video/");
    if (filter === "audio") return type.startsWith("audio/");
    if (filter === "document") {
      return (
        type.includes("pdf") ||
        type.includes("word") ||
        type.includes("text") ||
        type.includes("application")
      );
    }

    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar setFiles={setFiles} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-2xl font-bold mb-6">My Files</h1>

          {/* 🔥 FILTER BUTTONS */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border transition-all duration-200
        ${
          filter === item.key
            ? "bg-purple-600 text-white border-purple-600"
            : "bg-white text-gray-600 hover:bg-purple-100"
        }`}
              >
                <span>{item.icon}</span>
                {item.label}
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div>
          {/* <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "image", label: "Images" },
              { key: "document", label: "Docs" },
              { key: "video", label: "Videos" },
              { key: "audio", label: "Audio" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 border transition
        ${
          filter === item.key
            ? "bg-purple-600 text-white border-purple-600"
            : "bg-white text-gray-600 hover:bg-purple-100"
        }`}
              >
                {item.label}
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div> */}

          {/* FILES */}
          <div className="grid grid-cols-3 gap-6">
            {filteredFiles.length === 0 ? (
              <p>No files found</p>
            ) : (
              filteredFiles.map((file) => (
                <FileCard key={file._id} file={file} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFiles;
