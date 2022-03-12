const {
	AgencyStatisticsDAO,
} = require('../../../dao/agency/agency.statistics.dao');

class AgencyStatisticsCtrl {
	static async getStats(req, res, next) {
		try {
			const { agencyId } = req.params;
			const result = await AgencyStatisticsDAO.getStats(agencyId);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = { AgencyStatisticsCtrl };
