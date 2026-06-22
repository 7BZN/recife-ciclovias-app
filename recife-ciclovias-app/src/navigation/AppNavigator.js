// ============================================================
// src/navigation/AppNavigator.js
// ============================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Importação de todas as telas
import SplashScreen   from '../screens/SplashScreen';
import HomeScreen     from '../screens/HomeScreen';
import ListaScreen    from '../screens/ListaScreen';
import DetalhesScreen from '../screens/DetalhesScreen';
import MapaScreen     from '../screens/MapaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';

// Criação dos navigators
const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ============================================================
// MainTabs — Bottom Tab Navigator com 4 abas principais
// ============================================================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Ícone de cada aba (usando emojis para simplicidade sem dependências extras)
        tabBarIcon: ({ focused }) => {
          const icons = {
            Home:      focused ? '🏠' : '🏡',
            Lista:     focused ? '📋' : '📄',
            Mapa:      focused ? '🗺️'  : '🗺',
            Histórico: focused ? '📅' : '📆',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        // Estilos da barra de abas
        tabBarActiveTintColor:   '#2D6A4F',  // verde Recife ativo
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        // Remove o header padrão das abas (cada tela gerencia o seu)
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Início' }} />
      <Tab.Screen name="Lista"     component={ListaScreen}     options={{ title: 'Ciclovias' }} />
      <Tab.Screen name="Mapa"      component={MapaScreen}      options={{ title: 'Mapa' }} />
      <Tab.Screen name="Histórico" component={HistoricoScreen} options={{ title: 'Histórico' }} />
    </Tab.Navigator>
  );
}

// ============================================================
// AppNavigator — Stack raiz que engloba tudo
// ============================================================
export default function AppNavigator() {
  return (
    // NavigationContainer: obrigatório — provê o contexto de navegação
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName: começa na Splash antes de ir para as abas
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }} // sem header no stack raiz
      >
        {/* Splash exibida no primeiro acesso */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* MainTabs encapsula todo o sistema de abas */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detalhes: tela de detalhe empilhada sobre as abas */}
        <Stack.Screen
          name="Detalhes"
          component={DetalhesScreen}
          options={{
            headerShown: true,          // exibe o botão de voltar automático
            title: 'Detalhes da Ciclovia',
            headerStyle: { backgroundColor: '#2D6A4F' },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
