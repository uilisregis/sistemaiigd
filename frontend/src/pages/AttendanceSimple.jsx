import { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Loading } from '../components/common/Loading'
import { memberService } from '../services/memberService'
import { serviceTypeService } from '../services/serviceTypeService'

export function AttendanceSimple() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedServiceType, setSelectedServiceType] = useState('')

  console.log('🔍 [ATTENDANCE] Componente renderizado')
  console.log('📅 [ATTENDANCE] Data selecionada:', selectedDate)
  console.log('⛪ [ATTENDANCE] Culto selecionado:', selectedServiceType)

  // Buscar membros
  const { data: membersData, isLoading: membersLoading, error: membersError } = useQuery(
    'members',
    () => {
      console.log('📡 [ATTENDANCE] Buscando membros...')
      return memberService.getMembers({ limit: 100 })
    },
    { 
      select: (data) => {
        console.log('📊 [ATTENDANCE] Dados de membros recebidos:', data)
        return data?.data || []
      },
      onError: (error) => {
        console.error('❌ [ATTENDANCE] Erro ao buscar membros:', error)
      }
    }
  )

  // Buscar tipos de culto
  const { data: serviceTypesData, isLoading: serviceTypesLoading, error: serviceTypesError } = useQuery(
    'service-types',
    () => {
      console.log('📡 [ATTENDANCE] Buscando tipos de culto...')
      return serviceTypeService.getServiceTypes()
    },
    { 
      select: (data) => {
        console.log('📊 [ATTENDANCE] Dados de tipos de culto recebidos:', data)
        return data?.data || []
      },
      onError: (error) => {
        console.error('❌ [ATTENDANCE] Erro ao buscar tipos de culto:', error)
      }
    }
  )

  const isLoading = membersLoading || serviceTypesLoading

  console.log('⏳ [ATTENDANCE] Carregando:', isLoading)
  console.log('👥 [ATTENDANCE] Membros:', membersData?.length || 0)
  console.log('⛪ [ATTENDANCE] Tipos de culto:', serviceTypesData?.length || 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Controle de Presença</h1>
          <p className="page-subtitle">Marque a presença dos membros nos cultos</p>
        </div>
        <Loading />
      </div>
    )
  }

  if (membersError || serviceTypesError) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Controle de Presença</h1>
          <p className="page-subtitle">Marque a presença dos membros nos cultos</p>
        </div>
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-red-600">Erro ao carregar dados</p>
              <p className="text-sm text-gray-500 mt-2">
                {membersError?.message || serviceTypesError?.message}
              </p>
            </div>
          </CardBody>
        </Card>
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

      {/* Filtros */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data do Culto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Culto
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo de Culto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Culto
              </label>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o culto</option>
                {serviceTypesData?.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{membersData?.length || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">0</p>
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
                <p className="text-2xl font-bold text-gray-900">{membersData?.length || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lista de Membros */}
      {selectedServiceType && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Membros - {selectedServiceType}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedDate} - Clique para marcar presença
            </p>
          </CardHeader>
          <CardBody>
            {membersData && membersData.length > 0 ? (
              <div className="space-y-3">
                {membersData.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {member.photo_path ? (
                        <img
                          src={`/api/uploads/${member.photo_path}`}
                          alt={member.name}
                          className="w-12 h-12 object-cover rounded-full border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-gray-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">Ausente</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Cadastre membros para começar.</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Instruções */}
      {!selectedServiceType && (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione um culto</h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha a data e o tipo de culto para começar a marcar presenças.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
