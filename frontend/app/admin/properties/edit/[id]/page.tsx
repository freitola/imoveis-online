// app/admin/properties/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPropertyById, updateProperty } from '../../../../../services/api/propertyService';
import styles from './EditProperty.module.css';

export default function EditProperty() {
  const router = useRouter();
  const { id } = useParams();
  const [propertyData, setPropertyData] = useState({
    title: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    image: null
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const property = await getPropertyById(id);
        if (property) {
          setPropertyData({
            title: property.title,
            price: property.price,
            location: property.location,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            size: property.size,
            image: null // Manter nulo para a imagem inicialmente
          });
        }
      } catch (error) {
        setErrorMessage('Erro ao buscar os dados da propriedade.');
      }
    };
    fetchProperty();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPropertyData({
      ...propertyData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPropertyData({
      ...propertyData,
      image: file,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProperty(id, propertyData);
      setSuccessMessage('Imóvel atualizado com sucesso!');
      setErrorMessage(null);
      router.push('/admin/properties');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao atualizar o imóvel.');
      setSuccessMessage(null);
    }
  };

  return (
    <div className={styles.container}>
  <h1 className={styles.title}>Editar Imóvel</h1>
  
  {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
  {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

  <form className={styles.form} onSubmit={handleSubmit}>
    <input
      className={styles.inputField}
      type="text"
      name="title"
      placeholder="Título do imóvel"
      value={propertyData.title}
      onChange={handleInputChange}
    />
    <input
      className={styles.inputField}
      type="number"
      name="price"
      placeholder="Preço"
      value={propertyData.price}
      onChange={handleInputChange}
    />
    <input
      className={styles.inputField}
      type="text"
      name="location"
      placeholder="Localização"
      value={propertyData.location}
      onChange={handleInputChange}
    />
    <input
      className={styles.inputField}
      type="number"
      name="bedrooms"
      placeholder="Número de quartos"
      value={propertyData.bedrooms}
      onChange={handleInputChange}
    />
    <input
      className={styles.inputField}
      type="number"
      name="bathrooms"
      placeholder="Número de banheiros"
      value={propertyData.bathrooms}
      onChange={handleInputChange}
    />
    <input
      className={styles.inputField}
      type="number"
      name="size"
      placeholder="Tamanho em m²"
      value={propertyData.size}
      onChange={handleInputChange}
    />
    <input className={styles.inputField} type="file" name="image" onChange={handleImageChange} />
    <button className={styles.submitButton} type="submit">Atualizar Imóvel</button>
  </form>
</div>
  );
}