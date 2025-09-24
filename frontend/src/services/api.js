import axios from 'axios'
import toast from 'react-hot-toast'

// Configurar axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Adicionar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Resposta recebida:', {
      url: response.config?.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ [API] Erro na requisição:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    
    const message = error.response?.data?.message || 'Erro interno do servidor'
    
    // Não mostrar toast para erros 404 em algumas rotas específicas
    const isSilentError = error.response?.status === 404 && 
      (error.config?.url?.includes('/members/') || 
       error.config?.url?.includes('/attendance/'))
    
    if (!isSilentError) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api
