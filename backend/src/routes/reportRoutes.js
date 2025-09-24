const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

// Rotas para relatórios
router.get('/dashboard-stats', ReportController.getDashboardStats);
router.get('/monthly', ReportController.getMonthlyReport);

module.exports = router;