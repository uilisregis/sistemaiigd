const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../../database.sqlite');

// Criar diretório se não existir
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Conectar ao banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        initializeDatabase();
    }
});

// Inicializar tabelas do banco de dados
function initializeDatabase() {
    // Tabela de membros
    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            birth_date DATE,
            photo_path TEXT,
            files_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela members:', err.message);
        } else {
            console.log('✅ Tabela members criada/verificada');
        }
    });

    // Tabela de presenças
    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            date DATE NOT NULL,
            service_type TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members (id)
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela attendance:', err.message);
        } else {
            console.log('✅ Tabela attendance criada/verificada');
        }
    });

    // Tabela de tipos de culto
    db.run(`
        CREATE TABLE IF NOT EXISTS service_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            schedule TEXT,
            faith_campaign TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela service_types:', err.message);
        } else {
            console.log('✅ Tabela service_types criada/verificada');
            // Adicionar novas colunas se não existirem
            db.run(`ALTER TABLE service_types ADD COLUMN schedule TEXT`, () => {});
            db.run(`ALTER TABLE service_types ADD COLUMN faith_campaign TEXT`, () => {});
            db.run(`ALTER TABLE service_types ADD COLUMN pastor_name TEXT`, () => {});
            db.run(`ALTER TABLE service_types ADD COLUMN pastor_title TEXT`, () => {});
            db.run(`ALTER TABLE members ADD COLUMN deleted_at DATETIME`, () => {});
            db.run(`ALTER TABLE members ADD COLUMN delete_reason TEXT`, () => {});
            db.run(`ALTER TABLE members ADD COLUMN group_id INTEGER`, () => {});
            // Não inserir dados simulados - apenas dados reais
        }
    });

    // Criar tabela de grupos
    db.run(`
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            color TEXT DEFAULT '#3B82F6',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela groups:', err.message);
        } else {
            console.log('✅ Tabela groups criada/verificada');
        }
    });

    // Criar tabela de membros do grupo
    db.run(`
        CREATE TABLE IF NOT EXISTS group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups (id),
            FOREIGN KEY (member_id) REFERENCES members (id),
            UNIQUE(group_id, member_id)
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela group_members:', err.message);
        } else {
            console.log('✅ Tabela group_members criada/verificada');
        }
    });
}

// Dados simulados removidos - apenas dados reais serão utilizados

// Função para executar queries
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// Função para buscar dados
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Função para buscar múltiplos dados
function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    db,
    runQuery,
    getQuery,
    allQuery
};
