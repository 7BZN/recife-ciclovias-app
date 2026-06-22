// ============================================================
// src/screens/SplashScreen.js
//
// Tela de carregamento inicial exibida ao abrir o app.
//
// Responsabilidades:
//   - Exibir logo e nome do app
//   - Simular um breve carregamento (pode ser substituído
//     por inicialização real: carregar cache, verificar token, etc.)
//   - Redirecionar para MainTabs após 2.5 segundos
//
// Design:
//   - Fundo verde Recife com logo centralizado
//   - Animação de fade-in
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';

export default function SplashScreen({ navigation }) {
  // Valor animado para o efeito de fade-in (começa invisível)
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada: fade-in em 1 segundo
    Animated.timing(opacidade, {
      toValue: 1,       // opacidade final = 1 (completamente visível)
      duration: 1000,
      useNativeDriver: true, // usa GPU para melhor performance
    }).start();

    // Após 2.5 segundos, navega para as abas principais
    // replace: substitui a Splash na pilha (impede de voltar)
    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2500);

    // Limpa o timer se o componente for desmontado antes do tempo
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={estilos.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />

      {/* Conteúdo com animação de fade */}
      <Animated.View style={[estilos.conteudo, { opacity: opacidade }]}>
        {/* Ícone principal */}
        <Text style={estilos.icone}>🚲</Text>

        {/* Nome do aplicativo */}
        <Text style={estilos.titulo}>Ciclovias Recife</Text>

        {/* Subtítulo descritivo */}
        <Text style={estilos.subtitulo}>
          Explore a malha cicloviária da cidade
        </Text>

        {/* Indicador de carregamento */}
        <Text style={estilos.carregando}>Carregando...</Text>
      </Animated.View>

      {/* Rodapé com crédito */}
      <Text style={estilos.rodape}>Dados Abertos Prefeitura do Recife</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332', // verde escuro — identidade visual
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    alignItems: 'center',
    gap: 12,
  },
  icone: {
    fontSize: 80,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitulo: {
    fontSize: 15,
    color: '#B7E4C7',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  carregando: {
    fontSize: 13,
    color: '#74C69D',
    marginTop: 30,
  },
  rodape: {
    position: 'absolute',
    bottom: 30,
    fontSize: 11,
    color: '#52B788',
  },
});
