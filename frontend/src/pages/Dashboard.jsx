import { useQuery } from 'react-query'
import { Users, Calendar, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { memberService } from '../services/memberService'
import { attendanceService } from '../services/attendanceService'
import { reportService } from '../services/reportService'
import { formatNumber } from '../utils/format'

export function Dashboard() {
  // Buscar estatísticas gerais
  const { data: membersData, isLoading: membersLoading } = useQuery(
    'members',
    () => memberService.getMembers({ limit: 1 }),
    { 
      select: (data) => data.pagination?.total || 0
    }
  )

  const { data: absentMembers, isLoading: absentLoading } = useQuery(
    'absent-members',
    () => memberService.getAbsentMembers(),
    { select: (data) => data.data || [] }
  )

  const { data: attendanceStats, isLoading: statsLoading } = useQuery(
    'attendance-stats',
    () => attendanceService.getAttendanceStats(),
    { select: (data) => data.data || {} }
  )

  // Buscar estatísticas de pontuação
  const { data: dashboardStats } = useQuery(
    'dashboard-stats',
    () => reportService.getDashboardStats(),
    { 
      select: (data) => data.data || {},
      retry: 1
    }
  )

  const isLoading = membersLoading || absentLoading || statsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do sistema de gestão de membros</p>
        </div>
        <LoadingGrid items={4} />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total de Membros',
      value: formatNumber(membersData),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Presenças Hoje',
      value: formatNumber(attendanceStats.totalAttendance || 0),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Membros Ausentes',
      value: formatNumber(absentMembers?.length || 0),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do sistema de gestão de membros</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-medium transition-shadow">
            <CardBody>
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Pontuação por Grupo */}
      {dashboardStats && dashboardStats.group_stats && Object.keys(dashboardStats.group_stats).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Pontuação por Grupo</h3>
            <p className="text-sm text-gray-600">Últimos 30 dias</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dashboardStats.group_stats).map(([groupName, stats]) => (
                <div key={groupName} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{groupName}</h4>
                    <span className="text-2xl font-bold text-blue-600">{stats.score}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {stats.present}/{stats.total} membros
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membros Ausentes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Membros Ausentes</h3>
            <p className="text-sm text-gray-600">Membros que não vieram nos últimos 21 dias</p>
          </CardHeader>
          <CardBody>
            {(!absentMembers || absentMembers.length === 0) ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro ausente</h3>
                <p className="mt-1 text-sm text-gray-500">Todos os membros estão frequentando regularmente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {absentMembers && absentMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {member.photo_path ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`/api/uploads/${member.photo_path}`}
                          alt={member.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Última presença: {member.last_attendance ? new Date(member.last_attendance).toLocaleDateString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                  </div>
                ))}
                {absentMembers && absentMembers.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    E mais {absentMembers.length - 5} membros...
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Estatísticas de Presença */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Estatísticas de Presença</h3>
            <p className="text-sm text-gray-600">Resumo das presenças por tipo de culto</p>
          </CardHeader>
          <CardBody>
            {attendanceStats.attendanceByType && attendanceStats.attendanceByType.length > 0 ? (
              <div className="space-y-3">
                {attendanceStats.attendanceByType.slice(0, 5).map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type.service_type}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(type.total)} presenças
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma presença registrada</h3>
                <p className="mt-1 text-sm text-gray-500">Comece marcando presenças nos cultos.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
