// src/routes/turmas.ts
import { Router } from "express";
import dbPromise from "../db";

const router = Router();

// Lista todas as turmas com contagem de alunos
router.get("/list", async (req, res) => {
  try {
    const db = await dbPromise;

    // Busca as turmas
    const turmas = await db.all(`
      SELECT
        t.id,
        t.name,
        COUNT(ta.student_id) AS total_alunos
      FROM turmas t
      LEFT JOIN turma_alunos ta ON ta.turma_id = t.id
      GROUP BY t.id
      ORDER BY t.id ASC
    `);

    res.json({ ok: true, turmas });
  } catch (err: any) {
    console.error("Erro ao listar turmas:", err);
    res.status(500).json({ error: "Erro ao listar turmas" });
  }
});

// Lista os alunos de uma turma específica
router.get("/:id/alunos", async (req, res) => {
  try {
    const db = await dbPromise;
    const turmaId = req.params.id;

    const alunos = await db.all(`
      SELECT u.id, u.name, u.user_code
      FROM users u
      JOIN turma_alunos ta ON ta.student_id = u.id
      WHERE ta.turma_id = ?
    `, [turmaId]);

    res.json({ ok: true, alunos });
  } catch (err: any) {
    console.error("Erro ao buscar alunos da turma:", err);
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
});

export default router;
