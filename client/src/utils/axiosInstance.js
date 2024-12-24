import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8888/api", // Base URL burada tanımlanır
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
