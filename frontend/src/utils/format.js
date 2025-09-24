import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Formatar data
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    
    return format(dateObj, pattern, { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

// Formatar data e hora
export const formatDateTime = (date, pattern = 'dd/MM/yyyy HH:mm') => {
  return formatDate(date, pattern)
}

// Formatar data relativa (ex: "há 2 dias")
export const formatRelativeDate = (date) => {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '-'
    
    const now = new Date()
    const diffInDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `Há ${diffInDays} dias`
    if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
    if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`
    
    return `Há ${Math.floor(diffInDays / 365)} anos`
  } catch (error) {
    return '-'
  }
}

// Formatar telefone
export const formatPhone = (phone) => {
  if (!phone) return '-'
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Formatar baseado no tamanho
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// Formatar CPF
export const formatCPF = (cpf) => {
  if (!cpf) return '-'
  
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  return cpf
}

// Formatar tamanho de arquivo
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatar número com separadores
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0'
  return number.toLocaleString('pt-BR')
}

// Formatar porcentagem
export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

// Formatar idade
export const formatAge = (birthDate) => {
  if (!birthDate) return '-'
  
  try {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate
    if (!isValid(birth)) return '-'
    
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return `${age} anos`
  } catch (error) {
    return '-'
  }
}

// Formatar status de presença
export const formatAttendanceStatus = (lastAttendance, daysThreshold = 21) => {
  if (!lastAttendance) return { status: 'absent', text: 'Nunca veio', color: 'danger' }
  
  try {
    const lastDate = typeof lastAttendance === 'string' ? parseISO(lastAttendance) : lastAttendance
    if (!isValid(lastDate)) return { status: 'unknown', text: 'Data inválida', color: 'secondary' }
    
    const now = new Date()
    const diffInDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return { status: 'present', text: 'Presente hoje', color: 'success' }
    } else if (diffInDays <= 7) {
      return { status: 'recent', text: `Há ${diffInDays} dias`, color: 'success' }
    } else if (diffInDays <= daysThreshold) {
      return { status: 'warning', text: `Há ${diffInDays} dias`, color: 'warning' }
    } else {
      return { status: 'absent', text: `Há ${diffInDays} dias`, color: 'danger' }
    }
  } catch (error) {
    return { status: 'unknown', text: 'Erro', color: 'secondary' }
  }
}
