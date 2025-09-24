import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Calendar, Users, CheckCircle, Clock, ChevronRight, X } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { memberService } from '../services/memberService'
import { attendanceService } from '../services/attendanceService'
import { serviceTypeService } from '../services/serviceTypeService'
import { groupService } from '../services/groupService'
import { formatDate } from '../utils/format'
import toast from 'react-hot-toast'

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedServiceType, setSelectedServiceType] = useState('')
  const [selectedTimes, setSelectedTimes] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [showMemberList, setShowMemberList] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [memberToConfirm, setMemberToConfirm] = useState(null)
  const [filtersApplied, setFiltersApplied] = useState(false)
  const queryClient = useQueryClient()

  // Buscar membros apenas quando filtros forem aplicados
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
      enabled: filtersApplied, // Só executa quando filtros forem aplicados
      retry: 1
    }
  )

  // Membros filtrados (só disponíveis após aplicar filtros)
  const filteredMembers = filtersApplied ? (membersData || []) : []

  // Buscar tipos de culto
  const { data: serviceTypesData } = useQuery(
    'service-types',
    () => serviceTypeService.getServiceTypes(),
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
      if (isMemberPresent(memberId)) {
        // Remover presença
        const attendance = attendanceData?.find(a => a.member_id === memberId)
        if (attendance) {
          removeAttendanceMutation.mutate(attendance.id)
        }
      } else {
        // Marcar presença
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

  // Separar membros presentes e ausentes
  const presentMembers = filteredMembers.filter(member => isMemberPresent(member.id))
  const absentMembers = filteredMembers.filter(member => !isMemberPresent(member.id))

  // Funções para lidar com seleções
  const handleServiceTypeChange = (serviceTypeName) => {
    setSelectedServiceType(serviceTypeName)
    setSelectedTimes([]) // Reset horários quando mudar tipo de culto
  }

  // Obter horários disponíveis do tipo de culto selecionado
  const availableTimes = selectedServiceType 
    ? (() => {
        const serviceType = serviceTypesData?.find(type => type.name === selectedServiceType)
        return serviceType?.schedule ? serviceType.schedule.split(', ').filter(time => time.trim()) : []
      })()
    : []

  const handleTimeToggle = (time) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    )
  }

  const handleApply = () => {
    if (!selectedServiceType) {
      toast.error('Selecione um tipo de culto')
      return
    }
    if (selectedTimes.length === 0) {
      toast.error('Selecione pelo menos um horário')
      return
    }
    
    // Aplicar filtros e carregar membros
    setFiltersApplied(true)
    setShowMemberList(true)
    
    // Mostrar mensagem de sucesso
    const groupName = selectedGroup 
      ? groupsData?.find(g => g.id === parseInt(selectedGroup))?.name || 'grupo selecionado'
      : 'todos os membros'
    
    toast.success(`Carregando ${groupName}...`)
  }

  const handleMemberClick = (member) => {
    setMemberToConfirm(member)
    setShowConfirmModal(true)
  }

  const handleConfirmPresence = () => {
    if (memberToConfirm) {
      markAttendanceMutation.mutate({
        memberId: memberToConfirm.id,
        date: selectedDate,
        serviceType: selectedServiceType
      }, {
        onSuccess: (data) => {
          if (data.alreadyMarked) {
            toast.success('Membro já estava presente!')
          } else {
            toast.success('Presença confirmada com sucesso!')
          }
        }
      })
      setShowConfirmModal(false)
      setMemberToConfirm(null)
    }
  }

  const handleFinalizeDay = () => {
    setShowMemberList(false)
    setSelectedServiceType('')
    setSelectedTimes([])
    setSelectedGroup('')
    setFiltersApplied(false)
    toast.success('Dia finalizado com sucesso!')
  }

  const handleResetFilters = () => {
    setShowMemberList(false)
    setSelectedServiceType('')
    setSelectedTimes([])
    setSelectedGroup('')
    setFiltersApplied(false)
    toast.success('Filtros resetados')
  }

  // Buscar grupos
  const { data: groupsData } = useQuery(
    'groups',
    () => groupService.getGroups(),
    { select: (data) => data.data || [] }
  )

  if (isLoading && !membersData) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Controle de Presença</h1>
          <p className="page-subtitle">Marque a presença dos membros nos cultos</p>
        </div>
        <LoadingGrid />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title" style={{color: 'red', fontSize: '3rem', backgroundColor: 'yellow', padding: '20px'}}>🔥 TESTE FINAL - SE VOCÊ VÊ ISSO, FUNCIONOU! 🔥</h1>
        <p className="page-subtitle" style={{color: 'white', fontWeight: 'bold', backgroundColor: 'red', padding: '10px'}}>ALTERAÇÃO CONFIRMADA - SISTEMA FUNCIONANDO</p>
      </div>

       {/* TESTE DE CACHE */}
       <div style={{backgroundColor: 'yellow', padding: '20px', border: '5px solid red', margin: '20px 0'}}>
         <h2 style={{color: 'red', fontSize: '24px', textAlign: 'center'}}>
           🚨 TESTE DE CACHE - SE VOCÊ VÊ ISSO, O SISTEMA ESTÁ ATUALIZADO! 🚨
         </h2>
         <p style={{color: 'black', fontSize: '16px', textAlign: 'center'}}>
           Esta é uma mensagem de teste para verificar se as alterações estão sendo carregadas.
         </p>
       </div>

       {/* Filtros */}
       <Card>
         <CardBody className="bg-blue-50">
           <h3 className="text-lg font-semibold text-blue-800 mb-4">🔧 Configurar Filtros</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                   onChange={(e) => handleServiceTypeChange(e.target.value)}
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

            {/* Seleção de Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Grupo
              </label>
               <div className="relative">
                 <select
                   value={selectedGroup}
                   onChange={(e) => setSelectedGroup(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                 >
                   <option value="">Sem grupo (todos os membros)</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📅 Horários Disponíveis para {selectedServiceType}
              </label>
              <div className="flex flex-wrap gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeToggle(time)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2
                      ${selectedTimes.includes(time)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                    `}
                  >
                    <Clock className="inline h-4 w-4 mr-2" />
                    {time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Selecione um ou mais horários para este culto
              </p>
            </div>
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
                  <span>Configure os filtros e clique em <strong>"Aplicar Filtros"</strong> para carregar os membros</span>
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
                  🔄 Resetar Filtros
                </Button>
              )}
              <Button
                onClick={handleApply}
                disabled={!selectedServiceType || selectedTimes.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                🎯 Aplicar Filtros
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
                  <p className="text-2xl font-bold text-gray-900">{presentMembers.length}</p>
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
                Selecione a data, tipo de culto, horários e opcionalmente um grupo,<br />
                depois clique em "Aplicar" para carregar os membros.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

       {/* Lista de Membros - Layout em Duas Colunas */}
       {filtersApplied && showMemberList && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Coluna 1: Ausentes */}
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-lg font-semibold text-gray-900">
                     Membros Ausentes
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
                 <div className="bg-gray-100 px-3 py-1 rounded-full">
                   <span className="text-sm font-medium text-gray-700">
                     {absentMembers.length} ausente{absentMembers.length !== 1 ? 's' : ''}
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
                           <Clock className="h-3 w-3 text-gray-400 mr-1" />
                           <span className="text-xs text-gray-500">Ausente</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                   <h3 className="mt-4 text-lg font-medium text-gray-900">Todos presentes!</h3>
                   <p className="mt-2 text-sm text-gray-500">Todos os membros marcaram presença.</p>
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
                     {presentMembers.length} presente{presentMembers.length !== 1 ? 's' : ''}
                   </span>
                 </div>
               </div>
             </CardHeader>
             <CardBody>
               {presentMembers.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {presentMembers.map((member) => (
                     <div
                       key={member.id}
                       onClick={() => handleToggleAttendance(member.id)}
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
                onClick={handleFinalizeDay}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
                  className="w-20 h-24 object-cover rounded-lg mx-auto border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-24 bg-gray-200 rounded-lg mx-auto border-2 border-gray-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <h4 className="mt-2 text-lg font-medium">{memberToConfirm.name}</h4>
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate)} - {selectedServiceType}
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
                className="flex-1"
              >
                Confirmar Presença
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}