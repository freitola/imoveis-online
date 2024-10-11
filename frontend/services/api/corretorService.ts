import axios from 'axios';

const API_URL = 'http://localhost:5001/api/corretores'; // Ajuste para o backend real

export const getCorretores = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCorretor = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createCorretor = async (corretorData: { name: string; email: string }) => {
  const response = await axios.post(API_URL, corretorData);
  return response.data;
};

export const updateCorretor = async (id: string, corretorData: { name: string; email: string }) => {
  const response = await axios.put(`${API_URL}/${id}`, corretorData);
  return response.data;
};

export const deleteCorretor = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};