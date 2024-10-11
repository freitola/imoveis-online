'use client';

import { useState } from 'react';
import { createCorretor } from '../../services/api/corretorService';
import { useRouter } from 'next/navigation';

interface CorretorFormProps {
  corretor?: {
    id?: string;
    name: string;
    email: string;
  };
}

export default function CorretorForm({ corretor }: CorretorFormProps) {
  const [name, setName] = useState(corretor?.name || '');
  const [email, setEmail] = useState(corretor?.email || '');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (corretor?.id) {
      // Atualizar corretor existente
      // Implemente a função de edição de corretor no service/api/corretorService.ts
    } else {
      // Criar novo corretor
      await createCorretor({ name, email });
    }

    // Redireciona após o envio do formulário
    router.push('/corretores');
  };

  return (
    <form onSubmit={handleSubmit} className="corretor-form">
      <input
        type="text"
        placeholder="Nome do Corretor"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email do Corretor"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">
        {corretor ? 'Atualizar Corretor' : 'Adicionar Corretor'}
      </button>
    </form>
  );
}