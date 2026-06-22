// ============================================================
// src/components/CicloviaCard.js
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { corPorTipo, truncarTexto } from '../utils/helpers';

export default function CicloviaCard({ ciclovia, onPress }) {
  // Determina a cor baseada no tipo de via (ciclovia / ciclofaixa / ciclorrota)
  const cor = corPorTipo(ciclovia.tipo);

  return (
    <TouchableOpacity
      style={estilos.container}
      onPress={onPress}
      activeOpacity={0.7} // feedback visual ao toque
    >
      {/* Faixa colorida lateral indicando o tipo */}
      <View style={[estilos.faixa, { backgroundColor: cor }]} />

      {/* Conteúdo principal do card */}
      <View style={estilos.conteudo}>
        {/* Linha superior: tipo + ícone de seta */}
        <View style={estilos.linhaTopo}>
          <View style={[estilos.badge, { backgroundColor: `${cor}22` }]}>
            <Text style={[estilos.badgeTexto, { color: cor }]}>
              {ciclovia.tipo || 'Tipo N/D'}
            </Text>
          </View>
          <Text style={estilos.seta}>›</Text>
        </View>

        {/* Bairro como título principal */}
        <Text style={estilos.bairro} numberOfLines={1}>
          {ciclovia.bairro || 'Bairro não informado'}
        </Text>

        {/* Logradouro (truncado para não quebrar layout) */}
        {ciclovia.logradouro && (
          <Text style={estilos.logradouro} numberOfLines={1}>
            {truncarTexto(ciclovia.logradouro, 45)}
          </Text>
        )}

        {/* Linha inferior: extensão + situação */}
        <View style={estilos.linhaInfo}>
          {ciclovia.extensao_km && (
            <Text style={estilos.info}>
              📏 {ciclovia.extensao_km} km
            </Text>
          )}
          {ciclovia.situacao && (
            <Text style={[
              estilos.situacao,
              ciclovia.situacao === 'ATIVA'
                ? estilos.situacaoAtiva
                : estilos.situacaoOutra,
            ]}>
              {ciclovia.situacao}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  faixa: { width: 5 },
  conteudo: { flex: 1, padding: 12, gap: 4 },

  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  seta: { fontSize: 22, color: '#B7E4C7', lineHeight: 24 },

  bairro: { fontSize: 15, fontWeight: '700', color: '#1B4332' },
  logradouro: { fontSize: 12, color: '#74C69D' },

  linhaInfo: { flexDirection: 'row', gap: 12, marginTop: 2 },
  info: { fontSize: 12, color: '#52B788' },

  situacao: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  situacaoAtiva: { backgroundColor: '#D8F3DC', color: '#1B4332' },
  situacaoOutra: { backgroundColor: '#F0F0F0', color: '#888' },
});
