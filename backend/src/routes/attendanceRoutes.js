const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');

// Rotas para presenças
router.get('/', AttendanceController.getAttendance);
router.get('/stats', AttendanceController.getAttendanceStats);
router.get('/absent', AttendanceController.getAbsentMembers);
router.get('/:id', AttendanceController.getAttendanceById);
router.post('/', AttendanceController.markAttendance);
router.post('/bulk', AttendanceController.markBulkAttendance);
router.put('/:id', AttendanceController.updateAttendance);
router.delete('/:id', AttendanceController.deleteAttendance);

module.exports = router;
