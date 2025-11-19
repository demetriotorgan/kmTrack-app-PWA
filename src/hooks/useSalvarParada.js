import { useState } from "react";
import api from "../api/api";
import { calcularDiferencaHorario } from "../util/calcularDiferencaHorario";

const useSalvarParada = (carregarViagemTrecho) => {
  const [salvando, setSalvando] = useState(false);  

  const salvarParada = async (trechoId, tipoParada, tempoInicioISO, tempoFinalISO, local, obs ) => {
      if (!tempoInicioISO || !tempoFinalISO) {
    alert("Preencha os horários de início e término da parada.");
    return;
  }

  // Data atual no formato YYYY-MM-DD
  const hoje = new Date().toISOString().split('T')[0];

  // Cria objetos Date a partir da data + hora
  const inicioDate = new Date(`${hoje}T${tempoInicioISO}:00`);
  const finalDate = new Date(`${hoje}T${tempoFinalISO}:00`);

  // Ajuste para caso o horário final seja após a meia-noite
  if (finalDate < inicioDate) {
    finalDate.setDate(finalDate.getDate() + 1);
  }

    const payload = {
      tipo:tipoParada,
      tempoInicialParada: inicioDate.toISOString(),
      tempoFinalParada: finalDate.toISOString(),
      tempoDeParada: calcularDiferencaHorario(tempoInicioISO,tempoFinalISO),
      local: local,
      observacao: obs
    }
    // console.log('Payload: ', payload);
    // console.log('Id do trecho: ', trechoSelecionado._id)
    const confirmar = window.confirm('Deseja realmente salvar esta parada?')
    if(!confirmar){
      return
    }

    try {
      setSalvando(true);
      const response = await api.post(`/salvar-parada/${trechoId}`, payload)
      console.log(response.data);
      alert('Parada salva com sucesso');
      carregarViagemTrecho();
    } catch (error) {
        console.log("Erro ao salvar parada:", error);

      if (error?.offline) {
        // ⚠ O interceptor JÁ salvou no IndexedDB aqui:
        alert(
          "Você está offline. A parada foi salva e será sincronizada automaticamente quando a conexão retornar."
        );

        // Nenhum reload necessário — sincronização acontece depois
      } else {
        alert("Não foi possível salvar a parada.");
      }
    }finally{
      setSalvando(false);
    }
  };

  return { salvarParada, salvando };
};

export default useSalvarParada;
