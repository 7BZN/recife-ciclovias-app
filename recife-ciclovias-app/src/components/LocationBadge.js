// ============================================================
// src/components/LocationBadge.js
// Badge compacto para exibir a localização atual do usuário.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LocationBadge({ latitude, longitude }) {
  if (!latitude || !longitude) {
    return (
      <View style={[estilos.container, estilos.semLocalizacao]}>
        <Text style={estilos.semTexto}>📍 Localização indisponível</Text>
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.icone}>📍</Text>
      <Text style={estilos.texto}>
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8F3DC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    alignSelf: 'flex-start',
  },
  semLocalizacao: { backgroundColor: '#F0F0F0' },
  icone: { fontSize: 13 },
  texto: { fontSize: 11, color: '#1B4332', fontWeight: '600', fontFamily: 'monospace' },
  semTexto: { fontSize: 11, color: '#888' },
});
