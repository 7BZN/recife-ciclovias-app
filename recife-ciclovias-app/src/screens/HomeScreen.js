// ============================================================
// src/screens/HomeScreen.js
//
// Tela principal (dashboard) do aplicativo.
//
// Responsabilidades:
//   - Exibir resumo dos dados (total de ciclovias, km totais)
//   - Exibir localização atual do usuário
//   - Solicitar permissão de localização na primeira visita
//   - Botões de ação rápida para navegar entre seções
//   - Indicar a ciclovia mais próxima (quando há localização)
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation }   from '../hooks/useLocation';
import { useCiclovias }  from '../hooks/useCiclovias';
import { useAppContext } from '../context/AppContext';
import { cicloviaMaisProxima, calcularDistanciaKm } from '../utils/helpers';

export default function HomeScreen({ navigation }) {
  const { userLocation } = useAppContext();
  const {
    solicitarPermissao,
    carregandoLocalizacao,
    erroLocalizacao,
    permissaoNegada,
  } = useLocation();

  const { ciclovias, carregarCiclovias, carregando } = useCiclovias();

  // Ciclovia mais próxima calculada localmente
  const [proxima, setProxima] = useState(null);

  // ── Solicitar localização e carregar dados ao montar ────
  useEffect(() => {
    solicitarPermissao();
    carregarCiclovias();
  }, []);

  // ── Recalcular ciclovia mais próxima ao mudar localização ──
  useEffect(() => {
    if (userLocation && ciclovias.length > 0) {
      const mais = cicloviaMaisProxima(
        ciclovias,
        userLocation.latitude,
        userLocation.longitude
      );
      setProxima(mais);
    }
  }, [userLocation, ciclovias]);

  // ── Alerta de permissão negada ──────────────────────────
  useEffect(() => {
    if (permissaoNegada) {
      Alert.alert(
        'Localização desativada',
        'Habilite a localização nas configurações para ver ciclovias próximas.',
        [{ text: 'OK' }]
      );
    }
  }, [permissaoNegada]);

  // ── Distância até a ciclovia mais próxima ───────────────
  const distanciaProxima =
    userLocation && proxima?.latitude
      ? calcularDistanciaKm(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(proxima.latitude),
          parseFloat(proxima.longitude)
        )
      : null;

  return (
    <SafeAreaView style={estilos.safe}>
      <ScrollView contentContainerStyle={estilos.scroll}>
        {/* ── Cabeçalho ─────────────────────────────────── */}
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>🚲 Ciclovias Recife</Text>
          <Text style={estilos.subtitulo}>Malha cicloviária da cidade</Text>
        </View>

        {/* ── Cards de estatísticas ──────────────────────── */}
        <View style={estilos.cards}>
          <View style={estilos.card}>
            <Text style={estilos.cardNumero}>
              {carregando ? '...' : ciclovias.length}
            </Text>
            <Text style={estilos.cardLabel}>Ciclovias carregadas</Text>
          </View>

          <View style={[estilos.card, { backgroundColor: '#D8F3DC' }]}>
            <Text style={[estilos.cardNumero, { color: '#1B4332' }]}>
              232,3
            </Text>
            <Text style={estilos.cardLabel}>Km de malha total</Text>
          </View>
        </View>

        {/* ── Localização atual ─────────────────────────── */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>📍 Sua Localização</Text>

          {carregandoLocalizacao ? (
            <ActivityIndicator color="#2D6A4F" />
          ) : userLocation ? (
            <View style={estilos.localizacaoBox}>
              <Text style={estilos.coordenada}>
                Lat: {userLocation.latitude.toFixed(5)}
              </Text>
              <Text style={estilos.coordenada}>
                Lon: {userLocation.longitude.toFixed(5)}
              </Text>
              {proxima && distanciaProxima !== null && (
                <Text style={estilos.proximaInfo}>
                  🏁 Ciclovia mais próxima: {distanciaProxima} km
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={estilos.botaoPermissao}
              onPress={solicitarPermissao}
            >
              <Text style={estilos.botaoPermissaoTexto}>
                Habilitar Localização
              </Text>
            </TouchableOpacity>
          )}

          {erroLocalizacao ? (
            <Text style={estilos.erro}>{erroLocalizacao}</Text>
          ) : null}
        </View>

        {/* ── Botões de navegação rápida ─────────────────── */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Explorar</Text>

          <TouchableOpacity
            style={estilos.botaoAcao}
            onPress={() => navigation.navigate('Lista')}
          >
            <Text style={estilos.botaoAcaoIcone}>📋</Text>
            <Text style={estilos.botaoAcaoTexto}>Ver todas as ciclovias</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botaoAcao, { backgroundColor: '#D8F3DC' }]}
            onPress={() => navigation.navigate('Mapa')}
          >
            <Text style={estilos.botaoAcaoIcone}>🗺️</Text>
            <Text style={[estilos.botaoAcaoTexto, { color: '#1B4332' }]}>
              Ver no mapa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botaoAcao, { backgroundColor: '#B7E4C7' }]}
            onPress={() => navigation.navigate('Histórico')}
          >
            <Text style={estilos.botaoAcaoIcone}>📅</Text>
            <Text style={[estilos.botaoAcaoTexto, { color: '#1B4332' }]}>
              Meu histórico
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FFF4' },
  scroll: { padding: 20, gap: 20 },
  cabecalho: { alignItems: 'center', paddingVertical: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1B4332' },
  subtitulo: { fontSize: 14, color: '#52B788', marginTop: 4 },

  cards: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardNumero: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  cardLabel: { fontSize: 11, color: '#B7E4C7', marginTop: 4, textAlign: 'center' },

  secao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: '#1B4332' },

  localizacaoBox: { gap: 4 },
  coordenada: { fontSize: 13, color: '#52B788', fontFamily: 'monospace' },
  proximaInfo: { fontSize: 13, color: '#2D6A4F', marginTop: 6, fontWeight: '600' },

  botaoPermissao: {
    backgroundColor: '#2D6A4F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoPermissaoTexto: { color: '#FFFFFF', fontWeight: '600' },

  botaoAcao: {
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botaoAcaoIcone: { fontSize: 20 },
  botaoAcaoTexto: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },

  erro: { fontSize: 12, color: '#E63946', marginTop: 4 },
});
