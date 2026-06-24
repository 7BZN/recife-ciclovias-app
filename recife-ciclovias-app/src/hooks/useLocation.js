// ============================================================
// src/hooks/useLocation.js
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';

export function useLocation() {
  // Estado local do hook
  const [permissaoNegada, setPermissaoNegada] = useState(false);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState(null);

  // Referência ao subscriber de watchPosition (para cancelar ao desmontar)
  const [subscriber, setSubscriber] = useState(null);

  // Acessa o setter de localização do contexto global
  const { setUserLocation } = useAppContext();

  // ── Solicitar permissão ────────────────────────────────────
  // Deve ser chamado explicitamente (não no useEffect)
  // para que o diálogo apareça no momento certo da UI.
  const solicitarPermissao = useCallback(async () => {
    setCarregandoLocalizacao(true);
    setErroLocalizacao(null);

    try {
      // requestForegroundPermissionsAsync: pede permissão de uso em primeiro plano
      // (enquanto o app está aberto). Não pede background — mais simples e suficiente.
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // Usuário negou a permissão
        setPermissaoNegada(true);
        setErroLocalizacao(
          'Permissão de localização negada. Habilite nas configurações do dispositivo.'
        );
        return false;
      }

      // Permissão concedida — captura a localização imediatamente
      await capturarLocalizacao();
      return true;
    } catch (erro) {
      setErroLocalizacao(`Erro ao solicitar permissão: ${erro.message}`);
      return false;
    } finally {
      setCarregandoLocalizacao(false);
    }
  }, []);

  // ── Capturar posição atual ────────────────────────────────
  const capturarLocalizacao = useCallback(async () => {
    try {
      setCarregandoLocalizacao(true);

      // getCurrentPositionAsync: obtém uma única leitura de GPS.
      // accuracy: HIGH usa GPS + torres de celular (mais preciso).
      const localizacao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = localizacao.coords;

      // Atualiza o contexto global com as coordenadas
      setUserLocation({ latitude, longitude });

      return { latitude, longitude };
    } catch (erro) {
      // GPS desligado ou erro de hardware
      setErroLocalizacao(
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.'
      );
      return null;
    } finally {
      setCarregandoLocalizacao(false);
    }
  }, [setUserLocation]);

  // ── Monitoramento contínuo (watch) ────────────────────────
  // Atualiza a cada ~5 metros de deslocamento
  const iniciarMonitoramento = useCallback(async () => {
    // Cancela um subscriber anterior se existir
    if (subscriber) {
      subscriber.remove();
    }

    try {
      // watchPositionAsync: chama o callback a cada mudança de posição
      // distanceInterval: mínimo de 5 metros entre atualizações (economiza bateria)
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,      // metros mínimos entre updates
          timeInterval: 10000,      // ms mínimos entre updates (10s)
        },
        (localizacao) => {
          const { latitude, longitude } = localizacao.coords;
          setUserLocation({ latitude, longitude });
        }
      );

      setSubscriber(sub);
    } catch (erro) {
      setErroLocalizacao(`Erro no monitoramento: ${erro.message}`);
    }
  }, [subscriber, setUserLocation]);

  // ── Parar monitoramento ───────────────────────────────────
  const pararMonitoramento = useCallback(() => {
    if (subscriber) {
      subscriber.remove();  // cancela o watcher (libera GPS e bateria)
      setSubscriber(null);
    }
  }, [subscriber]);

  // ── Cleanup automático ao desmontar o componente ──────────
  // Essencial: sem isso, o watcher continuaria rodando em background
  useEffect(() => {
    return () => {
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [subscriber]);

  return {
    permissaoNegada,
    carregandoLocalizacao,
    erroLocalizacao,
    solicitarPermissao,
    capturarLocalizacao,
    iniciarMonitoramento,
    pararMonitoramento,
  };
}
