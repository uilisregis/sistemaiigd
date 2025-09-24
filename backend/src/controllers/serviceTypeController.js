const ServiceType = require('../models/ServiceType');
const { logger } = require('../middleware/logger');

class ServiceTypeController {
    // Listar todos os tipos de culto
    static async getAllServiceTypes(req, res, next) {
        try {
            const serviceTypes = await ServiceType.findAll();

            logger.info('Tipos de culto listados', { count: serviceTypes.length });

            res.json({
                success: true,
                data: serviceTypes
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar tipo de culto por ID
    static async getServiceTypeById(req, res, next) {
        try {
            const { id } = req.params;
            const serviceType = await ServiceType.findById(id);

            if (!serviceType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de culto não encontrado'
                });
            }

            logger.info('Tipo de culto encontrado', { id, name: serviceType.name });

            res.json({
                success: true,
                data: serviceType
            });
        } catch (error) {
            next(error);
        }
    }

    // Criar novo tipo de culto
    static async createServiceType(req, res, next) {
        try {
            const { name, description } = req.body;

            // Validar dados obrigatórios
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome é obrigatório'
                });
            }

            // Verificar se já existe
            const existingServiceType = await ServiceType.findByName(name);
            if (existingServiceType) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de culto já existe'
                });
            }

            // Criar tipo de culto
            const serviceTypeId = await ServiceType.create({ name, description });
            const serviceType = await ServiceType.findById(serviceTypeId);

            logger.info('Tipo de culto criado', { id: serviceTypeId, name: serviceType.name });

            res.status(201).json({
                success: true,
                message: 'Tipo de culto criado com sucesso',
                data: serviceType
            });
        } catch (error) {
            next(error);
        }
    }

    // Atualizar tipo de culto
    static async updateServiceType(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const serviceType = await ServiceType.findById(id);
            if (!serviceType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de culto não encontrado'
                });
            }

            // Verificar se o novo nome já existe (se estiver sendo alterado)
            if (updateData.name && updateData.name !== serviceType.name) {
                const existingServiceType = await ServiceType.findByName(updateData.name);
                if (existingServiceType) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nome já existe para outro tipo de culto'
                    });
                }
            }

            await serviceType.update(updateData);

            logger.info('Tipo de culto atualizado', { id, name: serviceType.name });

            res.json({
                success: true,
                message: 'Tipo de culto atualizado com sucesso',
                data: serviceType
            });
        } catch (error) {
            next(error);
        }
    }

    // Deletar tipo de culto
    static async deleteServiceType(req, res, next) {
        try {
            const { id } = req.params;

            const serviceType = await ServiceType.findById(id);
            if (!serviceType) {
                return res.status(404).json({
                    success: false,
                    message: 'Tipo de culto não encontrado'
                });
            }

            await serviceType.delete();

            logger.info('Tipo de culto deletado', { id, name: serviceType.name });

            res.json({
                success: true,
                message: 'Tipo de culto deletado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ServiceTypeController;
