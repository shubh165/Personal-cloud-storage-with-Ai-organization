import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import FileCard from "../components/FileCard";
import api from "../api/axios";

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files");

      const fileList = res.data.data || [];

      setFiles(fileList);

      const size = fileList.reduce(
        (acc, file) => acc + (file.fileSize || 0),
        0,
      );
      setTotalSize(size);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatSize = (size) => {
    return (size / 1024 / 1024 / 1024).toFixed(2);
  };

  return (
    <MainLayout setFiles={setFiles}>
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">Welcome back</h1>

      <p className="text-gray-500 mb-8">
        Manage and organize your digital workspace
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Storage</p>
          <h2 className="text-2xl font-bold">{formatSize(totalSize)} GB</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Files</p>
          <h2 className="text-2xl font-bold">{files.length}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">AI Intelligence</p>
          <h2 className="text-2xl font-bold">Active</h2>
        </div>
      </div>

      {/* Recent Files */}
      <h2 className="text-xl font-semibold mb-4">Recent Files</h2>

      <div className="grid grid-cols-3 gap-6">
        {files?.length === 0 ? (
          <p className="text-gray-400">No files uploaded yet</p>
        ) : (
          files.map((file) => <FileCard key={file._id} file={file} />)
        )}
      </div>
    </MainLayout>
  );
}

export default Dashboard;
