"use client";
import { useState, useEffect } from 'react';
import { getProperties, deleteProperty } from '../../../services/api/propertyService'; // Função para buscar e deletar imóveis do backend
import Link from 'next/link'; // Importar Link para navegação
import styles from './PropertyAdmin.module.css'; // Manter o estilo existente

export default function PropertyList() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', location: '' });
  const [order, setOrder] = useState({ orderBy: 'price', orderDirection: 'ASC' });

  // Função para buscar imóveis no backend com filtros
  const fetchProperties = async () => {
    try {
      const response = await getProperties({ ...filters, ...order });
      setProperties(response); // Salvar os imóveis no estado
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
    }
  };

  // Atualizar lista ao carregar a página e ao mudar filtros/ordenação
  useEffect(() => {
    fetchProperties();
  }, [filters, order]);

  // Função para atualizar os filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Função para atualizar a ordenação
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [orderBy, orderDirection] = e.target.value.split('-');
    setOrder({ orderBy, orderDirection });
  };

  // Função para deletar um imóvel com confirmação
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Você tem certeza que deseja excluir este imóvel?');
    if (!confirmDelete) return; // Se o usuário cancelar, não prosseguir com a exclusão

    try {
      await deleteProperty(id); // Chamar a função para deletar o imóvel
      setProperties(properties.filter(property => property.id !== id)); // Remover o imóvel do estado local
    } catch (error) {
      console.error('Erro ao deletar imóvel:', error);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeInAnimation}`}>
      <h1 className={styles.title}>Listagem de Imóveis</h1>

      {/* Filtros */}
      <div className={`${styles.filters} ${styles.fadeInAnimation}`}>
        <input
          type="text"
          name="location"
          placeholder="Localização"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Preço mínimo"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Preço máximo"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        
        {/* Botão de ordenação */}
        <select onChange={handleOrderChange} className={`${styles.sortButton} ${styles.fadeInAnimation}`} value={`${order.orderBy}-${order.orderDirection}`}>
          <option value="price-ASC">Ordenar por Preço (Crescente)</option>
          <option value="price-DESC">Ordenar por Preço (Decrescente)</option>
          <option value="size-ASC">Ordenar por Tamanho (Crescente)</option>
          <option value="size-DESC">Ordenar por Tamanho (Decrescente)</option>
        </select>
      </div>

      {/* Botão para criar novo imóvel */}
      <Link href="/admin/properties/new">
        <button className={`${styles.createButton} ${styles.fadeInAnimation}`}>
          Novo Imóvel
        </button>
      </Link>

      {/* Lista de imóveis */}
      <ul className={styles.propertyList}>
        {properties.map((property) => (
          <li key={property.id} className={`${styles.propertyItem} ${styles.fadeInCard}`}>
            {/* Imagem do imóvel */}
            <img
              src={property.image || '/default-image.jpg'}
              alt={property.title}
              className={`${styles.propertyImage} ${styles.imageZoom}`}
            />
            <div className={styles.propertyItemContent}>
              <span className={styles.propertyTitle}>{property.title}</span>
              <div className={styles.propertyDetails}>
                <span>Preço: R$ {property.price}</span>
                <span>Tamanho: {property.size} m²</span>
                <span>Quartos: {property.bedrooms}</span>
                <span>Banheiros: {property.bathrooms}</span>
              </div>
            </div>

            {/* Ações: Editar e Excluir */}
            <div className={styles.propertyActions}>
              <Link href={`/admin/properties/edit/${property.id}`}>
                <button className={styles.editButton}>Editar</button>
              </Link>
              <button onClick={() => handleDelete(property.id)} className={styles.deleteButton}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}