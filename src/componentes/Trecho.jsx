import React, { useEffect, useState } from 'react'
import { CalendarArrowUp, Save } from "lucide-react";
import { useTrecho } from '../hooks/useTrecho';
import { useCarregarViagem } from '../hooks/useCarregarViagem';
import ModalSalvando from './ModalSalvando';
import api from '../api/api';
import CardTrecho from './CardTrecho';


const Trecho = () => {  
  const [trechos, setTrechos] = useState([]);
  const [deletando, setDeletando]=useState(false);

  // substituir a versão antiga por esta:
const adicionarTrechoLocal = (novoTrecho) => {
  // novoTrecho deve ter: viagemId, origem, destino, distanciaPercorrida, odometro, _id, offline:true
  setTrechos(prev => {
    const prevArray = Array.isArray(prev) ? prev : [];

    // tenta encontrar a viagem existente
    const idx = prevArray.findIndex(v => String(v._id) === String(novoTrecho.viagemId));

    if (idx !== -1) {
      // existe a viagem: adiciona o trecho no topo do array de trechos dessa viagem
      const viagem = prevArray[idx];
      const viagemComTrechos = {
        ...viagem,
        trechos: [ novoTrecho, ...(Array.isArray(viagem.trechos) ? viagem.trechos : []) ]
      };
      // retornar novo array com substituição imutável
      return [
        ...prevArray.slice(0, idx),
        viagemComTrechos,
        ...prevArray.slice(idx + 1)
      ];
    } else {
      // viagem não encontrada: cria um placeholder de viagem contendo esse trecho
      const placeholder = {
        _id: novoTrecho.viagemId || `unknown-${Date.now()}`,
        nome: 'Viagem (offline)',
        origem: '',
        destino: '',
        distanciaObjetivo: 0,
        dataInicio: null,
        dataFim: null,
        status: 'planejada',
        notasGerais: '',
        trechos: [ novoTrecho ],
      };
      return [ placeholder, ...prevArray ];
    }
  });
};

const { trecho, salvando, handleChange, handleSubmit,iniciarEdicao, editando } = useTrecho({adicionarTrechoLocal});  
const { viagens } = useCarregarViagem();

const listarTrechos = async () => {
  try {
    const response = await api.get('/viagens-com-trechos');
    const dados = response.data;
    // console.log('Lista da API: ', dados);

    if (!Array.isArray(dados)) {
      console.error("ERRO: API NÃO RETORNOU ARRAY", dados);
      setTrechos([]); 
      return;
    }
    setTrechos(dados);
  } catch (error) {
    console.error("Erro ao carregar trechos:", error);    
    setTrechos([]);
  }
};


const deletarTrecho = async(id)=>{  
  const confirmar = window.confirm('Realmente deseja excluir esse trecho?');

  if(!confirmar){
    alert('Operação cancelada')
    return;
  }
  try {
    setDeletando(true);
  const response = await api.delete(`/deletar-trecho/${id}`)
  console.log(response.data);
  listarTrechos();
  alert('Trecho excluido com sucesso');  
  } catch (error) {
    console.error('Erro ao excluir trecho', error);
  }finally{
    setDeletando(false);
  }  
};



  useEffect(()=>{
    listarTrechos();
  },[]);  

  return (
    <>
    <div className='container'>
      <div className='painel-form-cadastro'>
        <form onSubmit={(e)=>handleSubmit(e,listarTrechos)}>
          <h3><CalendarArrowUp /> {editando ? "Editar Trecho" : "Cadastrar Novo Trecho"}</h3>          
          <label>
            Novo Trecho de:
            <select 
              name='viagemId'
              value={trecho.viagemId}
              onChange={handleChange}>
              <option>Selecione uma Viagem</option>
              {viagens.map((viagem, index)=>(
                <option key={index} value={viagem._id}>{viagem.nome}</option>
              ))}              
            </select>
          </label>
          <label>
            Origem
            <input 
              type='text'
              name='origem' 
              value={trecho.origem}
              onChange={handleChange} 
            />
          </label>
          <label>
           Destino
            <input 
              type='text'
              name='destino' 
              value={trecho.destino}
              onChange={handleChange} 
            /> 
          </label>
          <label>
            Disância a Percorrer
            <input 
              type='number'
              name='distanciaPercorrida'
              value={trecho.distanciaPercorrida}
              onChange={handleChange}
            />
          </label>
          <label>
            Odometro
            <input 
            type='number'
            name='odometro'
            value={trecho.odometro}
            onChange={handleChange}
            />
          </label>
          <div className='painel-botao'>
          <button type='submit' className='botao-principal'><Save />{editando ? "Atualizar" : "Salvar"}</button>              
          </div>
        </form>
      </div>      
      {(salvando || deletando) && 
        <ModalSalvando />}
    </div>
    <div className='container'>
      <h2>Trechos Cadastrados</h2>
    </div>    
    {Array.isArray(trechos) &&  trechos.length > 0 && trechos.map((trecho, index)=>(
      <CardTrecho
        key={trecho._id}
        trecho={trecho}
        onEditarTrecho={iniciarEdicao}
        deletarTrecho={deletarTrecho}
      />
    ))}    
    </>
  )
}

export default Trecho