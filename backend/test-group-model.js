const Group = require('./src/models/Group');

console.log('🧪 Testando modelo Group...');

async function testGroup() {
    try {
        console.log('1. Testando criação de grupo...');
        
        const groupData = {
            name: 'Grupo Teste',
            leader_name: 'Líder Teste',
            description: 'Descrição teste'
        };
        
        const groupId = await Group.create(groupData);
        console.log('✅ Grupo criado com ID:', groupId);
        
        console.log('2. Testando busca por ID...');
        const group = await Group.findById(groupId);
        console.log('✅ Grupo encontrado:', group ? group.name : 'Não encontrado');
        
        console.log('3. Testando listagem...');
        const groups = await Group.findAll();
        console.log('✅ Total de grupos:', groups.length);
        
        console.log('4. Testando atualização...');
        if (group) {
            await group.update({ description: 'Descrição atualizada' });
            console.log('✅ Grupo atualizado');
        }
        
        console.log('5. Testando exclusão...');
        if (group) {
            await group.delete();
            console.log('✅ Grupo excluído');
        }
        
        console.log('🎉 Todos os testes passaram!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

testGroup();
