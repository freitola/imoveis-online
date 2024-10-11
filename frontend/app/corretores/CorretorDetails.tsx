import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCorretor } from '../../services/api/corretorService';

export default function CorretorDetails() {
  const { id } = useParams();
  const [corretor, setCorretor] = useState(null);

  useEffect(() => {
    const fetchCorretor = async () => {
      const data = await getCorretor(id);
      setCorretor(data);
    };
    fetchCorretor();
  }, [id]);

  if (!corretor) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="corretor-details">
      <h1>{corretor.name}</h1>
      <p>Email: {corretor.email}</p>
    </div>
  );
}