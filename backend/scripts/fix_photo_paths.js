const { runQuery, allQuery } = require('../src/config/database')

async function fixPhotoPaths() {
  try {
    console.log('Corrigindo caminhos das fotos...')
    
    // Buscar todos os membros com fotos
    const members = await allQuery('SELECT id, photo_path FROM members WHERE photo_path IS NOT NULL')
    
    for (const member of members) {
      let newPath = member.photo_path
      
      // Se tem caminho completo, extrair apenas o nome do arquivo
      if (newPath.includes('\\') || newPath.includes('/')) {
        newPath = newPath.split(/[\\\/]/).pop()
      }
      
      // Atualizar no banco
      await runQuery('UPDATE members SET photo_path = ? WHERE id = ?', [newPath, member.id])
      console.log(`✅ Membro ${member.id}: ${member.photo_path} → ${newPath}`)
    }
    
    console.log('✅ Caminhos das fotos corrigidos!')
    
  } catch (error) {
    console.error('❌ Erro ao corrigir caminhos:', error)
    throw error
  }
}

fixPhotoPaths()
  .then(() => {
    console.log('Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro:', error)
    process.exit(1)
  })
