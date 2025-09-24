const { runQuery, getQuery, allQuery } = require('../config/database');

class ServiceType {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.schedule = data.schedule;
        this.faith_campaign = data.faith_campaign;
        this.pastor_name = data.pastor_name;
        this.pastor_title = data.pastor_title;
        this.created_at = data.created_at;
    }

    // Criar novo tipo de culto
    static async create(serviceTypeData) {
        const sql = `
            INSERT INTO service_types (name, description, schedule, faith_campaign, pastor_name, pastor_title)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            serviceTypeData.name,
            serviceTypeData.description || null,
            serviceTypeData.schedule || null,
            serviceTypeData.faith_campaign || null,
            serviceTypeData.pastor_name || null,
            serviceTypeData.pastor_title || null
        ];

        const result = await runQuery(sql, params);
        return result.id;
    }

    // Buscar tipo de culto por ID
    static async findById(id) {
        const sql = 'SELECT * FROM service_types WHERE id = ?';
        const serviceType = await getQuery(sql, [id]);
        return serviceType ? new ServiceType(serviceType) : null;
    }

    // Buscar todos os tipos de culto
    static async findAll() {
        const sql = 'SELECT * FROM service_types ORDER BY name ASC';
        const serviceTypes = await allQuery(sql);
        return serviceTypes.map(serviceType => new ServiceType(serviceType));
    }

    // Buscar tipo de culto por nome
    static async findByName(name) {
        const sql = 'SELECT * FROM service_types WHERE name = ?';
        const serviceType = await getQuery(sql, [name]);
        return serviceType ? new ServiceType(serviceType) : null;
    }

    // Atualizar tipo de culto
    async update(updateData) {
        const sql = `
            UPDATE service_types 
            SET name = ?, description = ?, schedule = ?, faith_campaign = ?, pastor_name = ?, pastor_title = ?
            WHERE id = ?
        `;
        
        const params = [
            updateData.name || this.name,
            updateData.description || this.description,
            updateData.schedule || this.schedule,
            updateData.faith_campaign || this.faith_campaign,
            updateData.pastor_name || this.pastor_name,
            updateData.pastor_title || this.pastor_title,
            this.id
        ];

        await runQuery(sql, params);
        
        // Atualizar propriedades da instância
        Object.assign(this, updateData);
    }

    // Deletar tipo de culto
    async delete() {
        // Verificar se há presenças usando este tipo
        const attendanceCount = await getQuery(
            'SELECT COUNT(*) as total FROM attendance WHERE service_type = ?',
            [this.name]
        );

        if (attendanceCount.total > 0) {
            throw new Error('Não é possível deletar tipo de culto que possui presenças registradas');
        }

        const sql = 'DELETE FROM service_types WHERE id = ?';
        await runQuery(sql, [this.id]);
    }

    // Converter para objeto simples
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            schedule: this.schedule,
            faith_campaign: this.faith_campaign,
            pastor_name: this.pastor_name,
            pastor_title: this.pastor_title,
            created_at: this.created_at
        };
    }
}

module.exports = ServiceType;
