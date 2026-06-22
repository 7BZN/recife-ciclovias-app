// ============================================================
// src/hooks/useCiclovias.js
// ============================================================

import { useState, useCallback } from 'react';
import { buscarCiclovias, buscarCicloviasPorTipo } from '../services/apiDadosRecife';
import { useAppContext } from '../context/AppContext';

export function useCiclovias() {
  // Estado local de paginação
  const [pagina, setPagina]   = useState(0);
  const [temMais, setTemMais] = useState(true);

  // Estado local de loading e erro (específicos deste hook)
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState(null);

  // Limite de registros por página
  const LIMITE = 20;

  // Acessa e atualiza a lista global de ciclovias
  const { ciclovias, setCiclovias } = useAppContext();

  // ── Carregamento inicial (página 0) ──────────────────────
  const carregarCiclovias = useCallback(async () => {
    if (carregando) return; // evita chamadas duplicadas

    setCarregando(true);
    setErro(null);

    try {
      const { registros, total } = await buscarCiclovias(LIMITE, 0);

      setCiclovias(registros);
      setPagina(1);

      // Verifica se ainda existem mais registros para buscar
      setTemMais(registros.length < total);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [carregando, setCiclovias]);

  // ── Paginação: carregar mais (infinite scroll) ────────────
  const carregarMais = useCallback(async () => {
    if (carregando || !temMais) return;

    setCarregando(true);

    try {
      const { registros } = await buscarCiclovias(LIMITE, pagina * LIMITE);

      // Adiciona os novos registros ao array existente
      setCiclovias((prev) => [...prev, ...registros]);
      setPagina((prev) => prev + 1);
      setTemMais(registros.length === LIMITE);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [carregando, temMais, pagina, setCiclovias]);

  // ── Filtrar por tipo ──────────────────────────────────────
  const filtrarPorTipo = useCallback(async (tipo) => {
    setCarregando(true);
    setErro(null);

    try {
      const registros = await buscarCicloviasPorTipo(tipo);
      setCiclovias(registros);
      setTemMais(false); // filtro sem paginação adicional
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [setCiclovias]);

  // ── Reset ─────────────────────────────────────────────────
  const resetar = useCallback(() => {
    setCiclovias([]);
    setPagina(0);
    setTemMais(true);
    setErro(null);
  }, [setCiclovias]);

  return {
    ciclovias,
    carregando,
    erro,
    temMais,
    carregarCiclovias,
    carregarMais,
    filtrarPorTipo,
    resetar,
  };
}
