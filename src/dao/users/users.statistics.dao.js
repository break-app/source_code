const { User } = require('../../schemas/users.schema');

class TopGivers {
	static daily() {
		return new Promise(async (resolve, reject) => {
			try {
				let date = new Date();
				date.setDate(date.getDate() - 1);

				const dailyResult = await User.aggregate([
					{
						$match: {
							'gives.createdAt': { $gt: date },
						},
					},
					{ $unwind: '$gives' },
					{ $project: { gives: 1 } },
					{
						$group: {
							_id: {
								gives: {
									$cond: [
										{ $gt: ['$gives.createdAt', date] },
										{
											quantity: {
												$sum: '$gives.quantity',
											},
										},
										0,
									],
								},
							},
						},
					},
				]);
				resolve(dailyResult);
			} catch (error) {
				reject(error);
			}
		});
	}
}
class UserStatisticsDAO {
	static topDailyGivers() {
		return new Promise(async (resolve, reject) => {
			try {
				const result = TopGivers.daily();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = UserStatisticsDAO;
