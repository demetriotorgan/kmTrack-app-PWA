import api from '../api/api'
import { salvarItem } from './idbService'
import { v4 as uuidv4 } from 'uuid'

export function configurarOfflineInterceptor() {
  api.interceptors.request.use(async (config) => {
    if (!navigator.onLine) {
      const pendente = {
        uuid: uuidv4(),
        url: config.url,
        method: config.method,
        data: config.data,
        timestamp: Date.now(),
      }
      await salvarItem('pendentes', pendente)
      console.warn('💾 Operação salva localmente (offline):', pendente)
      // cancela envio real
      return Promise.reject({ offline: true })
    }
    return config
  })
}
