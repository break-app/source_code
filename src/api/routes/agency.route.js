const { Router } = require('express');
const AgencyController = require('../controllers/agency.controller');
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
		AgencyController.createAgnecy
	);

router.route('/get/one/:groupId').get(AgencyController.getGroup);

router.route('/get/all').get(AgencyController.getGroups);

router
	.route('/join')
	.post(
		auth,
		(req, res, next) =>
			cleanCache(`single_group=${req.body.groupId}`, next),
		AgencyController.joinGroup
	);

router
	.route('/leave')
	.post(
		auth,
		(req, res, next) =>
			cleanCache(`single_group=${req.body.groupId}`, next),
		AgencyController.leaveGroup
	);

router
	.route('/update/:id')
	.put(
		auth,
		(req, res, next) =>
			cleanCache([`single_group=${req.params.id}`, `all_groups`], next),
		AgencyController.upateGroup
	);

module.exports = router;
