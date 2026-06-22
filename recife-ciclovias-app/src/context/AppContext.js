// ============================================================
// src/context/AppContext.js
// ============================================================

import React, { createContext, useContext, useState, useCallback } from 'react';

// 1. Criação do contexto com valor padrão undefined
const AppContext = createContext(undefined);

// ============================================================
// AppProvider — componente que envolve toda a aplicação
// ============================================================
export function AppProvider({ children }) {
  // Estado da localização: objeto { latitude, longitude } ou null
  const [userLocation, setUserLocation] = useState(null);

  // Estado da lista de ciclovias vindas da API do Recife
  const [ciclovias, setCiclovias] = useState([]);

  // Estado do histórico de registros salvos no backend
  const [historico, setHistorico] = useState([]);

  // Indicador de carregamento global
  const [isLoading, setIsLoading] = useState(false);

  // Mensagem de erro global (null quando não há erro)
  const [error, setError] = useState(null);

  // Função para limpar erros — usada após o usuário dispensar alertas
  const clearError = useCallback(() => setError(null), []);

  // Objeto de valor exposto a todos os consumidores do contexto
  const value = {
    userLocation,
    setUserLocation,
    ciclovias,
    setCiclovias,
    historico,
    setHistorico,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// useAppContext — hook customizado para consumir o contexto
// Lança erro se usado fora do AppProvider (segurança em dev)
// ============================================================
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
}
