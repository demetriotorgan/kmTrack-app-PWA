import { useState } from "react";
import api from "../api/api";

const useAtualizarHorarioTrecho = (tipo, hora, setTipo,setHora,carregarViagemTrecho)=>{
    const [salvando, setSalvando] = useState(false);

const payload = (tipo, hora) => {
  const data =  new Date();
  const [h,m] = hora.split(':');
  data.setHours(h);
  data.setMinutes(m);
  return {
    [tipo === 'inicio' ? 'tempoInicialMovimento' : 'tempoFinalMovimento']: data.toISOString()
  };
}

    const atualizarHorario = async(id)=>{
  try {
      // console.log('Gerando payload: ',payload(tipo, hora));         
      const confirmar = window.confirm('Realmente deseja Salvar este horário?');
      if(!confirmar){
        return;
      }
      setSalvando(true);
      const response = await api.put(`/atualizar-tempo/${id}`, payload(tipo, hora));
      alert('Horário registrado com sucesso');
      setTipo('inicio');
      setHora('');
      carregarViagemTrecho();
    } catch (error) {
       if (error?.offline) {
        // ⚠ IMPORTANTE: O interceptor JÁ salvou no IndexedDB aqui
        alert("Você está offline. O horário foi salvo e será sincronizado automaticamente.");
        
        // Comportamento normal após salvar
        setTipo("inicio");
        setHora("");

      } else {
        console.error("Erro ao registrar horário:", error);
        alert("Falha ao salvar horário.");
      }
    }finally{
      setSalvando(false);
    }
    }
    return {atualizarHorario, salvando}
};

export default useAtualizarHorarioTrecho