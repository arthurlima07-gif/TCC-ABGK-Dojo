// src/db.ts
import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

sqlite3.verbose();

const dbFile = path.resolve(__dirname, "abgk.sqlite");

const dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> = open({
  filename: dbFile,
  driver: sqlite3.Database,
});

(async () => {
  const db = await dbPromise;

  // ==========================
  // TABELAS PRINCIPAIS
  // ==========================
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('aluno', 'professor')),
      user_code INTEGER UNIQUE
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL UNIQUE,
      street TEXT,
      house_number TEXT,
      neighborhood TEXT,
      city TEXT,
      state TEXT,
      phone TEXT,
      guardian_phone TEXT,
      dob TEXT,
      gender TEXT,
      enrollment_date TEXT DEFAULT (date('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pago', 'pendente')) DEFAULT 'pendente',
      paid_at TEXT,
      UNIQUE(student_id, month),
      FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS turmas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      min_age INTEGER,
      max_age INTEGER,
      horario TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS turma_alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turma_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL UNIQUE,
      FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ==========================
  // INSERE TURMAS PADRÃO
  // ==========================
  await db.exec(`
    INSERT OR IGNORE INTO turmas (id, name, min_age, max_age, horario) VALUES
    (1, 'Kids', 4, 6, '14h às 15h'),
    (2, 'Kids2', 7, 9, '15h às 16h'),
    (3, 'Kids3', 10, 13, '16h às 17h'),
    (4, 'Junior', 14, 17, '17:30h às 19h'),
    (5, 'Adulto', 18, NULL, '19h às 21h');
  `);
})();

export default dbPromise;
