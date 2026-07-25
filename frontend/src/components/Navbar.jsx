import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Navbar({ setFiles }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // =========================
  // 🔍 SEARCH FUNCTION
  // =========================
  const handleSearch = async (value) => {
    try {
      if (!value) return;

      const res = await api.get(`/files/search?query=${value}`, {
        withCredentials: true,
      });

      // setFiles(res.data.data); // update file list
      setFiles(res.data.results); 
    } catch (error) {
      console.error("Search error:", error.message);
    }
  };

  // 🔁 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // =========================
  // 👤 GET LOGGED-IN USER
  // =========================
  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me", {
        withCredentials: true,
      });

      setUser(res.data.data);
    } catch (error) {
      console.error("User fetch error:", error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // =========================
  // 🚪 LOGOUT
  // =========================
  const handleLogout = async () => {
    await api.post("/users/logout");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="bg-white border-b p-4 flex justify-between items-center">
      {/* 🔍 SEARCH */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-10 py-2 w-96"
        />
        <span className="absolute left-3 top-2 text-gray-400">🔍</span>
      </div>

      {/* 👤 USER SECTION */}
      <div className="relative flex items-center gap-4">
        <span className="font-medium">{user?.fullName || "User"}</span>

        <img
          src={user?.avtar || "https://i.pravatar.cc/40"}
          className="w-9 h-9 rounded-full cursor-pointer"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-40">
            <button
              onClick={() => navigate("/profile")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Profile
            </button>

            <button
              onClick={() => navigate("/change-password")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
