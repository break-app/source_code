const { Router } = require('express');
const GroupController = require('../controllers/groups.controller');
const auth = require('../middlewares/auth.middleware');

const router = Router();

router.route('/create').post(GroupController.createGroup);
router.route('/get/one/:groupId').get(GroupController.getGroup);
router.route('/get/all').get(GroupController.getGroups);
router.route('/join').post(auth, GroupController.joinGroup);
router.route('/leave').post(auth, GroupController.leaveGroup);

module.exports = router;
