const { Aggregate } = require('mongoose');
const { User } = require('../../schemas/users.schema');

class AgencyStatisticsDAO {
	static getStats(agencyId) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await User.aggregate([
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$agency.id', agencyId] },
									{ $eq: ['$agency.status', 'joined'] },
								],
							},
						},
					},
					{
						$lookup: {
							from: 'transfers',
							let: { agencyId: '$_id' },
							pipeline: [
								{
									$match: {
										$expr: { $eq: ['$to', '$$agencyId'] },
									},
								},
							],
							as: 'transfers',
						},
					},
					{ $unwind: '$transfers' },
					{
						$project: {
							from: '$transfers.from',
							to: '$email',
							quantity: '$transfers.quantity',
							date: {
								$dateToString: {
									format: '%Y-%m-%d',
									date: '$transfers.createdAt',
								},
							},
						},
					},
				]);

				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = {
	AgencyStatisticsDAO,
};
