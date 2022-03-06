const { Transfers } = require('../../schemas/transfers.schema');

class ResellerStatisticsDAO {
	static getStatistics(resellerId) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(resellerId);
				const stats = await Transfers.aggregate([
					{ $match: { from: resellerId } },
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
				resolve(stats);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = ResellerStatisticsDAO;
