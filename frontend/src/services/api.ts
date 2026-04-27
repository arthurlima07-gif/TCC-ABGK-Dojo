// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // backend rodando em Node
  withCredentials: true,            // 🔹 mantém cookies de sessão
  headers: {
    "Content-Type": "application/json", // garante JSON por padrão
  },
});

// intercepta respostas com erro e mostra no console (debug)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error("API error:", err.response.status, err.response.data);
    } else {
      console.error("API error:", err.message);
    }
    return Promise.reject(err);
  }
);

export default api;
