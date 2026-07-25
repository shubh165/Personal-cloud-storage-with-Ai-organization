import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/users/login", {
        username: identifier,
        email: identifier,
        password,
      }, { withCredentials: true });

      console.log(res.data);

      navigate("/");
      window.location.href = "/";
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen grid grid-cols-2">
      {/* LEFT SIDE */}

      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex flex-col justify-center p-16">
        <h1 className="text-4xl font-bold mb-4">
          Organize your digital life with intelligence.
        </h1>

        <p className="text-lg opacity-90">
          MyCloud uses advanced AI to automatically tag, summarize, and
          categorize your files so you never have to organize manually again.
        </p>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-xl shadow-md w-[420px]"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>

          <p className="text-gray-500 mb-6">
            Enter your credentials to access your workspace.
          </p>

          {/* EMAIL OR USERNAME */}

          <div className="mb-4">
            <label className="block mb-1 font-medium">Email or Username</label>

            <input
              type="text"
              placeholder="name@example.com"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* PASSWORD */}

          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>

            <input
              type="password"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* REMEMBER */}

          <div className="flex items-center mb-6">
            <input type="checkbox" className="mr-2" />

            <span className="text-sm">Remember me for 30 days</span>
          </div>

          {/* BUTTON */}

          <button className="cursor-pointer w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
            Sign In →
          </button>

          {/* REGISTER */}

          <p className="text-center text-sm mt-6">
            Don't have an account?
            <span
              onClick={() => navigate("/register")}
              className="text-purple-600 cursor-pointer ml-1"
            >
              Sign up for free
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
