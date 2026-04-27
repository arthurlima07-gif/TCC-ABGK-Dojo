// src/routes/student.ts
import express from "express";
import dbPromise from "../db";
import { ensureAuth, ensureRole } from "../midleware/auth";

const router = express.Router();
router.use(ensureAuth, ensureRole("aluno"));

// ===============================
// 📌 GET /student -> dados do aluno logado
// ===============================
router.get("/", async (req, res) => {
  try {
    const uid = (req.session as any).user.id;
    const db = await dbPromise;

    // 🔹 Buscar perfil completo do aluno e turma
    const profile = await db.get(
      `SELECT u.id, u.name, u.user_code, u.email, sp.*, ta.turma_id, t.name AS turma_name
       FROM users u
       LEFT JOIN student_profiles sp ON sp.student_id = u.id
       LEFT JOIN turma_alunos ta ON ta.student_id = u.id
       LEFT JOIN turmas t ON t.id = ta.turma_id
       WHERE u.id = ?`,
      [uid]
    );

    if (!profile) return res.status(404).json({ error: "Aluno não encontrado" });

    // 🔹 Calcular idade
    let idade: number | null = null;
    if (profile.dob) {
      const birth = new Date(profile.dob);
      const today = new Date();
      let calc = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) calc--;
      idade = calc;
    }

    // 🔹 Garante que o mês atual tenha uma mensalidade
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${currentMonth}`;

    // verifica se já existe o mês atual
    const existing = await db.get(
      `SELECT id FROM pagamentos WHERE student_id = ? AND month = ?`,
      [uid, currentMonthKey]
    );

    if (!existing) {
      await db.run(
        `INSERT INTO pagamentos (student_id, month, amount, status)
         VALUES (?, ?, ?, 'pendente')`,
        [uid, currentMonthKey, 120]
      );
    }

    // 🔹 Buscar ficha de treino
    const sheetRow = await db.get(
      "SELECT content, updated_at FROM training_sheets WHERE student_id = ?",
      [uid]
    );

    // 🔹 Buscar apenas a mensalidade do mês atual
    const payments = await db.all(
      `SELECT id, month, amount, status, paid_at
       FROM pagamentos
       WHERE student_id = ? AND month = ?
       ORDER BY month DESC`,
      [uid, currentMonthKey]
    );

    const sheet = sheetRow ? JSON.parse(sheetRow.content) : null;

    res.json({
      ok: true,
      profile: { ...profile, idade, turma: profile.turma_name || "Sem turma definida" },
      sheet,
      updated_at: sheetRow?.updated_at || null,
      payments
    });
  } catch (err: any) {
    console.error("Erro no GET /student:", err);
    res.status(500).json({ error: "Erro ao buscar dados do aluno", details: err.message });
  }
});

// ===============================
// 📌 POST /student/sheet
// ===============================
router.post("/sheet", async (req, res) => {
  try {
    const uid = (req.session as any).user.id;
    const db = await dbPromise;

    const info = await db.get(
      "SELECT training_edit_allowed FROM student_info WHERE student_id = ?",
      [uid]
    );
    if (!info?.training_edit_allowed)
      return res.status(403).json({ error: "Edição não permitida pelo professor" });

    let content = req.body.content;
    if (!content)
      return res.status(400).json({ error: 'Campo "content" obrigatório' });
    if (typeof content !== "string") content = JSON.stringify(content);

    await db.run(
      `INSERT INTO training_sheets (student_id, content) VALUES (?, ?)
       ON CONFLICT(student_id) DO UPDATE SET content=excluded.content, updated_at=datetime('now')`,
      [uid, content]
    );

    res.json({ ok: true });
  } catch (err: any) {
    console.error("Erro no POST /student/sheet:", err);
    res.status(500).json({
      error: "Erro ao salvar ficha",
      details: err.message,
    });
  }
});

// ===============================
// 📌 POST /student/pay/:id – Marcar pagamento como pago
// ===============================
router.post("/pay/:id", async (req, res) => {
  try {
    const uid = (req.session as any).user.id;
    const db = await dbPromise;

    const payment = await db.get(
      "SELECT * FROM pagamentos WHERE id = ? AND student_id = ?",
      [req.params.id, uid]
    );
    if (!payment)
      return res.status(404).json({ error: "Pagamento não encontrado" });
    if (payment.status === "pago")
      return res.json({ message: "Já está pago" });

    // ✅ Marca como pago
    await db.run(
      "UPDATE pagamentos SET status = ?, paid_at = datetime('now') WHERE id = ?",
      ["pago", req.params.id]
    );

    // 🔧 Cria automaticamente o pagamento do próximo mês
    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const existsNext = await db.get(
      "SELECT id FROM pagamentos WHERE student_id = ? AND month = ?",
      [uid, nextMonthKey]
    );

    if (!existsNext) {
      await db.run(
        `INSERT INTO pagamentos (student_id, month, amount, status)
         VALUES (?, ?, ?, 'pendente')`,
        [uid, nextMonthKey, 120]
      );
    }

    res.json({ ok: true, message: "Pagamento Realizado com Sucesso ✅" });
  } catch (err: any) {
    console.error("Erro no POST /student/pay:", err);
    res.status(500).json({
      error: "Erro ao confirmar pagamento",
      details: err.message,
    });
  }
});

// ===============================
// 📌 POST /student/update – Atualizar dados do aluno
// ===============================
router.post("/update", async (req, res) => {
  try {
    const uid = (req.session as any).user.id;
    const db = await dbPromise;

    const {
      phone,
      guardian_phone,
      street,
      house_number,
      neighborhood,
      city,
      state
    } = req.body;

    await db.run(
      `UPDATE student_profiles SET
        phone = ?, guardian_phone = ?, street = ?, house_number = ?,
        neighborhood = ?, city = ?, state = ?
       WHERE student_id = ?`,
      [phone, guardian_phone, street, house_number, neighborhood, city, state, uid]
    );

    res.json({ ok: true, message: "Dados atualizados com sucesso ✅" });
  } catch (err: any) {
    console.error("Erro no POST /student/update:", err);
    res.status(500).json({
      error: "Erro ao atualizar dados",
      details: err.message,
    });
  }
});

export default router;
