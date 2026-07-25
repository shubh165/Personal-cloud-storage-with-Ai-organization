import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import FileCard from "../components/FileCard";
import api from "../api/axios";

function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptying, setEmptying] = useState(false);

  const fetchTrash = async () => {
    try {
      const response = await api.get("/files/trash");
      setFiles(response.data.data || []);
    } catch (error) {
      console.error("Unable to load trash:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleEmptyTrash = async () => {
    if (!window.confirm("Permanently delete every file in Trash? This cannot be undone.")) return;

    try {
      setEmptying(true);
      await api.delete("/files/trash");
      setFiles([]);
    } catch (error) {
      console.error("Empty trash error:", error);
      alert(error.response?.data?.message || "Unable to empty trash.");
    } finally {
      setEmptying(false);
    }
  };

  return (
    <MainLayout setFiles={setFiles}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trash</h1>
          <p className="text-gray-500">Restore files or permanently delete them.</p>
        </div>

        <button
          type="button"
          onClick={handleEmptyTrash}
          disabled={emptying || loading || files.length === 0}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {emptying ? "Deleting..." : "Empty Trash"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading trash...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-400">Trash is empty.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 2xl:grid-cols-4">
          {files.map((file) => (
            <FileCard key={file._id} file={file} isTrashView />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Trash;
