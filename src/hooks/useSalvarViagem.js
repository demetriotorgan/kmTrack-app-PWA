import { useState } from 'react';
import api from '../api/api';

export const useViagem = ({ recarregar, adicionarLocal }) => {
  const viagemInicial = {
    nome: '',
    origem: '',
    destino: '',
    distanciaObjetivo: '',
    dataInicio: '',
    dataFim: '',
    status: 'planejada',
    notasGerais: ''
  };

  const [viagem, setViagem] = useState(viagemInicial);
  const [salvando, setSalvando] = useState(false);

  // 🔹 Atualiza qualquer campo do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setViagem((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔹 Validação dos campos obrigatórios
  const validarCampos = () => {
    const obrigatorios = ['nome', 'origem', 'destino', 'distanciaObjetivo', 'dataInicio', 'dataFim'];
    for (let campo of obrigatorios) {
      if (!viagem[campo] || viagem[campo].toString().trim() === '') {
        return `O campo "${campo}" é obrigatório.`;
      }
    }
    return null; // tudo ok
  };

  // 🔹 Envia os dados para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Verifica campos obrigatórios antes de enviar
    const erroValidacao = validarCampos();
    if (erroValidacao) {
      alert(`❌ ${erroValidacao}`);
      return;
    }

    const confirmar = window.confirm('Deseja realmente salvar esta viagem?');
    if (!confirmar) {
      alert('🚫 Operação cancelada.');
      return;
    }

    try {
      setSalvando(true);

      if (viagem._id) {
        const response = await api.put(`/editar-viagem/${viagem._id}`, viagem);
        alert('✏️ Viagem atualizada com sucesso!')
        console.log('Dados Atualziados', response.data);
      } else {
        const response = await api.post('/salvar-viagem', viagem);
        alert('✅ Viagem cadastrada com sucesso!');
        console.log('Dados enviados:', response.data);
      }

      //Atualiza lista de viagens com novo registro salvo
      await recarregar();

      // 🔹 Reseta o formulário
      setViagem(viagemInicial);

    } catch (error) {
        console.error("Erro ao salvar viagem: ", error);

  const erroDeRede =
    !navigator.onLine ||
    error.code === "ERR_NETWORK" ||
    !error.response; // sem resposta = API inacessível

  if (erroDeRede) {
    adicionarLocal({
      ...viagem,
      _id: `offline-${Date.now()}`,
      offline: true
    });

    alert(
      "📴 Você está offline.\n\n" +
      "A viagem foi salva no dispositivo e será sincronizada quando a conexão voltar."
    );

    setViagem(viagemInicial);
    return;
  }

  alert("❌ Erro ao cadastrar viagem.");
    } finally {
      setSalvando(false);
    }
  };

  return {
    viagem,
    setViagem,
    handleChange,
    handleSubmit,
    salvando
  };
};
