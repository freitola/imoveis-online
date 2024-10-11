'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';  // Usando jwtDecode para pegar a role
import styles from './Header.module.css';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    window.location.href = '/auth';
  };

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/properties">Imóveis</Link></li>
          
          {/* Exibe o botão para todos */}
          <li><Link href="/corretores">Painel de Corretores</Link></li>

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