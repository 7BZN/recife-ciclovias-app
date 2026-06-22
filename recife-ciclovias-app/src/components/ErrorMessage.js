// ============================================================
// src/components/ErrorMessage.js
// Componente de erro com botão de retry.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ErrorMessage({ mensagem, onRetry }) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.icone}>⚠️</Text>
      <Text style={estilos.mensagem}>{mensagem}</Text>
      {onRetry && (
        <TouchableOpacity style={estilos.botao} onPress={onRetry}>
          <Text style={estilos.botaoTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E63946',
  },
  icone: { fontSize: 24 },
  mensagem: { fontSize: 13, color: '#555', textAlign: 'center' },
  botao: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  botaoTexto: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});
