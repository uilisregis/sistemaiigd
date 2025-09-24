const { runQuery } = require('../src/config/database')

async function insertExampleGroups() {
  try {
    console.log('Inserindo grupos de exemplo...')
    
    const exampleGroups = [
      {
        name: 'Jovens',
        description: 'Grupo de jovens da igreja',
        color: '#10B981'
      },
      {
        name: 'Crianças',
        description: 'Grupo de crianças',
        color: '#F59E0B'
      },
      {
        name: 'Idosos',
        description: 'Grupo da terceira idade',
        color: '#8B5CF6'
      }
    ]
    
    for (const group of exampleGroups) {
      // Verificar se já existe
      const existing = await runQuery('SELECT id FROM groups WHERE name = ?', [group.name])
      
      if (!existing || existing.length === 0) {
        const insertSql = `
          INSERT INTO groups (name, description, color, is_active, created_at, updated_at)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        
        await runQuery(insertSql, [group.name, group.description, group.color])
        console.log(`✅ Grupo "${group.name}" inserido!`)
      } else {
        console.log(`⚠️ Grupo "${group.name}" já existe!`)
      }
    }
    
    console.log('✅ Grupos de exemplo processados!')
    
  } catch (error) {
    console.error('❌ Erro ao inserir grupos:', error)
    throw error
  }
}

insertExampleGroups()
  .then(() => {
    console.log('Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
