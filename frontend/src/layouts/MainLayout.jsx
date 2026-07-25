import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children, setFiles }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="flex-shrink-0 border-b bg-white">
          <Navbar setFiles={setFiles} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export default MainLayout;
