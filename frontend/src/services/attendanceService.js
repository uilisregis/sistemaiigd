import api from './api'

export const attendanceService = {
  // Listar presenças
  getAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params })
    return response.data
  },

  // Buscar presença por ID
  getAttendanceById: async (id) => {
    const response = await api.get(`/attendance/${id}`)
    return response.data
  },

  // Marcar presença
  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData)
    return response.data
  },

  // Marcar presença em lote
  markBulkAttendance: async (bulkData) => {
    const response = await api.post('/attendance/bulk', bulkData)
    return response.data
  },

  // Atualizar presença
  updateAttendance: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData)
    return response.data
  },

  // Deletar presença
  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`)
    return response.data
  },

  // Buscar estatísticas de presença
  getAttendanceStats: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await api.get('/attendance/stats', { params })
    return response.data
  },

  // Buscar membros ausentes
  getAbsentMembers: async () => {
    const response = await api.get('/attendance/absent')
    return response.data
  },

  // Buscar presenças por membro
  getMemberAttendance: async (memberId, limit = 100, offset = 0) => {
    const response = await api.get('/attendance', {
      params: { memberId, limit, offset }
    })
    return response.data
  },

  // Buscar presenças por data
  getAttendanceByDate: async (date) => {
    const response = await api.get('/attendance', {
      params: { date }
    })
    return response.data
  },

  // Buscar presenças por período
  getAttendanceByDateRange: async (startDate, endDate) => {
    const response = await api.get('/attendance', {
      params: { startDate, endDate }
    })
    return response.data
  },

  // Buscar presenças por tipo de culto
  getAttendanceByServiceType: async (serviceType) => {
    const response = await api.get('/attendance', {
      params: { serviceType }
    })
    return response.data
  },

  // Buscar presenças por data e tipo de culto
  getAttendanceByDateAndService: async (date, serviceType) => {
    const response = await api.get('/attendance', {
      params: { date, serviceType }
    })
    return response.data
  },

  // Remover presença
  removeAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`)
    return response.data
  },

  // Buscar tipos de culto
  getServiceTypes: async () => {
    const response = await api.get('/service-types')
    return response.data
  },
}
