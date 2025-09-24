const { runQuery } = require('../src/config/database')

async function createGroupsTable() {
  try {
    console.log('Criando tabela de grupos...')
    
    const sql = `
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await runQuery(sql)
    console.log('✅ Tabela de grupos criada com sucesso!')
    
    // Inserir alguns grupos de exemplo
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
      const insertSql = `
        INSERT INTO groups (name, description, color, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `
      
      await runQuery(insertSql, [group.name, group.description, group.color])
    }
    
    console.log('✅ Grupos de exemplo inseridos!')
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de grupos:', error)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createGroupsTable()
    .then(() => {
      console.log('Script executado com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Erro:', error)
      process.exit(1)
    })
}

module.exports = { createGroupsTable }
