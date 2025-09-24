const { logger } = require('./logger');

// Middleware para tratamento de erros
function errorHandler(err, req, res, next) {
    // Log do erro
    logger.error('Erro capturado pelo middleware', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Erro de validação
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: err.errors
        });
    }

    // Erro de arquivo não encontrado
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            success: false,
            message: 'Arquivo não encontrado'
        });
    }

    // Erro de limite de arquivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo: 10MB'
        });
    }

    // Erro de tipo de arquivo
    if (err.message.includes('Tipo de arquivo não permitido')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Erro de banco de dados
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({
            success: false,
            message: 'Violação de restrição do banco de dados'
        });
    }

    // Erro genérico
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
}

// Middleware para rotas não encontradas
function notFoundHandler(req, res, next) {
    const error = new Error(`Rota não encontrada: ${req.method} ${req.url}`);
    error.status = 404;
    next(error);
}

// Middleware para capturar erros assíncronos
function asyncErrorHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncErrorHandler
};
