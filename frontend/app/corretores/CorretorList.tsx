import { useState, useEffect } from 'react';
import { getCorretores } from '../../services/api/corretorService';

export default function CorretorList() {
  const [corretores, setCorretores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCorretores();
      setCorretores(data);
    };
    fetchData();
  }, []);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {corretores.map((corretor) => (
          <tr key={corretor.id}>
            <td>{corretor.name}</td>
            <td>{corretor.email}</td>
            <td>
              <button>Editar</button>
              <button>Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}