'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './auth.module.css';  // Importando estilos do arquivo CSS modular

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Verifica se a role está no localStorage
    if (token && role) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    const data = isLogin
      ? { email, password }
      : { name, email, password, role: 'user' };

    try {
      const response = await axios.post(endpoint, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        // Armazena o token e a role no localStorage
        const { token, role } = response.data; // Extraindo token e role
        localStorage.setItem('token', token);
        localStorage.setItem('role', role); // Certifique-se de armazenar a role
        console.log("Role recebida no frontend:", role); // Verificar no console

        setIsAuthenticated(true);

        // Exibe o diálogo de confirmação
        window.alert('Login realizado com sucesso!');
        router.push('/');
      } else {
        console.error('Erro inesperado na resposta:', response);
      }
    } catch (error) {
      console.error('Erro durante o login:', error); // Log detalhado do erro no frontend
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao autenticar. Verifique suas credenciais.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Remove a role ao fazer logout
    setIsAuthenticated(false);
    router.push('/auth');
  };

  if (isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <h1>Você está logado!</h1>
        <button onClick={handleLogout} className={styles.button}>Logout</button>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <h1>{isLogin ? 'Login' : 'Registrar'}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              className={styles.input}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.button}>
          {isLogin ? 'Entrar' : 'Registrar'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className={styles.toggleButton}>
        {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login'}
      </button>
    </div>
  );
}