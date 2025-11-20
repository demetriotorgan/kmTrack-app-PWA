// src/hooks/useSalvarAbastecimento.js
import { useState } from "react";
import api from "../api/api";
import { hhmmToIso, dateToIso } from "../util/time";

export default function useSalvarAbastecimento(carregarViagemTrecho,setTrechoSelecionado) {
  const [salvando, setSalvando] = useState(false);
  const [tipoAbastecimento, setTipoAbastecimento] = useState("inicial");

  const [novoAbastecimento, setNovoAbastecimento] = useState({
    odometro: "",
    litros: "",
    valor_total: "",
    preco_litro: "",
    cidade: "",
    data: "",
    hora: "",
    tipo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNovoAbastecimento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const criarPayload = () => {
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

  const resetarFormulario = () => {
    setNovoAbastecimento({
      odometro: "",
      litros: "",
      valor_total: "",
      preco_litro: "",
      cidade: "",
      data: "",
      hora: "",
      tipo: "",
    });
  };

  const handleSalvar = async (trechoId, callbackAtualizar) => {
    const confirmar = window.confirm(
      "Deseja realmente salvar este abastecimento?"
    );
    if (!confirmar) return;

    const payload = criarPayload();

    try {
      setSalvando(true);      
      // console.log("Payload:", payload);
      const response = await api.post(
        `/adicionar-abastecimento/${trechoId}`,
        payload
      );
      console.log(response.data);
      alert("Abastecimento salvo com sucesso!");
      resetarFormulario();
      carregarViagemTrecho();
      if (callbackAtualizar) callbackAtualizar(); // recarrega dados
      
    } catch (error) {
      console.error("Erro ao salvar abastecimento:", error);
      // 🔥 TRATAMENTO EXCLUSIVO PARA MODO OFFLINE
      if (error.offline) {
        alert(
          "📴 Você está offline.\nO abastecimento foi salvo localmente e será sincronizado automaticamente quando a conexão voltar."
        );

        // Criar abastecimento temporário
  const abastecimentoTemp = {
    ...payload,
    _id: `temp-${Date.now()}`,  // ID temporário
    offline: true               // marca como pendente
  };

  console.log(abastecimentoTemp);

  // ATUALIZAR apenas o trecho selecionado no frontend
  setTrechoSelecionado((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      abastecimentos: [abastecimentoTemp, ...prev.abastecimentos]
    };
  });

        // Resetamos o formulário normalmente (assim como no modo online)
        resetarFormulario();

        // ❗ NÃO chamar carregarViagemTrecho, pois estamos offline
        return;
      }
      // Outros erros reais
      alert("Erro ao salvar abastecimento.");

    } finally {
      setSalvando(false);
    }
  };

  return {
    salvando,
    novoAbastecimento,
    tipoAbastecimento,
    setTipoAbastecimento,
    handleChange,
    handleSalvar,
    setNovoAbastecimento
  };
}
