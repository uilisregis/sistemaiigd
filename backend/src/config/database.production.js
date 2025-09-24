// Configuração de banco de dados para produção
const { Pool } = require('pg')

// Configuração PostgreSQL para produção
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_igreja',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Query executada', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Erro na query:', error)
    throw error
  }
}

// Função para executar uma query e retornar uma linha
const queryOne = async (text, params) => {
  const result = await query(text, params)
  return result.rows[0] || null
}

// Função para executar uma query e retornar todas as linhas
const queryAll = async (text, params) => {
  const result = await query(text, params)
  return result.rows
}

// Função para executar uma query de inserção/atualização
const queryRun = async (text, params) => {
  const result = await query(text, params)
  return {
    lastID: result.rows[0]?.id,
    changes: result.rowCount
  }
}

// Criar tabelas se não existirem
const createTables = async () => {
  try {
    // Tabela de membros
    await query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        birth_date DATE,
        photo_path VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de tipos de culto
    await query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        schedule TEXT,
        faith_campaign TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de presenças
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        service_type_id INTEGER REFERENCES service_types(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        observations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Inserir tipos de culto padrão
    await query(`
      INSERT INTO service_types (name, description, schedule, faith_campaign)
      VALUES 
        ('Culto Dominical', 'Culto principal aos domingos', '08:00, 19:00', ''),
        ('Culto de Quarta', 'Culto de meio de semana', '19:00', ''),
        ('Culto de Oração', 'Culto de oração', '19:00', ''),
        ('Escola Bíblica', 'Aula da escola bíblica', '09:00', ''),
        ('Reunião de Jovens', 'Reunião do grupo de jovens', '19:00', ''),
        ('Reunião de Senhoras', 'Reunião do grupo de senhoras', '14:00', '')
      ON CONFLICT (name) DO NOTHING
    `)

    console.log('✅ Tabelas criadas/verificadas com sucesso')
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    throw error
  }
}

module.exports = {
  query,
  queryOne,
  queryAll,
  queryRun,
  createTables,
  pool
}
