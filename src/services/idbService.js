import { openDB } from 'idb'

const DB_NAME = 'kmtrack-db'
const DB_VERSION = 1

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('viagens')) db.createObjectStore('viagens', { keyPath: '_id', autoIncrement: true })
      if (!db.objectStoreNames.contains('trechos')) db.createObjectStore('trechos', { keyPath: '_id', autoIncrement: true })
      if (!db.objectStoreNames.contains('paradas')) db.createObjectStore('paradas', { keyPath: '_id', autoIncrement: true })
      if (!db.objectStoreNames.contains('abastecimentos')) db.createObjectStore('abastecimentos', { keyPath: '_id', autoIncrement: true })
      if (!db.objectStoreNames.contains('pedagios')) db.createObjectStore('pedagios', { keyPath: '_id', autoIncrement: true })
      if (!db.objectStoreNames.contains('pendentes')) db.createObjectStore('pendentes', { keyPath: 'uuid' })
    },
  })
}

export async function salvarItem(store, item) {
  const db = await getDB()
  await db.put(store, item)
}

export async function listarItens(store) {
  const db = await getDB()
  return await db.getAll(store)
}

export async function removerItem(store, key) {
  const db = await getDB()
  await db.delete(store, key)
}
