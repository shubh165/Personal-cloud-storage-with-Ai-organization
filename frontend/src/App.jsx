import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api/axios";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import FileDetails from "./pages/FileDetails";
import Recent from "./pages/Recent";
import Starred from "./pages/Starred";
import Trash from "./pages/Trash";

function App() {
  const [isAuth, setIsAuth] = useState(null); // null = loading

  // Check authentication from backend
  const checkAuth = async () => {
    try {
      await api.get("/users/me");
      setIsAuth(true);
    } catch (err) {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Prevent flicker while checking auth
  if (isAuth === null) return <div>Loading...</div>;

  // Private Route
  const PrivateRoute = ({ children }) => {
    return isAuth ? children : <Navigate to="/login" />;
  };

  // Public Route
  const PublicRoute = ({ children }) => {
    return !isAuth ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />
        <Route
          path="/files"
          element={
            <PrivateRoute>
              <MyFiles />
            </PrivateRoute>
          }
        />
        <Route
          path="/recent"
          element={
            <PrivateRoute>
              <Recent />
            </PrivateRoute>
          }
        />
        <Route
          path="/starred"
          element={
            <PrivateRoute>
              <Starred />
            </PrivateRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <PrivateRoute>
              <Trash />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/file/:id"
          element={
            <PrivateRoute>
              <FileDetails />
            </PrivateRoute>
          }
        />
        ;{/* Fallback */}
        <Route
          path="*"
          element={isAuth ? <Navigate to="/" /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;