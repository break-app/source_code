const { Transfers } = require('../../schemas/transfers.schema');

class ResellerStatisticsDAO {
	static getStatistics(resellerId) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(resellerId);
				const stats = await Transfers.aggregate([
					{ $match: { from: resellerId, as: 'reseller' } },
					{
						$project: {
							to: 1,
							quantity: 1,
							date: {
								$dateToString: {
									format: '%Y-%m-%d',
									date: '$createdAt',
								},
							},
						},
					},
				]);
				if (!stats.length) {
					reject(new Error('your request not complete'));
				}
				resolve(stats);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = ResellerStatisticsDAO;
