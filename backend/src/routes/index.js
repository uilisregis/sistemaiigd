const express = require('express');
const router = express.Router();

// Importar rotas
const memberRoutes = require('./memberRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const serviceTypeRoutes = require('./serviceTypeRoutes');
const groupRoutes = require('./groupRoutes');
const reportRoutes = require('./reportRoutes');

// Configurar rotas
router.use('/members', memberRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/service-types', serviceTypeRoutes);
router.use('/groups', groupRoutes);
router.use('/reports', reportRoutes);

// Rota de health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de gestão de membros da igreja está funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
