import { defineStore } from "pinia";
import router from "@/router";
import axiosInstance from "@/utils/axiosInstance";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loginUserInformation: {
      username: null,
      password: null,
    },
    registerUserInformation: {
      username: null,
      password: null,
      email: null,
    },
  }),
  getters: {
    getIsAuthenticated() {
      return localStorage.getItem("accessToken") ? true : false;
    },
  },
  actions: {
    async register() {
      return axiosInstance.post("/register", this.registerUserInformation);
    },
    async login() {
      return axiosInstance.post("/login", this.loginUserInformation);
    },
    async logout() {
      try {
        const response = await axiosInstance.post("/logout");
        if (response.status === 204) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // router.push({ name: "login" });
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
});
