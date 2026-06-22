// ============================================================
// src/screens/MapaScreen.js
//
// Tela de mapa mostrando localização do usuário e ciclovias.
//
// NOTA IMPORTANTE SOBRE MAPAS NO EXPO:
// O uso de MapView (react-native-maps) requer um API Key do
// Google Maps e configuração nativa. Para um projeto acadêmico
// no Expo Go, implementamos uma tela de mapa simplificada que:
//   1. Exibe as coordenadas atuais do usuário
//   2. Lista as ciclovias com suas coordenadas
//   3. Calcula e exibe distâncias
//   4. Permite integração futura com react-native-maps
//
// Para habilitar mapa visual completo:
//   npx expo install react-native-maps
//   (Requer build nativo com eas build)
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation }   from '../hooks/useLocation';
import { useCiclovias }  from '../hooks/useCiclovias';
import { useAppContext } from '../context/AppContext';
import { calcularDistanciaKm, corPorTipo } from '../utils/helpers';

export default function MapaScreen({ navigation }) {
  const { userLocation } = useAppContext();
  const { solicitarPermissao, carregandoLocalizacao } = useLocation();
  const { ciclovias, carregarCiclovias, carregando } = useCiclovias();

  // Ciclovias que têm coordenadas válidas
  const [comCoordenadas, setComCoordenadas] = useState([]);

  // ── Carga de dados ───────────────────────────────────────
  useEffect(() => {
    solicitarPermissao();
    if (ciclovias.length === 0) {
      carregarCiclovias();
    }
  }, []);

  // ── Filtrar ciclovias com coordenadas válidas ────────────
  useEffect(() => {
    const filtradas = ciclovias
      .filter((c) => c.latitude && c.longitude)
      .map((c) => ({
        ...c,
        distancia: userLocation
          ? calcularDistanciaKm(
              userLocation.latitude,
              userLocation.longitude,
              parseFloat(c.latitude),
              parseFloat(c.longitude)
            )
          : null,
      }))
      // Ordena pela mais próxima (se houver localização)
      .sort((a, b) =>
        userLocation
          ? (a.distancia || Infinity) - (b.distancia || Infinity)
          : 0
      );

    setComCoordenadas(filtradas);
  }, [ciclovias, userLocation]);

  // ── Renderizar item ─────────────────────────────────────
  const renderItem = (item) => {
    const cor = corPorTipo(item.tipo);
    return (
      <TouchableOpacity
        key={item._id?.toString()}
        style={estilos.item}
        onPress={() => navigation.navigate('Detalhes', { ciclovia: item })}
      >
        <View style={[estilos.marcador, { backgroundColor: cor }]}>
          <Text style={estilos.marcadorTexto}>📍</Text>
        </View>
        <View style={estilos.itemInfo}>
          <Text style={estilos.itemBairro}>{item.bairro || 'Bairro N/D'}</Text>
          <Text style={[estilos.itemTipo, { color: cor }]}>{item.tipo}</Text>
          {item.distancia !== null && (
            <Text style={estilos.itemDistancia}>{item.distancia} km de você</Text>
          )}
          <Text style={estilos.itemCoordenadas}>
            {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={estilos.safe}>
      {/* ── Cabeçalho ────────────────────────────────────── */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>🗺️ Mapa de Ciclovias</Text>
        <Text style={estilos.subtitulo}>
          {comCoordenadas.length} com localização disponível
        </Text>
      </View>

      <ScrollView contentContainerStyle={estilos.scroll}>
        {/* ── Posição do usuário ──────────────────────────── */}
        <View style={estilos.meuPosicaoCard}>
          <Text style={estilos.meuPosicaoTitulo}>📡 Minha posição</Text>
          {carregandoLocalizacao ? (
            <ActivityIndicator color="#2D6A4F" />
          ) : userLocation ? (
            <View>
              <Text style={estilos.coordenada}>
                🔺 Latitude: {userLocation.latitude.toFixed(6)}
              </Text>
              <Text style={estilos.coordenada}>
                🔺 Longitude: {userLocation.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={estilos.botaoLocal}
              onPress={solicitarPermissao}
            >
              <Text style={estilos.botaoLocalTexto}>
                Habilitar localização
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Aviso sobre mapa visual ─────────────────────── */}
        <View style={estilos.aviso}>
          <Text style={estilos.avisoIcone}>ℹ️</Text>
          <Text style={estilos.avisoTexto}>
            Para exibir o mapa visual, configure o react-native-maps
            com sua chave do Google Maps no arquivo app.json.
          </Text>
        </View>

        {/* ── Lista de pontos com coordenadas ────────────── */}
        <Text style={estilos.secaoTitulo}>Ciclovias com localização</Text>

        {carregando && (
          <ActivityIndicator color="#2D6A4F" style={{ margin: 20 }} />
        )}

        {comCoordenadas.length === 0 && !carregando ? (
          <Text style={estilos.semDados}>
            Nenhuma ciclovia com coordenadas encontrada.
          </Text>
        ) : (
          comCoordenadas.map(renderItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FFF4' },
  scroll: { padding: 16, gap: 12 },

  cabecalho: {
    padding: 16,
    backgroundColor: '#2D6A4F',
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 12, color: '#B7E4C7', marginTop: 2 },

  meuPosicaoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2D6A4F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 2,
  },
  meuPosicaoTitulo: { fontSize: 15, fontWeight: '700', color: '#1B4332' },
  coordenada: { fontSize: 13, color: '#52B788', fontFamily: 'monospace' },

  botaoLocal: {
    backgroundColor: '#2D6A4F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoLocalTexto: { color: '#FFFFFF', fontWeight: '600' },

  aviso: {
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  avisoIcone: { fontSize: 16 },
  avisoTexto: { fontSize: 12, color: '#555', flex: 1 },

  secaoTitulo: { fontSize: 16, fontWeight: '700', color: '#1B4332' },

  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 1,
  },
  marcador: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marcadorTexto: { fontSize: 18 },

  itemInfo: { flex: 1, gap: 2 },
  itemBairro: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
  itemTipo: { fontSize: 12, fontWeight: '600' },
  itemDistancia: { fontSize: 12, color: '#52B788' },
  itemCoordenadas: { fontSize: 11, color: '#95D5B2', fontFamily: 'monospace' },

  semDados: { textAlign: 'center', color: '#74C69D', padding: 20 },
});
