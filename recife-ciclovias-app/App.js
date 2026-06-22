// ============================================================
// App.js — Ponto de entrada da aplicação
// Responsável por: inicializar o contexto global, configurar
// o SafeArea e renderizar o sistema de navegação.
// ============================================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexto global da aplicação (localização + dados)
import { AppProvider } from './src/context/AppContext';

// Componente de navegação principal
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    // GestureHandlerRootView: necessário para gestos do React Navigation
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider: respeita os recortes de tela (notch, barra de status) */}
      <SafeAreaProvider>
        {/* AppProvider: fornece estado global via Context API */}
        <AppProvider>
          {/* StatusBar com estilo automático (dark/light conforme tema) */}
          <StatusBar style="auto" />
          {/* AppNavigator: toda a lógica de rotas fica aqui */}
          <AppNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
