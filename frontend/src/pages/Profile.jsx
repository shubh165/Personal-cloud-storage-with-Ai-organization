import { useState } from "react";
import api from "../api/axios";

function Profile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async () => {
    const response = await api.patch("/users/update-account", {
      fullName,
      email,
    });
    alert(response.data.message);
  };

  const updateAvatar = async () => {
    const formData = new FormData();
    formData.append("avtar", avatar);

    await api.patch("/users/update-avatar", formData);
    alert("Avatar updated");
  };

  const changePassword = async () => {
    try {
      const response = await api.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      // Success message
      alert(response.data.message);
    } catch (error) {
      // Show backend error message
      const message = error.response?.data?.message;

      if (message) {
        alert(message); // This will show: "New password must be different"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-10 w-[420px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Profile Settings
        </h1>

        <div className="flex flex-col items-center mb-6">
          {/* Avatar Preview */}

          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover mb-3 border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              Avatar
            </div>
          )}

          {/* Hidden File Input */}

          <input
            type="file"
            accept="image/*"
            id="avatarUpload"
            className="hidden"
            onChange={handleAvatarChange}
          />

          {/* Custom Upload Button */}

          <label
            htmlFor="avatarUpload"
            className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-2"
          >
            Upload Image
          </label>

          <button
            onClick={updateAvatar}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Change Avatar
          </button>
        </div>

        {/* Name + Email */}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded-lg p-3 mb-3 focus:ring-2 focus:ring-purple-500 outline-none"
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={updateProfile}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 mb-6"
        >
          Update Profile
        </button>

        {/* Password */}

        <input
          type="password"
          placeholder="Current Password"
          className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-400 outline-none"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-400 outline-none"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={changePassword}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

export default Profile;
