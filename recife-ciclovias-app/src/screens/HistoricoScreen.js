// ============================================================
// src/screens/HistoricoScreen.js
//
// Tela de histórico — consome o backend e exibe registros salvos.
//
// Responsabilidades:
//   - Buscar todos os registros de visitas do backend (GET /locations)
//   - Exibir em lista com data/hora, localização e ciclovia
//   - Permitir deletar um registro (DELETE /locations/:id)
//   - Pull-to-refresh para recarregar
//   - Tratamento de loading e erro
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarHistorico, deletarRegistro } from '../services/apiBackend';
import { useAppContext }                    from '../context/AppContext';
import { formatarDataHora, corPorTipo }     from '../utils/helpers';

export default function HistoricoScreen() {
  const { historico, setHistorico } = useAppContext();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  // ── Buscar histórico do backend ───────────────────────────
  const carregarHistorico = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarHistorico();
      setHistorico(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [setHistorico]);

  // ── Pull-to-refresh ──────────────────────────────────────
  const aoAtualizar = async () => {
    setAtualizando(true);
    await carregarHistorico();
    setAtualizando(false);
  };

  // ── Carga inicial ────────────────────────────────────────
  useEffect(() => {
    carregarHistorico();
  }, []);

  // ── Deletar registro com confirmação ─────────────────────
  const aoDeletear = (id) => {
    Alert.alert(
      'Remover registro',
      'Tem certeza que deseja remover esta visita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarRegistro(id);
              // Remove do estado local imediatamente (sem precisar rebuscar)
              setHistorico((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  // ── Renderizar cada registro ─────────────────────────────
  const renderItem = ({ item }) => {
    const cor = corPorTipo(item.tipo);
    return (
      <View style={estilos.card}>
        {/* Faixa colorida à esquerda indicando tipo */}
        <View style={[estilos.faixa, { backgroundColor: cor }]} />

        <View style={estilos.cardConteudo}>
          {/* Cabeçalho do card */}
          <View style={estilos.cardTopo}>
            <Text style={[estilos.tipo, { color: cor }]}>{item.tipo || 'N/D'}</Text>
            <Text style={estilos.data}>{formatarDataHora(item.criadoEm)}</Text>
          </View>

          {/* Bairro da ciclovia */}
          <Text style={estilos.bairro}>{item.bairro || 'Bairro não informado'}</Text>

          {/* Coordenadas onde o usuário estava */}
          <View style={estilos.coordenadasBox}>
            <Text style={estilos.coordenadasLabel}>Sua localização:</Text>
            <Text style={estilos.coordenadas}>
              {parseFloat(item.latitude).toFixed(5)},{' '}
              {parseFloat(item.longitude).toFixed(5)}
            </Text>
          </View>

          {/* Extensão da ciclovia (se disponível) */}
          {item.extensaoKm && (
            <Text style={estilos.extensao}>
              📏 {item.extensaoKm} km de extensão
            </Text>
          )}

          {/* Botão de deletar */}
          <TouchableOpacity
            style={estilos.botaoDelete}
            onPress={() => aoDeletear(item.id)}
          >
            <Text style={estilos.botaoDeleteTexto}>🗑️ Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Estado de lista vazia ─────────────────────────────────
  const renderVazio = () => {
    if (carregando) return null;
    return (
      <View style={estilos.vazio}>
        <Text style={estilos.vazioPrincipal}>📭 Nenhum registro encontrado</Text>
        <Text style={estilos.vazioSub}>
          Navegue até uma ciclovia e toque em "Registrar Visita" para salvar aqui.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={estilos.safe}>
      {/* ── Cabeçalho ────────────────────────────────────── */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>📅 Histórico de Visitas</Text>
        <Text style={estilos.subtitulo}>
          {historico.length} registro(s) no servidor
        </Text>
      </View>

      {/* ── Loading inicial ──────────────────────────────── */}
      {carregando && historico.length === 0 && (
        <View style={estilos.loadingCenter}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={estilos.loadingTexto}>Buscando do servidor...</Text>
        </View>
      )}

      {/* ── Mensagem de erro ─────────────────────────────── */}
      {erro && !carregando && (
        <View style={estilos.erroBox}>
          <Text style={estilos.erroTexto}>⚠️ {erro}</Text>
          <TouchableOpacity onPress={carregarHistorico}>
            <Text style={estilos.erroRetry}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Lista de registros ───────────────────────────── */}
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderVazio}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={aoAtualizar}
            colors={['#2D6A4F']}
            tintColor="#2D6A4F"
          />
        }
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
    backgroundColor: '#1B4332',
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 12, color: '#74C69D', marginTop: 2 },

  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTexto: { color: '#52B788', fontSize: 14 },

  erroBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  erroTexto: { fontSize: 14, color: '#E63946' },
  erroRetry: { fontSize: 14, color: '#2D6A4F', fontWeight: '600' },

  lista: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  faixa: { width: 5 },
  cardConteudo: { flex: 1, padding: 14, gap: 6 },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipo: { fontSize: 13, fontWeight: '700' },
  data: { fontSize: 11, color: '#95D5B2' },
  bairro: { fontSize: 16, fontWeight: 'bold', color: '#1B4332' },

  coordenadasBox: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  coordenadasLabel: { fontSize: 11, color: '#74C69D', fontWeight: '600' },
  coordenadas: { fontSize: 11, color: '#555', fontFamily: 'monospace' },

  extensao: { fontSize: 12, color: '#52B788' },

  botaoDelete: {
    alignSelf: 'flex-end',
    padding: 6,
    marginTop: 4,
  },
  botaoDeleteTexto: { fontSize: 12, color: '#E63946' },

  vazio: { alignItems: 'center', padding: 40, gap: 10 },
  vazioPrincipal: { fontSize: 16, color: '#52B788', fontWeight: '600' },
  vazioSub: { fontSize: 13, color: '#95D5B2', textAlign: 'center' },
});
