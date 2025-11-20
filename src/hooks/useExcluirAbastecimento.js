// src/hooks/useExcluirAbastecimento.js
import { useState } from "react";
import api from "../api/api";

export default function useExcluirAbastecimento(carregarViagemTrecho,setTrechoSelecionado) {
  const [excluindo, setExcluindo] = useState(false);

  const excluirAbastecimento = async (trechoId, abastecimentoId) => {
    const confirmar = window.confirm("Deseja excluir este abastecimento?");
      if (!confirmar) return;
      setExcluindo(true);

    try {
      const response = await api.delete(
        `/excluir-abastecimento/${trechoId}/${abastecimentoId}`
      );

      console.log(response.data);
      alert("Registro excluído com sucesso");

      // recarrega os dados da tela
      carregarViagemTrecho();
    } catch (error) {
      console.error("Erro ao excluir:", error);

      // 🔥 TRATAMENTO EXCLUSIVO PARA MODO OFFLINE
      if (error.offline) {
        alert(
          "📴 Você está offline.\nA exclusão foi registrada localmente e será sincronizada quando a conexão voltar."
        );

        // Atualizar apenas no trecho selecionado
        setTrechoSelecionado((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            abastecimentos: prev.abastecimentos
              .filter(a => a._id !== abastecimentoId)
              .map(a =>
                a.offline
                  ? a // abastecimentos offline removidos não precisam ser "marcados"
                  : { ...a, excluirOffline: true } // marca para sincronizar depois
              )
          };
        });

        return; // não chama carregarViagemTrecho porque estamos offline
      }

      alert("Erro ao excluir abastecimento.");
    } finally {
      setExcluindo(false);
    }
  };

  return {
    excluindo,
    excluirAbastecimento,
  };
}
