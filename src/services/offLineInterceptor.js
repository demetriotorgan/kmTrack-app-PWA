import api from "../api/api";
import { salvarItem } from "./idbService";
import { v4 as uuidv4 } from "uuid";

export function configurarOfflineInterceptor() {
  api.interceptors.request.use(async (config) => {
    // Se está offline → intercepta
    if (!navigator.onLine) {
      
      let safeData = null;

      // Clonar o body apenas se existir
      if (config.data !== undefined && config.data !== null) {
        try {
          safeData =
            typeof config.data === "string"
              ? JSON.parse(config.data)
              : JSON.parse(JSON.stringify(config.data));
        } catch {
          safeData = config.data; // fallback
        }
      }

      const pendente = {
        uuid: uuidv4(),
        url: config.url,
        method: config.method,
        data: safeData,
        timestamp: Date.now(),
      };

      await salvarItem("pendentes", pendente);

      console.warn("💾 Operação salva localmente (offline):", pendente);

      // Cancela envio real e deixa o catch() do seu hook tratar
      return Promise.reject({ offline: true });
    }

    return config;
  });
}
