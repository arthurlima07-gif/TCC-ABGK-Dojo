// src/pages/ForgetID.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/abkg_dojo_logo.png";
import "../styles/forgetID.css";

export default function ForgetID() {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCodigo(null);
    setLoading(true);

    try {
      const res = await api.post("/forget-code", { nome });
      if (res.data.ok) setCodigo(res.data.user_code);
    } catch (err: any) {
      setErro(err.response?.data?.error || "Erro ao buscar código");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forget-page">
      <div className="forget-container">
        <img src={logo} alt="ABGK Dojô" />
        <h3> Recuperar Código do Aluno</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Nome Completo</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn forget-btn w-100"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar Código"}
          </button>
        </form>

        {erro && <div className="alert alert-danger mt-3">{erro}</div>}
        {codigo && (
          <div className="alert alert-success mt-3 text-center">
            Código do aluno: <strong>{codigo}</strong>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => navigate("/login")}
            className="btn forget-btn-secondary w-100"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}
