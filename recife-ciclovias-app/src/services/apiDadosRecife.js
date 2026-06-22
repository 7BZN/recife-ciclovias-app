// ============================================================
// src/services/apiDadosRecife.js
//
// Camada de serviço responsável por toda comunicação com
// o Portal de Dados Abertos da Prefeitura do Recife.
//
// API utilizada: Malha Cicloviária do Recife
// Base URL: https://dados.recife.pe.gov.br
// Padrão:   CKAN DataStore REST API
// ============================================================

import axios from 'axios';

// ── Configuração base do cliente Axios ──────────────────────
const BASE_URL = 'https://dados.recife.pe.gov.br';

// Resource ID do dataset "Malha Cicloviária do Recife"
// Encontrado em: dados.recife.pe.gov.br/dataset/malha-ciclovi-ria
const RESOURCE_ID_CICLOVIAS = '49657ff7-9860-4b3b-9840-c4239c34f3d2';

// Criação da instância Axios com configurações padrão
const apiRecife = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 segundos: adequado para conexões móveis lentas
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Interceptor de request ───────────────────────────────────
// Executado ANTES de cada requisição — útil para logs em dev
apiRecife.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API Recife] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de response ──────────────────────────────────
// Executado após CADA resposta — centraliza tratamento de erros HTTP
apiRecife.interceptors.response.use(
  (response) => response, // sucesso: retorna normalmente
  (error) => {
    // Sem resposta do servidor (timeout ou sem internet)
    if (!error.response) {
      throw new Error(
        'Sem conexão com o servidor. Verifique sua internet.'
      );
    }
    // Erros HTTP conhecidos
    const status = error.response.status;
    if (status === 404) throw new Error('Recurso não encontrado na API.');
    if (status === 500) throw new Error('Erro interno no servidor da API.');
    if (status === 429) throw new Error('Muitas requisições. Aguarde e tente novamente.');

    // Erro genérico com código HTTP
    throw new Error(`Erro na API: HTTP ${status}`);
  }
);

// ============================================================
// buscarCiclovias
//
// Busca registros da malha cicloviária usando a CKAN Data API.
//
// Parâmetros:
//   limit  — número máximo de registros (padrão: 50)
//   offset — paginação (padrão: 0)
//
// Retorna: Array de objetos com dados das ciclovias
// ============================================================
export async function buscarCiclovias(limit = 50, offset = 0) {
  try {
    const response = await apiRecife.get('/api/action/datastore_search', {
      params: {
        resource_id: RESOURCE_ID_CICLOVIAS,
        limit,
        offset,
      },
    });

    // A CKAN API retorna: { success: true, result: { records: [...] } }
    const { success, result } = response.data;

    if (!success) {
      throw new Error('A API retornou success: false');
    }

    // Retorna os registros e o total para controle de paginação
    return {
      registros: result.records || [],
      total: result.total || 0,
    };
  } catch (error) {
    // Re-lança com contexto adicional
    throw new Error(`Falha ao buscar ciclovias: ${error.message}`);
  }
}

// ============================================================
// buscarCicloviaPorId
//
// Busca um único registro pelo ID do tipo (equivalente a filtro).
// Usado na tela de Detalhes.
//
// Parâmetros:
//   id — valor de _id do registro CKAN
// ============================================================
export async function buscarCicloviaPorId(id) {
  try {
    const response = await apiRecife.get('/api/action/datastore_search', {
      params: {
        resource_id: RESOURCE_ID_CICLOVIAS,
        filters: JSON.stringify({ _id: id }),
        limit: 1,
      },
    });

    const { success, result } = response.data;
    if (!success || result.records.length === 0) {
      throw new Error('Ciclovia não encontrada.');
    }

    return result.records[0];
  } catch (error) {
    throw new Error(`Falha ao buscar ciclovia: ${error.message}`);
  }
}

// ============================================================
// buscarCicloviasPorTipo
//
// Filtra ciclovias pelo tipo (CICLOVIA, CICLOFAIXA, CICLORROTA).
// Demonstra o uso de filtros na CKAN API.
// ============================================================
export async function buscarCicloviasPorTipo(tipo, limit = 50) {
  try {
    const response = await apiRecife.get('/api/action/datastore_search', {
      params: {
        resource_id: RESOURCE_ID_CICLOVIAS,
        filters: JSON.stringify({ tipo }),
        limit,
      },
    });

    const { success, result } = response.data;
    if (!success) throw new Error('Falha no filtro por tipo');

    return result.records || [];
  } catch (error) {
    throw new Error(`Falha ao filtrar ciclovias: ${error.message}`);
  }
}

export default apiRecife;
