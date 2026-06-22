// ============================================================
// src/screens/DetalhesScreen.js
//
// Tela de detalhes de uma ciclovia específica.
//
// Responsabilidades:
//   - Exibir todos os dados do registro selecionado
//   - Mostrar distância até o usuário (se localização disponível)
//   - Botão para salvar localização + ciclovia no backend
//   - Feedback visual do salvamento (loading / sucesso / erro)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useAppContext }      from '../context/AppContext';
import { salvarLocalizacao }  from '../services/apiBackend';
import { calcularDistanciaKm, corPorTipo, formatarDataHora } from '../utils/helpers';

export default function DetalhesScreen({ route }) {
  // Os dados da ciclovia são passados via parâmetros de navegação
  const { ciclovia } = route.params;

  const { userLocation } = useAppContext();

  // Estado do salvamento
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]       = useState(false);

  // ── Calcular distância (se localização disponível) ──────
  const distancia =
    userLocation && ciclovia.latitude && ciclovia.longitude
      ? calcularDistanciaKm(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(ciclovia.latitude),
          parseFloat(ciclovia.longitude)
        )
      : null;

  // ── Salvar localização + ciclovia no backend ─────────────
  const aoSalvar = async () => {
    if (!userLocation) {
      Alert.alert(
        'Localização indisponível',
        'Ative a localização para registrar sua posição.'
      );
      return;
    }

    setSalvando(true);

    try {
      await salvarLocalizacao({
        latitude:   userLocation.latitude,
        longitude:  userLocation.longitude,
        cicloviaId: ciclovia._id?.toString() || 'N/A',
        tipo:       ciclovia.tipo      || 'Não informado',
        bairro:     ciclovia.bairro    || 'Não informado',
        extensaoKm: ciclovia.extensao_km
          ? parseFloat(ciclovia.extensao_km)
          : null,
      });

      setSalvo(true);
      Alert.alert('✅ Salvo!', 'Sua visita foi registrada com sucesso.');
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setSalvando(false);
    }
  };

  // ── Cor do tipo ──────────────────────────────────────────
  const cor = corPorTipo(ciclovia.tipo);

  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      {/* ── Badge do tipo ────────────────────────────────── */}
      <View style={[estilos.badge, { backgroundColor: cor }]}>
        <Text style={estilos.badgeTexto}>{ciclovia.tipo || 'Tipo desconhecido'}</Text>
      </View>

      {/* ── Título / bairro ──────────────────────────────── */}
      <Text style={estilos.bairro}>{ciclovia.bairro || 'Bairro não informado'}</Text>

      {/* ── Distância do usuário ─────────────────────────── */}
      {distancia !== null ? (
        <View style={estilos.distanciaBox}>
          <Text style={estilos.distanciaIcone}>📍</Text>
          <Text style={estilos.distanciaTexto}>
            {distancia} km de distância
          </Text>
        </View>
      ) : (
        <Text style={estilos.semLocalizacao}>
          Ative a localização para ver a distância
        </Text>
      )}

      {/* ── Dados técnicos ───────────────────────────────── */}
      <View style={estilos.secao}>
        <Text style={estilos.secaoTitulo}>Informações Técnicas</Text>

        <InfoLinha label="ID" valor={ciclovia._id} />
        <InfoLinha label="Tipo" valor={ciclovia.tipo} />
        <InfoLinha label="Bairro" valor={ciclovia.bairro} />
        <InfoLinha label="Logradouro" valor={ciclovia.logradouro} />
        <InfoLinha
          label="Extensão"
          valor={
            ciclovia.extensao_km
              ? `${ciclovia.extensao_km} km`
              : null
          }
        />
        <InfoLinha label="Largura" valor={ciclovia.largura_m ? `${ciclovia.largura_m} m` : null} />
        <InfoLinha label="Situação" valor={ciclovia.situacao} />
      </View>

      {/* ── Coordenadas geográficas ───────────────────────── */}
      {(ciclovia.latitude || ciclovia.longitude) && (
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Coordenadas</Text>
          <InfoLinha label="Latitude" valor={ciclovia.latitude} />
          <InfoLinha label="Longitude" valor={ciclovia.longitude} />
        </View>
      )}

      {/* ── Botão de salvar visita ───────────────────────── */}
      <TouchableOpacity
        style={[
          estilos.botao,
          salvo && estilos.botaoSalvo,
          salvando && estilos.botaoCarregando,
        ]}
        onPress={aoSalvar}
        disabled={salvando || salvo}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={estilos.botaoTexto}>
            {salvo ? '✅ Visita Registrada' : '📌 Registrar Visita'}
          </Text>
        )}
      </TouchableOpacity>

      {/* ── Nota sobre a API ──────────────────────────────── */}
      <Text style={estilos.nota}>
        Dados fornecidos pelo Portal de Dados Abertos da Prefeitura do Recife
      </Text>
    </ScrollView>
  );
}

// ── Componente auxiliar para cada linha de informação ────────
function InfoLinha({ label, valor }) {
  if (!valor) return null;
  return (
    <View style={estilos.infoLinha}>
      <Text style={estilos.infoLabel}>{label}:</Text>
      <Text style={estilos.infoValor}>{String(valor)}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  conteudo: { padding: 20, gap: 16 },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  bairro: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },

  distanciaBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distanciaIcone: { fontSize: 18 },
  distanciaTexto: { fontSize: 15, color: '#2D6A4F', fontWeight: '600' },
  semLocalizacao: { fontSize: 13, color: '#95D5B2', fontStyle: 'italic' },

  secao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 1,
  },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: '#1B4332', marginBottom: 4 },

  infoLinha: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoLabel: { fontSize: 13, color: '#74C69D', fontWeight: '600', minWidth: 80 },
  infoValor: { fontSize: 13, color: '#333333', flex: 1 },

  botao: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoSalvo: { backgroundColor: '#52B788' },
  botaoCarregando: { opacity: 0.7 },
  botaoTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  nota: {
    fontSize: 11,
    color: '#95D5B2',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
