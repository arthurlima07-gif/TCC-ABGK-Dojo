// src/routes/register.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import dbPromise from "../db";

const router = Router();

// Gera código 5 dígitos único
async function gerarCodigoAluno(db: any): Promise<number> {
  while (true) {
    const code = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
    const row = await db.get("SELECT 1 FROM users WHERE user_code = ?", [code]);
    if (!row) return code;
  }
}

// calcular idade
function calcularIdade(dob: string | null): number | null {
  if (!dob) return null;
  const nasc = new Date(dob);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function determinarTurma(idade: number | null) {
  if (idade === null) return null;
  if (idade >= 4 && idade <= 6) return "Kids";
  if (idade >= 7 && idade <= 9) return "Kids2";
  if (idade >= 10 && idade <= 13) return "Kids3";
  if (idade >= 14 && idade <= 17) return "Junior";
  return "Adulto";
}

router.post("/student/register", async (req: Request, res: Response) => {
  try {
    // aceita tanto nomes em pt quanto en para facilitar o frontend
    const {
      nome,
      rua, street,
      numero, house_number,
      bairro, neighborhood,
      cidade, city,
      estado, state,
      telefone, phone,
      telefoneResp, guardian_phone,
      responsavel, emergency_contact,
      sexo, dataNasc
    } = req.body;

    if (!nome || !dataNasc) return res.status(400).json({ error: "Nome e dataNasc obrigatórios" });

    const db = await dbPromise;

    // 1 - gera código e senha inicial (hash)
    const user_code = await gerarCodigoAluno(db);
    const password_hash = await bcrypt.hash(String(user_code), 10);

    // 2 - inserir usuário na tabela users
    const ins = await db.run(
      `INSERT INTO users (name, email, password_hash, role, user_code)
       VALUES (?, ?, ?, 'aluno', ?)`,
      [nome, `${user_code}@abgk.dojo`, password_hash, user_code]
    );
    const studentId = ins.lastID;

    // 3 - mapear campos de endereço/telefone
    const finalStreet = street ?? rua ?? null;
    const finalHouse = house_number ?? numero ?? null;
    const finalNeighborhood = neighborhood ?? bairro ?? null;
    const finalCity = city ?? cidade ?? null;
    const finalState = state ?? estado ?? null;
    const finalPhone = phone ?? telefone ?? null;
    const finalGuardianPhone = guardian_phone ?? telefoneResp ?? emergency_contact ?? null;

    await db.run(
      `INSERT INTO student_profiles (
         student_id, street, house_number, neighborhood, city, state,
         phone, guardian_phone, dob, gender, enrollment_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))`,
      [
        studentId,
        finalStreet,
        finalHouse,
        finalNeighborhood,
        finalCity,
        finalState,
        finalPhone,
        finalGuardianPhone,
        dataNasc,
        sexo ?? null
      ]
    );

    // 4 - determinar turma por idade (e vincular)
    const idade = calcularIdade(dataNasc);
    const turmaNome = determinarTurma(idade);

    let turmaId: number | null = null;
    if (turmaNome) {
      const t = await db.get("SELECT id FROM turmas WHERE name = ?", [turmaNome]);
      if (t) turmaId = t.id;
      else {
        const tIns = await db.run("INSERT INTO turmas (name, min_age, max_age, horario) VALUES (?, ?, ?, ?)",
          [turmaNome, null, null, "a definir"]);
        turmaId = tIns.lastID;
      }

      // tentar inserir na turma_alunos — usa student_id; se o banco for antigo (coluna 'aluno_id'), tenta fallback
      try {
        await db.run("INSERT OR IGNORE INTO turma_alunos (turma_id, student_id) VALUES (?, ?)", [turmaId, studentId]);
      } catch (err: any) {
        // fallback para esquemas antigos que tenham coluna 'aluno_id'
        if (err.message && err.message.includes("no such column")) {
          await db.run("INSERT OR IGNORE INTO turma_alunos (turma_id, aluno_id) VALUES (?, ?)", [turmaId, studentId]);
        } else throw err;
      }
    }

    // 5 - criar 3 pagamentos pendentes (últimos 3 meses)
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      // tenta usar student_id; se falhar por coluna antiga, tenta aluno_id
      try {
        await db.run(
          `INSERT OR IGNORE INTO pagamentos (student_id, month, amount, status)
           VALUES (?, ?, ?, ?)`,
          [studentId, m, 120, "pendente"]
        );
      } catch (err: any) {
        if (err.message && err.message.includes("no such column")) {
          await db.run(
            `INSERT OR IGNORE INTO pagamentos (aluno_id, month, amount, status)
             VALUES (?, ?, ?, ?)`,
            [studentId, m, 120, "pendente"]
          );
        } else throw err;
      }
    }

    res.json({
      ok: true,
      user_code,
      turma: turmaNome,
      idade
    });
  } catch (err: any) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro ao cadastrar aluno", details: err.message });
  }
});

export default router;
