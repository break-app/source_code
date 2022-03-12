const { User, Agency } = require('../../schemas/users.schema');
const mongoose = require('mongoose');
const { Transfers } = require('../../schemas/transfers.schema');
const idGenerator = require('../../api/helpers/idGenerator');
const verifyUpdates = require('../../api/helpers/verifyUpdates');
const { Store } = require('../../schemas/store.schema');
const Settings = require('../../schemas/settings.schema');
const res = require('express/lib/response');
const { checkUpdated } = require('../../api/helpers/checkUpdated');

class AgencyHelper {
	static async RetrieveGiftToUser({ userId, giftId, giftQty }) {
		const result = await User.updateOne(
			{
				_id: userId,
				products: { $elemMatch: { id: giftId } },
			},
			{
				$inc: {
					'products.$.quantity': giftQty,
				},
			}
		);
		if (!result.modifiedCount) {
			throw new Error(
				'Error occured when retrieve your gift, please contact support'
			);
		}
		throw new Error('Problem occured while sending your gift');
	}
}
class AgencyDAO {
	/**-----------------------
	 *  create Agency --- gruopInfo
	 *  get Agency --- AgencyId
	 *  get Agencys
	 *  join Agency -- {AgencyId, userId}
	 *  leave Agency -- {AgencyId, userId}
	 *------------------------**/

	static createAgnecy(agencyInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				const { name, description, avatar } = agencyInfo;
				const settings = await Settings.findOne({}, { agency: 1 });
				resolve(
					await Agency.create({
						name,
						description,
						avatar,
						_id: idGenerator(),
					})
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	static createReqJoinFromUserToAgency(agencyId, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				const agency = await User.updateOne(
					{ _id: userId, 'agency.id': { $ne: agencyId } },
					{
						$set: {
							'agency.id': agencyId,
						},
					}
				);

				if (!(await checkUpdated(agency))) {
					reject(
						new Error(
							'something went wrong, or may be you already joint this agency'
						)
					);
				}

				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static getAgencyJoinReqs(agencyId) {
		return new Promise(async (resolve, reject) => {
			try {
				const reqs = await User.aggregate([
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$agency.id', agencyId] },
									{ $eq: ['$agency.status', 'pending'] },
								],
							},
						},
					},
					{
						$project: {
							name: {
								$concat: ['$first_name', ' ', '$last_name'],
							},
							avatar: 1,
							email: 1,
						},
					},
				]);
				if (!reqs?.length) {
					reject(new Error('No Requests'));
				}
				resolve({ result: reqs });
			} catch (error) {
				reject(error);
			}
		});
	}

	static approveAgencyJoinReqs(agencyId, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				const agency = await User.updateOne(
					{ _id: userId, 'agency.id': agencyId },
					{
						$set: {
							'agency.status': 'joined',
						},
					}
				);

				if (!(await checkUpdated(agency))) {
					reject(
						new Error(
							'your request not completed, please try again later.'
						)
					);
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static getAgencyMembers(agencyId) {
		return new Promise(async (resolve, reject) => {
			try {
				const members = await User.aggregate([
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
						$project: {
							name: {
								$concat: ['$first_name', ' ', '$last_name'],
							},
							avatar: 1,
							email: 1,
							total_balance: '$agency.total_balance',
						},
					},
				]);
				if (!members.length) {
					reject(new Error('No Members'));
				}
				resolve({ result: members });
			} catch (error) {
				reject(error);
			}
		});
	}

	static addMemberToAgencyByAgencyAdmin(agencyId, userId) {
		return new Promise(async (resolve, reject) => {
			try {
				const newMember = await User.updateOne(
					{ _id: userId, 'agency.id': { $ne: agencyId } },
					{
						$set: {
							agency: {
								id: agencyId,
								status: 'joined',
							},
						},
					}
				);

				if (!(await checkUpdated(newMember))) {
					reject(new Error('something went wrong'));
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static sendGiftFromUserToAgencyMember(obj) {
		let { userId, memberId, giftId, giftQty, agencyId } = obj;
		return new Promise(async (resolve, reject) => {
			try {
				//* send gift to member
				// find gift price
				// find settings & get golds_beans equation
				// check if the user has this gift or not
				// check if the user has quantity >= giftQty
				// convert price of gift to beans
				// find member
				// increase his total_balance by beans
				// increase agency total_balance by beans
				// let store_pipeline = {
				// 	$lookup: {
				// 		from: 'stores',
				// 		pipeline: [
				// 			{ $match: { _id: giftId } },
				// 			{ $project: { price: 1, _id: 0 } },
				// 		],
				// 		as: 'gift_price',
				// 	},
				// };
				// let settings_pipeline = {
				// 	$lookup: {
				// 		from: 'settings',
				// 		pipeline: [{ $project: { beans_golds: 1, _id: 0 } }],
				// 		as: 'beans_golds_eq',
				// 	},
				// };

				let merge_pipeline = {
					$merge: {
						into: { db: 'break_app', coll: 'users' },
						on: '_id',
					},
				};

				// let remove_price_settings_pipeline = {
				// 	$project: { beans_golds_eq: 0, gift_price: 0 },
				// };
				const [beans_golds_eq, gift_price] = await Promise.all([
					Settings.findOne({}, { beans_golds: 1, _id: 0 }),
					Store.findOne({ _id: giftId }, { price: 1, _id: 0 }),
				]);
				if (!beans_golds_eq || !gift_price) {
					reject(new Error('your request not complete'));
				}
				let user = User.aggregate([
					{
						$match: {
							_id: userId,
							products: {
								$elemMatch: {
									id: giftId,
									quantity: { $gte: giftQty },
								},
							},
						},
					},
					// store_pipeline,
					// settings_pipeline,
					// { $unwind: '$gift_price' },
					// { $unwind: '$beans_golds_eq' },
					{
						$set: {
							products: {
								$map: {
									input: '$products',
									as: 'product',
									in: {
										$cond: [
											{ $eq: ['$$product.id', giftId] },
											{
												$mergeObjects: [
													'$$product',
													{
														quantity: {
															$subtract: [
																'$$product.quantity',
																giftQty,
															],
														},
													},
												],
											},
											'$$product',
										],
									},
								},
							},
							'wallet.spends': {
								$add: [
									'$wallet.spends',
									{
										$multiply: [
											giftQty,
											gift_price.price,
											beans_golds_eq.beans_golds,
										],
									},
								],
							},
						},
					},
					// TODO
					merge_pipeline,
				]);

				let agencyMember = User.aggregate([
					{ $match: { _id: memberId } },
					// store_pipeline,
					// settings_pipeline,
					// { $unwind: '$gift_price' },
					// { $unwind: '$beans_golds_eq' },
					{
						$set: {
							'agency.total_balance': {
								$add: [
									'$agency.total_balance',
									{
										$multiply: [
											giftQty,
											gift_price.price,
											beans_golds_eq.beans_golds,
										],
									},
								],
							},
						},
					},
					// TODO
					merge_pipeline,
				]);

				let agency = Agency.aggregate([
					{
						$lookup: {
							from: 'users',
							pipeline: [
								{ $match: { _id: memberId } },
								{ $project: { agency: 1, _id: 0 } },
							],
							as: 'member',
						},
					},
					{ $unwind: '$member' },
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$member.agency.id'],
							},
						},
					},
					// store_pipeline,
					// settings_pipeline,
					// { $unwind: '$gift_price' },
					// { $unwind: '$beans_golds_eq' },
					{
						$set: {
							'total_balance.current_value': {
								$add: [
									'$total_balance.current_value',
									{
										$multiply: [
											giftQty,
											gift_price.price,
											beans_golds_eq.beans_golds,
										],
									},
								],
							},
						},
					},
					{
						$merge: {
							into: { db: 'break_app', coll: 'agencies' },
							on: '_id',
						},
					},
				]);
				await Promise.all([user, agencyMember, agency]);

				await Transfers.create({
					from: userId,
					to: memberId,
					quantity:
						giftQty * gift_price.price * beans_golds_eq.beans_golds,
				});
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static awardAgencyMembers(agencyId) {
		return new Promise(async (resolve, reject) => {
			try {
				let agency;
				let user;
				agency = await Agency.findOne({
					_id: agencyId,
					$expr: { $gte: ['$total_balance.expire_date', Date.now()] },
				});
				if (!agency) {
					await Agency.updateOne(
						{ _id: agencyId },
						{
							$set: {
								'total_balance.expire_date': new Date().setDate(
									new Date().getDate() + 30
								),
							},
						}
					);
					reject(new Error('Sorry, you exceeded the limit date'));
				}

				if (
					agency.total_balance.current_value <
					agency.total_balance.target_value
				) {
					reject(
						new Error(
							'The current balalnce is less than The target balance'
						)
					);
				}

				agency = Agency.aggregate([
					{
						$match: {
							_id: String(agencyId),
						},
					},
					{
						$set: {
							'wallet.beans': {
								$add: [
									'$wallet.beans',
									{
										$multiply: [
											'$total_balance.current_value',
											0.1,
										],
									},
								],
							},
							'total_balance.current_value': 0,
						},
					},
					{
						$merge: {
							into: {
								db: 'break_app',
								coll: 'agencies',
							},
							on: '_id',
						},
					},
				]);

				user = User.aggregate([
					{ $match: { 'agency.id': agencyId } },
					{
						$set: {
							'wallet.beans': {
								$add: [
									'$wallet.beans',
									{
										$subtract: [
											'$agency.total_balance',
											{
												$multiply: [
													'$agency.total_balance',
													0.1,
												],
											},
										],
									},
								],
							},
							'agency.total_balance': 0,
						},
					},
					{
						$merge: {
							into: { db: 'break_app', coll: 'users' },
							on: '_id',
						},
					},
				]);

				await Promise.all([agency, user]);

				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = AgencyDAO;
