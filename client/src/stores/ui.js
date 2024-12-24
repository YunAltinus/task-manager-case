import { defineStore } from "pinia";
import router from "@/router";

export const useUiStore = defineStore("ui", {
  state: () => ({
    isLoading: false,
    isError: false,
    errorMessage: null,
  }),
  getters: {
  },
  actions: {
    formatDate(date) {
      const parsedDate = new Date(date);

      const day = String(parsedDate.getDate()).padStart(2, '0');
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const year = String(parsedDate.getFullYear());

      return `${day}/${month}/${year}`;
    }
  },
});
