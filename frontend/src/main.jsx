console.log('🚀 [MAIN] Iniciando aplicação React...')

import React from 'react'
console.log('✅ [MAIN] React importado')

import ReactDOM from 'react-dom/client'
console.log('✅ [MAIN] ReactDOM importado')

import { BrowserRouter } from 'react-router-dom'
console.log('✅ [MAIN] BrowserRouter importado')

import { QueryClient, QueryClientProvider } from 'react-query'
console.log('✅ [MAIN] React Query importado')

import { Toaster } from 'react-hot-toast'
console.log('✅ [MAIN] Toaster importado')

import App from './App.jsx'
console.log('✅ [MAIN] App component importado')

import './styles/index.css'
console.log('✅ [MAIN] CSS importado')

// Configurar React Query
console.log('🔧 [MAIN] Configurando React Query...')
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})
console.log('✅ [MAIN] React Query configurado')

// Verificar elemento root
const rootElement = document.getElementById('root')
console.log('🎯 [MAIN] Elemento root:', rootElement)

if (!rootElement) {
  console.error('❌ [MAIN] ERRO: Elemento root não encontrado!')
  throw new Error('Elemento root não encontrado')
}

console.log('🎨 [MAIN] Criando root do React...')
const root = ReactDOM.createRoot(rootElement)
console.log('✅ [MAIN] Root criado')

console.log('🚀 [MAIN] Renderizando aplicação...')
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
console.log('✅ [MAIN] Aplicação renderizada com sucesso!')
