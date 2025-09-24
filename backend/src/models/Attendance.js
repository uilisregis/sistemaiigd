const { runQuery, getQuery, allQuery } = require('../config/database');

class Attendance {
    constructor(data) {
        this.id = data.id;
        this.member_id = data.member_id;
        this.date = data.date;
        this.service_type = data.service_type;
        this.notes = data.notes;
        this.created_at = data.created_at;
    }

    // Criar nova presença
    static async create(attendanceData) {
        const sql = `
            INSERT INTO attendance (member_id, date, service_type, notes)
            VALUES (?, ?, ?, ?)
        `;
        
        const params = [
            attendanceData.member_id,
            attendanceData.date,
            attendanceData.service_type,
            attendanceData.notes || null
        ];

        const result = await runQuery(sql, params);
        return result.id;
    }

    // Buscar presença por ID
    static async findById(id) {
        const sql = `
            SELECT a.*, m.name as member_name 
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.id = ?
        `;
        const attendance = await getQuery(sql, [id]);
        return attendance ? new Attendance(attendance) : null;
    }

    // Buscar presenças de um membro
    static async findByMemberId(memberId, limit = 100, offset = 0) {
        const sql = `
            SELECT a.*, m.name as member_name 
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.member_id = ?
            ORDER BY a.date DESC
            LIMIT ? OFFSET ?
        `;
        
        const attendances = await allQuery(sql, [memberId, limit, offset]);
        return attendances.map(attendance => new Attendance(attendance));
    }

    // Buscar presenças por data
    static async findByDate(date) {
        const sql = `
            SELECT a.*, m.name as member_name, m.photo_path
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.date = ?
            ORDER BY m.name ASC
        `;
        
        const attendances = await allQuery(sql, [date]);
        return attendances.map(attendance => new Attendance(attendance));
    }

    // Buscar presenças por data e tipo de culto
    static async findByDateAndService(date, serviceType) {
        const sql = `
            SELECT a.*, m.name as member_name, m.photo_path
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.date = ? AND a.service_type = ?
            ORDER BY m.name ASC
        `;
        
        const attendances = await allQuery(sql, [date, serviceType]);
        return attendances.map(attendance => new Attendance(attendance));
    }

    // Buscar presenças por período
    static async findByDateRange(startDate, endDate) {
        const sql = `
            SELECT a.*, m.name as member_name, m.photo_path
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.date BETWEEN ? AND ?
            ORDER BY a.date DESC, m.name ASC
        `;
        
        const attendances = await allQuery(sql, [startDate, endDate]);
        return attendances.map(attendance => new Attendance(attendance));
    }

    // Buscar presenças por tipo de culto
    static async findByServiceType(serviceType, limit = 100) {
        const sql = `
            SELECT a.*, m.name as member_name, m.photo_path
            FROM attendance a
            JOIN members m ON a.member_id = m.id
            WHERE a.service_type = ?
            ORDER BY a.date DESC
            LIMIT ?
        `;
        
        const attendances = await allQuery(sql, [serviceType, limit]);
        return attendances.map(attendance => new Attendance(attendance));
    }

    // Verificar se membro já marcou presença na data
    static async checkExistingAttendance(memberId, date, serviceType) {
        const sql = `
            SELECT id FROM attendance 
            WHERE member_id = ? AND date = ? AND service_type = ?
        `;
        
        const existing = await getQuery(sql, [memberId, date, serviceType]);
        return existing !== null;
    }

    // Buscar estatísticas de presença
    static async getStats(startDate = null, endDate = null) {
        let dateFilter = '';
        let params = [];
        
        if (startDate && endDate) {
            dateFilter = 'WHERE a.date BETWEEN ? AND ?';
            params = [startDate, endDate];
        }

        // Total de presenças
        const totalAttendance = await getQuery(
            `SELECT COUNT(*) as total FROM attendance a ${dateFilter}`,
            params
        );

        // Presenças por tipo de culto
        const attendanceByType = await allQuery(
            `SELECT a.service_type, COUNT(*) as total 
             FROM attendance a ${dateFilter}
             GROUP BY a.service_type 
             ORDER BY total DESC`,
            params
        );

        // Presenças por dia da semana
        const attendanceByDay = await allQuery(
            `SELECT strftime('%w', a.date) as day_of_week, COUNT(*) as total
             FROM attendance a ${dateFilter}
             GROUP BY strftime('%w', a.date)
             ORDER BY day_of_week`,
            params
        );

        // Membros mais frequentes
        const mostFrequentMembers = await allQuery(
            `SELECT m.name, COUNT(a.id) as total_attendance
             FROM attendance a
             JOIN members m ON a.member_id = m.id
             ${dateFilter}
             GROUP BY m.id, m.name
             ORDER BY total_attendance DESC
             LIMIT 10`,
            params
        );

        return {
            totalAttendance: totalAttendance.total,
            attendanceByType,
            attendanceByDay,
            mostFrequentMembers
        };
    }

    // Buscar membros ausentes (não vieram nas últimas 3 semanas)
    static async getAbsentMembers() {
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
        const threeWeeksAgoStr = threeWeeksAgo.toISOString().substring(0, 10);

        const sql = `
            SELECT m.*, 
                   MAX(a.date) as last_attendance,
                   COUNT(a.id) as total_attendance
            FROM members m
            LEFT JOIN attendance a ON m.id = a.member_id
            WHERE m.is_active = 1
            GROUP BY m.id
            HAVING last_attendance IS NULL OR last_attendance < ?
            ORDER BY last_attendance ASC, m.name ASC
        `;
        
        const absentMembers = await allQuery(sql, [threeWeeksAgoStr]);
        return absentMembers;
    }

    // Atualizar presença
    async update(updateData) {
        const sql = `
            UPDATE attendance 
            SET date = ?, service_type = ?, notes = ?
            WHERE id = ?
        `;
        
        const params = [
            updateData.date || this.date,
            updateData.service_type || this.service_type,
            updateData.notes || this.notes,
            this.id
        ];

        await runQuery(sql, params);
        
        // Atualizar propriedades da instância
        Object.assign(this, updateData);
    }

    // Deletar presença
    async delete() {
        const sql = 'DELETE FROM attendance WHERE id = ?';
        await runQuery(sql, [this.id]);
    }

    // Converter para objeto simples
    toJSON() {
        return {
            id: this.id,
            member_id: this.member_id,
            date: this.date,
            service_type: this.service_type,
            notes: this.notes,
            created_at: this.created_at
        };
    }
}

module.exports = Attendance;
