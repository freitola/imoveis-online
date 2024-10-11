export const login = async (credentials: { email: string; password: string }) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer login');
  }

  const data = await response.json();

  // Verificar token e role no frontend
  console.log('Token recebido no frontend:', data.token);
  console.log('Role recebida no frontend:', data.role);

  // Armazenar token e role no localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role); // Certifique-se de armazenar a role corretamente

  return data;
};

export const register = async (data: { name: string; email: string; password: string; role: string }) => {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao registrar');
  }

  return response.json();
};