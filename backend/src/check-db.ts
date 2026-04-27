// src/check-db.ts
import dbPromise from "./db";

(async () => {
  const db = await dbPromise;

  console.log("=== USERS ===");
  console.log(await db.all("SELECT id, name, email, role FROM users"));

  console.log("=== STUDENT_INFO ===");
  console.log(await db.all("SELECT * FROM student_info"));

  console.log("=== TRAINING_SHEETS ===");
  console.log(await db.all("SELECT * FROM training_sheets"));

  console.log("=== PAGAMENTOS ===");
  console.log(await db.all("SELECT * FROM pagamentos ORDER BY month DESC"));
})();
