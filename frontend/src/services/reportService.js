import api from './api'

export const reportService = {
  // Buscar estatísticas do dashboard
  getDashboardStats: async (groupId = null) => {
    const params = groupId ? { group_id: groupId } : {}
    const response = await api.get('/reports/dashboard-stats', { params })
    return response.data
  },

  // Buscar relatório mensal
  getMonthlyReport: async (year, month, groupId = null) => {
    const params = { year, month }
    if (groupId) params.group_id = groupId
    const response = await api.get('/reports/monthly', { params })
    return response.data
  },

  // Buscar estatísticas de presença
  getAttendanceStats: async (startDate, endDate) => {
    const response = await api.get('/reports/attendance-stats', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  // Buscar relatório de frequência
  getFrequencyReport: async (startDate, endDate, groupId = null) => {
    const params = { start_date: startDate, end_date: endDate }
    if (groupId) params.group_id = groupId
    const response = await api.get('/reports/frequency', { params })
    return response.data
  },

  // Exportar relatório
  exportReport: async (type, params) => {
    const response = await api.get(`/reports/export/${type}`, { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}