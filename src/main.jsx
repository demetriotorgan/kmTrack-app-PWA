import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Inicio from './componentes/Inicio.jsx';
import Viagem from './componentes/Viagem.jsx';
import Trecho from './componentes/Trecho.jsx';
import Estatisticas from './componentes/Estatisticas.jsx';
import Abastecimentos from './componentes/Abastecimentos.jsx';
import Pedagios from './componentes/Pedagios.jsx';
import './services/syncManager.js';

import { configurarOfflineInterceptor } from './services/offLineInterceptor.js';
import { sincronizarPendentes } from './services/syncManager.js'

// Inicializa o interceptor
configurarOfflineInterceptor();

// 🔁 Escuta quando o app volta a ficar online e sincroniza pendências
window.addEventListener('online', async () => {
  console.log('🌐 Conexão restabelecida, iniciando sincronização...')
  await sincronizarPendentes()
});
// Opcional: tentar sincronizar assim que o app abrir
sincronizarPendentes()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {path: '/', element: <Inicio />},
      {path: '/viagem', element: <Viagem />},
      {path: '/trecho', element: <Trecho />},
      {path: '/estatisticas', element: <Estatisticas/>},
      {path: '/abastecimentos', element: <Abastecimentos/>},
      {path: '/pedagios', element: <Pedagios />},      
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
