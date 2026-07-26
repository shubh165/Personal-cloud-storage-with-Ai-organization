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

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isRefreshRequest
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
      return Promise.reject(refreshError);
    }
  },
);

export default api;
