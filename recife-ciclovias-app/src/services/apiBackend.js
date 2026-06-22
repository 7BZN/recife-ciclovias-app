// ============================================================
// src/services/apiBackend.js
//
// Camada de serviço para comunicação com o backend Node.js.
// Responsável por: salvar localizações, buscar histórico.
// ============================================================

import axios from 'axios';

// Lê a URL do backend da variável de ambiente Expo
const BACKEND_URL = process.env.EXPO_PUBLIC_API_BACKEND || 'http://192.168.0.3';

// Cliente Axios configurado para o backend próprio
const apiBackend = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000, // 10s — backend local tende a responder mais rápido
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Interceptor de log para desenvolvimento ──────────────────
apiBackend.interceptors.request.use((config) => {
  if (__DEV__) {
    console.log(`[Backend] ${config.method?.toUpperCase()} ${config.url}`, config.data);
  }
  return config;
});

// ── Interceptor de tratamento de erros ──────────────────────
apiBackend.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      throw new Error('Backend indisponível. Verifique se o servidor está rodando.');
    }
    const { status, data } = error.response;
    const mensagem = data?.mensagem || `Erro HTTP ${status}`;
    throw new Error(mensagem);
  }
);

// ============================================================
// salvarLocalizacao
//
// Envia para o backend a localização do usuário junto com
// os dados de uma ciclovia próxima/selecionada.
//
// Parâmetros:
//   payload = {
//     latitude:    number,
//     longitude:   number,
//     cicloviaId:  string,
//     tipo:        string,
//     bairro:      string,
//     extensaoKm:  number,
//   }
// ============================================================
export async function salvarLocalizacao(payload) {
  try {
    const response = await apiBackend.post('/locations', payload);
    // O backend retorna { sucesso: true, dados: { ... } }
    return response.data;
  } catch (error) {
    throw new Error(`Falha ao salvar localização: ${error.message}`);
  }
}

// ============================================================
// buscarHistorico
//
// Busca todos os registros de localização salvos pelo usuário.
// Retorna array ordenado do mais recente para o mais antigo.
// ============================================================
export async function buscarHistorico() {
  try {
    const response = await apiBackend.get('/locations');
    return response.data.dados || [];
  } catch (error) {
    throw new Error(`Falha ao buscar histórico: ${error.message}`);
  }
}

// ============================================================
// deletarRegistro
//
// Remove um registro específico do histórico pelo ID.
// ============================================================
export async function deletarRegistro(id) {
  try {
    const response = await apiBackend.delete(`/locations/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Falha ao deletar registro: ${error.message}`);
  }
}

export default apiBackend;
