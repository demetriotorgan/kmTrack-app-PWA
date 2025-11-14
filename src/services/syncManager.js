import api from '../api/api'
import { listarItens, removerItem } from './idbService'

export async function sincronizarPendentes() {
  try {
    const pendentes = await listarItens('pendentes')
    if (pendentes.length === 0) {
      console.log('✅ Nenhuma operação pendente para sincronizar.')
      return
    }

    console.log(`🔄 Iniciando sincronização de ${pendentes.length} operações...`)

    // 🔔 Dispara evento para notificar o StatusConexao
    window.dispatchEvent(new CustomEvent('sync:start'))

    for (const item of pendentes) {
      try {
        const { url, method, data, headers } = item
        await api.request({ url, method, data, headers })
        await removerItem('pendentes', item.uuid)
        console.log(`☁️ Sincronizado com sucesso: ${url}`)
      } catch (err) {
        console.warn(`⚠️ Falha ao sincronizar ${item.url}:`, err.message)
      }
    }

    console.log('✅ Sincronização concluída.')
  } catch (err) {
    console.error('❌ Erro ao sincronizar pendentes:', err)
  } finally {
    // 🔔 Notifica que terminou
    window.dispatchEvent(new CustomEvent('sync:end'))
  }
}
