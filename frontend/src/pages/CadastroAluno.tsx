// src/pages/CadastroAluno.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { IMaskInput } from "react-imask";
import logo from "../assets/abkg_dojo_logo.png";
import "../styles/cadastro.css";

export default function CadastroAluno() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [sexo, setSexo] = useState("");
  const [dataNasc, setDataNasc] = useState("");

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [telefone, setTelefone] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefoneResp, setTelefoneResp] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/student/register", {
        nome,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        telefone,
        telefoneResp,
        responsavel,
        sexo,
        dataNasc,
      });

      if (res.data.ok) {
        setMsg(
          `✅ Aluno cadastrado!\nCódigo: ${res.data.user_code}\nTurma: ${res.data.turma}`
        );

        setNome("");
        setSexo("");
        setDataNasc("");
        setRua("");
        setNumero("");
        setBairro("");
        setCidade("");
        setEstado("");
        setTelefone("");
        setResponsavel("");
        setTelefoneResp("");
      } else {
        setMsg("⚠️ Erro ao cadastrar.");
      }
    } catch (err: any) {
      console.error(err);
      setMsg("⚠️ Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cadastro-page d-flex justify-content-center align-items-center">
      <div className="cadastro-container shadow-lg p-4 rounded">
        <div className="text-center mb-4">
          <img src={logo} alt="ABGK Dojo" className="cadastro" />
          <h2 className="fw-bold text-danger mt-3">Cadastro de Alunos</h2>
          <p className="text-muted">Preencha os dados do novo aluno</p>
        </div>

        {msg && (
          <div className="alert alert-info white-space-pre-wrap text-center">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome completo:</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Sexo:</label>
              <select
                className="form-select"
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Data de Nascimento:</label>
              <input
                type="date"
                className="form-control"
                value={dataNasc}
                onChange={(e) => setDataNasc(e.target.value)}
                required
              />
            </div>
          </div>

          <h5 className="section-title mt-4">📍 Endereço</h5>

          <div className="row">
            <div className="col-md-8 mb-3">
              <label className="form-label">Rua:</label>
              <input
                type="text"
                className="form-control"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Número:</label>
              <input
                type="text"
                className="form-control"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Bairro:</label>
              <input
                type="text"
                className="form-control"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Cidade:</label>
              <input
                type="text"
                className="form-control"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">UF:</label>
              <input
                type="text"
                maxLength={2}
                className="form-control text-uppercase"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <h5 className="section-title mt-4">📞 Contato</h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Telefone do Aluno:</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={telefone}
                onAccept={(v) => setTelefone(v)}
                className="form-control"
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Telefone do Responsável:</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={telefoneResp}
                onAccept={(v) => setTelefoneResp(v)}
                className="form-control"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Nome do Responsável:</label>
            <input
              type="text"
              className="form-control"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>

          <div className="d-grid gap-2 mt-4">
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Aluno"}
            </button>

            <button
              type="button"
              className="btn btn-outline-warning"
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
