// src/hooks/useEditarPedagio.js  (substitua o arquivo existente)
import { useState } from "react";
import { isoToDateEdit } from "../util/time"; // se usa isto em iniciar edição
import { dateToIso } from "../util/time"; // usado para normalizar data ao compor payload/UI
import api from "../api/api";
import { salvarItem } from "../services/idbService";
import { v4 as uuidv4 } from "uuid";

export default function useEditarPedagio({ carregarViagemTrecho, novoPedagio, setNovoPedagio, setTrechoSelecionado }) {
  const [editando, setEditando] = useState(false);
  const [pedagioId, setPedagioId] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const handleEditar = (pedagio, formRef) => {
    setEditando(true);
    setNovoPedagio({
      valor: pedagio.valor,
      local: pedagio.local,
      data: isoToDateEdit(pedagio.data)
    });
    setPedagioId(pedagio._id);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const criarPayload = (novoPed) => {
    return {
      valor: novoPed.valor,
      local: novoPed.local,
      data: dateToIso(novoPed.data) // normaliza para ISO
    };
  };

  const editarPedagio = async (trechoId) => {
    const confirmar = window.confirm('Deseja editar este registro?');
    if (!confirmar) return;

    const payload = criarPayload(novoPedagio);

    try {
      setSalvandoEdicao(true);
      const response = await api.put(`/atualizar-pedagio/${trechoId}/${pedagioId}`, payload);
      console.log(response.data);
      alert('Registro alterado com sucesso');

      // reset form
      setNovoPedagio({ valor: "", local: "", data: "" });
      if (typeof carregarViagemTrecho === "function") carregarViagemTrecho();

      setEditando(false);
      setPedagioId('');
      return true;
    } catch (error) {
      console.error('❌ Erro ao editar pedágio:', error);

      // TRATAMENTO OFFLINE (interceptor retorna { offline: true })
      if (error?.offline) {
        // montar pendência para sincronização
        const pendente = {
          uuid: uuidv4(),
          type: "UPDATE_PEDAGIO",
          trechoId,
          pedagioId,
          url: `/atualizar-pedagio/${trechoId}/${pedagioId}`,
          method: "PUT",
          data: payload,
          timestamp: Date.now()
        };

        try {
          await salvarItem("pendentes", pendente);
          console.warn("💾 Edição salva offline (pendência):", pendente);
        } catch (e) {
          console.error("❌ Falha salvando pendência no idb:", e);
        }

        // Atualizar UI local: substituir o pedágio no trechoSelecionado
        if (typeof setTrechoSelecionado === "function") {
          setTrechoSelecionado(prev => {
            if (!prev) return prev;
            const before = Array.isArray(prev.pedagios) ? prev.pedagios : [];
            const updated = before.map(p => {
              if (String(p._id) === String(pedagioId)) {
                // manter _id igual (offline we are editing existing item), aplicar novos campos
                return {
                  ...p,
                  valor: payload.valor,
                  local: payload.local,
                  data: payload.data,
                  offlineEdited: true // marca opcional para UI / debug
                };
              }
              return p;
            });
            return { ...prev, pedagios: updated };
          });
        }

        alert(
          "Você está offline. A edição foi salva localmente e será sincronizada quando a conexão voltar."
        );

        // reset local form (igual online)
        setNovoPedagio({ valor: "", local: "", data: "" });
        setEditando(false);
        setPedagioId('');
        return true;
      }

      // erro real
      alert("Erro ao salvar edição. Verifique o console.");
      return false;
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return {
    handleEditar,
    editarPedagio,
    setPedagioId,
    editando,
    salvandoEdicao
  };
}
