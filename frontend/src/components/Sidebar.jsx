import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      navigate("/login");
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 ACTIVE CHECK
  const isActive = (path) => location.pathname === path;

  // 🔥 STYLES
  const active =
    "font-semibold text-purple-600 border-l-4 border-purple-600 pl-2";
  const normal = "text-gray-600 hover:text-purple-600";

  return (
    <div className="w-64 h-screen bg-white border-r p-6 flex flex-col justify-between">
      {/* TOP SECTION */}
      <div>
        <h1
          className="text-xl font-bold mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          MyCloud
        </h1>

        {/* Upload Button */}
        <button
          onClick={() => navigate("/upload")}
          className="w-full bg-purple-600 text-white py-2 rounded-lg mb-6 hover:bg-purple-700"
        >
          Upload New
        </button>

        {/* Menu */}
        <ul className="space-y-4">
          <li
            onClick={() => navigate("/")}
            className={`cursor-pointer ${isActive("/") ? active : normal}`}
          >
            Dashboard
          </li>

          <li
            onClick={() => navigate("/files")}
            className={`cursor-pointer ${isActive("/files") ? active : normal}`}
          >
            My Files
          </li>

          <li
            onClick={() => navigate("/recent")}
            className={`cursor-pointer ${
              isActive("/recent") ? active : normal
            }`}
          >
            Recent
          </li>

          <li
            onClick={() => navigate("/starred")}
            className={`cursor-pointer ${
              isActive("/starred") ? active : normal
            }`}
          >
            Starred
          </li>

          <li
            onClick={() => navigate("/trash")}
            className={`cursor-pointer ${isActive("/trash") ? active : normal}`}
          >
            Trash
          </li>
        </ul>
      </div>

      {/* BOTTOM SECTION */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
