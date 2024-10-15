// AdminPage.tsx
"use client";

import Link from "next/link";
import styles from './AdminPage.module.css';

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bem-vindo ao Painel de Administração</h1>
      <ul className={styles.linkList}>
        <li className={styles.listItem}>
          <Link href="/admin/properties" className={styles.link}>
            Gerenciar Imóveis
          </Link>
        </li>
        <li className={styles.listItem}>
          <Link href="/admin/corretores" className={styles.link}>
            Gerenciar Corretores
          </Link>
        </li>
      </ul>
    </div>
  );
}