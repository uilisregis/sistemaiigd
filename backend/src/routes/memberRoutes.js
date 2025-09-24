const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/memberController');

// Rotas para membros
router.get('/', MemberController.getAllMembers);
router.get('/absent', MemberController.getAbsentMembers);
router.get('/:id', MemberController.getMemberById);
router.get('/:id/stats', MemberController.getMemberStats);
router.post('/', MemberController.createMember);
router.put('/:id', MemberController.updateMember);
router.delete('/:id', MemberController.deleteMember);

// Rotas para upload de arquivos
router.post('/upload-photo', MemberController.uploadPhotoBeforeCreate);
router.post('/:id/photo', MemberController.uploadPhoto);
router.post('/:id/files', MemberController.uploadFiles);

// Rota para exclusão lógica
router.patch('/:id/soft-delete', MemberController.softDeleteMember);

module.exports = router;
