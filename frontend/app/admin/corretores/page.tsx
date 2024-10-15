// app/admin/corretores/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCorretores, deleteCorretor } from "../../../services/api/corretorService";
import styles from './CorretorAdmin.module.css';

export default function CorretorAdmin() {
  const [corretores, setCorretores] = useState<any[]>([]);

  useEffect(() => {
    const fetchCorretores = async () => {
      const response = await getCorretores();
      setCorretores(response);
    };
    fetchCorretores();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCorretor(id);
      setCorretores(corretores.filter((corretor) => corretor.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o corretor:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Gerenciar Corretores</h1>
      <Link href="/admin/corretores/new">
        <button className={styles.createButton}>Novo Corretor</button>
      </Link>
      <ul className={styles.corretorList}>
        {corretores.map((corretor) => (
          <li key={corretor.id} className={styles.corretorItem}>
            <span>{corretor.name}</span>
            <Link href={`/admin/corretores/edit/${corretor.id}`}>
              <button className={styles.editButton}>Editar</button>
            </Link>
            <button onClick={() => handleDelete(corretor.id)} className={styles.deleteButton}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}