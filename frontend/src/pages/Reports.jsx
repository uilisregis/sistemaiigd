import { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, Download, BarChart3, Users, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { reportService } from '../services/reportService'
import { groupService } from '../services/groupService'
import { MonthlyReport } from '../components/reports/MonthlyReport'
import toast from 'react-hot-toast'

export function Reports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [showReport, setShowReport] = useState(false)

  // Buscar grupos
  const { data: groupsData } = useQuery(
    'groups',
    () => groupService.getGroups(),
    { select: (data) => data.data || [] }
  )

  // Buscar relatório mensal
  const { data: reportData, isLoading: reportLoading } = useQuery(
    ['monthly-report', selectedYear, selectedMonth, selectedGroup],
    () => reportService.getMonthlyReport(selectedYear, selectedMonth, selectedGroup || null),
    {
      enabled: showReport,
      retry: 1,
      onError: (error) => {
        console.error('Erro ao buscar relatório:', error)
        toast.error('Erro ao carregar relatório')
      }
    }
  )

  // Buscar estatísticas do dashboard
  const { data: dashboardStats } = useQuery(
    ['dashboard-stats', selectedGroup],
    () => reportService.getDashboardStats(selectedGroup || null),
    {
      select: (data) => data.data || {},
      retry: 1
    }
  )

  const handleGenerateReport = () => {
    if (!selectedYear || !selectedMonth) {
      toast.error('Selecione ano e mês')
      return
    }
    setShowReport(true)
    toast.success('Relatório gerado com sucesso!')
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  if (reportLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Relatórios mensais de presença</p>
        </div>
        <LoadingGrid />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Relatórios mensais de presença</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Gerar Relatório</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Ano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Mês */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo (opcional)
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os grupos</option>
                {groupsData?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão */}
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Estatísticas do Dashboard */}
      {dashboardStats && Object.keys(dashboardStats.group_stats || {}).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Estatísticas dos Últimos 30 Dias</h3>
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

      {/* Relatório Gerado */}
      {showReport && reportData && (
        <MonthlyReport reportData={reportData.data} />
      )}

      {/* Mensagem quando não há relatório */}
      {!showReport && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Selecione o período para gerar o relatório
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Escolha o ano, mês e opcionalmente um grupo para gerar o relatório mensal.
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}