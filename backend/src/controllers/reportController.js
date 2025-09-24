const { runQuery, getQuery, allQuery } = require('../config/database');

class ReportController {
    // Relatório mensal de presença
    static async getMonthlyReport(req, res) {
        try {
            const { year, month, group_id } = req.query;
            
            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'Ano e mês são obrigatórios'
                });
            }

            // Buscar membros
            let membersQuery = `
                SELECT m.*, g.name as group_name 
                FROM members m 
                LEFT JOIN groups g ON m.group_id = g.id 
                WHERE m.is_active = 1
            `;
            const membersParams = [];
            
            if (group_id) {
                membersQuery += ' AND m.group_id = ?';
                membersParams.push(group_id);
            }
            
            const members = await allQuery(membersQuery, membersParams);

            // Buscar presenças do mês
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
            
            const attendanceQuery = `
                SELECT a.member_id, COUNT(*) as attendance_count
                FROM attendance a
                WHERE DATE(a.date) BETWEEN ? AND ?
                GROUP BY a.member_id
            `;
            
            const attendanceData = await allQuery(attendanceQuery, [startDate, endDate]);
            const attendanceMap = {};
            attendanceData.forEach(att => {
                attendanceMap[att.member_id] = att.attendance_count;
            });

            // Calcular estatísticas
            const totalMembers = members.length;
            const membersWithAttendance = members.filter(m => attendanceMap[m.id]);
            const presentMembers = membersWithAttendance.length;
            const absentMembers = totalMembers - presentMembers;
            
            // Calcular pontuação por grupo
            const groupStats = {};
            members.forEach(member => {
                const groupName = member.group_name || 'Sem Grupo';
                if (!groupStats[groupName]) {
                    groupStats[groupName] = {
                        total: 0,
                        present: 0,
                        score: 0
                    };
                }
                groupStats[groupName].total++;
                if (attendanceMap[member.id]) {
                    groupStats[groupName].present++;
                }
            });

            // Calcular pontuação (percentual de presença)
            Object.keys(groupStats).forEach(groupName => {
                const group = groupStats[groupName];
                group.score = group.total > 0 ? Math.round((group.present / group.total) * 100) : 0;
            });

            // Preparar dados dos membros
            const membersData = members.map(member => ({
                id: member.id,
                member_id: member.member_id,
                name: member.name,
                group_name: member.group_name || 'Sem Grupo',
                attendance_count: attendanceMap[member.id] || 0,
                status: attendanceMap[member.id] ? 'Presente' : 'Ausente',
                photo_path: member.photo_path
            }));

            res.json({
                success: true,
                data: {
                    period: {
                        year: parseInt(year),
                        month: parseInt(month),
                        start_date: startDate,
                        end_date: endDate
                    },
                    summary: {
                        total_members: totalMembers,
                        present_members: presentMembers,
                        absent_members: absentMembers,
                        overall_score: totalMembers > 0 ? Math.round((presentMembers / totalMembers) * 100) : 0
                    },
                    group_stats: groupStats,
                    members: membersData
                }
            });

        } catch (error) {
            console.error('Erro ao gerar relatório mensal:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Dashboard com pontuação
    static async getDashboardStats(req, res) {
        try {
            const { group_id } = req.query;
            
            // Buscar membros
            let membersQuery = `
                SELECT m.*, g.name as group_name 
                FROM members m 
                LEFT JOIN groups g ON m.group_id = g.id 
                WHERE m.is_active = 1
            `;
            const membersParams = [];
            
            if (group_id) {
                membersQuery += ' AND m.group_id = ?';
                membersParams.push(group_id);
            }
            
            const members = await allQuery(membersQuery, membersParams);

            // Buscar presenças dos últimos 30 dias
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];

            const attendanceQuery = `
                SELECT a.member_id, COUNT(*) as attendance_count
                FROM attendance a
                WHERE DATE(a.date) >= ?
                GROUP BY a.member_id
            `;
            
            const attendanceData = await allQuery(attendanceQuery, [startDate]);
            const attendanceMap = {};
            attendanceData.forEach(att => {
                attendanceMap[att.member_id] = att.attendance_count;
            });

            // Calcular estatísticas por grupo
            const groupStats = {};
            members.forEach(member => {
                const groupName = member.group_name || 'Sem Grupo';
                if (!groupStats[groupName]) {
                    groupStats[groupName] = {
                        total: 0,
                        present: 0,
                        score: 0
                    };
                }
                groupStats[groupName].total++;
                if (attendanceMap[member.id]) {
                    groupStats[groupName].present++;
                }
            });

            // Calcular pontuação
            Object.keys(groupStats).forEach(groupName => {
                const group = groupStats[groupName];
                group.score = group.total > 0 ? Math.round((group.present / group.total) * 100) : 0;
            });

            res.json({
                success: true,
                data: {
                    period: 'Últimos 30 dias',
                    group_stats: groupStats,
                    total_members: members.length,
                    members_with_attendance: Object.keys(attendanceMap).length
                }
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas do dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = ReportController;
