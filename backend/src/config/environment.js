// Configuração de ambiente
const config = {
  development: {
    database: {
      type: 'sqlite',
      path: './database.sqlite'
    },
    upload: {
      path: './uploads',
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    cors: {
      origin: ['http://localhost:2027', 'http://localhost:2028', 'http://localhost:2029']
    }
  },
  
  production: {
    database: {
      type: 'postgresql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'sistema_igreja',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    },
    upload: {
      path: process.env.UPLOAD_PATH || './uploads',
      maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    },
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://seudominio.com']
    }
  }
}

const env = process.env.NODE_ENV || 'development'
module.exports = config[env]
