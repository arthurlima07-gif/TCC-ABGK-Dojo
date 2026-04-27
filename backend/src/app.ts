// src/app.ts
import express, { Express } from "express";
import morgan from "morgan";
import session from "express-session";
import cors from "cors";

import authRoutes from "./routes/auth";   
import registerRoutes from "./routes/register";
import studentRoutes from "./routes/student";
import teacherRoutes from "./routes/teacher";
import turmasRoutes from "./routes/turmas";
import forgetRoutes from "./routes/forget"; 

const app: Express = express();

// 🔹 habilitar CORS
app.use(
  cors({
    origin: "http://localhost:5173", // porta do frontend
    credentials: true,
  })
);

// 🔹 middlewares globais
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 🔹 sessão
app.use(
  session({
    secret: "segredo-super-seguro",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// 🔹 rotas principais
app.use("/", authRoutes);        // login/logout
app.use("/", registerRoutes);    // cadastro de aluno
app.use("/student", studentRoutes);  // páginas do aluno
app.use("/teacher", teacherRoutes);  // páginas do professor
app.use("/turmas", turmasRoutes); // turmas dos alunos
app.use("/", forgetRoutes); // pagina pra recuperar o ID

// 🔹 rota home simples
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  res.send(`
    <h1>Bem-vindo, ${req.session.user.name}!</h1>
    <p>Seu papel: ${req.session.user.role}</p>
    <form method="POST" action="/logout"><button>Sair</button></form>
  `);
});

// 🔹 inicia servidor
app.listen(3000, () =>
  console.log("🚀 Servidor rodando em http://localhost:3000")
);
