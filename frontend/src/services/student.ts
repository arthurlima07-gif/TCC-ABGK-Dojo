// src/services/student.ts
const API_URL = 'http://localhost:3000';

export async function getStudentData() {
  const res = await fetch(`${API_URL}/student`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao buscar dados do aluno');
  return res.json();
}

export async function updateStudentSheet(content: any) {
  const res = await fetch(`${API_URL}/student/sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    credentials: 'include'
  });
  return res.json();
}

export async function payMonth(month: string, amount: number) {
  const res = await fetch(`${API_URL}/student/payment/${month}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
    credentials: 'include'
  });
  return res.json();
}
