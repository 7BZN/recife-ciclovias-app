// ============================================================
// src/utils/helpers.js
export function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio da Terra em km

  // Converte graus para radianos
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((R * c).toFixed(2));
}

// ── Formatar data e hora ──────────────────────────────────────
// Converte string ISO 8601 para formato PT-BR legível.
// Exemplo: "2024-03-15T14:30:00.000Z" → "15/03/2024 11:30"
export function formatarDataHora(isoString) {
  if (!isoString) return 'Data desconhecida';

  try {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Recife',
    });
  } catch {
    return 'Data inválida';
  }
}

// ── Capitalizar primeira letra ─────────────────────────────
// "ciclofaixa" → "Ciclofaixa"
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// ── Cor por tipo de ciclovia ──────────────────────────────
// Retorna uma cor de destaque baseada no tipo da via.
// Usado nos cards e no mapa para diferenciar visualmente.
export function corPorTipo(tipo) {
  const cores = {
    CICLOVIA:   '#2D6A4F', // verde escuro — via exclusiva, mais segura
    CICLOFAIXA: '#52B788', // verde médio — faixa compartilhada
    CICLORROTA: '#95D5B2', // verde claro — rota sinalizada
  };
  return cores[tipo?.toUpperCase()] || '#74C69D';
}

// ── Encontrar ciclovia mais próxima ──────────────────────────
// Recebe lista de ciclovias (com lat/lon) e localização do usuário.
// Retorna a ciclovia com menor distância.
//
// NOTA: Nem todos os registros da API têm coordenadas.
// Esta função filtra apenas os que possuem latitude e longitude válidas.
export function cicloviaMaisProxima(ciclovias, userLat, userLon) {
  const comCoordenadas = ciclovias.filter(
    (c) => c.latitude && c.longitude
  );

  if (comCoordenadas.length === 0) return null;

  return comCoordenadas.reduce((maisProxima, atual) => {
    const distAtual = calcularDistanciaKm(
      userLat, userLon,
      parseFloat(atual.latitude),
      parseFloat(atual.longitude)
    );
    const distMaisProxima = calcularDistanciaKm(
      userLat, userLon,
      parseFloat(maisProxima.latitude),
      parseFloat(maisProxima.longitude)
    );
    return distAtual < distMaisProxima ? atual : maisProxima;
  });
}

// ── Truncar texto longo ────────────────────────────────────
// Útil para exibir descrições longas em cards pequenos.
// Exemplo: truncarTexto("texto longo...", 30) → "texto longo......"
export function truncarTexto(texto, maxCaracteres = 60) {
  if (!texto || texto.length <= maxCaracteres) return texto;
  return texto.substring(0, maxCaracteres) + '...';
}
