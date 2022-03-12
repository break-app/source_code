const { Transfers } = require('../../schemas/transfers.schema');
const { User } = require('../../schemas/users.schema');

class TopGivers {
	constructor(period) {
		this.period = period;
	}
	periodCalc() {
		let period_time = new Date();
		period_time.setDate(period_time.getDate() - this.period);
		let periodFollowing = new Date();
		periodFollowing.setDate(periodFollowing.getDate() + 1);
		console.log(period_time);
		console.log(periodFollowing);
		return {
			period_time,
			periodFollowing,
		};
	}

	filterBydatePipeline() {
		return [
			{
				$match: {
					$expr: {
						$or: [{ as: 'personal' }, { as: 'agency' }],
					},
					$expr: {
						$and: [
							{
								$gt: [
									'$createdAt',
									this.periodCalc().period_time,
								],
							},
							{
								$lt: [
									'$createdAt',
									this.periodCalc().periodFollowing,
								],
							},
						],
					},
				},
			},

			{
				$group: {
					_id: '$from',
					count: { $sum: '$quantity' },
				},
			},

			{
				$lookup: {
					from: 'users',
					let: { userId: '$_id' },
					pipeline: [
						{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
						{
							$project: {
								name: {
									$concat: ['$first_name', ' ', '$last_name'],
								},
								email: 1,
								avatar: 1,
								age: 1,
								country: 1,
							},
						},
					],
					as: 'user',
				},
			},
			{ $unwind: '$user' },
			{
				$project: {
					totalGives: '$count',
					user: 1,
				},
			},
			{ $sort: { totalGives: -1 } },
		];
	}

	async daily() {
		try {
			const dailyResult = await Transfers.aggregate(
				this.filterBydatePipeline()
			);
			return dailyResult;
		} catch (error) {
			return error;
		}
	}

	async weekly() {
		try {
			const weeklyResult = await Transfers.aggregate(
				this.filterBydatePipeline()
			);
			return weeklyResult;
		} catch (error) {
			return error;
		}
	}

	async monthly() {
		try {
			const monthlyResult = await Transfers.aggregate(
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
