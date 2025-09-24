const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Rotas para grupos
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroup);
router.post('/', groupController.createGroup);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Rotas para membros do grupo
router.get('/:id/members', groupController.getGroupMembers);
router.post('/:id/members', groupController.addMemberToGroup);
router.post('/:id/associate', groupController.associateMembers);
router.delete('/:id/members/:memberId', groupController.removeMemberFromGroup);

module.exports = router;