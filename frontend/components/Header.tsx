// Header.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { jwtDecode } from 'jwt-decode';

export default function Header() {
  const [userRole, setUserRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificando se o usuário está autenticado e pegando o role
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Decodifica o token
        setUserRole(decodedToken.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        setIsAuthenticated(false);
        setUserRole('');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/auth'; // Redireciona para a página de login
  };

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/properties">Imóveis</Link></li>

          {/* Exibe o botão do painel apenas para admin e corretor */}
          {isAuthenticated && (userRole === 'admin' || userRole === 'corretor') && (
            <li><Link href="/admin">Painel de Admin</Link></li>
          )}

          {isAuthenticated ? (
            <li>
              <button className={styles.userButton} onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <li><Link href="/auth">Autenticação</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}