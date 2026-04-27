// src/services/teacher.ts
const API_URL = 'http://localhost:3000';

export async function getAllStudents() {
  const res = await fetch(`${API_URL}/teacher/students`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao buscar lista de alunos');
  return res.json();
}

export async function getStudentDetails(id: number) {
  const res = await fetch(`${API_URL}/teacher/student/${id}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao buscar dados do aluno');
  return res.json();
}

export async function toggleEdit(id: number) {
  const res = await fetch(`${API_URL}/teacher/student/${id}/toggle-edit`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

export async function payMonthForStudent(id: number, month: string, amount: number) {
  const res = await fetch(`${API_URL}/teacher/student/${id}/payment/${month}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
    credentials: 'include'
  });
  return res.json();
}
