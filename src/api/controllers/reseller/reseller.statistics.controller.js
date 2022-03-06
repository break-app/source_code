const ResellerStatisticsDAO = require('../../../dao/reseller/reseller.statistics.dao');

class ResellerStatisticsCtrl {
	static async getResellerStatistics(req, res, next) {
		try {
			const result = await ResellerStatisticsDAO.getStatistics(
				req.user.id
			);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = {
	ResellerStatisticsCtrl,
};
