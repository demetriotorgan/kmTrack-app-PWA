import React, { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react'
import '../styles/StatusConexao.css'

const StatusConexao = () => {
  const [online, setOnline] = useState(navigator.onLine)
  const [sincronizando, setSincronizando] = useState(false)

  useEffect(() => {
    const atualizarStatus = () => setOnline(navigator.onLine)
    const iniciarSync = () => setSincronizando(true)
    const finalizarSync = () => setSincronizando(false)

    window.addEventListener('online', atualizarStatus)
    window.addEventListener('offline', atualizarStatus)
    window.addEventListener('sync:start', iniciarSync)
    window.addEventListener('sync:end', finalizarSync)

    return () => {
      window.removeEventListener('online', atualizarStatus)
      window.removeEventListener('offline', atualizarStatus)
      window.removeEventListener('sync:start', iniciarSync)
      window.removeEventListener('sync:end', finalizarSync)
    }
  }, [])

  return (
    <div className={`status-conexao ${online ? 'online' : 'offline'}`}>
      {sincronizando ? (
        <>
          <RefreshCcw className="rotacionando" size={18} />
          <span>Sincronizando...</span>
        </>
      ) : online ? (
        <>
          <Wifi size={18} />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>Sem conexão</span>
        </>
      )}
    </div>
  )
}

export default StatusConexao
