// src/services/auth.ts
const API_URL = 'http://localhost:3000';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password }),
    credentials: 'include' // importante para cookies de sessão
  });
  if (!res.ok) throw new Error('Falha no login');
  return res.text(); // backend faz redirect
}

export async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}
