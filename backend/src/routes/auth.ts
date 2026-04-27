// src/routes/auth.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import dbPromise from "../db";

const router = Router();

// login professor (email + senha)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE email = ? AND role = ?", [email, "professor"]);
    if (!user) return res.status(401).send("Usuário não encontrado");

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).send("Senha inválida");

    (req.session as any).user = { id: user.id, name: user.name, role: user.role };
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no login");
  }
});

// login aluno via código (user_code)
router.post("/login-code", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).send("Código obrigatório");

    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE user_code = ? AND role = ?", [Number(code), "aluno"]);
    if (!user) return res.status(401).send("Código inválido");

    (req.session as any).user = { id: user.id, name: user.name, role: user.role };
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no login por código");
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
