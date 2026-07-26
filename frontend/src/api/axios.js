import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/users/refresh-token");
    
    const isPublicAuthRequest =
      originalRequest?.url?.includes("/users/login") ||
      originalRequest?.url?.includes("/users/register");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isRefreshRequest ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share one refresh request across simultaneous failed API calls. The
      // backend rotates the refresh token, so parallel refreshes would make
      // each other invalid.
      if (!refreshPromise) {
        refreshPromise = api.post("/users/refresh-token").finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return api(originalRequest);
    } catch (refreshError) {
      // A missing, invalid, or expired refresh token means the session is over.
      // App state is not available in this Axios module, so redirect directly.
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
