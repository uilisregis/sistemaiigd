const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando banco de dados...');

// Listar todas as tabelas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Erro:', err.message);
        return;
    }
    
    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });
    
    // Verificar se a tabela groups existe
    const hasGroups = tables.some(table => table.name === 'groups');
    
    if (hasGroups) {
        console.log('\n✅ Tabela groups existe');
        
        // Verificar estrutura
        db.all("PRAGMA table_info(groups)", (err, columns) => {
            if (err) {
                console.error('❌ Erro ao verificar estrutura:', err.message);
                return;
            }
            
            console.log('\n📋 Estrutura da tabela groups:');
            columns.forEach(col => {
                console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            
            db.close();
        });
    } else {
        console.log('\n❌ Tabela groups NÃO existe');
        console.log('🔧 Criando tabela groups...');
        
        db.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                leader_name TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Erro ao criar tabela:', err.message);
            } else {
                console.log('✅ Tabela groups criada com sucesso!');
            }
            db.close();
        });
    }
});
