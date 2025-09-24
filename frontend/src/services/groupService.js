import api from './api'

export const groupService = {
  // Listar grupos
  getGroups: async (params = {}) => {
    const response = await api.get('/groups', { params })
    return response.data
  },

  // Buscar grupo por ID
  getGroup: async (id) => {
    const response = await api.get(`/groups/${id}`)
    return response.data
  },

  // Criar grupo
  createGroup: async (data) => {
    const response = await api.post('/groups', data)
    return response.data
  },

  // Atualizar grupo
  updateGroup: async (id, data) => {
    const response = await api.put(`/groups/${id}`, data)
    return response.data
  },

  // Deletar grupo
  deleteGroup: async (id) => {
    const response = await api.delete(`/groups/${id}`)
    return response.data
  },

  // Adicionar membro ao grupo
  addMemberToGroup: async (groupId, memberId) => {
    const response = await api.post(`/groups/${groupId}/members`, { member_id: memberId })
    return response.data
  },

  // Remover membro do grupo
  removeMemberFromGroup: async (groupId, memberId) => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`)
    return response.data
  },

  // Buscar membros do grupo
  getGroupMembers: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/members`)
    return response.data
  },

  // Associar membros ao grupo (função que estava faltando)
  associateMembers: async (groupId, memberIds) => {
    const response = await api.post(`/groups/${groupId}/associate`, { member_ids: memberIds })
    return response.data
  }
}