// Validação de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone brasileiro
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

// Validação de CPF
export const isValidCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

// Validação de data
export const isValidDate = (date) => {
  if (!date) return false
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj)
}

// Validação de arquivo
export const isValidFile = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], maxSize = 10 * 1024 * 1024) => {
  if (!file) return { valid: false, message: 'Nenhum arquivo selecionado' }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` 
    }
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      message: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / (1024 * 1024))}MB` 
    }
  }
  
  return { valid: true }
}

// Validação de nome
export const isValidName = (name) => {
  if (!name || name.trim().length < 2) return false
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim())
}

// Validação de endereço
export const isValidAddress = (address) => {
  if (!address) return true // Endereço é opcional
  return address.trim().length >= 5
}

// Validação de senha
export const isValidPassword = (password) => {
  if (!password || password.length < 6) return false
  return true
}

// Validação de URL
export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validação de número
export const isValidNumber = (number) => {
  return !isNaN(number) && isFinite(number)
}

// Validação de string não vazia
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0
}

// Validação de array não vazio
export const isNotEmptyArray = (array) => {
  return Array.isArray(array) && array.length > 0
}

// Validação de objeto
export const isValidObject = (obj) => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

// Validação de ID
export const isValidId = (id) => {
  return isValidNumber(id) && parseInt(id) > 0
}

// Validação de data futura
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) > new Date()
}

// Validação de data passada
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) < new Date()
}

// Validação de idade mínima
export const isValidAge = (birthDate, minAge = 0, maxAge = 150) => {
  if (!isValidDate(birthDate)) return false
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= minAge && age <= maxAge
}
