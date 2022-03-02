const { User, Agency } = require('../../schemas/users.schema');
const mongoose = require('mongoose');

const idGenerator = require('../../api/helpers/idGenerator');
const verifyUpdates = require('../../api/helpers/verifyUpdates');
const { Store } = require('../../schemas/store.schema');
const Settings = require('../../schemas/settings.schema');
const res = require('express/lib/response');

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
					{ _id: userId },
					{
						$set: {
							agency: {
								id: agencyId,
								status: 'pending',
							},
						},
					}
				);
				if (!agency.matchedCount) {
					reject(new Error('user not found'));
				}
				if (!agency.modifiedCount) {
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

	static getAgencyJoinReqs(agencyId) {
		return new Promise(async (resolve, reject) => {
			console.log(agencyId);
			try {
				const reqs = await User.aggregate([
					{
						$match: {
							'agency.id': agencyId,
							'agency.status': 'pending',
						},
					},
					{
						$project: {
							name: {
								$concat: ['$first_name', ' ', '$last_name'],
							},
							avatar: 1,
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
				if (!agency.matchedCount) {
					reject(new Error('user not found'));
				}
				if (!agency.modifiedCount) {
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
							'agency.id': agencyId,
							'agency.status': 'joined',
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
					{ _id: userId },
					{
						$set: {
							'agency.id': agencyId,
							'agency.status': 'joined',
						},
					}
				);
				if (!newMember.matchedCount) {
					reject(new Error('user not found'));
				}
				if (!newMember.modifiedCount) {
					reject(new Error('try again later'));
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static sendGiftFromUserToAgencyMember({
		userId,
		memberId,
		giftId,
		giftQty,
	}) {
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

				let gift_price;
				let beans_golds;
				let totalBeans;

				// fetch git & settings information
				let [gift, settings] = await Promise.all([
					await Store.findById(giftId, { price: 1 }),
					Settings.findOne({}, { beans_golds: 1, _id: 0 }),
				]);

				// check whether gift or settings are fetched well
				if (!gift || !settings) {
					reject(
						new Error(
							'your request not completed, please try again later'
						)
					);
				}

				// re-assign gift_price | beans_golds 'equation'
				gift_price = gift.price;
				beans_golds = settings.beans_golds;
				// calculate the totalBeans that I will use in other operations
				totalBeans = beans_golds * gift_price * giftQty;

				// check if user has the ptoduct and 'specific quantity' that he want to send as a gift
				const userCheck = User.updateOne(
					{
						_id: userId,
						products: {
							$elemMatch: {
								id: giftId,
								quantity: { $gte: giftQty },
							},
						},
					},
					// if above is true (the user already has the product and quantity),
					// then update his wallet and product quantity
					{
						$inc: {
							'wallet.spends': totalBeans,
							'products.$.quantity': -giftQty,
						},
					}
				);

				const updateMemberBalance = User.findOneAndUpdate(
					{ _id: memberId },
					{
						$inc: {
							'agency.total_balance': totalBeans,
						},
					}
				);

				// execute previous operations
				const [userCheckResult, updateMemberBalanceResult] =
					await Promise.all([userCheck, updateMemberBalance]);

				// check if all things are well
				if (!userCheckResult.matchedCount) {
					reject(new Error('you have no enough gifts quantity'));
				}
				if (!userCheckResult.modifiedCount) {
					reject(
						new Error(
							'your request not completed, please try again later'
						)
					);
				}

				// check if the member already received the gift
				if (!updateMemberBalanceResult) {
					// if not
					// retrieve the gift back to the user
					reject(
						await AgencyHelper.RetrieveGiftToUser({
							userId,
							giftId,
							giftQty,
						})
					);
				}

				// and finally
				// update agency `total_balance`
				await Agency.updateOne(
					{ _id: updateMemberBalanceResult.agency.id },
					{ $inc: { 'total_balance.current_value': totalBeans } }
				);

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
