import axios from 'axios';

const API_URL = 'http://localhost:5001/api/properties';

export const getProperties = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.properties;
  } catch (error) {
    console.error('Erro ao buscar as propriedades:', error);
    return [];
  }
};

export const getPropertyById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os detalhes da propriedade:', error);
    return null;
  }
};

export const getFeaturedProperties = async () => {
  const response = await fetch('http://localhost:5001/api/properties/featured');
  const data = await response.json();
  return data;
};