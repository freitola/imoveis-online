'use client';  // Adicionando essa linha

import CorretorList from './CorretorList';
import CorretorForm from './CorretorForm';
import { useState } from 'react';

export default function CorretoresPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container">
      <h1>Corretores</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : 'Adicionar Corretor'}
      </button>

      {showForm ? <CorretorForm /> : <CorretorList />}
    </div>
  );
}