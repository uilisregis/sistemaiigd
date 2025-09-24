import api from './api'

export const serviceTypeService = {
  // Listar tipos de culto
  getServiceTypes: async () => {
    const response = await api.get('/service-types')
    return response.data
  },

  // Buscar tipo de culto por ID
  getServiceType: async (id) => {
    const response = await api.get(`/service-types/${id}`)
    return response.data
  },

  // Criar tipo de culto
  createServiceType: async (serviceTypeData) => {
    const response = await api.post('/service-types', serviceTypeData)
    return response.data
  },

  // Atualizar tipo de culto
  updateServiceType: async (id, serviceTypeData) => {
    const response = await api.put(`/service-types/${id}`, serviceTypeData)
    return response.data
  },

  // Deletar tipo de culto
  deleteServiceType: async (id) => {
    const response = await api.delete(`/service-types/${id}`)
    return response.data
  },
}
