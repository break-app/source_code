const { User } = require('../../schemas/users.schema');

class TopGivers {
	static daily() {
		return new Promise(async (resolve, reject) => {
			try {
				let date = new Date();
				date.setDate(date.getDate() - 1);
				let dayFollowing = new Date();
				dayFollowing.setDate(dayFollowing.getDate() + 1);
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
							_id: '$gives.giver',
							count: {
								$sum: {
									$cond: [
										{
											$and: [
												{
													$gt: [
														'$gives.createdAt',
														date,
													],
												},
												{
													$lt: [
														'$gives.createdAt',
														dayFollowing,
													],
												},
											],
										},
										'$gives.quantity',
										0,
									],
								},
							},
						},
					},

					{
						$lookup: {
							from: 'users',
							foreignField: '_id',
							localField: '_id',
							as: 'user',
						},
					},
					{ $unwind: '$user' },
					{
						$project: {
							totalDailyGives: '$count',
							user: {
								name: {
									$concat: [
										'$user.name.first',
										' ',
										'$user.name.last',
									],
								},
								avatar: '$user.avatar',
								email: '$user.email',
							},
						},
					},
					{ $sort: { topDailyGives: -1 } },
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
