import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/cadastro.css';
import './styles/forgetID.css';
import './styles/home.css';
import './styles/login.css';
import './styles/student.css';
import './styles/teacher.css';
import './styles/turmas.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
