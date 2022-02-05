const { Router } = require('express');
const UserStatisticsController = require('../../controllers/users/users.statistics.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();

router.route('/daily').get(UserStatisticsController.topDailyGivers);

module.exports = router;
