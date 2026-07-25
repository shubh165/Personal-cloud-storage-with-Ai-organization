import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import FileCard from "../components/FileCard";
import api from "../api/axios";

function Starred() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteFiles = async () => {
      try {
        const response = await api.get("/files/starred");
        setFiles(response.data.data || []);
      } catch (error) {
        console.error("Unable to load favorite files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteFiles();
  }, []);

  return (
    <MainLayout setFiles={setFiles}>
      <h1 className="text-2xl font-bold mb-2">Starred Files</h1>
      <p className="text-gray-500 mb-6">Files you have marked as favorites.</p>

      {loading ? (
        <p className="text-gray-400">Loading starred files...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-400">No starred files yet.</p>
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

export default Starred;
