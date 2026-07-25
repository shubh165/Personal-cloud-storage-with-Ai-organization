import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";

function FileDetails() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await api.get(`/files/${id}`);
        setFile(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFile();
  }, [id]);

  useEffect(() => {
    if (file?.mimeType !== "application/pdf") {
      setPdfPreviewUrl("");
      return undefined;
    }

    let objectUrl = "";
    let cancelled = false;

    const loadPdfPreview = async () => {
      try {
        const response = await api.get(`/files/${file._id}/download?inline=true`, {
          responseType: "blob",
        });
        objectUrl = URL.createObjectURL(response.data);

        if (!cancelled) {
          setPdfPreviewUrl(objectUrl);
        }
      } catch (error) {
        console.error("PDF preview error:", error);
      }
    };

    loadPdfPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleDownload = async () => {
    try {
      const response = await api.get(`/files/${file._id}/download`, {
        responseType: "blob",
      });
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.originalName || file.fileName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Unable to download this file. Please try again.");
    }
  };

  if (!file) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">Back</span>
          </button>

          <div>
            <h1 className="text-xl font-semibold">{file.fileName}</h1>
            <p className="text-sm text-gray-500">
              {(file.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
              {new Date(file.createdAt).toISOString().split("T")[0]}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(file.fileUrl);
              alert("Link copied!");
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Share
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Download
          </button>

          <button
            onClick={async () => {
              if (window.confirm("Delete this file?")) {
                await api.delete(`/files/${file._id}`);
                window.location.href = "/files";
              }
            }}
            className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* 🔥 PREVIEW */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow flex items-center justify-center min-h-[500px]">
          {/* IMAGE */}
          {file.mimeType?.startsWith("image") && (
            <img
              src={file.fileUrl}
              alt=""
              className="max-h-[500px] w-full object-contain rounded-lg"
            />
          )}

          {/* PDF */}
          {file.mimeType === "application/pdf" && (
            pdfPreviewUrl ? (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[500px] rounded-lg"
                title="PDF preview"
              />
            ) : (
              <p className="text-gray-400">Loading PDF preview...</p>
            )
          )}

          {/* AUDIO */}
          {file.mimeType?.startsWith("audio") && (
            <audio controls className="w-full">
              <source src={file.fileUrl} />
            </audio>
          )}

          {/* VIDEO */}
          {file.mimeType?.startsWith("video") && (
            <video controls className="max-h-[500px] w-full rounded-lg">
              <source src={file.fileUrl} />
            </video>
          )}

          {/* FALLBACK */}
          {!file.mimeType?.startsWith("image") &&
            file.mimeType !== "application/pdf" &&
            !file.mimeType?.startsWith("audio") &&
            !file.mimeType?.startsWith("video") && (
              <div className="text-center">
                <p className="text-gray-400 mb-4">No preview available</p>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  className="text-purple-600 underline"
                >
                  Open file
                </a>
              </div>
            )}
        </div>

        {/* 🔥 RIGHT PANEL */}
        <div className="bg-white rounded-xl p-6 shadow space-y-6">
          <h2 className="font-semibold text-lg">AI Insights</h2>

          {/* TAGS */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Auto Generated Tags</p>

            <div className="flex flex-wrap gap-2">
              {file.aiTags?.length ? (
                file.aiTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No tags available</p>
              )}
            </div>
          </div>

          {/* SUMMARY */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Executive Summary</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {file.aiSummary || "No summary available"}
            </p>
          </div>

          {/* 🎤 TRANSCRIPT (NEW) */}
          {file.aiTranscript && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Transcript</p>

              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
                {file.aiTranscript}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default FileDetails;
