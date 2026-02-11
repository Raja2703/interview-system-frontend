import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  timeout: 0,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    // Get the Access Token
    const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor (with Refresh Logic) ---
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url.includes("/login/") || originalRequest.url.includes("/signup/")) {
      return Promise.reject(error);
    }

    // Check if error is 401 AND we haven't tried to refresh for this request yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
      // Optional: Add specific code check if your backend distinguishes 401 types
      // && error.response.data?.code === "token_not_valid"
    ) {
      originalRequest._retry = true; // Mark this request so we don't loop infinitely

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 1. Call the Refresh Endpoint
        // We use the base 'axios' here (or a separate instance) to avoid 
        // using the interceptors of 'apiClient' for this specific call.
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        // 2. Get the new Access Token from response
        const newAccessToken = response.data.access;

        // 3. Update Storage
        sessionStorage.setItem("accessToken", newAccessToken);
        // If your backend rotates refresh tokens, update that too:
        // if (response.data.refresh) sessionStorage.setItem("refreshToken", response.data.refresh);

        // 4. Update the Authorization header for the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 5. Update default headers for future requests
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // 6. Retry the original request
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed (token expired or invalid) -> Logout user
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");

          window.location.href = "/login?session_expired=true";
        }
        return Promise.reject(refreshError);
      }
    }

    // Return other errors as usual
    return Promise.reject(error);
  }
);

export default apiClient;