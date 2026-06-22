// ============================================================
// src/services/apiDadosRecife.js
//
// Consome o GeoJSON público da Malha Cicloviária do Recife.
// O portal disponibiliza os dados como arquivo para download,
// não via CKAN DataStore — por isso usamos a URL direta.
// ============================================================

import axios from 'axios';

// URL direta do arquivo GeoJSON das rotas permanentes
const GEOJSON_URL =
  'https://dados.recife.pe.gov.br/dataset/8512f8d0-b0be-4880-9fbd-3d568c65ca1a/resource/1c9feb5e-38ad-4235-b3d2-771964c59c46/download/rotas-ciclaveis-do-recife-permanente.geojson';

const apiRecife = axios.create({
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

// ── Buscar e converter GeoJSON → array de registros ──────────
// O GeoJSON tem formato: { type: "FeatureCollection", features: [...] }
// Cada feature tem: { geometry: {...}, properties: { tipo, bairro, ... } }
// Convertemos para um array plano igual ao que o app já espera.
export async function buscarCiclovias(limit = 50, offset = 0) {
  try {
    const response = await apiRecife.get(GEOJSON_URL);
  const registros = features
  .filter((f) => f.geometry?.coordinates?.length > 0) // ignora features sem geometria
  .map((feature, index) => ({
    _id:        index + 1,
    tipo:       feature.properties?.Tipo       || 'N/D',
    bairro:     feature.properties?.Bairro     || 'N/D',
    logradouro: feature.properties?.Logradouro || '',
    nome:       feature.properties?.Nome       || '',
    sentido:    feature.properties?.Sentido    || '',
    extensao_km: null,
    situacao:   'ATIVA',
    // MultiLineString: coordinates = [ [ [lon,lat], ... ], ... ]
    // Pega o ponto do meio do primeiro segmento
    latitude:   extrairLatitude(feature.geometry),
    longitude:  extrairLongitude(feature.geometry),
  }));

    // Paginação manual
    const total = registros.length;
    const pagina = registros.slice(offset, offset + limit);

    return { registros: pagina, total };
  } catch (error) {
    if (!error.response) {
      throw new Error('Sem conexão. Verifique sua internet.');
    }
    throw new Error(`Falha ao buscar ciclovias: ${error.message}`);
  }
}

// ── Helpers para extrair coordenadas do GeoJSON ───────────────
// GeoJSON LineString: coordinates = [[lon, lat], [lon, lat], ...]
// Pega o ponto do meio da linha como representativo
function extrairLatitude(geometry) {
  if (!geometry?.coordinates?.length) return null;
  // MultiLineString: coordinates[segmento][ponto][lon/lat]
  const segmento = geometry.coordinates[0];
  if (!segmento?.length) return null;
  const meio = Math.floor(segmento.length / 2);
  return segmento[meio]?.[1] ?? null; // índice 1 = latitude
}

function extrairLongitude(geometry) {
  if (!geometry?.coordinates?.length) return null;
  const segmento = geometry.coordinates[0];
  if (!segmento?.length) return null;
  const meio = Math.floor(segmento.length / 2);
  return segmento[meio]?.[0] ?? null; // índice 0 = longitude
}

export async function buscarCicloviasPorTipo(tipo, limit = 50) {
  const { registros } = await buscarCiclovias(999, 0);
  return registros.filter(
    (r) => r.tipo?.toUpperCase() === tipo.toUpperCase()
  ).slice(0, limit);
}

export async function buscarCicloviaPorId(id) {
  const { registros } = await buscarCiclovias(999, 0);
  const found = registros.find((r) => r._id === id);
  if (!found) throw new Error('Ciclovia não encontrada.');
  return found;
}

export default apiRecife;