import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Search, Users, Phone, Mail, MapPin, X, Upload } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Loading, LoadingGrid } from '../components/common/Loading'
import { memberService } from '../services/memberService'
import { serviceTypeService } from '../services/serviceTypeService'
import { groupService } from '../services/groupService'
import { formatDate, formatPhone } from '../utils/format'
import { PhotoCrop } from '../components/common/PhotoCrop'
import { PhotoModal } from '../components/common/PhotoModal'
import PhotoUpload from '../components/common/PhotoUpload'
import toast from 'react-hot-toast'

export function Members() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [tempPhotoFile, setTempPhotoFile] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [expandedPhoto, setExpandedPhoto] = useState({ src: '', name: '' })
  const [deleteReason, setDeleteReason] = useState('')
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    leader_name: '',
    description: ''
  })
  const [leaderSearch, setLeaderSearch] = useState('')
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false)
  const [selectedMembersForGroup, setSelectedMembersForGroup] = useState([])
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [editGroupData, setEditGroupData] = useState({
    name: '',
    leader_name: '',
    description: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    photo: null,
    group_id: '',
    // Novos campos da ficha
    marital_status: '',
    street: '',
    neighborhood: '',
    city: '',
    home_phone: '',
    cell_phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    member_since: ''
  })
  const [newPhoto, setNewPhoto] = useState(null)
  const limit = 20
  const queryClient = useQueryClient()

  // Buscar membros
  const { data: membersData, isLoading, error } = useQuery(
    ['members', page, searchTerm],
    () => memberService.getMembers({ 
      page, 
      limit, 
      search: searchTerm || undefined 
    }),
    { 
      keepPreviousData: true,
      select: (data) => data.data || []
    }
  )

  // Buscar tipos de culto
  const { data: serviceTypes } = useQuery(
    'service-types',
    () => serviceTypeService.getServiceTypes(),
    { select: (data) => data.data || [] }
  )

  // Buscar grupos
  const { data: groupsData } = useQuery(
    'groups',
    () => groupService.getGroups(),
    { select: (data) => data.data || [] }
  )

  // Criar novo membro
  const createMemberMutation = useMutation(memberService.createMember, {
    onSuccess: () => {
      toast.success('Membro criado com sucesso!')
      queryClient.invalidateQueries(['members'])
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        photo: null,
        group_id: ''
      })
    },
    onError: (error) => {
      toast.error('Erro ao criar membro: ' + error.message)
    }
  })

  // Mutation para editar membro
  const updateMemberMutation = useMutation(
    ({ id, data }) => memberService.updateMember(id, data),
    {
      onSuccess: () => {
        toast.success('Membro atualizado com sucesso!')
        setShowEditModal(false)
        setSelectedMember(null)
        setNewPhoto(null)
        // Invalidar todas as queries relacionadas a membros
        queryClient.invalidateQueries(['members'])
        queryClient.invalidateQueries('members')
        queryClient.invalidateQueries('attendance')
        queryClient.invalidateQueries('reports')
      },
      onError: (error) => {
        toast.error('Erro ao atualizar membro: ' + error.message)
      }
    }
  )

  // Mutation para exclusão lógica
  const softDeleteMutation = useMutation(
    ({ id, reason }) => memberService.softDeleteMember(id, reason),
    {
      onSuccess: () => {
        toast.success('Membro excluído com sucesso!')
        setShowDeleteModal(false)
        setSelectedMember(null)
        setDeleteReason('')
        queryClient.invalidateQueries('members')
      },
      onError: (error) => {
        toast.error('Erro ao excluir membro: ' + error.message)
      }
    }
  )

  // Mutations para grupos
  const createGroupMutation = useMutation(groupService.createGroup, {
    onSuccess: () => {
      toast.success('Grupo criado com sucesso!')
      setShowGroupModal(false)
      setGroupFormData({ name: '', leader_name: '', description: '' })
      queryClient.invalidateQueries('groups')
    },
    onError: (error) => {
      toast.error('Erro ao criar grupo: ' + error.message)
    }
  })

  const deleteGroupMutation = useMutation(groupService.deleteGroup, {
    onSuccess: () => {
      toast.success('Grupo excluído com sucesso!')
      queryClient.invalidateQueries('groups')
      queryClient.invalidateQueries('members')
    },
    onError: (error) => {
      toast.error('Erro ao excluir grupo: ' + error.message)
    }
  })

  const associateMembersMutation = useMutation(
    ({ groupId, memberIds }) => groupService.associateMembers(groupId, memberIds),
    {
      onSuccess: () => {
        toast.success('Membros associados com sucesso!')
        setShowGroupMembersModal(false)
        setSelectedMembersForGroup([])
        setMemberSearchTerm('')
        queryClient.invalidateQueries('groups')
        queryClient.invalidateQueries('members')
      },
      onError: (error) => {
        toast.error('Erro ao associar membros: ' + error.message)
      }
    }
  )

  const updateGroupMutation = useMutation(
    ({ id, data }) => groupService.updateGroup(id, data),
    {
      onSuccess: () => {
        toast.success('Grupo atualizado com sucesso!')
        queryClient.invalidateQueries('groups')
      },
      onError: (error) => {
        toast.error('Erro ao atualizar grupo: ' + error.message)
      }
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    // Preparar dados para envio
    const memberData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      birth_date: formData.birth_date || null
    }

    // Se há foto, fazer upload primeiro
    if (formData.photo) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('photo', formData.photo)
        
        const uploadResponse = await fetch('/api/members/upload-photo', {
          method: 'POST',
          body: formDataUpload
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          memberData.photo_path = uploadData.data.photo_path
        } else {
          toast.error('Erro ao fazer upload da foto')
          return
        }
      } catch (error) {
        console.error('Erro no upload da foto:', error)
        toast.error('Erro ao fazer upload da foto')
        return
      }
    }

    createMemberMutation.mutate(memberData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTempPhotoFile(file)
      setShowCropModal(true)
    }
  }

  const handleCropComplete = async (croppedFile) => {
    try {
      // Fazer upload da foto diretamente
      const response = await memberService.uploadPhoto(editingMember.id, croppedFile)
      
      if (response.success) {
        // Atualizar dados do membro com nova foto
        setFormData(prev => ({ 
          ...prev, 
          photo: croppedFile,
          photo_path: response.data.photo_path 
        }))
        
        // Atualizar o membro selecionado para atualizar a thumbnail
        if (selectedMember && selectedMember.id === editingMember.id) {
          setSelectedMember(prev => ({
            ...prev,
            photo_path: response.data.photo_path
          }))
        }
        
        // Atualizar a lista de membros
        queryClient.invalidateQueries('members')
        
        // Forçar re-render adicionando timestamp à URL da imagem
        const timestamp = Date.now()
        setFormData(prev => ({ 
          ...prev, 
          photo_timestamp: timestamp
        }))
        
        toast.success('Foto atualizada com sucesso!')
      } else {
        toast.error('Erro ao atualizar foto')
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      toast.error('Erro ao salvar foto')
    } finally {
      setTempPhotoFile(null)
    }
  }

  const handleMemberClick = (member) => {
    if (!selectedService) {
      setShowServiceModal(true)
      return
    }
    setSelectedMember(member)
    setShowAttendanceModal(true)
  }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setShowServiceModal(false)
  }

  const handlePhotoExpand = (member) => {
    if (member.photo_path) {
      setExpandedPhoto({
        src: `/api/uploads/${member.photo_path}`,
        name: member.name
      })
      setShowPhotoModal(true)
    }
  }

  // Funções para os botões de ação
  const handleViewMember = (member) => {
    setSelectedMember(member)
    setShowViewModal(true)
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      birth_date: member.birth_date || '',
      photo: null,
      group_id: member.group_id || ''
    })
    setNewPhoto(null)
    setShowEditModal(true)
  }

  const handleDeleteMember = (member) => {
    setSelectedMember(member)
    setDeleteReason('')
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteReason.trim()) {
      toast.error('Por favor, selecione um motivo para a exclusão')
      return
    }
    softDeleteMutation.mutate({ id: selectedMember.id, reason: deleteReason })
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    
    // Preparar dados para envio
    const memberData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      birth_date: formData.birth_date || null,
      group_id: formData.group_id || null,
      marital_status: formData.marital_status || null,
      street: formData.street || null,
      neighborhood: formData.neighborhood || null,
      city: formData.city || null,
      home_phone: formData.home_phone || null,
      cell_phone: formData.cell_phone || null,
      whatsapp: formData.whatsapp || null,
      instagram: formData.instagram || null,
      facebook: formData.facebook || null,
      member_since: formData.member_since || null
    }

    // Se há nova foto, fazer upload primeiro
    if (newPhoto) {
      console.log('📸 Iniciando upload da nova foto:', newPhoto.name, newPhoto.size, 'bytes')
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('photo', newPhoto)
        
        console.log('📤 Enviando foto para:', `/api/members/${selectedMember.id}/photo`)
        
        const uploadResponse = await fetch(`/api/members/${selectedMember.id}/photo`, {
          method: 'POST',
          body: formDataUpload
        })
        
        console.log('📥 Resposta do upload:', uploadResponse.status, uploadResponse.statusText)
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          console.log('✅ Upload bem-sucedido:', uploadData)
          memberData.photo_path = uploadData.data.photo_path
        } else {
          const errorData = await uploadResponse.json()
          console.error('❌ Erro no upload:', errorData)
          toast.error('Erro ao fazer upload da nova foto')
          return
        }
      } catch (error) {
        console.error('❌ Erro no upload da foto:', error)
        toast.error('Erro ao fazer upload da nova foto')
        return
      }
    }

    updateMemberMutation.mutate({ id: selectedMember.id, data: memberData })
  }

  // Funções para grupos
  const handleCreateGroup = (e) => {
    e.preventDefault()
    createGroupMutation.mutate(groupFormData)
  }

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      deleteGroupMutation.mutate(groupId)
    }
  }

  const handleManageGroupMembers = (group) => {
    setSelectedGroup(group)
    setEditGroupData({
      name: group.name,
      leader_name: group.leader_name || '',
      description: group.description || ''
    })
    
    // Carregar membros já associados ao grupo
    const associatedMembers = membersData?.filter(member => member.group_id === group.id).map(member => member.id) || []
    setSelectedMembersForGroup(associatedMembers)
    setMemberSearchTerm('')
    setShowGroupMembersModal(true)
  }

  const handleMemberToggle = (memberId) => {
    setSelectedMembersForGroup(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleAssociateMembers = async () => {
    if (selectedMembersForGroup.length === 0) {
      toast.error('Selecione pelo menos um membro')
      return
    }

    try {
      // Primeiro, atualizar os dados do grupo se houver mudanças
      if (editGroupData.name !== selectedGroup.name || 
          editGroupData.leader_name !== (selectedGroup.leader_name || '') || 
          editGroupData.description !== (selectedGroup.description || '')) {
        
        await updateGroupMutation.mutateAsync({ 
          id: selectedGroup.id, 
          data: editGroupData 
        })
      }

      // Depois, associar os membros
      associateMembersMutation.mutate({ 
        groupId: selectedGroup.id, 
        memberIds: selectedMembersForGroup 
      })
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message)
    }
  }

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLeaderDropdown && !event.target.closest('.relative')) {
        setShowLeaderDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLeaderDropdown])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Membros</h1>
          <p className="page-subtitle text-red-600">Erro ao carregar dados: {error.message}</p>
        </div>
      </div>
    )
  }

  if (isLoading && !membersData) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Membros</h1>
          <p className="page-subtitle">Gerencie os membros da igreja</p>
        </div>
        <LoadingGrid items={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Membros</h1>
            <p className="page-subtitle">Gerencie os membros e grupos da igreja</p>
            {selectedService && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-green-600 font-medium">
                  Culto selecionado: {selectedService.name}
                </span>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
            <Button onClick={() => setShowGroupModal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar membros por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Seção de Grupos */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Grupos</h3>
          <p className="text-sm text-gray-600">Gerencie os grupos de membros</p>
        </CardHeader>
        <CardBody>
          {groupsData && groupsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupsData.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageGroupMembers(group)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Gerenciar
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Líder:</strong> {group.leader_name || '—'}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Descrição:</strong> {group.description || '—'}
                    </p>
                    <p className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block mt-2">
                      📊 {membersData?.filter(member => member.group_id === group.id).length || 0} membro(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum grupo criado</h3>
              <p className="mt-1 text-sm text-gray-500">Crie grupos para organizar os membros.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quadro Visual de Membros */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quadro Visual de Membros</h3>
          <p className="text-sm text-gray-600">Visualize os membros cadastrados</p>
        </CardHeader>
        <CardBody>
          {membersData && membersData.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {membersData.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative">
                    {member.photo_path ? (
                      <img
                        src={`/api/uploads/${member.photo_path}?t=${Date.now()}`}
                        alt={member.name}
                        className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => handlePhotoExpand(member)}
                        onDoubleClick={() => handleMemberClick(member)}
                        title="Clique para expandir | Duplo clique para marcar presença"
                      />
                    ) : (
                      <div 
                        className="w-20 h-24 sm:w-24 sm:h-28 bg-gray-200 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors flex items-center justify-center cursor-pointer"
                        onClick={() => handleMemberClick(member)}
                        title="Clique para marcar presença"
                      >
                        <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="text-center w-full">
                    <p className="text-xs sm:text-sm text-gray-600 truncate font-medium" title={member.name}>
                      {member.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Adicione membros para ver o quadro visual.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Members Grid */}
      {membersData && membersData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membersData.map((member) => (
            <Card key={member.id} className="hover:shadow-medium transition-shadow">
              <CardBody>
                <div className="flex items-start space-x-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {member.photo_path ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={`/api/uploads/${member.photo_path}?t=${Date.now()}`}
                        alt={member.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {member.name}
                    </h3>
                    
                    <div className="mt-2 space-y-1">
                      {/* Telefone - sempre mostrar */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {member.phone ? formatPhone(member.phone) : member.cell_phone ? formatPhone(member.cell_phone) : '—'}
                        </span>
                      </div>
                      
                      {/* Email - sempre mostrar */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.email || '—'}</span>
                      </div>
                      
                      {/* Endereço - sempre mostrar */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {member.address || (member.street && member.neighborhood && member.city) 
                            ? `${member.street || ''}, ${member.neighborhood || ''}, ${member.city || ''}`.replace(/^,\s*|,\s*$/g, '')
                            : '—'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Membro desde {formatDate(member.created_at)}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewMember(member)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleEditMember(member)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece adicionando o primeiro membro da igreja.'
                }
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Membro
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {membersData && membersData.length === limit && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Carregar Mais'}
          </Button>
        </div>
      )}

      {/* Modal Novo Membro */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold">Ficha de Membro</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda - Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dados Pessoais</h3>
                  
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil
                    </label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Solteiro">Solteiro</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viúvo">Viúvo</option>
                    </select>
                  </div>

                  {/* Membro Desde */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membro Desde
                    </label>
                    <input
                      type="number"
                      name="member_since"
                      value={formData.member_since}
                      onChange={handleInputChange}
                      placeholder="Ex: 2008"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Grupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupo
                    </label>
                    <select
                      name="group_id"
                      value={formData.group_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sem grupo</option>
                      {groupsData?.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coluna Direita - Contato e Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contato e Endereço</h3>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Telefone Residencial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Residencial
                    </label>
                    <input
                      type="tel"
                      name="home_phone"
                      value={formData.home_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Telefone Celular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Celular
                    </label>
                    <input
                      type="tel"
                      name="cell_phone"
                      value={formData.cell_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram (opcional)
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook (opcional)
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="Nome do perfil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço Completo */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Foto */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Foto 3x4</h3>
                <PhotoUpload
                  currentPhoto={null}
                  onPhotoChange={(file) => setFormData(prev => ({ ...prev, photo: file }))}
                  aspectRatio={3/4}
                  className="mb-2"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-6 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMemberMutation.isLoading}
                  className="flex-1"
                >
                  {createMemberMutation.isLoading ? 'Criando...' : 'Criar Membro'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Presença */}
      {showAttendanceModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Marcar Presença</h2>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              {selectedMember.photo_path ? (
                <img
                  src={`/api/uploads/${selectedMember.photo_path}?t=${Date.now()}`}
                  alt={selectedMember.name}
                  className="w-20 h-24 object-cover rounded-lg mx-auto border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-24 bg-gray-200 rounded-lg mx-auto border-2 border-gray-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <h3 className="mt-2 text-lg font-medium">{selectedMember.name}</h3>
            </div>

            <form className="space-y-4">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tipo de Culto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Culto *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o culto</option>
                  <option value="Culto Dominical">Culto Dominical</option>
                  <option value="Culto de Quarta">Culto de Quarta</option>
                  <option value="Culto de Oração">Culto de Oração</option>
                  <option value="Escola Bíblica">Escola Bíblica</option>
                  <option value="Reunião de Jovens">Reunião de Jovens</option>
                  <option value="Reunião de Senhoras">Reunião de Senhoras</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={3}
                  placeholder="Observações sobre a presença..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAttendanceModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Marcar Presença
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Culto */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Selecionar Culto</h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Selecione o culto para marcar as presenças:
              </p>
              
              {serviceTypes && serviceTypes.length > 0 ? (
                serviceTypes.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-gray-500 mt-1">{service.description}</div>
                    )}
                    {service.schedule && (
                      <div className="text-sm text-blue-600 mt-1">⏰ {service.schedule}</div>
                    )}
                    {service.faith_campaign && (
                      <div className="text-sm text-purple-600 mt-1">🙏 {service.faith_campaign}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum tipo de culto cadastrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Vá em Configurações para adicionar tipos de culto
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crop */}
      <PhotoCrop
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCrop={handleCropComplete}
        imageFile={tempPhotoFile}
        aspectRatio={3/4}
      />

      {/* Modal de Expansão de Foto */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        imageSrc={expandedPhoto.src}
        memberName={expandedPhoto.name}
      />

      {/* Modal de Visualização do Membro */}
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Informações do Membro</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedMember.photo_path && (
                <div className="flex justify-center">
                  <img
                    src={`/api/uploads/${selectedMember.photo_path}?t=${Date.now()}`}
                    alt={selectedMember.name}
                    className="w-24 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedMember.name}</p>
                </div>

                {selectedMember.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>
                )}

                {selectedMember.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-gray-900">{formatPhone(selectedMember.phone)}</p>
                  </div>
                )}

                {selectedMember.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <p className="text-gray-900">{selectedMember.address}</p>
                  </div>
                )}

                {selectedMember.birth_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="text-gray-900">{formatDate(selectedMember.birth_date)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Membro desde</label>
                  <p className="text-gray-900">{formatDate(selectedMember.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowViewModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição do Membro */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold">Editar Ficha de Membro</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda - Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dados Pessoais</h3>
                  
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, marital_status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Solteiro">Solteiro</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viúvo">Viúvo</option>
                    </select>
                  </div>

                  {/* Membro Desde */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membro Desde
                    </label>
                    <input
                      type="number"
                      value={formData.member_since}
                      onChange={(e) => setFormData(prev => ({ ...prev, member_since: e.target.value }))}
                      placeholder="Ex: 2008"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Grupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grupo
                    </label>
                    <select
                      value={formData.group_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sem grupo</option>
                      {groupsData?.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coluna Direita - Contato e Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contato e Endereço</h3>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Telefone Residencial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Residencial
                    </label>
                    <input
                      type="tel"
                      value={formData.home_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, home_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Telefone Celular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Celular
                    </label>
                    <input
                      type="tel"
                      value={formData.cell_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, cell_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="Nome do perfil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço Completo */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Foto */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Foto 3x4</h3>
                <PhotoUpload
                  currentPhoto={selectedMember?.photo_path ? `/api/uploads/${selectedMember.photo_path}` : null}
                  onPhotoChange={(file) => {
                    console.log('📸 NOVA FOTO RECEBIDA NO MEMBERS:', file.name, file.size, 'bytes')
                    setNewPhoto(file)
                  }}
                  aspectRatio={3/4}
                  className="mb-2"
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-6 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMemberMutation.isLoading}
                  className="flex-1"
                >
                  {updateMemberMutation.isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão do Membro */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Excluir Membro</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Excluir {selectedMember.name}?
                </h4>
                <p className="text-sm text-gray-500">
                  Esta ação marcará o membro como inativo. O histórico será mantido.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da exclusão
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o motivo</option>
                  <option value="desistencia">Desistência</option>
                  <option value="trocou_igreja">Trocou de igreja</option>
                  <option value="obito">Veio a óbito</option>
                  <option value="mudou_cidade">Mudou de cidade</option>
                  <option value="mudou_estado">Mudou de estado</option>
                  <option value="viajou">Viajou para outra cidade</option>
                  <option value="outro">Outro motivo</option>
                </select>
              </div>

              {deleteReason === 'outro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especifique o motivo
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva o motivo da exclusão..."
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={softDeleteMutation.isLoading}
                className="flex-1"
              >
                {softDeleteMutation.isLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Grupo */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Novo Grupo</h2>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Grupo 01 do Willis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Líder do Grupo
                </label>
                <input
                  type="text"
                  value={leaderSearch}
                  onChange={(e) => {
                    setLeaderSearch(e.target.value)
                    setShowLeaderDropdown(true)
                  }}
                  onFocus={() => setShowLeaderDropdown(true)}
                  placeholder="Digite para pesquisar um membro..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Dropdown de membros */}
                {showLeaderDropdown && leaderSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {membersData
                      ?.filter(member => 
                        member.name.toLowerCase().includes(leaderSearch.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((member) => (
                        <div
                          key={member.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                          onClick={() => {
                            setGroupFormData(prev => ({ ...prev, leader_name: member.name }))
                            setLeaderSearch(member.name)
                            setShowLeaderDropdown(false)
                          }}
                        >
                          {member.photo_path ? (
                            <img
                              src={`/api/uploads/${member.photo_path}?t=${Date.now()}`}
                              alt={member.name}
                              className="w-6 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-6 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Users className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.email && (
                              <p className="text-xs text-gray-500">{member.email}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    {membersData?.filter(member => 
                      member.name.toLowerCase().includes(leaderSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Nenhum membro encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do grupo (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createGroupMutation.isLoading}
                  className="flex-1"
                >
                  {createGroupMutation.isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Grupo e Membros */}
      {showGroupMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Editar Grupo - {selectedGroup.name}</h2>
              <button
                onClick={() => setShowGroupMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Dados do Grupo */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações do Grupo</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Grupo
                  </label>
                  <input
                    type="text"
                    value={editGroupData.name}
                    onChange={(e) => setEditGroupData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Líder do Grupo
                  </label>
                  <input
                    type="text"
                    value={editGroupData.leader_name}
                    onChange={(e) => setEditGroupData(prev => ({ ...prev, leader_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={editGroupData.description}
                    onChange={(e) => setEditGroupData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Coluna 2: Membros do Grupo */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Membros do Grupo</h3>
                
                {/* Campo de pesquisa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesquisar Membros
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      placeholder="Digite o nome do membro..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Lista de membros */}
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {membersData
                    ?.filter(member => {
                      // Mostrar apenas membros sem grupo OU membros já do grupo atual
                      const belongsToGroup = !member.group_id || member.group_id === selectedGroup.id
                      // Filtrar por termo de pesquisa
                      const matchesSearch = !memberSearchTerm || 
                        member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                      return belongsToGroup && matchesSearch
                    })
                    .map((member) => {
                      const isAssociated = member.group_id === selectedGroup.id
                      const isSelected = selectedMembersForGroup.includes(member.id)
                      
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            isSelected
                              ? isAssociated 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleMemberToggle(member.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMemberToggle(member.id)}
                            className={`mr-3 ${isAssociated ? 'text-green-600' : 'text-blue-600'}`}
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            {member.photo_path ? (
                              <img
                                src={`/api/uploads/${member.photo_path}?t=${Date.now()}`}
                                alt={member.name}
                                className="w-8 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                              {member.email && (
                                <p className="text-xs text-gray-500">{member.email}</p>
                              )}
                            </div>
                            {isAssociated && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                No grupo
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  
                  {membersData?.filter(member => {
                    const belongsToGroup = !member.group_id || member.group_id === selectedGroup.id
                    const matchesSearch = !memberSearchTerm || 
                      member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                    return belongsToGroup && matchesSearch
                  }).length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      {memberSearchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro disponível'}
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p>💡 <strong>Dica:</strong> Membros já no grupo aparecem com fundo verde</p>
                  <p>📊 <strong>Selecionados:</strong> {selectedMembersForGroup.length} membros</p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGroupMembersModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAssociateMembers}
                disabled={associateMembersMutation.isLoading || updateGroupMutation.isLoading}
                className="flex-1"
              >
                {(associateMembersMutation.isLoading || updateGroupMutation.isLoading) ? 'Salvando...' : 'Salvar Grupo e Membros'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
