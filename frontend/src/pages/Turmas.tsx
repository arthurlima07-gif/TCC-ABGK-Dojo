// src/pages/Turmas.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import logo from "../assets/abkg_dojo_logo.png";
import "../styles/turmas.css";

interface Turma {
  id: number;
  name: string;
  horario: string;
  alunos: { id: number; name: string; user_code: number }[];
}

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/teacher/turmas");
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao buscar turmas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="turmas-page d-flex justify-content-center align-items-center">
        <div className="text-center text-light">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p>Carregando turmas...</p>
        </div>
      </div>
    );

  return (
    <div className="turmas-page py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <img src={logo} alt="ABGK Dojo" className="turma-logo" />
          <h2 className="fw-bold text-light mt-2">Turmas do Dojo</h2>
          <p className="text-light">Gerencie os alunos de cada turma.</p>
        </div>

        <div className="row g-4">
          {turmas.map((turma) => (
            <div key={turma.id} className="col-md-6 col-lg-4">
              <div className="card turma-card shadow-lg h-100">
                <div className="card-header text-center fw-bold">
                  {turma.name}
                </div>
                <div className="card-body">
                  <p className="fw-semibold text-secondary mb-2">
                    ⏰ Horário: {turma.horario}
                  </p>
                  <p className="fw-semibold mb-3">
                    👥 Alunos:{" "}
                    <span className="text-danger">{turma.alunos.length}</span>
                  </p>

                  <button
                    className="btn btn-outline-dark w-100"
                    onClick={() => setSelectedTurma(turma)}
                  >
                    Ver Aluno(s)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <button
            className="btn btn-outline-warning px-4"
            onClick={() => navigate("/teacher")}
          >
            Voltar ao Painel do Professor
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedTurma && (
        <div className="modal-overlay" onClick={() => setSelectedTurma(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="mb-3">{selectedTurma.name}</h4>
            <p><strong>Horário:</strong> {selectedTurma.horario}</p>
            <p><strong>Alunos:</strong></p>
            {selectedTurma.alunos.length > 0 ? (
              <ul className="list-group">
                {selectedTurma.alunos.map((a) => (
                  <li
                    key={a.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {a.name}
                    <span className="badge bg-dark">#{a.user_code}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted fst-italic mt-2">
                Nenhum aluno nesta turma.
              </p>
            )}
            <button
              className="btn btn-danger mt-4"
              onClick={() => setSelectedTurma(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
