import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      if (avatar) {
        formData.append("avtar", avatar);
      }

      const res = await api.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Registration successful");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="h-screen grid grid-cols-2">
      {/* LEFT SECTION */}

      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex flex-col justify-center p-16">
        <h1 className="text-4xl font-bold mb-4">Store your files smarter.</h1>

        <p className="text-lg opacity-90">
          MyCloud uses AI to organize your files automatically so you never lose
          anything again.
        </p>
      </div>

      {/* RIGHT SECTION */}

      <div className="flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-xl shadow-md w-[420px]"
        >
          <h2 className="text-3xl font-bold mb-2">Create account</h2>

          <p className="text-gray-500 mb-6">
            Sign up to start organizing your files.
          </p>

          {/* FULL NAME */}

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          {/* USERNAME */}

          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* AVATAR UPLOAD */}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>

            <div className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  +
                </div>
              )}

              <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                Upload Avatar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON */}

          <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition">
            Create Account
          </button>

          {/* LOGIN LINK */}

          <p className="text-center text-sm mt-6">
            Already have an account?
            <span
              onClick={() => navigate("/login")}
              className="text-purple-600 cursor-pointer ml-1"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
