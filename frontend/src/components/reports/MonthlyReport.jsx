import { Card, CardHeader, CardBody } from '../common/Card'
import { Button } from '../common/Button'
import { Download, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { formatNumber, formatDate } from '../../utils/format'

export function MonthlyReport({ reportData }) {
  if (!reportData) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado disponível</h3>
            <p className="mt-1 text-sm text-gray-500">Não há dados para o período selecionado.</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  const {
    month,
    year,
    totalMembers,
    totalAttendance,
    attendanceByGroup,
    attendanceByDay,
    topMembers,
    summary
  } = reportData

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const monthName = monthNames[month - 1] || 'Mês'

  return (
    <div className="space-y-6">
      {/* Header do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Relatório Mensal - {monthName} {year}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Relatório de presença e frequência dos membros
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalMembers || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Presenças</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(totalAttendance || 0)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Frequência Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.averageFrequency || 0}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-100">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dias com Culto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary?.serviceDays || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Presença por Grupo */}
      {attendanceByGroup && attendanceByGroup.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Presença por Grupo</h3>
            <p className="text-sm text-gray-600">Distribuição de presenças por grupo</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {attendanceByGroup.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-red-500' :
                      index === 4 ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{group.group_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(group.total_attendance)} presenças
                    </span>
                    <p className="text-xs text-gray-500">
                      {group.member_count} membros
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Top Membros */}
      {topMembers && topMembers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Membros Mais Frequentes</h3>
            <p className="text-sm text-gray-600">Top 10 membros com mais presenças</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {topMembers.slice(0, 10).map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatNumber(member.total_attendance)} presenças
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Presença por Dia */}
      {attendanceByDay && attendanceByDay.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Presença por Dia</h3>
            <p className="text-sm text-gray-600">Distribuição de presenças ao longo do mês</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-7 gap-2">
              {attendanceByDay.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(day.date).getDate()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((day.attendance / Math.max(day.total_members, 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {day.attendance}/{day.total_members}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}