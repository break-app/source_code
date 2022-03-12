const {
	AgencyStatisticsCtrl,
} = require('../../controllers/agency/agency.statistics.controller');
const auth = require('../../middlewares/auth.middleware');
const router = require('express').Router();

router
	.route('/getStatistics/:agencyId')
	.get(auth, AgencyStatisticsCtrl.getStats);
module.exports = router;
