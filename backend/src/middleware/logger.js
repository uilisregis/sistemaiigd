const fs = require('fs');
const path = require('path');

// Configuração de logs
const logDir = path.join(__dirname, '../../logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Função para formatar data/hora
function formatDateTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
}

// Função para escrever log
function writeLog(level, message, data = null) {
    const timestamp = formatDateTime();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    const fullMessage = data ? `${logMessage} | Data: ${JSON.stringify(data)}` : logMessage;
    
    // Escrever no console
    console.log(fullMessage);
    
    // Escrever no arquivo
    const logFile = path.join(logDir, 'app.log');
    fs.appendFileSync(logFile, fullMessage + '\n');
}

// Middleware de logging para Express
function requestLogger(req, res, next) {
    const start = Date.now();
    
    // Log da requisição
    writeLog('info', `Requisição: ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    // Interceptar resposta para log
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        // Log da resposta
        writeLog('info', `Resposta: ${req.method} ${req.url} - Status: ${res.statusCode} - Tempo: ${duration}ms`);
        
        originalSend.call(this, data);
    };
    
    next();
}

// Funções de log específicas
const logger = {
    info: (message, data) => writeLog('info', message, data),
    warn: (message, data) => writeLog('warn', message, data),
    error: (message, data) => writeLog('error', message, data),
    debug: (message, data) => writeLog('debug', message, data)
};

module.exports = {
    requestLogger,
    logger
};
