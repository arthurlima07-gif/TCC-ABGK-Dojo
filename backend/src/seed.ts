// src/seed.ts
import dbPromise from './db';
import bcrypt from 'bcrypt';

function getLastMonths(n: number) {
  const arr: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    arr.push(`${y}-${m}`);
  }
  return arr;
}

(async () => {
  const db = await dbPromise;
  const row = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM users');
  if (row && row.c > 0) {
    console.log('Seed pulado: já existem usuários.');
    return;
  }

  const hashProfessor = await bcrypt.hash('admin123', 10);
  const hashAluno = await bcrypt.hash('aluno123', 10);

  const resT = await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Sensei Admin', 'admin@abgk.dojo', hashProfessor, 'professor']
  );
  const resS = await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Aluno Demo', 'aluno@abgk.dojo', hashAluno, 'aluno']
  );

  // obter IDs (res.lastID funciona aqui)
  const teacherId = (resT && (resT as any).lastID) || (await db.get('SELECT id FROM users WHERE email = ?', ['admin@abgk.dojo'])).id;
  const studentId = (resS && (resS as any).lastID) || (await db.get('SELECT id FROM users WHERE email = ?', ['aluno@abgk.dojo'])).id;

  // cria student_info e permite edição para demo
  await db.run('INSERT INTO student_info (student_id, teacher_id, training_edit_allowed) VALUES (?, ?, ?)', [
    studentId,
    teacherId,
    1,
  ]);

  // ficha de treino demo
  const sheet = {
    objetivos: 'Ganho de condicionamento e técnica básica',
    treinos: [
      { dia: 'Segunda', exercicios: ['Aquecimento 10min', 'Kihon 3x', 'Kata Heian Shodan 5x'] },
      { dia: 'Quarta', exercicios: ['Aquecimento 10min', 'Kihon 3x', 'Kumite leve 10min'] },
    ],
  };
  await db.run('INSERT INTO training_sheets (student_id, content) VALUES (?, ?)', [studentId, JSON.stringify(sheet)]);

  // cria 3 mensalidades pendentes
  const months = getLastMonths(3);
  const ins = await db.prepare('INSERT OR IGNORE INTO pagamentos (student_id, month, amount, status) VALUES (?, ?, ?, ?)');
  for (const m of months) {
    await db.run('INSERT OR IGNORE INTO pagamentos (student_id, month, amount, status) VALUES (?, ?, ?, ?)', [
      studentId,
      m,
      120,
      'pendente',
    ]);
  }

  console.log('Seed criado ✅ (admin@abgk.dojo / admin123) (aluno@abgk.dojo / aluno123)');
})();
