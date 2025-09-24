import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Settings as SettingsIcon, Plus, Trash2, Edit, X } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { TimeSelector } from '../components/common/TimeSelector'
import { serviceTypeService } from '../services/serviceTypeService'
import toast from 'react-hot-toast'

export function Settings() {
  const [newServiceType, setNewServiceType] = useState({ 
    name: '', 
    description: '', 
    schedule: '', 
    faith_campaign: '',
    pastor_name: '',
    pastor_title: ''
  })
  const [selectedTimes, setSelectedTimes] = useState([])
  const [editSelectedTimes, setEditSelectedTimes] = useState([])
  const [editingType, setEditingType] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    schedule: '',
    faith_campaign: '',
    pastor_name: '',
    pastor_title: ''
  })
  const queryClient = useQueryClient()

  // Buscar tipos de culto
  const { data: serviceTypes, isLoading, refetch } = useQuery(
    'service-types',
    () => serviceTypeService.getServiceTypes(),
    { select: (data) => data.data || [] }
  )

  // Criar tipo de culto
  const createMutation = useMutation(serviceTypeService.createServiceType, {
    onSuccess: () => {
      toast.success('Tipo de culto criado com sucesso!')
      setNewServiceType({ name: '', description: '', schedule: '', faith_campaign: '', pastor_name: '', pastor_title: '' })
      setSelectedTimes([])
      queryClient.invalidateQueries('service-types')
    },
    onError: (error) => {
      toast.error('Erro ao criar tipo de culto: ' + error.message)
    }
  })

  // Atualizar tipo de culto
  const updateMutation = useMutation(
    ({ id, data }) => serviceTypeService.updateServiceType(id, data),
    {
      onSuccess: () => {
        toast.success('Tipo de culto atualizado com sucesso!')
        setEditingType(null)
        queryClient.invalidateQueries('service-types')
      },
      onError: (error) => {
        toast.error('Erro ao atualizar tipo de culto: ' + error.message)
      }
    }
  )

  // Deletar tipo de culto
  const deleteMutation = useMutation(serviceTypeService.deleteServiceType, {
    onSuccess: () => {
      toast.success('Tipo de culto deletado com sucesso!')
      queryClient.invalidateQueries('service-types')
    },
    onError: (error) => {
      toast.error('Erro ao deletar tipo de culto: ' + error.message)
    }
  })

  const handleCreateServiceType = async (e) => {
    e.preventDefault()
    if (!newServiceType.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    
    const serviceData = {
      ...newServiceType,
      schedule: selectedTimes.join(', ')
    }
    
    createMutation.mutate(serviceData)
  }

  const handleDeleteServiceType = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este tipo de culto?')) return
    deleteMutation.mutate(id)
  }

  const handleEditClick = (type) => {
    setEditingType(type)
    setEditFormData({
      name: type.name,
      description: type.description || '',
      schedule: type.schedule || '',
      faith_campaign: type.faith_campaign || '',
      pastor_name: type.pastor_name || '',
      pastor_title: type.pastor_title || ''
    })
    
    // Carregar horários selecionados para edição
    const selectedTimes = type.schedule ? type.schedule.split(', ').filter(time => time.trim()) : []
    setEditSelectedTimes(selectedTimes)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editFormData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    
    const updateData = {
      ...editFormData,
      schedule: editSelectedTimes.join(', ')
    }
    
    updateMutation.mutate({ id: editingType.id, data: updateData })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie as configurações do sistema</p>
        </div>
        <LoadingGrid items={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie as configurações do sistema</p>
      </div>

      {/* Service Types */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Culto</h3>
          <p className="text-sm text-gray-600">Gerencie os tipos de culto disponíveis</p>
        </CardHeader>
        <CardBody>
          {/* Add New Service Type */}
          <form onSubmit={handleCreateServiceType} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Nome do Culto *</label>
                <input
                  type="text"
                  value={newServiceType.name}
                  onChange={(e) => setNewServiceType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Culto Dominical"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  value={newServiceType.description}
                  onChange={(e) => setNewServiceType(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Culto principal aos domingos"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <TimeSelector
                  selectedTimes={selectedTimes}
                  onTimesChange={setSelectedTimes}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campanhas de Fé</label>
                <input
                  type="text"
                  value={newServiceType.faith_campaign}
                  onChange={(e) => setNewServiceType(prev => ({ ...prev, faith_campaign: e.target.value }))}
                  placeholder="Ex: Quarta-feira da Água Consagrada"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Título do Pastor</label>
                  <select
                    value={newServiceType.pastor_title}
                    onChange={(e) => setNewServiceType(prev => ({ ...prev, pastor_title: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Selecione o título</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Reverendo">Reverendo</option>
                    <option value="Missionário">Missionário</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Presbítero">Presbítero</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome do Pastor</label>
                  <input
                    type="text"
                    value={newServiceType.pastor_name}
                    onChange={(e) => setNewServiceType(prev => ({ ...prev, pastor_name: e.target.value }))}
                    placeholder="Ex: João Silva"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button type="submit" disabled={createMutation.isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {createMutation.isLoading ? 'Criando...' : 'Adicionar Tipo de Culto'}
              </Button>
            </div>
          </form>

          {/* Service Types List */}
          <div className="space-y-3">
            {serviceTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{type.name}</h4>
                  {type.description && (
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  )}
                  {type.schedule && (
                    <p className="text-sm text-blue-600 mt-1">⏰ {type.schedule}</p>
                  )}
                  {type.faith_campaign && (
                    <p className="text-sm text-purple-600 mt-1 font-medium">🙏 {type.faith_campaign}</p>
                  )}
                  {type.pastor_name && (
                    <p className="text-sm text-green-600 mt-1 font-medium">👨‍💼 {type.pastor_title} {type.pastor_name}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteServiceType(type.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {serviceTypes.length === 0 && (
            <div className="text-center py-8">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum tipo de culto cadastrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione tipos de culto para organizar as presenças.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Informações do Sistema</h3>
          <p className="text-sm text-gray-600">Detalhes sobre a instalação atual</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Versão</h4>
              <p className="text-sm text-gray-600">Sistema de Gestão de Membros v1.0.0</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Banco de Dados</h4>
              <p className="text-sm text-gray-600">SQLite</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Backend</h4>
              <p className="text-sm text-gray-600">Node.js + Express</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Frontend</h4>
              <p className="text-sm text-gray-600">React + Vite</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Backup e Exportação</h3>
          <p className="text-sm text-gray-600">Faça backup dos dados do sistema</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              Exportar Membros (CSV)
            </Button>
            
            <Button variant="outline" className="w-full">
              Exportar Presenças (CSV)
            </Button>
            
            <Button variant="outline" className="w-full">
              Backup Completo (JSON)
            </Button>
            
            <Button variant="outline" className="w-full">
              Restaurar Backup
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modal de Edição */}
      {editingType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Editar Tipo de Culto</h2>
              <button
                onClick={() => setEditingType(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Culto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Horários */}
              <TimeSelector
                selectedTimes={editSelectedTimes}
                onTimesChange={setEditSelectedTimes}
              />

              {/* Campanhas de Fé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campanhas de Fé
                </label>
                <input
                  type="text"
                  name="faith_campaign"
                  value={editFormData.faith_campaign}
                  onChange={handleEditInputChange}
                  placeholder="Ex: Quarta-feira da Água Consagrada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pastor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Pastor
                  </label>
                  <select
                    name="pastor_title"
                    value={editFormData.pastor_title}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o título</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Reverendo">Reverendo</option>
                    <option value="Missionário">Missionário</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Presbítero">Presbítero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Pastor
                  </label>
                  <input
                    type="text"
                    name="pastor_name"
                    value={editFormData.pastor_name}
                    onChange={handleEditInputChange}
                    placeholder="Ex: João Silva"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingType(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="flex-1"
                >
                  {updateMutation.isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
