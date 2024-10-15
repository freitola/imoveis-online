// services/api/corretorService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/corretores';

// Função para buscar a lista de corretores
export const getCorretores = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.corretores;
  } catch (error) {
    console.error('Erro ao buscar os corretores:', error);
    return [];
  }
};

// Função para buscar corretor por ID
export const getCorretorById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os detalhes do corretor:', error);
    return null;
  }
};

// Função para criar um novo corretor
export const createCorretor = async (corretorData: any) => {
  try {
    const response = await axios.post(API_URL, corretorData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar o corretor:', error);
    return null;
  }
};

// Função para editar um corretor existente
export const updateCorretor = async (id: number, corretorData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, corretorData);
    return response.data;
  } catch (error) {
    console.error('Erro ao editar o corretor:', error);
    return null;
  }
};

// Função para deletar um corretor
export const deleteCorretor = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Erro ao excluir o corretor:', error);
  }
};