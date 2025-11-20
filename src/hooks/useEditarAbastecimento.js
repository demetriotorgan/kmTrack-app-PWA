import { useState } from "react";
import api from "../api/api";
import { hhmmToIso, dateToIso, isoToHHMM, isoToDateEdit } from "../util/time";

export default function useEditarAbastecimento(setNovoAbastecimento, formRef,setTrechoSelecionado) {
  const [editando, setEditando] = useState(false);
  const [abastecimentoId, setAbastecimentoId] = useState("");
  const [editandoAwait, setEditandoAwait] = useState(false);

  // -----------------------------------------
  // ✅ Preencher formulário para edição
  // -----------------------------------------
  const iniciarEdicao = (abastecimento) => {
    setEditando(true);

    setNovoAbastecimento({
      odometro: abastecimento.odometro || "",
      litros: abastecimento.litros || "",
      valor_total: abastecimento.valorTotal || "",
      preco_litro: abastecimento.precoPorLitro || "",
      cidade: abastecimento.cidade || "",
      data: isoToDateEdit(abastecimento.data || ""),
      hora: isoToHHMM(abastecimento.hora || ""),
      tipo: abastecimento.tipo || "",
    });

    setAbastecimentoId(abastecimento._id);

    // 🔥 Scroll para o formulário
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // -----------------------------------------
  // ✅ Criar payload para atualizar
  // -----------------------------------------
  const criarPayload = (novoAbastecimento, tipoAbastecimento) => {
    return {
      odometro: novoAbastecimento.odometro,
      litros: novoAbastecimento.litros,
      valorTotal: novoAbastecimento.valor_total,
      precoPorLitro: novoAbastecimento.preco_litro,
      cidade: novoAbastecimento.cidade,
      data: dateToIso(novoAbastecimento.data),
      hora: hhmmToIso(novoAbastecimento.hora),
      tipo: tipoAbastecimento,
    };
  };

  // -----------------------------------------
  // ✅ Enviar PUT — Editar abastecimento
  // -----------------------------------------
  const salvarEdicao = async (trechoId, novoAbastecimento, tipoAbastecimento, carregarViagemTrecho) => {

    setEditandoAwait(true);
    
    const confirmar = window.confirm("Deseja realmente alterar este abastecimento?");
    if (!confirmar) return;

    const payload = criarPayload(novoAbastecimento, tipoAbastecimento);

    try {
      setEditandoAwait(true);    

      const response = await api.put(
        `/editar-abastecimento/${trechoId}/${abastecimentoId}`,
        payload
      );

      alert("Abastecimento editado com sucesso!");
      carregarViagemTrecho();      
    } catch (error) {
       console.error("Erro ao editar abastecimento:", error);

      // ======================
      //  🔥 TRATAMENTO OFFLINE
      // ======================
      if (error.offline) {
        alert(
          "Você está offline.\n\nA alteração foi salva localmente e será sincronizada quando a conexão voltar."
        ); 
        // 🔥 ATUALIZA IMEDIATAMENTE NA TELA (offline)
        setTrechoSelecionado((prev) => ({
          ...prev,
          abastecimentos: prev.abastecimentos.map((a) =>
            a._id === abastecimentoId ? { ...a, ...payload } : a
          ),
        }));    

      } else {
        alert("Erro ao editar abastecimento");
      }

    }finally{
      setEditandoAwait(false);
      setEditando(false);
      setAbastecimentoId("");
      setNovoAbastecimento({
        odometro: "",
      litros: "",
      valor_total: "",
      preco_litro: "",
      cidade: "",
      data: "",
      hora: "",
      tipo: ""
      });
    }
  };

  return {
    editando,
    iniciarEdicao,
    salvarEdicao,
    editandoAwait,
  };
}
