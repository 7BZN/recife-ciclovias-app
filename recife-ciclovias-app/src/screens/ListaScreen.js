// ============================================================
// src/screens/ListaScreen.js
//
// Tela de listagem das ciclovias do Recife.
//
// Responsabilidades:
//   - Exibir lista paginada (infinite scroll) de ciclovias
//   - Pull-to-refresh para recarregar dados
//   - Filtro por tipo (Ciclovia / Ciclofaixa / Ciclorrota)
//   - Navegação para tela de Detalhes ao tocar em um item
//   - Indicador de loading e mensagem de erro
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCiclovias }  from '../hooks/useCiclovias';
import CicloviaCard      from '../components/CicloviaCard';
import ErrorMessage      from '../components/ErrorMessage';

// Tipos de filtro disponíveis
const FILTROS = ['Todos', 'CICLOVIA', 'CICLOFAIXA', 'CICLORROTA'];

export default function ListaScreen({ navigation }) {
  const {
    ciclovias,
    carregando,
    erro,
    temMais,
    carregarCiclovias,
    carregarMais,
    filtrarPorTipo,
    resetar,
  } = useCiclovias();

  // Filtro ativo (padrão: Todos)
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [atualizando, setAtualizando] = useState(false);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    carregarCiclovias();
  }, []);

  // ── Mudar filtro ──────────────────────────────────────────
  const aoMudarFiltro = async (filtro) => {
    setFiltroAtivo(filtro);
    if (filtro === 'Todos') {
      resetar();
      carregarCiclovias();
    } else {
      await filtrarPorTipo(filtro);
    }
  };

  // ── Pull-to-refresh ──────────────────────────────────────
  const aoAtualizar = async () => {
    setAtualizando(true);
    resetar();
    await carregarCiclovias();
    setAtualizando(false);
  };

  // ── Renderizar cada item da lista ─────────────────────────
  const renderItem = ({ item }) => (
    <CicloviaCard
      ciclovia={item}
      onPress={() =>
        navigation.navigate('Detalhes', { ciclovia: item })
      }
    />
  );

  // ── Rodapé da lista (carregando mais / fim da lista) ──────
  const renderRodape = () => {
    if (!carregando) return null;
    return (
      <View style={estilos.rodape}>
        <ActivityIndicator color="#2D6A4F" />
        <Text style={estilos.rodapeTexto}>Carregando mais...</Text>
      </View>
    );
  };

  // ── Estado de lista vazia ─────────────────────────────────
  const renderVazio = () => {
    if (carregando) return null;
    return (
      <View style={estilos.vazio}>
        <Text style={estilos.vazioPrincipal}>Nenhuma ciclovia encontrada</Text>
        <Text style={estilos.vazioSub}>
          Tente remover o filtro ou recarregue a lista.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={estilos.safe}>
      {/* ── Cabeçalho ───────────────────────────────────── */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>🚲 Ciclovias</Text>
        <Text style={estilos.subtitulo}>
          {ciclovias.length} registro(s) carregado(s)
        </Text>
      </View>

      {/* ── Filtros por tipo ─────────────────────────────── */}
      <View style={estilos.filtros}>
        {FILTROS.map((filtro) => (
          <TouchableOpacity
            key={filtro}
            style={[
              estilos.filtroBtn,
              filtroAtivo === filtro && estilos.filtroBtnAtivo,
            ]}
            onPress={() => aoMudarFiltro(filtro)}
          >
            <Text
              style={[
                estilos.filtroTexto,
                filtroAtivo === filtro && estilos.filtroTextoAtivo,
              ]}
            >
              {filtro}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Mensagem de erro ─────────────────────────────── */}
      {erro && <ErrorMessage mensagem={erro} onRetry={carregarCiclovias} />}

      {/* ── Lista principal ──────────────────────────────── */}
      <FlatList
        data={ciclovias}
        keyExtractor={(item, index) =>
          item._id?.toString() || index.toString()
        }
        renderItem={renderItem}
        ListFooterComponent={renderRodape}
        ListEmptyComponent={renderVazio}
        // Pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            colors={['#2D6A4F']}
            tintColor="#2D6A4F"
          />
        }
        // Infinite scroll: chama carregarMais quando está a 20% do fim
        onEndReached={temMais ? carregarMais : null}
        onEndReachedThreshold={0.2}
        contentContainerStyle={estilos.lista}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FFF4' },

  cabecalho: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1B4332' },
  subtitulo: { fontSize: 12, color: '#74C69D', marginTop: 2 },

  filtros: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  filtroBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  filtroBtnAtivo: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  filtroTexto: { fontSize: 12, color: '#2D6A4F', fontWeight: '600' },
  filtroTextoAtivo: { color: '#FFFFFF' },

  lista: { padding: 12, gap: 10 },

  rodape: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  rodapeTexto: { fontSize: 12, color: '#74C69D' },

  vazio: { alignItems: 'center', padding: 40, gap: 8 },
  vazioPrincipal: { fontSize: 16, color: '#52B788', fontWeight: '600' },
  vazioSub: { fontSize: 13, color: '#95D5B2', textAlign: 'center' },
});
