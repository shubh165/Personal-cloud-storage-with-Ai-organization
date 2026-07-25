import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import FileCard from "../components/FileCard";
import api from "../api/axios";

function Recent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        const response = await api.get("/files");
        const newestFirst = [...(response.data.data || [])].sort(
          (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
        );
        setFiles(newestFirst);
      } catch (error) {
        console.error("Unable to load recent files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFiles();
  }, []);

  return (
    <MainLayout setFiles={setFiles}>
      <h1 className="text-2xl font-bold mb-2">Recent Files</h1>
      <p className="text-gray-500 mb-6">Your latest uploads, newest first.</p>

      {loading ? (
        <p className="text-gray-400">Loading recent files...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 2xl:grid-cols-4">
          {files.map((file) => (
            <FileCard key={file._id} file={file} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Recent;
