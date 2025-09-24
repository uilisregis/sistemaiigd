console.log('📱 [APP] Iniciando importações...')

import { Routes, Route } from 'react-router-dom'
console.log('✅ [APP] Routes e Route importados')

import { Layout } from './components/common/Layout'
console.log('✅ [APP] Layout importado')

import { Dashboard } from './pages/Dashboard'
console.log('✅ [APP] Dashboard importado')

import { Members } from './pages/Members'
console.log('✅ [APP] Members importado')

import { Attendance02 } from './pages/Attendance02'
console.log('✅ [APP] Attendance02 importado')

import { Reports } from './pages/Reports'
console.log('✅ [APP] Reports importado')

import { Settings } from './pages/Settings'
console.log('✅ [APP] Settings importado')

function App() {
  console.log('🎯 [APP] Componente App sendo renderizado')
  
  try {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/attendance" element={<Attendance02 />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    )
  } catch (error) {
    console.error('❌ [APP] Erro ao renderizar:', error)
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#fef2f2', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>❌ Erro no App</h1>
          <p style={{ color: '#7f1d1d' }}>{error.message}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1rem' }}>
            Verifique o console para mais detalhes
          </p>
        </div>
      </div>
    )
  }
}

export default App
