const { Router } = require('express');
const AgencyController = require('../controllers/agency.controller');
const validate = require('../helpers/validationLayers/agency.layer');

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

router
	.route('/createReqJoinFromUserToAgency/:agencyId')
	.put(auth, AgencyController.createReqJoinFromUserToAgency);
router
	.route('/getAgencyJoinReqs/:agencyId')
	.get(AgencyController.getAgencyJoinReqs);
router
	.route('/approveAgencyJoinReqs/:agencyId')
	.put(AgencyController.approveAgencyJoinReqs);
router
	.route('/getAgencyMembers/:agencyId')
	.get(AgencyController.getAgencyMembers);
router
	.route('/sendGiftFromUserToAgencyMember')
	.put(auth, AgencyController.sendGiftFromUserToAgencyMember);
router
	.route('/awardAgencyMembers/:agencyId')
	.put(auth, AgencyController.awardAgencyMembers);

module.exports = router;
