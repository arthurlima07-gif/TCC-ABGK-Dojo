// src/pages/Student.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/student.css";
import logo from "../assets/abkg_dojo_logo.png";
import { IMaskInput } from "react-imask";

interface StudentProfile {
  name: string;
  user_code: string;
  gender: string;
  dob: string;
  idade?: number;
  street?: string;
  house_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  guardian_phone?: string;
  turma?: string;
}

interface Payment {
  id: number;
  month: string;
  amount: number;
  status: string;
  paid_at?: string;
}

export default function Student() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [msg, setMsg] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Edit modal
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    guardian_phone: "",
    street: "",
    house_number: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get("/student");
        if (res.data.ok) {
          setProfile(res.data.profile);
          setPayments(res.data.payments || []);

          const p = res.data.profile;
          setForm({
            phone: p.phone || "",
            guardian_phone: p.guardian_phone || "",
            street: p.street || "",
            house_number: p.house_number || "",
            neighborhood: p.neighborhood || "",
            city: p.city || "",
            state: p.state || "",
          });
        }
      } catch (err) {
        console.error(err);
        setMsg("Erro ao carregar dados do aluno");
      }
    }
    loadData();
  }, []);

  async function handlePay(id: number) {
    try {
      const res = await api.post(`/student/pay/${id}`);
      if (res.data.ok) {
        setMsg("✅ Pagamento confirmado!");
        setConfirmId(null);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error(err);
      setMsg("Erro ao confirmar pagamento");
    }
  }

  async function handleUpdate() {
    try {
      const res = await api.post("/student/update", form);
      if (res.data.ok) {
        setMsg("✅ Dados atualizados com sucesso!");
        setEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error(err);
      setMsg("Erro ao atualizar dados");
    }
  }

  if (!profile)
    return (
      <div className="student-page d-flex justify-content-center align-items-center">
        <div className="text-center text-light">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p>Carregando informações...</p>
        </div>
      </div>
    );

  return (
    <div className="student-page py-5">
      <div className="container">
        <div className="text-center mb-4">
          <img src={logo} alt="ABGK Dojo" style={{ height: 130 }} />
          <h2 className="fw-bold text-light mt-2">Painel do Aluno</h2>
          <p className="text-light">
            Olá, <strong>{profile.name}</strong> — Código:{" "}
            <span className="text-warning">{profile.user_code}</span>
          </p>
        </div>

        {msg && (
          <div className="alert alert-info text-center white-space-pre-wrap py-2">
            {msg}
          </div>
        )}

        {/* Dados Pessoais */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-danger text-light fw-bold">
                Dados Pessoais
              </div>
              <div className="card-body">
                <p><strong>Sexo:</strong> {profile.gender}</p>
                <p><strong>Data de Nascimento:</strong> {profile.dob}</p>
                <p><strong>Idade:</strong> {profile.idade} anos</p>
                <p><strong>Turma:</strong> {profile.turma}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-danger text-light fw-bold">
                Endereço
              </div>
              <div className="card-body">
                <p>
                  <strong>Rua:</strong> {profile.street}, {profile.house_number}
                </p>
                <p>
                  <strong>Bairro:</strong> {profile.neighborhood}
                </p>
                <p>
                  <strong>Cidade:</strong> {profile.city}/{profile.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-danger text-light fw-bold">
            Contato
          </div>
          <div className="card-body row">
            <div className="col-md-6">
              <p><strong>Telefone do Aluno:</strong> {profile.phone}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Telefone do Responsável:</strong> {profile.guardian_phone}</p>
            </div>
          </div>
        </div>

        {/* Mensalidades */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-danger text-light fw-bold">
            Mensalidade Atual
          </div>
          <div className="card-body">
            {payments.length === 0 ? (
              <p className="text-muted">Nenhum pagamento registrado.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <strong>{p.month}</strong> — R$ {p.amount.toFixed(2)}
                  </span>
                  {p.status === "pago" ? (
                    <span className="badge bg-success">Pago ✅</span>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setConfirmId(p.id)}
                    >
                      Pagar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-outline-light" onClick={() => navigate("/")}>
            Voltar à Página Inicial
          </button>

          <button
            className="btn btn-outline-warning ms-3"
            onClick={() => setEditing(true)}
          >
            Editar Meus Dados
          </button>
        </div>
      </div>

      {/* Confirmação */}
      {confirmId !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            color: "black",
          }}
          onClick={() => setConfirmId(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-3">Confirmar Pagamento</h5>
            <p>
              Deseja confirmar o pagamento de <strong>R$ 120,00</strong> referente à mensalidade atual?
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-success" onClick={() => handlePay(confirmId)}>
                Confirmar
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP — ROLÁVEL */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={() => setEditing(false)}
        >
          <div
            style={{
              background: "#222",
              padding: "1.5rem",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="btneditardados">Editar Meus Dados</h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
            >
              <div className="row g-3">

                {/* TELEFONE ALUNO - CORRIGIDO */}
                <div className="col-md-6">
                  <label>Telefone</label>
                  <IMaskInput
                    mask="(00) 00000-0000"
                    value={form.phone}
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    onAccept={(v) => setForm({ ...form, phone: v })}
                  />
                </div>

                {/* TELEFONE RESPONSÁVEL - CORRIGIDO */}
                <div className="col-md-6">
                  <label>Telefone do Responsável</label>
                  <IMaskInput
                    mask="(00) 00000-0000"
                    value={form.guardian_phone}
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    onAccept={(v) =>
                      setForm({ ...form, guardian_phone: v })
                    }
                  />
                </div>

                <div className="col-md-8">
                  <label>Rua</label>
                  <input
                    className="form-control"
                    value={form.street}
                    onChange={(e) =>
                      setForm({ ...form, street: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label>Número</label>
                  <input
                    className="form-control"
                    value={form.house_number}
                    onChange={(e) =>
                      setForm({ ...form, house_number: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label>Bairro</label>
                  <input
                    className="form-control"
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm({ ...form, neighborhood: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label>Cidade</label>
                  <input
                    className="form-control"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label>Estado</label>
                  <input
                    className="form-control"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button className="btn btn-success" type="submit">
                  Salvar
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
