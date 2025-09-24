const { runQuery } = require('../src/config/database')

async function addColorColumn() {
  try {
    console.log('Adicionando coluna color à tabela groups...')
    
    await runQuery('ALTER TABLE groups ADD COLUMN color VARCHAR(7) DEFAULT "#3B82F6"')
    console.log('✅ Coluna color adicionada com sucesso!')
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Coluna color já existe!')
    } else {
      console.error('❌ Erro ao adicionar coluna:', error.message)
      throw error
    }
  }
}

addColorColumn()
  .then(() => {
    console.log('Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
