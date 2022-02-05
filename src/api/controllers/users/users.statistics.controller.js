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
	static async topWeeklyGivers(req, res, next) {
		try {
			const WeeklyResult = await UserStatisticsDAO.topWeeklyGivers();
			res.json(WeeklyResult);
		} catch (error) {
			next(error);
		}
	}
	static async topMonthlyGivers(req, res, next) {
		try {
			const WeeklyResult = await UserStatisticsDAO.topMonthlyGivers();
			res.json(WeeklyResult);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = UserStatisticsController;
