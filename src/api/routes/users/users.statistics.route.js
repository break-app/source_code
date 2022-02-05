const { Router } = require('express');
const UserStatisticsController = require('../../controllers/users/users.statistics.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();

router.route('/daily').get(UserStatisticsController.topDailyGivers);
router.route('/weekly').get(UserStatisticsController.topWeeklyGivers);
router.route('/monthly').get(UserStatisticsController.topMonthlyGivers);

module.exports = router;
