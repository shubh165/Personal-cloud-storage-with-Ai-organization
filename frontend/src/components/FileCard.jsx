import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

function FileCard({ file, isTrashView = false }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState(file.fileName || file.originalName);
  const [displayName, setDisplayName] = useState(file.fileName || file.originalName);
  const [isFavorite, setIsFavorite] = useState(Boolean(file.isFavorite));

  if (!file) return null;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatSize = (size) => {
    if (!size) return "0 MB";
    return (size / 1024 / 1024).toFixed(1) + " MB";
  };

  const getFileIcon = () => {
    const type = file.mimeType || "";

    if (type.includes("image")) return "🖼️";
    if (type.includes("audio")) return "🎵";
    if (type.includes("video")) return "🎬";
    if (type.includes("pdf")) return "📄";

    return "📁";
  };

  const visibleTags = file.aiTags?.slice(0, 2) || [];
  const remaining = (file.aiTags?.length || 0) - 2;

  const handleFavorite = async (event) => {
    event.stopPropagation();

    try {
      const response = await api.patch(`/files/${file._id}/favorite`);
      setIsFavorite(response.data.data.isFavorite);
    } catch (error) {
      console.error("Favorite update error:", error);
      alert("Unable to update this favorite. Please try again.");
    }
  };

  const handleRestore = async (event) => {
    event.stopPropagation();

    try {
      await api.patch(`/files/${file._id}/restore`);
      window.location.reload();
    } catch (error) {
      console.error("Restore error:", error);
      alert("Unable to restore this file. Please try again.");
    }
  };

  const saveRename = async () => {
    const trimmedName = newName.trim();
    setRenameMode(false);

    if (!trimmedName || trimmedName === displayName) {
      setNewName(displayName);
      return;
    }

    try {
      const response = await api.patch(`/files/${file._id}`, {
        fileName: trimmedName,
      });
      const updatedName = response.data.data.fileName;
      setDisplayName(updatedName);
      setNewName(updatedName);
    } catch (error) {
      setNewName(displayName);
      console.error("Rename error:", error);
      alert(error.response?.data?.message || "Unable to rename this file.");
    }
  };

  return (
    <div
      onClick={() => {
        if (isTrashView) {
          alert("Restore this file before opening it.");
          return;
        }
        navigate(`/file/${file._id}`);
      }}
      className={`group relative bg-white p-6 rounded-xl shadow transition ${
        isTrashView ? "cursor-not-allowed" : "cursor-pointer hover:shadow-lg"
      }`}
    >
      {!isTrashView && (
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`absolute left-3 top-3 rounded-full p-2 text-lg leading-none transition ${
          isFavorite
            ? "bg-amber-100 text-amber-500"
            : "text-gray-400 hover:bg-gray-100 hover:text-amber-500"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>
      )}

      {/* 3 DOT MENU */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg z-10">
            {/* Rename */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewName(displayName);
                setRenameMode(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Rename
            </button>

            {/* Share */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(file.fileUrl);
                alert("Link copied!");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Share
            </button>

            {!isTrashView && <button
              onClick={async (e) => {
                e.stopPropagation();

                if (!window.confirm("Delete this file?")) return;

                await api.delete(`/files/${file._id}`, {
                  withCredentials: true,
                });

                window.location.reload();
              }}
              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              Move to Trash
            </button>}
          </div>
        )}
      </div>

      {/* FILE ICON */}
      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg text-2xl mb-4">
        {getFileIcon()}
      </div>

      {/*  FILE NAME / RENAME */}
      {renameMode ? (
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={saveRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setNewName(displayName);
              setRenameMode(false);
            }
          }}
          className="border px-2 py-1 rounded w-full mb-1"
        />
      ) : (
        <h3 className="font-semibold mb-1 truncate">
          {displayName}
        </h3>
      )}

      {/* FILE INFO */}
      <p className="text-gray-500 text-sm mb-3">
        {formatSize(file.fileSize)} • {formatDate(file.createdAt)}
      </p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}

        {remaining > 0 && (
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            +{remaining}
          </span>
        )}
      </div>

      {isTrashView && (
        <button
          type="button"
          onClick={handleRestore}
          className="mt-4 w-full rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200"
        >
          Restore File
        </button>
      )}
    </div>
  );
}

export default FileCard;
