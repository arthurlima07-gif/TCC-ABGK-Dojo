// src/pages/Teacher.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/teacher.css";
import logo from "../assets/abkg_dojo_logo.png";

interface Student {
  id: number;
  name: string;
  email: string;
  training_edit_allowed: number;
  unpaid_count: number;
  dob?: string;
}

export default function Teacher() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("alfabetica");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const res = await api.get("/teacher/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Erro ao carregar alunos");
    } finally {
      setLoading(false);
    }
  }

  async function toggleEdit(studentId: number) {
    try {
      await api.post(`/teacher/student/${studentId}/toggle-edit`);
      await loadStudents();
    } catch (err) {
      console.error(err);
      setMsg("Erro ao alterar permissão");
    }
  }

  async function deleteStudent(studentId: number) {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return;
    try {
      await api.delete(`/teacher/student/${studentId}`);
      setMsg("✅ Aluno excluído com sucesso!");
      await loadStudents();
    } catch (err) {
      console.error(err);
      setMsg("Erro ao excluir aluno");
    }
  }

  const filteredStudents = students
    .filter((s) => {
      if (filter === "pendentes") return s.unpaid_count > 0;
      if (filter === "nascimento") return !!s.dob;
      return true;
    })
    .filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "alfabetica") return a.name.localeCompare(b.name);
      if (filter === "nascimento") return new Date(a.dob || "").getTime() - new Date(b.dob || "").getTime();
      if (filter === "pendentes") return b.unpaid_count - a.unpaid_count;
      return 0;
    });

  if (loading)
    return (
      <div className="teacher-page d-flex justify-content-center align-items-center">
        <div className="text-center text-light">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p>Carregando lista de alunos...</p>
        </div>
      </div>
    );

  return (
    <div className="teacher-page py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <img src={logo} alt="ABGK Dojo" className="teacher-logo" />
          <h2 className="fw-bold text-light mt-2">Painel do Professor</h2>
          <p className="text-light">
            Gerencie os alunos, permissões e pagamentos.
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card-totalalunos">
              <div className="card-body text-center">
                <h5 className="card-title">Total de Alunos</h5>
                <br />
                <p className="display-6 fw-bold">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card-mensalidades">
              <div className="card-body text-center">
                <h5 className="card-title">Mensalidades Pendentes</h5>
                <p className="display-6 fw-bold">
                  {students.reduce((acc, s) => acc + s.unpaid_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {msg && <div className="alert alert-info text-center">{msg}</div>}

        {/* Ações */}
        

        {/* Filtro e busca */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Buscar Alunos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filtragemalunos"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="alfabetica"> Ordem Alfabética</option>
            <option value="nascimento"> Data de Nascimento</option>
            <option value="pendentes"> Mensalidades Pendentes</option>
          </select>
        </div>

        {/* Tabela de alunos */}
        <div className="card shadow-lg">
          <div className="card-header bg-danger text-light fw-bold">
            Alunos Cadastrados
          </div>
          <div className="table-container">
            <table className="table align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th>Código</th>
                  <th className="text-center">Edição</th>
                  <th className="text-center">Mensalidades</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td className="text-center">
                      <button
                        className={`btn btn-sm ${
                          s.training_edit_allowed
                            ? "btn-success"
                            : "btn-secondary"
                        }`}
                        onClick={() => toggleEdit(s.id)}
                      >
                        {s.training_edit_allowed ? "Permitido" : "Bloqueado"}
                      </button>
                    </td>
                    <td className="text-center">
                      {s.unpaid_count > 0 ? (
                        <span className="badge bg-danger">
                          {s.unpaid_count} Pendente(s)
                        </span>
                      ) : (
                        <span className="badge bg-success">Tudo em dia ✅</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger me-2"
                        onClick={() => deleteStudent(s.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="botaoverturmas"
            onClick={() => navigate("/turmas")}
          >
            🥋 Ver Turmas
          </button>
        </div>

        <br />
        <button
          className="botaosair-professor"
          onClick={() => navigate("/")}
        >
          Voltar à Página Inicial
        </button>
      </div>
    </div>
  );
}
