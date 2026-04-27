// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/home.css';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import CadastroAluno from "./pages/CadastroAluno";
import Turmas from "./pages/Turmas";
import ForgetID from "./pages/ForgetID";

import logo from "./assets/abkg_dojo_logo.png";

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar moderna e simplificada */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              src={logo}
              alt="ABGK Dojô Logo"
              height="45"
              className="me-2"
              style={{ borderRadius: "6px" }}
            />
            <span className="fw-bold text-dark fs-5">ABGK Dojô</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Início</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cadastro">Cadastro</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Rotas — Home ocupa tela inteira, outras ficam em container */}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Páginas com layout normal */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroAluno />} />
        <Route path="/forgetID" element={<ForgetID />} />

        {/* Rotas protegidas */}
       <Route path="/student" element={<Student />} />
       <Route path="/teacher" element={<Teacher />} />
       <Route path="/turmas" element={<Turmas />} />
      </Routes>

      {/* Rodapé fixo */}
      <footer className="footer-dojo text-center py-3 text-muted big">
         © {new Date().getFullYear()} ABGK Dojô — Disciplina. Técnica. Superação.
      </footer>
    </BrowserRouter>
  );
}
