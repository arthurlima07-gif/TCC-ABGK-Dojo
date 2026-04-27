// src/routes/forget.ts
import { Router } from "express";
import dbPromise from "../db";

const router = Router();

router.post("/forget-code", async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome obrigatório" });

    const db = await dbPromise;
    const aluno = await db.get(
      "SELECT name, user_code FROM users WHERE name = ? AND role = 'aluno'",
      [nome]
    );

    if (!aluno)
      return res
        .status(404)
        .json({ error: "Aluno não encontrado. Verifique o nome completo." });

    res.json({ ok: true, user_code: aluno.user_code });
  } catch (err: any) {
    console.error("Erro no /forget-code:", err);
    res.status(500).json({ error: "Erro ao buscar código" });
  }
});

export default router;
