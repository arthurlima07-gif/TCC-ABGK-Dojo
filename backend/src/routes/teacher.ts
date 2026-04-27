// src/routes/teacher.ts
import express from "express";
import dbPromise from "../db";
import { ensureAuth, ensureRole } from "../midleware/auth";

const router = express.Router();
router.use(ensureAuth, ensureRole("professor"));

router.get("/students", async (req, res) => {
  try {
    const db = await dbPromise;
    const students = await db.all(`
  SELECT 
    u.id, u.name, u.email, u.user_code,
    sp.dob, -- ✅ adicionado para filtro por nascimento
    sp.street, sp.house_number, sp.neighborhood, sp.city, sp.state, sp.phone, sp.guardian_phone,
    si.training_edit_allowed,
    (
      SELECT COUNT(*) FROM pagamentos p
      WHERE p.student_id = u.id
      AND p.status = 'pendente'
      AND p.month = strftime('%Y-%m', 'now')
    ) AS unpaid_count
  FROM users u
  LEFT JOIN student_info si ON si.student_id = u.id
  LEFT JOIN student_profiles sp ON sp.student_id = u.id
  WHERE u.role = 'aluno'
  ORDER BY u.name
`);
    res.json(students);
  } catch (err: any) {
    console.error("Erro /teacher/students:", err);
    res.status(500).json({ error: "Erro ao listar alunos", details: err.message });
  }
});

router.get("/student/:id", async (req, res) => {
  try {
    const sid = Number(req.params.id);
    const db = await dbPromise;
    const s = await db.get(
      `SELECT u.id, u.name, u.email, u.user_code, si.training_edit_allowed, sp.*
       FROM users u
       LEFT JOIN student_info si ON si.student_id = u.id
       LEFT JOIN student_profiles sp ON sp.student_id = u.id
       WHERE u.id = ? AND u.role = ?`,
      [sid, "aluno"]
    );
    if (!s) return res.status(404).json({ error: "Aluno não encontrado" });

    const sheetRow = await db.get("SELECT content, updated_at FROM training_sheets WHERE student_id = ?", [sid]);
    const payments = await db.all("SELECT id, month, amount, status, paid_at FROM pagamentos WHERE student_id = ? ORDER BY month DESC", [sid]);

    res.json({
      student: s,
      sheet: sheetRow ? JSON.parse(sheetRow.content) : null,
      updated_at: sheetRow?.updated_at || null,
      payments,
    });
  } catch (err: any) {
    console.error("Erro /teacher/student/:id:", err);
    res.status(500).json({ error: "Erro ao buscar aluno", details: err.message });
  }
});

// rest (toggle-edit, pagamentos) mantidos como já tem
router.post("/student/:id/toggle-edit", async (req, res) => {
  try {
    const sid = Number(req.params.id);
    const db = await dbPromise;
    const exist = await db.get("SELECT * FROM student_info WHERE student_id = ?", [sid]);
    if (!exist) {
      await db.run("INSERT INTO student_info (student_id, training_edit_allowed) VALUES (?, ?)", [sid, 1]);
    } else {
      await db.run("UPDATE student_info SET training_edit_allowed = 1 - training_edit_allowed WHERE student_id = ?", [sid]);
    }
    res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao alternar permissão", details: err.message });
  }
});

// DELETE /teacher/student/:id → excluir aluno e dados relacionados
router.delete("/student/:id", async (req, res) => {
  try {
    const sid = Number(req.params.id);
    const db = await dbPromise;

    // verificar se existe
    const aluno = await db.get("SELECT id FROM users WHERE id = ? AND role = 'aluno'", [sid]);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    // deletar (vai apagar em cascata todas as infos relacionadas)
    await db.run("DELETE FROM users WHERE id = ?", [sid]);

    res.json({ ok: true, message: "Aluno excluído com sucesso" });
  } catch (err: any) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro ao excluir aluno", details: err.message });
  }
});

// 📌 GET /teacher/turmas – listar turmas e alunos
router.get("/turmas", async (req, res) => {
  try {
    const db = await dbPromise;

    const turmas = await db.all("SELECT id, name, horario FROM turmas ORDER BY id");

    const result = [];
    for (const turma of turmas) {
      const alunos = await db.all(
        `SELECT u.id, u.name, u.user_code
         FROM turma_alunos ta
         JOIN users u ON ta.student_id = u.id
         WHERE ta.turma_id = ?
         ORDER BY u.name`,
        [turma.id]
      );

      result.push({ ...turma, alunos });
    }

    res.json(result);
  } catch (err) {
    console.error("Erro ao buscar turmas:", err);
    res.status(500).json({ error: "Erro ao buscar turmas" });
  }
});

export default router;
