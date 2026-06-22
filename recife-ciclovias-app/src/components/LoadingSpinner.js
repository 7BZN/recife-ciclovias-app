// ============================================================
// src/components/LoadingSpinner.js
// Componente de loading reutilizável com mensagem opcional.
// ============================================================

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function LoadingSpinner({ mensagem = 'Carregando...' }) {
  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color="#2D6A4F" />
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { alignItems: 'center', padding: 30, gap: 12 },
  texto: { fontSize: 14, color: '#52B788' },
});
