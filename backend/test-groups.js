const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando tabela groups...');

// Verificar se a tabela existe
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='groups'", (err, row) => {
    if (err) {
        console.error('❌ Erro ao verificar tabela:', err.message);
        return;
    }
    
    if (row) {
        console.log('✅ Tabela groups existe');
        
        // Verificar estrutura da tabela
        db.all("PRAGMA table_info(groups)", (err, columns) => {
            if (err) {
                console.error('❌ Erro ao verificar estrutura:', err.message);
                return;
            }
            
            console.log('📋 Estrutura da tabela groups:');
            columns.forEach(col => {
                console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            
            // Testar inserção
            console.log('\n🧪 Testando inserção...');
            db.run(`
                INSERT INTO groups (name, leader_name, description)
                VALUES (?, ?, ?)
            `, ['Teste', 'Teste Leader', 'Descrição teste'], function(err) {
                if (err) {
                    console.error('❌ Erro ao inserir:', err.message);
                } else {
                    console.log('✅ Inserção bem-sucedida, ID:', this.lastID);
                    
                    // Limpar teste
                    db.run('DELETE FROM groups WHERE id = ?', [this.lastID], (err) => {
                        if (err) {
                            console.error('❌ Erro ao limpar teste:', err.message);
                        } else {
                            console.log('✅ Teste limpo com sucesso');
                        }
                        db.close();
                    });
                }
            });
        });
    } else {
        console.log('❌ Tabela groups não existe');
        db.close();
    }
});
