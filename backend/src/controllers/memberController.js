const Member = require('../models/Member');
const { uploadPhoto, uploadFiles, moveFile, deleteFile } = require('../config/upload');
const { logger } = require('../middleware/logger');
const path = require('path');

class MemberController {
    // Listar todos os membros
    static async getAllMembers(req, res, next) {
        try {
            const { page = 1, limit = 50, search, group_id } = req.query;
            const offset = (page - 1) * limit;

            let members;
            if (group_id) {
                // Filtrar por grupo
                members = await Member.findByGroup(group_id, parseInt(limit), offset);
            } else if (search) {
                members = await Member.searchByName(search, parseInt(limit));
            } else {
                members = await Member.findAll(parseInt(limit), offset);
            }

            logger.info('Membros listados', { count: members.length, search, group_id, page });

            res.json({
                success: true,
                data: members,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: members.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar membro por ID
    static async getMemberById(req, res, next) {
        try {
            const { id } = req.params;
            const member = await Member.findById(id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            // Buscar estatísticas do membro
            const stats = await member.getStats();

            logger.info('Membro encontrado', { id, name: member.name });

            res.json({
                success: true,
                data: {
                    ...member.toJSON(),
                    stats
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Criar novo membro
    static async createMember(req, res, next) {
        try {
            const memberData = req.body;

            // Validar dados obrigatórios
            if (!memberData.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome é obrigatório'
                });
            }

            // Email pode ser duplicado (pai e filho podem ter o mesmo email)

            // Criar membro
            const memberId = await Member.create(memberData);
            const member = await Member.findById(memberId);

            logger.info('Membro criado', { id: memberId, name: member.name });

            res.status(201).json({
                success: true,
                message: 'Membro criado com sucesso',
                data: member
            });
        } catch (error) {
            logger.error('Erro ao criar membro:', error);
            
            // Tratar erros específicos do banco de dados
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'Erro de duplicação de dados'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Atualizar membro
    static async updateMember(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            await member.update(updateData);

            logger.info('Membro atualizado', { id, name: member.name });

            res.json({
                success: true,
                message: 'Membro atualizado com sucesso',
                data: member
            });
        } catch (error) {
            next(error);
        }
    }

    // Deletar membro
    static async deleteMember(req, res, next) {
        try {
            const { id } = req.params;

            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            await member.delete();

            logger.info('Membro deletado', { id, name: member.name });

            res.json({
                success: true,
                message: 'Membro deletado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    }

    // Upload de foto antes de criar membro
    static async uploadPhotoBeforeCreate(req, res, next) {
        try {
            uploadPhoto(req, res, async (err) => {
                if (err) {
                    return next(err);
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nenhum arquivo enviado'
                    });
                }

                // Gerar nome único para o arquivo
                const timestamp = Date.now();
                const oldPath = req.file.path;
                const fileName = `photo-${timestamp}${path.extname(req.file.originalname)}`;
                const newPath = path.join(path.dirname(oldPath), fileName);

                try {
                    await moveFile(oldPath, newPath);
                    
                    logger.info('Foto enviada antes da criação do membro', { photoPath: fileName });

                    res.json({
                        success: true,
                        message: 'Foto enviada com sucesso',
                        data: {
                            photo_path: fileName
                        }
                    });
                } catch (moveError) {
                    logger.error('Erro ao mover arquivo:', moveError);
                    res.status(500).json({
                        success: false,
                        message: 'Erro ao processar arquivo'
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Upload de foto do membro
    static async uploadPhoto(req, res, next) {
        try {
            const { id } = req.params;

            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            uploadPhoto(req, res, async (err) => {
                if (err) {
                    return next(err);
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nenhum arquivo enviado'
                    });
                }

                // Usar o nome do arquivo gerado pelo multer
                const fileName = req.file.filename;

                try {
                    // Atualizar caminho da foto no banco
                    await member.update({ photo_path: fileName });

                    logger.info('Foto do membro enviada', { id, photoPath: fileName });

                    res.json({
                        success: true,
                        message: 'Foto enviada com sucesso',
                        data: {
                            photo_path: fileName
                        }
                    });
                } catch (updateError) {
                    // Deletar arquivo se houver erro ao atualizar banco
                    await deleteFile(req.file.path);
                    throw updateError;
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Upload de arquivos do membro
    static async uploadFiles(req, res, next) {
        try {
            const { id } = req.params;

            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            uploadFiles(req, res, async (err) => {
                if (err) {
                    return next(err);
                }

                if (!req.files || req.files.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nenhum arquivo enviado'
                    });
                }

                const uploadedFiles = [];

                for (const file of req.files) {
                    const oldPath = file.path;
                    const newPath = path.join(path.dirname(oldPath), file.filename);

                    try {
                        await moveFile(oldPath, newPath);
                        uploadedFiles.push({
                            name: file.originalname,
                            path: newPath,
                            size: file.size
                        });
                    } catch (moveError) {
                        await deleteFile(oldPath);
                        throw moveError;
                    }
                }

                logger.info('Arquivos do membro enviados', { id, filesCount: uploadedFiles.length });

                res.json({
                    success: true,
                    message: 'Arquivos enviados com sucesso',
                    data: uploadedFiles
                });
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar membros ausentes
    static async getAbsentMembers(req, res, next) {
        try {
            const { days = 21 } = req.query;
            
            // Buscar membros que não vieram nos últimos X dias
            const absentMembers = await Member.getAbsentMembers(parseInt(days));

            logger.info('Membros ausentes consultados', { count: absentMembers.length, days });

            res.json({
                success: true,
                data: absentMembers
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar estatísticas dos membros
    static async getMemberStats(req, res, next) {
        try {
            const { id } = req.params;

            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            const stats = await member.getStats();
            const isAbsent = await member.isAbsent();

            logger.info('Estatísticas do membro consultadas', { id, name: member.name });

            res.json({
                success: true,
                data: {
                    ...stats,
                    isAbsent
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Exclusão lógica do membro
    static async softDeleteMember(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            // Verificar se o membro existe
            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            // Verificar se já está inativo
            if (!member.is_active) {
                return res.status(400).json({
                    success: false,
                    message: 'Membro já está inativo'
                });
            }

            // Exclusão lógica
            await member.softDelete(reason);

            logger.info('Membro excluído logicamente', { id, name: member.name, reason });

            res.json({
                success: true,
                message: 'Membro excluído com sucesso',
                data: member
            });
        } catch (error) {
            logger.error('Erro ao excluir membro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = MemberController;
