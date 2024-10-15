import axios from 'axios';

const API_URL = 'http://localhost:5001/api/properties';

// Função para obter o token JWT do localStorage
const getAuthToken = () => localStorage.getItem('token');

// Função para buscar propriedades
export const getProperties = async (filters = {}) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    });
    return response.data.properties;
  } catch (error) {
    console.error('Erro ao buscar as propriedades:', error);
    return [];
  }
};

// Função para buscar uma propriedade pelo ID
export const getPropertyById = async (id: string) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os detalhes da propriedade:', error);
    return null;
  }
};

// Função para criar uma nova propriedade
export const createProperty = async (propertyData: any) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(API_URL, propertyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar a propriedade:', error);
    throw error;
  }
};

// Função para atualizar uma propriedade
export const updateProperty = async (id: string, propertyData: any) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, propertyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o imóvel:', error);
    throw error;
  }
};

// Função para excluir uma propriedade
export const deleteProperty = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir o imóvel:', error);
    throw error;
  }
};

// Função para buscar propriedades em destaque
export const getFeaturedProperties = async () => {
  try {
    const response = await axios.get(`${API_URL}/featured`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os imóveis em destaque:', error);
    throw error;
  }
};