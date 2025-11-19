import { useState } from 'react';
import api from '../api/api';
import { hhmmToIso } from '../util/time';
import { calcularDiferencaHorario } from '../util/calcularDiferencaHorario';
import { isoToHHMM } from '../util/time';

/**
 * Hook responsável por gerenciar o fluxo de edição de paradas.
 * - Prepara os dados para edição
 * - Envia atualização para o backend
 */
const useEditarParada = (carregarViagemTrecho) => {
  const [editando, setEditando] = useState(false);
  const [paradaEditando, setParadaEditando] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Prepara os dados da parada para edição
  const iniciarEdicao = (parada, setTipoParada, setTempoInicioISO, setTempoFinalISO, setLocal, setObs) => {
    if (!parada) {
      console.warn('⚠️ iniciarEdicao: parada inválida');
      return;
    }

    const dadosEditados = {
      _id: parada._id,
      tipo: parada.tipo,
      tempoDeParada: parada.tempoDeParada,
      tempoInicialParada: isoToHHMM(parada.tempoInicialParada),
      tempoFinalParada: isoToHHMM(parada.tempoFinalParada),
      local: parada.local,
      observacao: parada.observacao
    };

    setTipoParada(dadosEditados.tipo);
    setTempoInicioISO(dadosEditados.tempoInicialParada);
    setTempoFinalISO(dadosEditados.tempoFinalParada);
    setLocal(dadosEditados.local);
    setObs(dadosEditados.observacao);

    setParadaEditando(dadosEditados);
    setEditando(true);

    console.log('✏️ Dados carregados para edição:', dadosEditados);
  };

  // Envia atualização para o backend
  const salvarEdicao = async (tipoParada, tempoInicioISO, tempoFinalISO, local, obs) => {
    if (!paradaEditando) return;

    const tempoInicialEditado = hhmmToIso(tempoInicioISO);
    const tempoFinalEditado = hhmmToIso(tempoFinalISO);
    const tempoDeParada = calcularDiferencaHorario(tempoInicioISO, tempoFinalISO);

    const payloadEditado = {
      id: paradaEditando._id,
      tipo: tipoParada,
      tempoInicialEditado,
      tempoFinalEditado,
      tempoDeParada,
      local,
      observacao: obs
    };

    console.log('📦 Payload Editado:', payloadEditado);

    try {
      const confirmar = window.confirm('Deseja realmente editar este registro?');
      if (!confirmar) return;

      setSalvandoEdicao(true);
      await api.put(`/editar-parada/${payloadEditado.id}`, payloadEditado);
      alert('✅ Registro atualizado com sucesso!');
      carregarViagemTrecho();
      setEditando(false);
      setParadaEditando(null);
    } catch (error) {
       console.error("❌ Erro ao editar parada:", error);

  if (error.offline) {
    alert("📴 Você está offline. A edição será sincronizada automaticamente quando o app voltar à internet.");
    return;
  }
  alert("Erro ao salvar edição. Tente novamente mais tarde.");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return {
    editando,
    salvandoEdicao,
    iniciarEdicao,
    salvarEdicao
  };
};

export default useEditarParada;
