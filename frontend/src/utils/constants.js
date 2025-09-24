// Tipos de culto padrão
export const DEFAULT_SERVICE_TYPES = [
  { name: 'Culto Dominical', description: 'Culto principal aos domingos' },
  { name: 'Culto de Quarta', description: 'Culto de meio de semana' },
  { name: 'Culto de Oração', description: 'Culto de oração' },
  { name: 'Escola Bíblica', description: 'Aula da escola bíblica' },
  { name: 'Reunião de Jovens', description: 'Reunião do grupo de jovens' },
  { name: 'Reunião de Senhoras', description: 'Reunião do grupo de senhoras' },
  { name: 'Reunião de Homens', description: 'Reunião do grupo de homens' },
  { name: 'Culto de Crianças', description: 'Culto especial para crianças' },
  { name: 'Culto de Jovens', description: 'Culto especial para jovens' },
  { name: 'Culto de Casais', description: 'Culto especial para casais' },
]

// Status de presença
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  WARNING: 'warning',
  RECENT: 'recent',
  UNKNOWN: 'unknown',
}

// Cores para status
export const STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'success',
  [ATTENDANCE_STATUS.ABSENT]: 'danger',
  [ATTENDANCE_STATUS.WARNING]: 'warning',
  [ATTENDANCE_STATUS.RECENT]: 'success',
  [ATTENDANCE_STATUS.UNKNOWN]: 'secondary',
}

// Limites de ausência
export const ABSENCE_LIMITS = {
  WARNING_DAYS: 14, // Aviso após 14 dias
  ABSENT_DAYS: 21,  // Ausente após 21 dias
  CRITICAL_DAYS: 30, // Crítico após 30 dias
}

// Tipos de arquivo permitidos
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png'],
  DOCUMENTS: ['application/pdf'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
}

// Tamanhos de arquivo
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  TOTAL: 50 * 1024 * 1024, // 50MB por membro
}

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
}

// Configurações de cache
export const CACHE_KEYS = {
  MEMBERS: 'members',
  ATTENDANCE: 'attendance',
  SERVICE_TYPES: 'service_types',
  STATS: 'stats',
}

// Tempos de cache (em minutos)
export const CACHE_TIMES = {
  MEMBERS: 5,
  ATTENDANCE: 2,
  SERVICE_TYPES: 30,
  STATS: 10,
}

// Mensagens de erro
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  NOT_FOUND: 'Registro não encontrado.',
  UNAUTHORIZED: 'Acesso não autorizado.',
  FORBIDDEN: 'Acesso negado.',
  CONFLICT: 'Conflito de dados.',
  TIMEOUT: 'Tempo limite excedido.',
}

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro criado com sucesso!',
  UPDATED: 'Registro atualizado com sucesso!',
  DELETED: 'Registro deletado com sucesso!',
  SAVED: 'Dados salvos com sucesso!',
  UPLOADED: 'Arquivo enviado com sucesso!',
  ATTENDANCE_MARKED: 'Presença marcada com sucesso!',
}

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right',
  MAX_TOASTS: 3,
}

// Dias da semana
export const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

// Meses do ano
export const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Configurações de gráficos
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
]

// Configurações de exportação
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
}

// Configurações de backup
export const BACKUP_CONFIG = {
  AUTO_BACKUP_DAYS: 7,
  MAX_BACKUP_FILES: 30,
  BACKUP_FORMAT: 'json',
}
