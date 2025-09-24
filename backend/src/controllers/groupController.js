const Group = require('../models/Group');

// Listar grupos
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.getAll();
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar grupo por ID
exports.getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.getById(id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar grupo
exports.createGroup = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo é obrigatório'
      });
    }
    
    const groupData = {
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3B82F6',
      created_at: new Date().toISOString()
    };
    
    const group = await Group.create(groupData);
    
    res.status(201).json({
      success: true,
      data: group,
      message: 'Grupo criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar grupo
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    const group = await Group.getById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (color !== undefined) updateData.color = color;
    
    const updatedGroup = await Group.update(id, updateData);
    
    res.json({
      success: true,
      data: updatedGroup,
      message: 'Grupo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar grupo
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await Group.getById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }
    
    await Group.delete(id);
    
    res.json({
      success: true,
      message: 'Grupo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar membros do grupo
exports.getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await Group.getMembers(id);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Erro ao buscar membros do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Adicionar membro ao grupo
exports.addMemberToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id } = req.body;
    
    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do membro é obrigatório'
      });
    }
    
    await Group.addMember(id, member_id);
    
    res.json({
      success: true,
      message: 'Membro adicionado ao grupo com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar membro ao grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Remover membro do grupo
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    
    await Group.removeMember(id, memberId);
    
    res.json({
      success: true,
      message: 'Membro removido do grupo com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover membro do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Associar múltiplos membros ao grupo
exports.associateMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_ids } = req.body;
    
    if (!member_ids || !Array.isArray(member_ids)) {
      return res.status(400).json({
        success: false,
        message: 'IDs dos membros são obrigatórios'
      });
    }
    
    // Primeiro, remover todos os membros atuais do grupo
    await Group.removeAllMembers(id);
    
    // Depois, adicionar os novos membros
    for (const memberId of member_ids) {
      await Group.addMember(id, memberId);
    }
    
    res.json({
      success: true,
      message: 'Membros associados ao grupo com sucesso'
    });
  } catch (error) {
    console.error('Erro ao associar membros ao grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};