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
              <Text style={estilos.botaoLocalTexto}>Solicitar permissão</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Lista de ciclovias ─────────────────────────── */}
        <Text style={estilos.listaTitulo}>📌 Ciclovias com coordenadas</Text>
        {comCoordenadas.length === 0 ? (
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
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#F0FFF4',
  },
  titulo: { fontSize: 24, fontWeight: '700', color: '#1B4332' },
  subtitulo: { marginTop: 4, fontSize: 14, color: '#40916C' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  meuPosicaoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  meuPosicaoTitulo: { fontSize: 16, fontWeight: '700', color: '#1B4332', marginBottom: 8 },
  coordenada: { fontSize: 14, color: '#344E41', marginTop: 4 },
  botaoLocal: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botaoLocalTexto: { color: '#FFFFFF', fontWeight: '600' },
  listaTitulo: { fontSize: 18, fontWeight: '700', color: '#1B4332', marginBottom: 12 },
  semDados: { color: '#52796F', fontStyle: 'italic' },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  marcador: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  marcadorTexto: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemBairro: { fontSize: 16, fontWeight: '700', color: '#1B4332' },
  itemTipo: { marginTop: 2, fontSize: 13, fontWeight: '600' },
  itemDistancia: { marginTop: 4, fontSize: 13, color: '#2D6A4F' },
  itemCoordenadas: { marginTop: 4, fontSize: 12, color: '#6C757D' },
});