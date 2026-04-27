// scripts/createProfessor.ts
import bcrypt from "bcrypt";
import dbPromise from "../src/db";

async function run() {
  const db = await dbPromise;
  const hash = await bcrypt.hash("admin123", 10);
  await db.run("INSERT OR IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)", ["Professor", "admin@abgk.dojo", hash, "professor"]);
  console.log("Professor seed criado (admin@abgk.dojo / admin123)");
}
run().catch(console.error);
