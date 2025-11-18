import { useState } from 'react';
import axios from 'axios';
import api from '../api/api';

export const useTrecho = ({adicionarTrechoLocal}) => {
  const trechoInicial = {
    viagemId: '',
    origem: '',
    destino: '',
    distanciaPercorrida: '',
    odometro: ''
  };

  const [trecho, setTrecho] = useState(trechoInicial);
  const [salvando, setSalvando] = useState(false);
   const [editando, setEditando] = useState(false);


  // 🔹 Atualizar campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrecho((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Validação simples
  const validarCampos = () => {
    const obrigatorios = ['origem', 'destino', 'distanciaPercorrida'];
    for (let campo of obrigatorios) {
      if (!trecho[campo] || trecho[campo].toString().trim() === '') {
        return `O campo "${campo}" é obrigatório.`;
      }
    }
    return null;
  };

   // 🔹 Entrar no modo de edição (usado pelo componente pai)
  const iniciarEdicao = (trechoSelecionado) => {
    setTrecho({
      _id: trechoSelecionado._id,
      viagemId: trechoSelecionado.viagemId,
      origem: trechoSelecionado.origem,
      destino: trechoSelecionado.destino,
      distanciaPercorrida: trechoSelecionado.distanciaPercorrida,
      odometro: trechoSelecionado.odometro
    });
    setEditando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔹 Envio ao backend
  const handleSubmit = async (e, callbackPosSalvar) => {
    e.preventDefault();

    const erroValidacao = validarCampos();
    if (erroValidacao) {
      alert(`❌ ${erroValidacao}`);
      return;
    }

     if (!trecho.viagemId) {
      alert("❌ Selecione uma viagem.");
      return;
    }

    const confirmar = window.confirm('Deseja realmente salvar o novo Trecho?');
    if (!confirmar) {
      alert('🚫 Operação cancelada.');
      return;
    }

    try {
      setSalvando(true);    
      if(editando && trecho._id){
        // 🔸 Atualização
        const response = await api.put(`/atualizar-trecho/${trecho._id}`, trecho);
        alert('✏️ Trecho atualizado com sucesso!');
        console.log('Trecho atualizado:', response.data);
      }else{
        const response = await api.post('/salvar-trecho', trecho);
        console.log(response.data);       
        alert('✅ Trecho salvo com sucesso!');
      }      
       setTrecho(trechoInicial);
       setEditando(false);

       // 🔹 Atualizar lista no componente pai (callback opcional)
      if (callbackPosSalvar) callbackPosSalvar();
      
    } catch (error) {
      console.log('Erro ao salvar novo Trecho: ', error);      
    
      const erroDeRede =
    !navigator.onLine ||
    error.code === "ERR_NETWORK" ||
    !error.response; // sem resposta = API inacessível

   if (erroDeRede) {
  const trechoOffline = {
    ...trecho,
    _id: `offline-${Date.now()}`,
    offline: true
  };

  if (typeof adicionarTrechoLocal === 'function') {
    adicionarTrechoLocal(trechoOffline); // insere no lugar certo
    console.log('Trecho offline adicionado localmente:', trechoOffline);
  } else {
    console.warn('adicionarTrechoLocal não é função — trecho não foi adicionado localmente.');
  }

  alert(
    "📴 Você está offline.\n\n" +
    "O trecho foi salvo no dispositivo e será sincronizada quando a conexão voltar."
  );
  setTrecho(trechoInicial);
  return;
}
    alert('❌ Erro ao cadastrar trecho.');
    } finally {
      setSalvando(false);
    }
  };

  return {
    trecho,
    setTrecho,
    salvando,
    editando,
    handleChange,
    handleSubmit,
    iniciarEdicao
  };
};
