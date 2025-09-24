const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { logger } = require('../middleware/logger');

class AttendanceController {
    // Marcar presença
    static async markAttendance(req, res, next) {
        try {
            const { memberId, date, serviceType, notes } = req.body;

            // Validar dados obrigatórios
            if (!memberId || !date || !serviceType) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados obrigatórios: memberId, date, serviceType'
                });
            }

            // Verificar se membro existe
            const member = await Member.findById(memberId);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Membro não encontrado'
                });
            }

            // Verificar se já marcou presença neste culto (prevenção de duplicatas)
            const existingAttendance = await Attendance.checkExistingAttendance(memberId, date, serviceType);
            if (existingAttendance) {
                // Retornar a presença existente em vez de erro (sistema multi-usuário)
                return res.json({
                    success: true,
                    data: existingAttendance,
                    message: 'Presença já estava marcada',
                    alreadyMarked: true
                });
            }

            // Criar presença
            const attendanceId = await Attendance.create({
                member_id: memberId,
                date,
                service_type: serviceType,
                notes
            });

            const attendance = await Attendance.findById(attendanceId);

            logger.info('Presença marcada', { 
                memberId, 
                memberName: member.name, 
                date, 
                serviceType 
            });

            res.status(201).json({
                success: true,
                message: 'Presença marcada com sucesso',
                data: attendance
            });
        } catch (error) {
            next(error);
        }
    }

    // Listar presenças
    static async getAttendance(req, res, next) {
        try {
            const { 
                memberId, 
                date, 
                startDate, 
                endDate, 
                serviceType,
                page = 1, 
                limit = 100 
            } = req.query;

            const offset = (page - 1) * limit;
            let attendances;

            if (memberId) {
                // Presenças de um membro específico
                attendances = await Attendance.findByMemberId(memberId, parseInt(limit), offset);
            } else if (date && serviceType) {
                // Presenças de uma data e tipo de culto específicos
                attendances = await Attendance.findByDateAndService(date, serviceType);
            } else if (date) {
                // Presenças de uma data específica
                attendances = await Attendance.findByDate(date);
            } else if (startDate && endDate) {
                // Presenças de um período
                attendances = await Attendance.findByDateRange(startDate, endDate);
            } else if (serviceType) {
                // Presenças de um tipo de culto
                attendances = await Attendance.findByServiceType(serviceType, parseInt(limit));
            } else {
                // Todas as presenças (limitadas)
                attendances = await Attendance.findByDateRange(
                    new Date().toISOString().substring(0, 10), // Hoje
                    new Date().toISOString().substring(0, 10)  // Hoje
                );
            }

            logger.info('Presenças consultadas', { 
                count: attendances.length, 
                filters: { memberId, date, startDate, endDate, serviceType }
            });

            res.json({
                success: true,
                data: attendances,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: attendances.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar presença por ID
    static async getAttendanceById(req, res, next) {
        try {
            const { id } = req.params;
            const attendance = await Attendance.findById(id);

            if (!attendance) {
                return res.status(404).json({
                    success: false,
                    message: 'Presença não encontrada'
                });
            }

            logger.info('Presença encontrada', { id, memberId: attendance.member_id });

            res.json({
                success: true,
                data: attendance
            });
        } catch (error) {
            next(error);
        }
    }

    // Atualizar presença
    static async updateAttendance(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const attendance = await Attendance.findById(id);
            if (!attendance) {
                return res.status(404).json({
                    success: false,
                    message: 'Presença não encontrada'
                });
            }

            await attendance.update(updateData);

            logger.info('Presença atualizada', { id, memberId: attendance.member_id });

            res.json({
                success: true,
                message: 'Presença atualizada com sucesso',
                data: attendance
            });
        } catch (error) {
            next(error);
        }
    }

    // Deletar presença
    static async deleteAttendance(req, res, next) {
        try {
            const { id } = req.params;

            const attendance = await Attendance.findById(id);
            if (!attendance) {
                return res.status(404).json({
                    success: false,
                    message: 'Presença não encontrada'
                });
            }

            await attendance.delete();

            logger.info('Presença deletada', { id, memberId: attendance.member_id });

            res.json({
                success: true,
                message: 'Presença deletada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar estatísticas de presença
    static async getAttendanceStats(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            
            const stats = await Attendance.getStats(startDate, endDate);

            logger.info('Estatísticas de presença consultadas', { startDate, endDate });

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // Buscar membros ausentes
    static async getAbsentMembers(req, res, next) {
        try {
            const absentMembers = await Attendance.getAbsentMembers();

            logger.info('Membros ausentes consultados', { count: absentMembers.length });

            res.json({
                success: true,
                data: absentMembers
            });
        } catch (error) {
            next(error);
        }
    }

    // Marcar presença em lote (múltiplos membros)
    static async markBulkAttendance(req, res, next) {
        try {
            const { date, serviceType, memberIds, notes } = req.body;

            // Validar dados obrigatórios
            if (!date || !serviceType || !memberIds || !Array.isArray(memberIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados obrigatórios: date, serviceType, memberIds (array)'
                });
            }

            const results = {
                success: [],
                errors: []
            };

            for (const memberId of memberIds) {
                try {
                    // Verificar se membro existe
                    const member = await Member.findById(memberId);
                    if (!member) {
                        results.errors.push({
                            memberId,
                            error: 'Membro não encontrado'
                        });
                        continue;
                    }

                    // Verificar se já marcou presença
                    const existingAttendance = await Attendance.checkExistingAttendance(memberId, date, serviceType);
                    if (existingAttendance) {
                        results.errors.push({
                            memberId,
                            memberName: member.name,
                            error: 'Presença já marcada para este culto'
                        });
                        continue;
                    }

                    // Criar presença
                    const attendanceId = await Attendance.create({
                        member_id: memberId,
                        date,
                        service_type: serviceType,
                        notes
                    });

                    results.success.push({
                        memberId,
                        memberName: member.name,
                        attendanceId
                    });

                } catch (error) {
                    results.errors.push({
                        memberId,
                        error: error.message
                    });
                }
            }

            logger.info('Presença em lote processada', { 
                date, 
                serviceType, 
                success: results.success.length, 
                errors: results.errors.length 
            });

            res.json({
                success: true,
                message: `Presença processada: ${results.success.length} sucessos, ${results.errors.length} erros`,
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AttendanceController;
