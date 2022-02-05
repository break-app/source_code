const { User } = require('../../schemas/users.schema');
function period(period) {
	let period_time = new Date();
	period_time.setDate(period_time.getDate() - period);
	let periodFollowing = new Date();
	periodFollowing.setDate(periodFollowing.getDate() + 1);
	return {
		period_time,
		periodFollowing,
	};
}

class TopGivers {
	constructor(period) {
		this.period = period;
	}
	periodCalc() {
		let period_time = new Date();
		period_time.setDate(period_time.getDate() - this.period);
		let periodFollowing = new Date();
		periodFollowing.setDate(periodFollowing.getDate() + 1);
		return {
			period_time,
			periodFollowing,
		};
	}

	filterBydatePipeline() {
		return [
			{
				$match: {
					'gives.createdAt': { $gt: this.periodCalc().period_time },
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
												this.periodCalc().period_time,
											],
										},
										{
											$lt: [
												'$gives.createdAt',
												this.periodCalc()
													.periodFollowing,
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
					totalGives: '$count',
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
			{ $sort: { totalGives: -1 } },
		];
	}

	async daily() {
		try {
			const dailyResult = await User.aggregate(
				this.filterBydatePipeline()
			);
			return dailyResult;
		} catch (error) {
			return error;
		}
	}

	async weekly() {
		try {
			const weeklyResult = await User.aggregate(
				this.filterBydatePipeline()
			);
			return weeklyResult;
		} catch (error) {
			return error;
		}
	}

	async monthly() {
		try {
			const monthlyResult = await User.aggregate(
				this.filterBydatePipeline()
			);
			return monthlyResult;
		} catch (error) {
			return error;
		}
	}
}
class UserStatisticsDAO {
	static topDailyGivers() {
		return new Promise(async (resolve, reject) => {
			try {
				let result = new TopGivers(1);
				result = result.daily();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}

	static topWeeklyGivers() {
		return new Promise(async (resolve, reject) => {
			try {
				let result = new TopGivers(7);
				result = result.weekly();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}

	static topMonthlyGivers() {
		return new Promise(async (resolve, reject) => {
			try {
				let result = new TopGivers(30);
				result = result.monthly();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = UserStatisticsDAO;
