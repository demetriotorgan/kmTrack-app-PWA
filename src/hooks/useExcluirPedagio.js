import { useState } from "react";
import api from "../api/api";
import { salvarItem } from "../services/idbService";
import { v4 as uuidv4 } from "uuid";

export default function useExcluirPedagio({carregarViagemTrecho, setTrechoSelecionado}){
  const [excluindo, setExcluindo] = useState(false);

//   console.log("DEBUG → Recebido no hook:", {
//   carregarViagemTrecho,
//   setTrechoSelecionado
// });

  const excluirPedagio = async (trechoId, pedagioId) => {

    // console.log("🟦 INICIANDO EXCLUSÃO", { trechoId, pedagioId });

    const confirmar = window.confirm("Deseja realmente excluir este registro?");
    if (!confirmar) return false;

    try {
      setExcluindo(true);

      const response = await api.delete(
        `/excluir-pedagio/${trechoId}/${pedagioId}`
      );

      // console.log("🟩 ONLINE → API retornou sucesso:", response.data);

      if (navigator.onLine && typeof carregarViagemTrecho === "function") {
        console.log("🔄 Recarregando dados do trecho...");
        carregarViagemTrecho();
      }

      alert("Registro excluído com sucesso!");
      return true;

    } catch (error) {
      // console.warn("🟧 CATCH → Erro capturado:", error);

      // 🟡 Fluxo OFFLINE
      if (error?.offline) {
        // console.log("🟨 OFFLINE → Salvando pendência no IndexedDB...");

        const pendente = {
          uuid: uuidv4(),
          type: "DELETE_PEDAGIO",
          trechoId,
          pedagioId,
          url: `/excluir-pedagio/${trechoId}/${pedagioId}`,
          method: "DELETE",
          timestamp: Date.now()
        };

        await salvarItem("pendentes", pendente);
        console.log("💾 Pendência salva:", pendente);

        // 🟣 DEBUG PARA ENTENDER POR QUE O UI NÃO REMOVE O ITEM
        if (typeof setTrechoSelecionado === "function") {
          // console.log("🟪 Chamando setTrechoSelecionado()...");

          setTrechoSelecionado(prev => {
            // console.log("🔍 PREV antes da remoção:", JSON.parse(JSON.stringify(prev)));

            if (!prev) {
              // console.error("❌ prev é NULL — não dá para atualizar o trechoSelecionado!");
              return prev;
            }

            if (!Array.isArray(prev.pedagios)) {
              // console.error("❌ prev.pedagios não é uma array!", prev.pedagios);
              return prev;
            }

            const novoArray = prev.pedagios.filter(p =>
              String(p._id) !== String(pedagioId)
            );

            // console.log("🧹 FILTER aplicado. Items antes:", prev.pedagios.length);
            // console.log("🧹 Items depois:", novoArray.length);

            const updated = {
              ...prev,
              pedagios: novoArray
            };

            // console.log("📦 OBJETO FINAL enviado ao estado:", updated);

            return updated;
          });
        } else {
          console.error("❌ setTrechoSelecionado NÃO é uma função!");
        }

        alert(
          "Sem internet! O pedágio foi marcado para exclusão e foi removido da tela. Ele será realmente apagado quando a conexão voltar."
        );

        return true;
      }

      // ❌ Erro real
      console.error("❌ ERRO REAL (não é offline):", error);
      alert("Erro ao excluir o pedágio. Tente novamente.");
      return false;

    } finally {
      console.log("⬛ Finalizando exclusão...");
      setExcluindo(false);
    }
  };

  return { excluirPedagio, excluindo };
}
