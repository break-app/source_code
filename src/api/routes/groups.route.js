const { Router } = require('express');
const GroupController = require('../controllers/groups.controller');
const validate = require('../helpers/validationLayers/groups.layer');

const auth = require('../middlewares/auth.middleware');
var cleanCache = require('../middlewares/cleanCache');
const { catchValidationError } = require('../middlewares/validationError');

const router = Router();

router
	.route('/create')
	.post(
		validate('createGroup'),
		catchValidationError,
		(req, res, next) => cleanCache('all_groups', next),
		GroupController.createGroup
	);

router.route('/get/one/:groupId').get(GroupController.getGroup);

router.route('/get/all').get(GroupController.getGroups);

router
	.route('/join')
	.post(
		auth,
		(req, res, next) =>
			cleanCache(`single_group=${req.body.groupId}`, next),
		GroupController.joinGroup
	);

router
	.route('/leave')
	.post(
		auth,
		(req, res, next) =>
			cleanCache(`single_group=${req.body.groupId}`, next),
		GroupController.leaveGroup
	);

router
	.route('/update/:id')
	.put(
		auth,
		(req, res, next) =>
			cleanCache([`single_group=${req.params.id}`, `all_groups`], next),
		GroupController.upateGroup
	);

module.exports = router;
