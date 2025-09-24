import api from './api'

export const memberService = {
  // Listar membros
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params })
    return response.data
  },

  // Buscar membro por ID
  getMember: async (id) => {
    const response = await api.get(`/members/${id}`)
    return response.data
  },

  // Criar membro
  createMember: async (memberData) => {
    const response = await api.post('/members', memberData)
    return response.data
  },

  // Atualizar membro
  updateMember: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData)
    return response.data
  },

  // Deletar membro
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`)
    return response.data
  },

  // Upload de foto
  uploadPhoto: async (id, photoFile) => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    
    const response = await api.post(`/members/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload de arquivos
  uploadFiles: async (id, files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await api.post(`/members/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Buscar membros ausentes
  getAbsentMembers: async (days = 21) => {
    const response = await api.get('/members/absent', { params: { days } })
    return response.data
  },

  // Buscar estatísticas do membro
  getMemberStats: async (id) => {
    const response = await api.get(`/members/${id}/stats`)
    return response.data
  },

  // Buscar membros por nome
  searchMembers: async (searchTerm) => {
    const response = await api.get('/members', { 
      params: { search: searchTerm } 
    })
    return response.data
  },

  // Exclusão lógica de membro
  softDeleteMember: async (id, reason) => {
    const response = await api.patch(`/members/${id}/soft-delete`, { reason })
    return response.data
  },
}
