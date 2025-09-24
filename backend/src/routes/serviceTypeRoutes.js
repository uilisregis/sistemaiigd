const express = require('express');
const router = express.Router();
const ServiceTypeController = require('../controllers/serviceTypeController');

// Rotas para tipos de culto
router.get('/', ServiceTypeController.getAllServiceTypes);
router.get('/:id', ServiceTypeController.getServiceTypeById);
router.post('/', ServiceTypeController.createServiceType);
router.put('/:id', ServiceTypeController.updateServiceType);
router.delete('/:id', ServiceTypeController.deleteServiceType);

module.exports = router;
