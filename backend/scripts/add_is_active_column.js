const { runQuery } = require('../src/config/database')

async function addIsActiveColumn() {
  try {
    console.log('Adicionando coluna is_active à tabela groups...')
    
    await runQuery('ALTER TABLE groups ADD COLUMN is_active BOOLEAN DEFAULT 1')
    console.log('✅ Coluna is_active adicionada com sucesso!')
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Coluna is_active já existe!')
    } else {
      console.error('❌ Erro ao adicionar coluna:', error.message)
      throw error
    }
  }
}

addIsActiveColumn()
  .then(() => {
    console.log('Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
