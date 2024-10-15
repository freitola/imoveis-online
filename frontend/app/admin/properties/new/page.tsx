// app/admin/properties/new/page.tsx
"use client";

import { useState } from 'react';
import { createProperty } from '../../../../services/api/propertyService';
import { useRouter } from 'next/navigation';
import styles from './NewProperty.module.css';

export default function CreateProperty() {
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
  const router = useRouter();

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
      await createProperty(propertyData);
      setSuccessMessage('Imóvel criado com sucesso!');
      setErrorMessage(null);
      router.push('/admin/properties');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao criar o imóvel.');
      setSuccessMessage(null);
    }
  };

  return (
    <div className={styles.container}>
  <h1 className={styles.title}>Criar Novo Imóvel</h1>

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
    <button className={styles.submitButton} type="submit">Criar Imóvel</button>
  </form>
</div>
  );
}