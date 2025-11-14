import api from '../api/api'
import { listarItens, removerItem } from './idbService'

export async function sincronizarPendentes() {
  const pendentes = await listarItens('pendentes');

  console.log("📦 Pendentes encontrados:", pendentes);

  if (pendentes.length === 0) {
    console.log("✅ Nenhuma operação pendente.");
    return;
  }

  console.log(`🔄 Iniciando sincronização de ${pendentes.length} operações...`);

  // Notificar início
  window.dispatchEvent(new CustomEvent("sync:start"));

  try {
    for (const item of pendentes) {
      try {
        await api({
          url: item.url,
          method: item.method,
          data: item.data,
        });

        console.log("✔ Sincronizado com sucesso:", item.url);

        // Remover pendência
        await removerItem("pendentes", item.uuid);

      } catch (error) {
        if (error.response?.status === 409) {
          console.warn("⚠ Registro já existe no servidor. Removendo pendência...");
          await removerItem("pendentes", item.uuid);
        } else {
          console.error("❌ Falha ao sincronizar:", error);
          // Mantém pendência para tentar depois
          continue;
        }
      }
    }
  } finally {
    // Disparado apenas uma vez, após toda a sincronização
    window.dispatchEvent(new CustomEvent("sync:end"));
  }
}
