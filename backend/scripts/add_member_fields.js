const { runQuery } = require('../src/config/database');

async function addMemberFields() {
    try {
        console.log('🔄 Adicionando novos campos à tabela members...');

        // Adicionar novos campos
        const fields = [
            { name: 'marital_status', type: 'TEXT' },
            { name: 'street', type: 'TEXT' },
            { name: 'neighborhood', type: 'TEXT' },
            { name: 'city', type: 'TEXT' },
            { name: 'home_phone', type: 'TEXT' },
            { name: 'cell_phone', type: 'TEXT' },
            { name: 'whatsapp', type: 'TEXT' },
            { name: 'instagram', type: 'TEXT' },
            { name: 'facebook', type: 'TEXT' },
            { name: 'member_since', type: 'INTEGER' },
            { name: 'member_id', type: 'TEXT' } // ID único do membro
        ];

        for (const field of fields) {
            try {
                await runQuery(`ALTER TABLE members ADD COLUMN ${field.name} ${field.type}`);
                console.log(`✅ Campo ${field.name} adicionado`);
            } catch (error) {
                if (error.message.includes('duplicate column name')) {
                    console.log(`⚠️  Campo ${field.name} já existe`);
                } else {
                    console.error(`❌ Erro ao adicionar campo ${field.name}:`, error.message);
                }
            }
        }

        // Gerar IDs únicos para membros existentes
        const members = await runQuery('SELECT id FROM members WHERE member_id IS NULL');
        if (members.length > 0) {
            console.log('🔄 Gerando IDs únicos para membros existentes...');
            for (let i = 0; i < members.length; i++) {
                const memberId = `MEM${String(i + 1).padStart(4, '0')}`;
                await runQuery('UPDATE members SET member_id = ? WHERE id = ?', [memberId, members[i].id]);
                console.log(`✅ ID ${memberId} atribuído ao membro ${members[i].id}`);
            }
        }

        console.log('✅ Campos adicionados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao adicionar campos:', error);
    }
}

addMemberFields();
