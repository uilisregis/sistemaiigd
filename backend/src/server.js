const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar configurações e middlewares
const { requestLogger, logger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

// Importar configuração do banco de dados
require('./config/database');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 2028;

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP por janela
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
    }
});

// Middlewares de segurança
app.use(helmet());
app.use(compression());
app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://seudominio.com'] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:2027', 'http://localhost:2028', 'http://localhost:2029'],
    credentials: true
}));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Servir arquivos estáticos (uploads)
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Gestão de Membros da Igreja',
        version: '1.0.0',
        endpoints: {
            members: '/api/members',
            attendance: '/api/attendance',
            serviceTypes: '/api/service-types',
            health: '/api/health'
        }
    });
});

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Servidor iniciado na porta ${PORT}`);
    logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 URL Local: http://localhost:${PORT}`);
    logger.info(`🌐 URL Externa: http://SEU_IP_VPS:${PORT}`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api/health`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promise rejeitada não tratada:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM recebido, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT recebido, encerrando servidor...');
    process.exit(0);
});

module.exports = app;
