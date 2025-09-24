import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Calendar, Users, CheckCircle, Clock, ChevronRight, X, BarChart3, Settings } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { memberService } from '../services/memberService'
import { attendanceService } from '../services/attendanceService'
import { serviceTypeService } from '../services/serviceTypeService'
import { groupService } from '../services/groupService'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

export function Attendance02() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('attendance_date')
    return saved || new Date().toISOString().split('T')[0]
  })
  const [selectedServiceType, setSelectedServiceType] = useState(() => {
    return localStorage.getItem('attendance_service_type') || ''
  })
  const [selectedGroup, setSelectedGroup] = useState(() => {
    return localStorage.getItem('attendance_group') || ''
  })
  const [showMemberList, setShowMemberList] = useState(() => {
    return localStorage.getItem('attendance_show_list') === 'true'
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [memberToConfirm, setMemberToConfirm] = useState(null)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [activeTab, setActiveTab] = useState('config') // 'config', 'history', 'edit'
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [filtersApplied, setFiltersApplied] = useState(() => {
    return localStorage.getItem('attendance_filters_applied') === 'true'
  })
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState(() => {
    return localStorage.getItem('attendance_time') || ''
  })
  const [presentMembers, setPresentMembers] = useState(() => {
    const saved = localStorage.getItem('attendance_present_members')
    return saved ? JSON.parse(saved) : []
  })
  const queryClient = useQueryClient()

  // Buscar membros do grupo selecionado
  const { data: membersData, isLoading: membersLoading } = useQuery(
    ['members', selectedGroup],
    () => {
      if (selectedGroup) {
        return memberService.getMembers({ group_id: selectedGroup, limit: 100 })
      } else {
        return memberService.getMembers({ limit: 100 })
      }
    },
    { 
      select: (data) => data.data || [],
      enabled: filtersApplied,
      retry: 1
    }
  )


  // Buscar tipos de culto
  const { data: serviceTypesData } = useQuery(
    'service-types',
    () => serviceTypeService.getServiceTypes(),
    { select: (data) => data.data || [] }
  )

  // Salvar no localStorage sempre que os valores mudarem
  React.useEffect(() => {
    localStorage.setItem('attendance_date', selectedDate)
  }, [selectedDate])

  React.useEffect(() => {
    localStorage.setItem('attendance_service_type', selectedServiceType)
  }, [selectedServiceType])

  React.useEffect(() => {
    localStorage.setItem('attendance_group', selectedGroup)
  }, [selectedGroup])

  React.useEffect(() => {
    localStorage.setItem('attendance_show_list', showMemberList.toString())
  }, [showMemberList])

  React.useEffect(() => {
    localStorage.setItem('attendance_filters_applied', filtersApplied.toString())
  }, [filtersApplied])

  React.useEffect(() => {
    localStorage.setItem('attendance_time', selectedTime)
  }, [selectedTime])

  React.useEffect(() => {
    localStorage.setItem('attendance_present_members', JSON.stringify(presentMembers))
  }, [presentMembers])

  // Carregar horários quando selecionar tipo de culto
  React.useEffect(() => {
    if (selectedServiceType && serviceTypesData) {
      const serviceType = serviceTypesData.find(type => type.name === selectedServiceType)
      if (serviceType && serviceType.schedule) {
        const times = serviceType.schedule.split(', ').filter(time => time.trim())
        setAvailableTimes(times)
        // Não limpar selectedTime se já estiver salvo no localStorage
        if (!selectedTime) {
          setSelectedTime('')
        }
      } else {
        setAvailableTimes([])
        if (!selectedTime) {
          setSelectedTime('')
        }
      }
    } else {
      setAvailableTimes([])
      if (!selectedTime) {
        setSelectedTime('')
      }
    }
  }, [selectedServiceType, serviceTypesData, selectedTime])

  // Buscar grupos
  const { data: groupsData } = useQuery(
    'groups',
    () => groupService.getGroups(),
    { select: (data) => data.data || [] }
  )

  // Buscar presenças do dia e culto selecionado
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['attendance', selectedDate, selectedServiceType],
    () => attendanceService.getAttendanceByDateAndService(selectedDate, selectedServiceType),
    { 
      select: (data) => data?.data || [],
      enabled: !!selectedServiceType,
      retry: 1,
      onError: (error) => {
        console.error('Erro ao buscar presenças:', error)
      }
    }
  )

  // Mutation para marcar presença
  const markAttendanceMutation = useMutation(attendanceService.markAttendance, {
    onSuccess: () => {
      toast.success('Presença marcada com sucesso!')
      queryClient.invalidateQueries(['attendance'])
    },
    onError: (error) => {
      toast.error('Erro ao marcar presença: ' + error.message)
    }
  })

  // Mutation para remover presença
  const removeAttendanceMutation = useMutation(attendanceService.removeAttendance, {
    onSuccess: () => {
      toast.success('Presença removida com sucesso!')
      queryClient.invalidateQueries(['attendance'])
    },
    onError: (error) => {
      toast.error('Erro ao remover presença: ' + error.message)
    }
  })

  const isLoading = membersLoading || attendanceLoading

  // Verificar se membro está presente
  const isMemberPresent = (memberId) => {
    if (!attendanceData || !Array.isArray(attendanceData)) return false
    return attendanceData.some(attendance => attendance.member_id === memberId)
  }

  // Marcar/remover presença
  const handleToggleAttendance = async (memberId) => {
    try {
      if (presentMembers.includes(memberId)) {
        // Remover presença
        setPresentMembers(prev => prev.filter(id => id !== memberId))
        const attendance = attendanceData?.find(a => a.member_id === memberId)
        if (attendance) {
          removeAttendanceMutation.mutate(attendance.id)
        }
      } else {
        // Marcar presença
        setPresentMembers(prev => [...prev, memberId])
        markAttendanceMutation.mutate({
          memberId,
          date: selectedDate,
          serviceType: selectedServiceType
        })
      }
    } catch (error) {
      console.error('Erro ao alternar presença:', error)
      toast.error('Erro ao processar presença')
    }
  }

  // Filtrar membros por grupo
  const filteredMembers = React.useMemo(() => {
    if (!membersData) return []
    
    if (selectedGroup) {
      return membersData.filter(member => member.group_id === parseInt(selectedGroup))
    }
    
    return membersData
  }, [membersData, selectedGroup])

  // Separar membros presentes e ausentes baseado no estado local
  const { presentMembers: presentMembersList, absentMembers } = React.useMemo(() => {
    if (!filteredMembers.length) return { presentMembers: [], absentMembers: [] }
    
    const present = []
    const absent = []
    
    filteredMembers.forEach(member => {
      const isPresent = presentMembers.includes(member.id)
      
      if (isPresent) {
        present.push(member)
      } else {
        absent.push(member)
      }
    })
    
    console.log('Debug - presentMembers:', presentMembers)
    console.log('Debug - filteredMembers:', filteredMembers.length)
    console.log('Debug - present:', present.length)
    console.log('Debug - absent:', absent.length)
    
    return { presentMembers: present, absentMembers: absent }
  }, [filteredMembers, presentMembers])

  const handleApply = () => {
    if (!selectedServiceType) {
      toast.error('Selecione um tipo de culto')
      return
    }
    
    if (!selectedTime) {
      toast.error('Selecione um horário')
      return
    }
    
    // Aplicar filtros e carregar membros
    setFiltersApplied(true)
    setShowMemberList(true)
    
    const groupName = selectedGroup 
      ? groupsData?.find(g => g.id === parseInt(selectedGroup))?.name 
      : 'todos os membros'
    toast.success(`Carregando ${groupName} para o culto das ${selectedTime}...`)
  }

  const handleMemberClick = (member) => {
    setMemberToConfirm(member)
    setShowConfirmModal(true)
  }

  const handlePresentMemberClick = (member) => {
    setMemberToRemove(member)
    setShowRemoveModal(true)
  }

  const handleConfirmPresence = () => {
    if (memberToConfirm) {
      // Adicionar membro ao estado local imediatamente
      setPresentMembers(prev => {
        if (!prev.includes(memberToConfirm.id)) {
          return [...prev, memberToConfirm.id]
        }
        return prev
      })

      markAttendanceMutation.mutate({
        memberId: memberToConfirm.id,
        date: selectedDate,
        serviceType: selectedServiceType
      }, {
        onSuccess: (data) => {
          if (data.alreadyMarked) {
            toast.success('Membro já estava presente!')
          } else {
            toast.success('Presença confirmada! Membro movido para presentes.')
          }
          setShowConfirmModal(false)
          setMemberToConfirm(null)
        },
        onError: () => {
          // Remover do estado local em caso de erro
          setPresentMembers(prev => prev.filter(id => id !== memberToConfirm.id))
          setShowConfirmModal(false)
          setMemberToConfirm(null)
        }
      })
    }
  }

  const handleRemovePresence = () => {
    if (memberToRemove) {
      // Remover membro do estado local imediatamente
      setPresentMembers(prev => prev.filter(id => id !== memberToRemove.id))

      // Buscar e remover do backend
      const attendance = attendanceData?.find(a => a.member_id === memberToRemove.id)
      if (attendance) {
        removeAttendanceMutation.mutate(attendance.id, {
          onSuccess: () => {
            toast.success('Presença removida! Membro voltou para a lista.')
            setShowRemoveModal(false)
            setMemberToRemove(null)
          },
          onError: () => {
            // Reverter em caso de erro
            setPresentMembers(prev => [...prev, memberToRemove.id])
            setShowRemoveModal(false)
            setMemberToRemove(null)
          }
        })
      } else {
        // Se não encontrou no backend, apenas remover do estado local
        toast.success('Presença removida! Membro voltou para a lista.')
        setShowRemoveModal(false)
        setMemberToRemove(null)
      }
    }
  }

  const handleFinalizeDay = () => {
    // Salvar dados do culto no histórico
    const cultoData = {
      id: Date.now(), // ID único baseado em timestamp
      date: selectedDate,
      serviceType: selectedServiceType,
      time: selectedTime,
      group: selectedGroup ? groupsData?.find(g => g.id === parseInt(selectedGroup))?.name : 'Todos os membros',
      groupId: selectedGroup,
      totalMembers: filteredMembers.length,
      presentMembers: presentMembersList.length,
      absentMembers: absentMembers.length,
      presentMembersIds: presentMembers,
      finalizedAt: new Date().toISOString(),
      status: 'finalized'
    }

    // Salvar no localStorage
    const existingHistory = JSON.parse(localStorage.getItem('attendance_history') || '[]')
    existingHistory.unshift(cultoData) // Adicionar no início da lista
    localStorage.setItem('attendance_history', JSON.stringify(existingHistory))

    // Resetar todos os estados
    setShowMemberList(false)
    setSelectedServiceType('')
    setSelectedGroup('')
    setSelectedTime('')
    setFiltersApplied(false)
    setPresentMembers([])
    setAvailableTimes([])
    
    // Limpar localStorage dos filtros
    localStorage.removeItem('attendance_show_list')
    localStorage.removeItem('attendance_filters_applied')
    localStorage.removeItem('attendance_present_members')
    localStorage.removeItem('attendance_service_type')
    localStorage.removeItem('attendance_group')
    localStorage.removeItem('attendance_time')

    toast.success(`Culto finalizado! ${cultoData.presentMembers} presentes de ${cultoData.totalMembers} membros.`)
  }

  const handleResetFilters = () => {
    setShowMemberList(false)
    setSelectedServiceType('')
    setSelectedGroup('')
    setSelectedTime('')
    setFiltersApplied(false)
    setPresentMembers([]) // Limpar membros presentes
    toast.success('Filtros resetados')
  }

  if (isLoading && !membersData) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Presença 02 - Sistema Atualizado</h1>
          <p className="page-subtitle">Controle de presença com seleção de grupos</p>
        </div>
        <LoadingGrid />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
            <div className="page-header">
              <h1 className="page-title">Controle de Presença</h1>
              <p className="page-subtitle">Marque a presença dos membros nos cultos</p>
            </div>

            {/* Sistema de Abas */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('config')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'config'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Configurar
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="inline h-4 w-4 mr-2" />
                    Histórico
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'edit'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Settings className="inline h-4 w-4 mr-2" />
                    Editar
                  </button>
                </nav>
              </div>
            </div>

      {/* Conteúdo da Aba Configurar */}
      {activeTab === 'config' && (
        <>
          {/* Filtros */}
          <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurar Presença</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Data do Culto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Culto
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Tipo de Culto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Culto
              </label>
              <div className="relative">
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Selecione o culto</option>
                  {serviceTypesData?.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 rotate-90" />
              </div>
            </div>

            {/* Seleção de Grupo - OPCIONAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo (Opcional)
              </label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Todos os membros</option>
                  {groupsData?.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 rotate-90" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Horários Disponíveis */}
      {selectedServiceType && availableTimes.length > 0 && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <Clock className="inline h-5 w-5 mr-2" />
              Selecione o Horário do Culto
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border-2
                    ${selectedTime === time
                      ? 'bg-blue-700 text-white border-blue-700 shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
            {selectedTime && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2 font-medium">Horário selecionado:</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-700 text-white shadow-md">
                  {selectedTime}
                  <button
                    type="button"
                    onClick={() => setSelectedTime('')}
                    className="ml-2 text-white hover:text-red-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              💡 Selecione o horário em que você está marcando a presença
            </p>
          </CardBody>
        </Card>
      )}

      {/* Botões de Ação */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm">
              {!filtersApplied ? (
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  <span>Configure os filtros, selecione um horário e clique em <strong>"Aplicar Filtros"</strong> para carregar os membros</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>✓ Filtros aplicados - {filteredMembers.length} membro(s) carregado(s)</span>
                  {selectedGroup && (
                    <span className="ml-2 text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full">
                      Grupo: {groupsData?.find(g => g.id === parseInt(selectedGroup))?.name}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {filtersApplied && (
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Resetar Filtros
                </Button>
              )}
              <Button
                onClick={handleApply}
                disabled={!selectedServiceType || !selectedTime}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estatísticas */}
      {filtersApplied && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Presentes</p>
                  <p className="text-2xl font-bold text-gray-900">{presentMembersList.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-gray-100">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ausentes</p>
                  <p className="text-2xl font-bold text-gray-900">{absentMembers.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Mensagem quando não há filtros aplicados */}
      {!filtersApplied && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Configure os filtros para começar
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Selecione a data, tipo de culto e um horário,<br />
                opcionalmente um grupo, depois clique em "Aplicar" para carregar os membros.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lista de Membros - Layout em Duas Colunas */}
      {filtersApplied && showMemberList && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna 1: Membros */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Membros
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDate)} - {selectedServiceType} - {selectedTime}
                  </p>
                  {selectedGroup && (
                    <p className="text-xs text-blue-600 mt-1">
                      Grupo: {groupsData?.find(g => g.id === parseInt(selectedGroup))?.name}
                    </p>
                  )}
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-700">
                    {absentMembers.length} membro{absentMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {absentMembers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {absentMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className="flex flex-col items-center p-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex-shrink-0 mb-2">
                        {member.photo_path ? (
                          <img
                            src={`/api/uploads/${member.photo_path}`}
                            alt={member.name}
                            className="w-20 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-24 bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <p className="text-xs font-medium text-gray-900 truncate" title={member.name}>
                          {member.name}
                        </p>
                        <div className="flex items-center justify-center mt-1">
                          <Users className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Clique para marcar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Todos presentes!</h3>
                  <p className="mt-2 text-sm text-gray-500">Todos os membros já marcaram presença.</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Coluna 2: Presentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Membros Presentes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDate)} - {selectedServiceType}
                  </p>
                  {selectedGroup && (
                    <p className="text-xs text-blue-600 mt-1">
                      Grupo: {groupsData?.find(g => g.id === parseInt(selectedGroup))?.name}
                    </p>
                  )}
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-green-700">
                    {presentMembersList.length} presente{presentMembersList.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {presentMembersList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {presentMembersList.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handlePresentMemberClick(member)}
                      className="flex flex-col items-center p-2 border-2 border-green-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex-shrink-0 mb-2">
                        {member.photo_path ? (
                          <img
                            src={`/api/uploads/${member.photo_path}`}
                            alt={member.name}
                            className="w-20 h-24 object-cover rounded-lg border-2 border-green-200"
                          />
                        ) : (
                          <div className="w-20 h-24 bg-green-200 rounded-lg border-2 border-green-200 flex items-center justify-center">
                            <Users className="h-8 w-8 text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <p className="text-xs font-medium text-gray-900 truncate" title={member.name}>
                          {member.name}
                        </p>
                        <div className="flex items-center justify-center mt-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">Presente</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum presente ainda</h3>
                  <p className="mt-2 text-sm text-gray-500">Clique nos membros ausentes para marcar presença.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Botão Finalizar */}
      {filtersApplied && showMemberList && (
        <Card>
          <CardBody>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowFinalizeModal(true)}
                variant="outline"
                className="px-8"
              >
                Finalizar Dia
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && memberToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Presença</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              {memberToConfirm.photo_path ? (
                <img
                  src={`/api/uploads/${memberToConfirm.photo_path}`}
                  alt={memberToConfirm.name}
                  className="w-24 h-28 object-cover rounded-lg mx-auto border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-28 bg-gray-200 rounded-lg mx-auto border-2 border-gray-200 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <h4 className="mt-3 text-xl font-medium text-gray-900">{memberToConfirm.name}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {formatDate(selectedDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {selectedTime}
                </p>
                <p className="text-sm text-gray-600">
                  ⛪ {selectedServiceType}
                </p>
                {selectedGroup && (
                  <p className="text-sm text-blue-600">
                    👥 {groupsData?.find(g => g.id === parseInt(selectedGroup))?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 text-center">
                💡 Ao confirmar, este membro será movido para a lista de presentes
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPresence}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                ✅ Confirmar Presença
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Conteúdo da Aba Histórico */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Cultos</h3>
              <p className="text-sm text-gray-600 mb-6">
                Visualize todos os cultos que foram finalizados e suas estatísticas.
              </p>
              
              {(() => {
                const history = JSON.parse(localStorage.getItem('attendance_history') || '[]')
                
                if (history.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum culto finalizado</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Finalize um culto na aba "Configurar" para ver o histórico aqui.
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {history.map((culto) => (
                      <div key={culto.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {formatDate(culto.date)} - {culto.serviceType}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {culto.time} • {culto.group}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              Finalizado em {new Date(culto.finalizedAt).toLocaleString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {culto.id}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{culto.totalMembers}</div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{culto.presentMembers}</div>
                            <div className="text-sm text-gray-600">Presentes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{culto.absentMembers}</div>
                            <div className="text-sm text-gray-600">Ausentes</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Taxa de presença: {culto.totalMembers > 0 ? Math.round((culto.presentMembers / culto.totalMembers) * 100) : 0}%
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implementar visualização detalhada
                                  toast.info('Visualização detalhada em desenvolvimento')
                                }}
                              >
                                Ver Detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implementar edição
                                  toast.info('Edição em desenvolvimento')
                                }}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Conteúdo da Aba Editar */}
      {activeTab === 'edit' && (
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Presenças</h3>
            <div className="text-center py-12">
              <Settings className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Edição em Desenvolvimento</h3>
              <p className="mt-2 text-sm text-gray-500">
                Esta funcionalidade será implementada em breve.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal de Finalizar Dia */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Finalizar Culto</h3>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-2">
                {formatDate(selectedDate)} - {selectedServiceType}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {selectedTime} • {selectedGroup ? groupsData?.find(g => g.id === parseInt(selectedGroup))?.name : 'Todos os membros'}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{filteredMembers.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{presentMembersList.length}</div>
                    <div className="text-sm text-gray-600">Presentes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{absentMembers.length}</div>
                    <div className="text-sm text-gray-600">Ausentes</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ Ao finalizar, este culto será salvo no histórico e os filtros serão resetados.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowFinalizeModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  handleFinalizeDay()
                  setShowFinalizeModal(false)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                ✅ Finalizar Culto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remoção de Presença */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Desmarcar Presença</h3>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              {memberToRemove.photo_path ? (
                <img
                  src={`/api/uploads/${memberToRemove.photo_path}`}
                  alt={memberToRemove.name}
                  className="w-24 h-28 object-cover rounded-lg mx-auto border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-28 bg-gray-200 rounded-lg mx-auto border-2 border-gray-200 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <h4 className="mt-3 text-xl font-medium text-gray-900">{memberToRemove.name}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {formatDate(selectedDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {selectedTime}
                </p>
                <p className="text-sm text-gray-600">
                  ⛪ {selectedServiceType}
                </p>
                {selectedGroup && (
                  <p className="text-sm text-blue-600">
                    👥 {groupsData?.find(g => g.id === parseInt(selectedGroup))?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 text-center">
                ⚠️ Deseja desmarcar a presença deste membro?<br />
                Ele voltará para a lista de membros disponíveis.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowRemoveModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRemovePresence}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                ❌ Desmarcar Presença
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
