const { runQuery, getQuery, allQuery } = require('../config/database');
const { listMemberFiles } = require('../config/upload');

class Member {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.birth_date = data.birth_date;
        this.photo_path = data.photo_path;
        this.files_path = data.files_path;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.is_active = data.is_active;
        this.deleted_at = data.deleted_at;
        this.delete_reason = data.delete_reason;
        this.group_id = data.group_id;
        
        // Novos campos da ficha
        this.marital_status = data.marital_status;
        this.street = data.street;
        this.neighborhood = data.neighborhood;
        this.city = data.city;
        this.home_phone = data.home_phone;
        this.cell_phone = data.cell_phone;
        this.whatsapp = data.whatsapp;
        this.instagram = data.instagram;
        this.facebook = data.facebook;
        this.member_since = data.member_since;
        this.member_id = data.member_id;
    }

    // Criar novo membro
    static async create(memberData) {
        // Gerar ID único se não fornecido
        if (!memberData.member_id) {
            const lastMember = await getQuery('SELECT member_id FROM members WHERE member_id IS NOT NULL ORDER BY id DESC LIMIT 1');
            let nextNumber = 1;
            if (lastMember && lastMember.member_id) {
                const lastNumber = parseInt(lastMember.member_id.replace('MEM', ''));
                nextNumber = lastNumber + 1;
            }
            memberData.member_id = `MEM${String(nextNumber).padStart(4, '0')}`;
        }

        const sql = `
            INSERT INTO members (name, email, phone, address, birth_date, photo_path, files_path, group_id, 
                                marital_status, street, neighborhood, city, home_phone, cell_phone, whatsapp, 
                                instagram, facebook, member_since, member_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            memberData.name,
            memberData.email || null,
            memberData.phone || null,
            memberData.address || null,
            memberData.birth_date || null,
            memberData.photo_path || null,
            memberData.files_path || null,
            memberData.group_id || null,
            memberData.marital_status || null,
            memberData.street || null,
            memberData.neighborhood || null,
            memberData.city || null,
            memberData.home_phone || null,
            memberData.cell_phone || null,
            memberData.whatsapp || null,
            memberData.instagram || null,
            memberData.facebook || null,
            memberData.member_since || null,
            memberData.member_id
        ];

        const result = await runQuery(sql, params);
        return result.lastID || result.id;
    }

    // Buscar membro por ID
    static async findById(id) {
        const sql = 'SELECT * FROM members WHERE id = ? AND is_active = 1';
        const member = await getQuery(sql, [id]);
        
        if (member) {
            // Buscar arquivos do membro
            member.files = await listMemberFiles(id);
            return new Member(member);
        }
        
        return null;
    }

    // Buscar membro por email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM members WHERE email = ? AND is_active = 1';
        const member = await getQuery(sql, [email]);
        
        if (member) {
            return new Member(member);
        }
        
        return null;
    }

    // Buscar todos os membros
    static async findAll(limit = 50, offset = 0) {
        const sql = `
            SELECT * FROM members 
            WHERE is_active = 1 
            ORDER BY name ASC 
            LIMIT ? OFFSET ?
        `;
        
        const members = await allQuery(sql, [limit, offset]);
        
        // Buscar arquivos para cada membro
        for (let member of members) {
            member.files = await listMemberFiles(member.id);
        }
        
        return members.map(member => new Member(member));
    }

    // Buscar membros por nome
    static async searchByName(searchTerm, limit = 50) {
        const sql = `
            SELECT * FROM members 
            WHERE name LIKE ? AND is_active = 1 
            ORDER BY name ASC 
            LIMIT ?
        `;
        
        const members = await allQuery(sql, [`%${searchTerm}%`, limit]);
        
        // Buscar arquivos para cada membro
        for (let member of members) {
            member.files = await listMemberFiles(member.id);
        }
        
        return members.map(member => new Member(member));
    }

    // Buscar membros por grupo
    static async findByGroup(groupId, limit = 50, offset = 0) {
        const sql = `
            SELECT * FROM members 
            WHERE group_id = ? AND is_active = 1 
            ORDER BY name ASC 
            LIMIT ? OFFSET ?
        `;
        
        const members = await allQuery(sql, [groupId, limit, offset]);
        
        // Buscar arquivos para cada membro
        for (let member of members) {
            member.files = await listMemberFiles(member.id);
        }
        
        return members.map(member => new Member(member));
    }

    // Atualizar membro
    async update(updateData) {
        const sql = `
            UPDATE members 
            SET name = ?, email = ?, phone = ?, address = ?, 
                birth_date = ?, photo_path = ?, files_path = ?, 
                group_id = ?, marital_status = ?, street = ?, 
                neighborhood = ?, city = ?, home_phone = ?, 
                cell_phone = ?, whatsapp = ?, instagram = ?, 
                facebook = ?, member_since = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            updateData.name || this.name,
            updateData.email || this.email,
            updateData.phone || this.phone,
            updateData.address || this.address,
            updateData.birth_date || this.birth_date,
            updateData.photo_path || this.photo_path,
            updateData.files_path || this.files_path,
            updateData.group_id || this.group_id,
            updateData.marital_status || this.marital_status,
            updateData.street || this.street,
            updateData.neighborhood || this.neighborhood,
            updateData.city || this.city,
            updateData.home_phone || this.home_phone,
            updateData.cell_phone || this.cell_phone,
            updateData.whatsapp || this.whatsapp,
            updateData.instagram || this.instagram,
            updateData.facebook || this.facebook,
            updateData.member_since || this.member_since,
            this.id
        ];

        await runQuery(sql, params);
        
        // Atualizar propriedades da instância
        Object.assign(this, updateData);
        this.updated_at = new Date().toISOString();
    }

    // Deletar membro (soft delete)
    async delete() {
        const sql = 'UPDATE members SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await runQuery(sql, [this.id]);
        this.is_active = 0;
    }

    // Buscar estatísticas do membro
    async getStats() {
        // Total de presenças
        const totalAttendance = await getQuery(
            'SELECT COUNT(*) as total FROM attendance WHERE member_id = ?',
            [this.id]
        );

        // Presenças do mês atual
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyAttendance = await getQuery(
            'SELECT COUNT(*) as total FROM attendance WHERE member_id = ? AND date LIKE ?',
            [this.id, `${currentMonth}%`]
        );

        // Última presença
        const lastAttendance = await getQuery(
            'SELECT date FROM attendance WHERE member_id = ? ORDER BY date DESC LIMIT 1',
            [this.id]
        );

        // Dias sem vir (calculado)
        const daysSinceLastAttendance = lastAttendance 
            ? Math.floor((new Date() - new Date(lastAttendance.date)) / (1000 * 60 * 60 * 24))
            : null;

        return {
            totalAttendance: totalAttendance.total,
            monthlyAttendance: monthlyAttendance.total,
            lastAttendance: lastAttendance?.date,
            daysSinceLastAttendance
        };
    }

    // Verificar se membro está ausente (3+ cultos seguidos)
    async isAbsent() {
        const stats = await this.getStats();
        return stats.daysSinceLastAttendance && stats.daysSinceLastAttendance > 21; // 3 semanas
    }

    // Buscar membros ausentes (método estático)
    static async getAbsentMembers(days = 21) {
        const sql = `
            SELECT m.*, 
                   MAX(a.date) as last_attendance,
                   CASE 
                       WHEN MAX(a.date) IS NULL THEN 999
                       ELSE JULIANDAY('now') - JULIANDAY(MAX(a.date))
                   END as days_since_last_attendance
            FROM members m
            LEFT JOIN attendance a ON m.id = a.member_id
            WHERE m.is_active = 1
            GROUP BY m.id
            HAVING days_since_last_attendance > ?
            ORDER BY days_since_last_attendance DESC
        `;
        
        const members = await allQuery(sql, [days]);
        return members.map(member => new Member(member));
    }

    // Exclusão lógica do membro
    async softDelete(reason) {
        const sql = `
            UPDATE members 
            SET is_active = 0, deleted_at = CURRENT_TIMESTAMP, delete_reason = ?
            WHERE id = ?
        `;
        
        await runQuery(sql, [reason, this.id]);
        this.is_active = 0;
        this.deleted_at = new Date().toISOString();
        this.delete_reason = reason;
    }

    // Converter para objeto simples
    toJSON() {
        // Normalizar caminho da foto
        let normalizedPhotoPath = this.photo_path;
        if (normalizedPhotoPath) {
            // Se tem caminho completo, extrair apenas o nome do arquivo
            if (normalizedPhotoPath.includes('\\') || normalizedPhotoPath.includes('/')) {
                normalizedPhotoPath = normalizedPhotoPath.split(/[\\\/]/).pop();
            }
        }
        
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            birth_date: this.birth_date,
            photo_path: normalizedPhotoPath,
            files_path: this.files_path,
            created_at: this.created_at,
            updated_at: this.updated_at,
            is_active: this.is_active,
            deleted_at: this.deleted_at,
            delete_reason: this.delete_reason,
            group_id: this.group_id
        };
    }
}

module.exports = Member;
