// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/abkg_dojo_logo.png";
import fundoTemplo from "../assets/fundo-templo.png";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      {/* HERO SECTION (Top Red) */}
      <section className="home-hero d-flex flex-column justify-content-center align-items-center text-center text-white">
        <img src={logo} alt="Logo Dojô" className="home-logo mb-4" />
        <h1 className="home-title fw-bold text-shadow">DISCIPLINA. TÉCNICA. SUPERAÇÃO.</h1>
        <p className="home-subtitle mb-4 text-shadow">
          Gerenciamento dos alunos, turmas e pagamentos do ABGK Dojô.
        </p>

        <div className="mt-3">
          <Link to="/login" className="btn btn-dark btn-lg home-btn me-2">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn btn-outline-light btn-lg home-btn">
            Cadastre-se
          </Link>
        </div>
      </section>

      {/* BLACK SECTION WITH TEMPLE BG */}
      <section
        className="home-info-section text-center text-white d-flex flex-column justify-content-center"
        style={{ backgroundImage: `url(${fundoTemplo})` }}
      >
        <div className="black-overlay"></div>
        <div className="content position-relative">
          <h2 className="fw-bold mb-3 text-shadow">Bem-vindo ao ABGK Dojô</h2>
          <p className="mx-auto fs-5" style={{ maxWidth: 700 }}>
            Selecione uma das opções acima para acessar o painel de aluno ou realizar o
            cadastro de um novo praticante. Gerencie treinos, pagamentos e avanços de forma
            prática e eficiente.
          </p>
        </div>
      </section>
    </>
  );
}
