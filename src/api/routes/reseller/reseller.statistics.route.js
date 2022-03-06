const {
	ResellerStatisticsCtrl,
} = require('../../controllers/reseller/reseller.statistics.controller');
const auth = require('../../middlewares/auth.middleware');
const router = require('express').Router();

router
	.route('/getStatistics')
	.get(auth, ResellerStatisticsCtrl.getResellerStatistics);
module.exports = router;
