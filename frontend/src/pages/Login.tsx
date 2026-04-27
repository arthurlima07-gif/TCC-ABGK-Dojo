// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/login.css";
import logo from "../assets/abkg_dojo_logo.png";

export default function Login() {
  const [mode, setMode] = useState<"code" | "teacher">("code");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "code") {
        const res = await api.post("/login-code", { code });
        if (res.data && res.data.ok) {
          navigate("/student");
        } else {
          setMsg("Código inválido");
        }
      } else {
        const res = await api.post("/login", { email, password });
        if (res.data && res.data.ok) {
          navigate("/teacher");
        } else {
          setMsg("Credenciais inválidas");
        }
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      const serverMsg = err?.response?.data || err?.message || "Erro na requisição";
      setMsg(typeof serverMsg === "string" ? serverMsg : (serverMsg.error || "Erro no login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-container shadow-lg p-4 rounded bg-white text-dark">
        <div className="text-center mb-4">
          <img src={logo} alt="ABGK Dojo" className="login"/>
          <h2 className="fw-bold text-danger mt-3">
            {mode === "code" ? "Login do Aluno" : "Login do Professor"}
          </h2>
          <p className="text-muted">Acesse o painel do ABGK Dojô</p>
        </div>

        {msg && <div className="alert alert-danger text-center">{msg}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "code" ? (
            <>
              <div className="mb-3">
                <label className="form-label">Código do Aluno:</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="text-end mb-3">
                <Link to="/forgetID" className="text-decoration-none small text-danger">
                  Esqueci meu Código
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Senha:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-danger login-btn" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              className="btn btn-outline-warning login-btn-alt"
              onClick={() => setMode(mode === "code" ? "teacher" : "code")}
            >
              {mode === "code" ? "Sou Professor" : "Sou Aluno (Código)"}
            </button>

            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={() => navigate("/")}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
