const UserStatisticsDAO = require('../../../dao/users/users.statistics.dao');

class UserStatisticsController {
	static async topDailyGivers(req, res, next) {
		try {
			const dailyResult = await UserStatisticsDAO.topDailyGivers();
			res.json(dailyResult);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = UserStatisticsController;
