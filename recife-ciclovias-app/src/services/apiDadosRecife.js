import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BACKEND || 'http://localhost:3000';

const api = axios.create({ baseURL: BACKEND_URL, timeout: 20000 });

export async function buscarCiclovias(limit = 50, offset = 0) {
  try {
    const response = await api.get('/ciclovias');
    const todos    = response.data.dados || [];
    const pagina   = todos.slice(offset, offset + limit);
    return { registros: pagina, total: todos.length };
  } catch (error) {
    throw new Error('Falha ao buscar ciclovias: ' + error.message);
  }
}

export async function buscarCicloviasPorTipo(tipo, limit = 50) {
  const { registros } = await buscarCiclovias(9999, 0);
  return registros
    .filter((r) => r.tipo?.toUpperCase() === tipo.toUpperCase())
    .slice(0, limit);
}

export async function buscarCicloviaPorId(id) {
  const { registros } = await buscarCiclovias(9999, 0);
  const found = registros.find((r) => r._id === id);
  if (!found) throw new Error('Ciclovia não encontrada.');
  return found;
}

export default api;