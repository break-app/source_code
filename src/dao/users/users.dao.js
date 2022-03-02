const { User } = require('../../schemas/users.schema');
const Session = require('../../schemas/sessions.schema');
const { Store } = require('../../schemas/store.schema');
const ObjectId = require('mongoose').Types.ObjectId;
const Settings = require('../../schemas/settings.schema');
const idGenerator = require('../../api/helpers/idGenerator');
const checkDataExist = require('../../api/helpers/notFoundData');
const verifyUpdates = require('../../api/helpers/verifyUpdates');

class UserDAO {
	/**-----------------------
     *  
     * 
     * - getUser 
     * - addUser   
     * - loginUser  
     * - logoutUser
     * - deleteUser  
     
     
     *------------------------**/

	static async getUser(email) {
		try {
			return Promise.resolve(await User.findOne({ email }));
		} catch (error) {
			Promise.reject(error);
		}
	}

	static getUserById(userId) {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await User.findById(userId);
				checkDataExist(user, 'USER');
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	static getMyProfile(id) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log(id);
				const user = await User.aggregate([
					{ $match: { _id: id } },
					{
						$lookup: {
							from: 'users',
							let: { id: '$_id' },
							pipeline: [
								{
									$match: {
										_id: { $ne: id },
										$expr: { $in: ['$$id', '$followings'] },
									},
								},
								{
									$group: {
										_id: '$_id',
									},
								},
							],
							as: 'followers',
						},
					},

					{
						$project: {
							_id: 0,
							personal_info: {
								name: {
									$concat: ['$name.first', ' ', '$name.last'],
								},
								avatar: '$avatr',
								gender: '$gender',
								email: '$email',
								age: '$age',
							},
							followings: { $size: '$followings' },
							followers: { $size: '$followers' },
							rating: 1,
							level: 1,
						},
					},
				]);

				resolve(user);
			} catch (error) {
				reject(error);
			}
		});
	}
	/**
	 * Finds a user in the `users` collection
	 * @param {string} email - The email of the desired user
	 * @returns {Object | null} Returns either a single user or nothing
	 */
	static async getUserProfile(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const { visitor, userId } = data;
				// const user = await User.findOne({ email });

				let user = await User.updateOne(
					{ _id: visitor, visits: { $nin: [userId] } },
					{ $push: { visits: userId } }
				);
				user = await User.aggregate([
					{ $match: { _id: userId } },
					{
						$lookup: {
							from: 'users',
							pipeline: [
								{
									$match: {
										$expr: { $in: [userId, '$followings'] },
									},
								},
								{
									$group: {
										_id: '$_id',
									},
								},
							],
							as: 'followers',
						},
					},

					{
						$project: {
							_id: 0,
							personal_info: {
								name: {
									$concat: ['$name.first', ' ', '$name.last'],
								},
								avatar: '$avatr',
								gender: '$gender',
								email: '$email',
								age: '$age',
							},
							followings: { $size: '$followings' },
							followers: { $size: '$followers' },
							rating: 1,
							level: 1,
						},
					},
				]).cache({
					key: `user_profile=${userId}`,
				});
				resolve(user);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Adds a user to the `users` collection
	 * @param {UserInfo} userInfo - The information of the user to add
	 */
	static addUser(userInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(await User.create({ ...userInfo, _id: idGenerator() }));
			} catch (error) {
				reject(error);
				// throw error;
			}
		});
	}

	/**
	 * Adds a user to the `sessions` collection
	 * @param {string} email - The email of the user to login
	 * @param {string} jwt - A JSON web token representing the user's claims
	 * @returns {DAOResponse} Returns either a "success" or an "error" Object
	 */
	static async loginUser(email, jwt) {
		try {
			const session = await Session.updateOne(
				{ email },
				{ $set: { jwt: jwt } }
			);

			if (!session.modifiedCount) {
				await Session.create({ email, jwt });
				return { success: true };
			}

			return { success: true };
		} catch (error) {
			console.error(`Error when logging user ${error}`);
			return { error };
		}
	}

	/**-----------------------
	 *  Remove user from sessions collections
	 *  @param {string} email // the email of user to remove
	 *  @returns {DAOResponse} Returns either a `success` or an `error` object
	 *------------------------**/
	static async logoutUser(email) {
		try {
			// Delete the document in the `sessions` collection matching the email.
			await Session.deleteOne({ email });
			return { success: true };
		} catch (error) {
			console.error(`Error occurred while logging out user, ${error}`);
			return { error };
		}
	}

	static updateProfile(userId, profileInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				const whiteList = [
					'first_name',
					'last_name',
					'email',
					'password',
					'avatar',
					'phone',
				];

				const updateResult = await User.updateOne(
					{ _id: userId },
					{
						$set:
							verifyUpdates(profileInfo, whiteList) &&
							profileInfo,
					}
				);
				if (!updateResult.matchedCount) {
					reject(new Error('id is incorrect'));
				}
				if (!updateResult.modifiedCount) {
					reject(new Error('please try again later'));
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Gets a user from the `sessions` collection
	 * @param {string} email - The email of the user to search for in `sessions`
	 * @returns {Object | null} Returns a user session Object, an "error" Object
	 * if something went wrong, or null if user was not found.
	 */
	static async getUserSession(email) {
		try {
			// Retrieve the session document corresponding with the user's email.
			return Session.findOne({ email });
		} catch (e) {
			console.error(`Error occurred while retrieving user session, ${e}`);
			return null;
		}
	}

	/**
	 * Removes a user from the `sessions` and `users` collections
	 * @param {string} id - The id of the user to delete
	 * @returns {DAOResponse} Returns either a "success" or an "error" Object
	 */
	static async deleteUser(id) {
		try {
			await User.findByIdAndDelete(id);
			await Session.findByIdAndDelete(id);
			if (!(await this.getUser(id)) && !(await this.getUserSession(id))) {
				return { success: true };
			} else {
				console.error(`Deletion unsuccessful`);
				return { error: `Deletion unsuccessful` };
			}
		} catch (error) {
			console.error(`Error occurred while deleting user, ${error}`);
			return { error };
		}
	}

	/**-----------------------
	 *  add user_id to `followings` field in his document
	 *  @param {number} user_id // the id of user you want to follow
	 *  @param {number} id_to_follow // the id of user you want to follow
	 *  @returns {DAOResponse} // return either success or an error object
	 *------------------------**/

	static Follow(user_id, id_to_follow) {
		return new Promise(async (resolve, reject) => {
			try {
				const followResult = await User.updateOne(
					{
						_id: user_id,
						followings: { $nin: [id_to_follow] },
					},
					{ $push: { followings: id_to_follow } }
				);
				if (!followResult.matchedCount) {
					reject(new Error('you already follow this user.'));
					return;
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 *  add user_id to `followings` field in his document
	 *  @param {number} user_id // the id of user you want to unfollow
	 *  @param {number} id_to_unfollow
	 **/
	static async Unfollow(user_id, id_to_unfollow) {
		return new Promise(async (resolve, reject) => {
			try {
				const unfollowResult = await User.updateOne(
					{
						_id: user_id,
						followings: { $in: [id_to_unfollow] },
					},
					{ $pull: { followings: id_to_unfollow } }
				);
				if (!unfollowResult.matchedCount) {
					reject(new Error('you do not follow this user after now'));
					return;
				}
				resolve({ success: true });
			} catch (error) {
				console.log(error);
				reject(error);
			}
		});
	}

	/**
	 *  add user_id to `followings` field in his document
	 *  @param {string} user_id // the id of user that has followers
	 **/
	static async getFollowers(user_id) {
		return new Promise(async (resolve, reject) => {
			try {
				const getFollowersResult = await User.find(
					{
						_id: { $ne: user_id },
						followings: { $in: [user_id] },
					},
					{ name: 1, avatar: 1 }
				).cache({
					key: `user_followers=${user_id}`,
				});
				resolve(getFollowersResult);
			} catch (error) {
				reject(error);
			}
		});
	}

	// /**
	//  *  add user_id to `followings` field in his document
	//  *  @param {string} user_id // the id of visitor user
	//  *  @param {string} user_to_visit // the id of user you want to visit
	//  **/
	// static async addVisitor(user_id, user_to_visit) {
	// 	return new Promise(async (resolve, reject) => {
	// 		try {
	// 			await User.updateOne(
	// 				{ _id: user_id, visits: { $nin: [user_to_visit] } },
	// 				{ $push: { visits: user_to_visit } }
	// 			);

	// 			resolve({ success: true });
	// 		} catch (error) {
	// 			reject(error);
	// 		}
	// 	});
	// }

	/**
	 *  buy product.. either (push) new product or update it
	 *  @param {object} info // the informations of buying process
	 *  @returns {object} // return result of the query
	 **/
	static buyProduct(info) {
		return new Promise(async (resolve, reject) => {
			try {
				let { buyer, product, quantity } = info;

				// get product and settings info from database
				const [productDB, settings] = await Promise.all([
					Store.findById(product, {
						price: 1,
						_id: 0,
					}),
					Settings.findOne({}, { level_reqs: 1, _id: 0 }),
				]);

				// product doesn't exists in database
				if (!productDB) {
					reject(new Error('this product may be deleted'));
				}

				// total price of buy process
				let totalPrice = productDB.price * quantity;

				// if product already exist in products array
				await User.findOneAndUpdate(
					{
						_id: buyer,
						'wallet.golds': { $gte: totalPrice },
						'products.id': product,
					},
					{
						$inc: {
							'products.$.quantity': quantity,
							'wallet.golds': -totalPrice,
							'wallet.spends': totalPrice,
						},
					}
				).exec(async (err, result) => {
					// if err with collection
					if (err) reject(new Error(err));

					// two probabilies
					if (!result) {
						// 1. the wanted product doesn't in the user's products array --> I will push it
						// 2. the client golds is not enuogh

						return (result = await User.findOneAndUpdate(
							{
								_id: buyer,
								'wallet.golds': { $gte: totalPrice },
								'products.id': { $ne: product },
							},
							{
								$push: {
									products: { id: product, quantity },
								},
								$inc: {
									'wallet.golds': -totalPrice,
									'wallet.spends': totalPrice,
								},
							}
						).exec(async (err, res) => {
							// if error
							if (err) reject(new Error(err));

							// I have one probabily
							if (!res) {
								// the user has no enough golds to buy the product
								reject(
									new Error("you don't have enough golds")
								);
								return;
							}

							// if balance of golds allow to buy the product
							// check if wallet.spends of user is greater than or equal the settings.level_reqs.spends
							// if true I will upgrade user's level
							if (
								res.wallet.spends >= settings.level_reqs.spends
							) {
								res.level += 1;
								res.wallet.spends = 0;
								await res.save();
								resolve(res);
								return;
							}
							// that means user's spends doesn't greater than or equal settings.level_req.spends yet
							resolve({ success: true });
						}));
					}

					// if balance of golds allow to buy the product
					// check if wallet.spends of user is greater than or equal the settings.level_reqs.spends
					// if true I will upgrade user's level
					if (result.wallet.spends >= settings.level_reqs.spends) {
						result.level += 1;
						result.wallet.spends = 0;
						await result.save();
						resolve(result);
						return;
					}

					// that means user's spends doesn't greater than or equal settings.level_req.spends yet
					resolve(result);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 *  buy product.. either (push) new product or update it
	 *  @param {object} gift_info // the informations of sending gifts process
	 **/
	static sendGifts(gift_info) {
		return new Promise(async (resolve, reject) => {
			try {
				const { gift_id, gift_qty, reciever, sender } = gift_info;

				const [gift_value, settings] = await Promise.all([
					Store.findById(gift_id, { _id: 0, price: 1 }),
					Settings.findOne({}, { beans_golds: 1, _id: 0 }),
				]);

				// if the user has this gift and quantity allow to send this gift,
				// reduce the his product quantity by 'quantity of gift'
				let sendGiftResult = await User.updateOne(
					{
						_id: sender,
						products: {
							$elemMatch: {
								id: gift_id,
								quantity: { $gte: gift_qty },
							},
						},
					},
					{
						$inc: {
							'products.$.quantity': -gift_qty,
						},

						$push: {
							gives: {
								giver: sender,
								receiver: reciever,
								quantity: gift_qty * gift_value.price,
								scope: 'global',
							},
						},
					}
				);

				// if user has 0 of this product
				if (!sendGiftResult.modifiedCount) {
					reject(
						new Error(
							'your product quantity is less than gift quantity'
						)
					);
					return;
				}

				// if the gift quantity was reduced from the sender,
				// then increase the 'beans' of the reciever
				if (sendGiftResult.modifiedCount) {
					sendGiftResult = await User.updateOne(
						{ _id: reciever },
						{
							$inc: {
								'wallet.beans':
									(gift_value.price / settings.beans_golds) *
									gift_qty,
							},
						}
					);

					// if gift wasn't sent to receiver
					if (!sendGiftResult.modifiedCount) {
						reject(
							new Error(
								'error occured while sending gift, please do not worry about your gift we will resend it later.'
							)
						);

						return;
					}
				}
				resolve(sendGiftResult);
			} catch (error) {
				reject(error);
			}
		});
	}

	static convertCurrence({ user_id, quantity }) {
		return new Promise(async (resolve, reject) => {
			try {
				const settings = await Settings.findOne({}, { beans_golds: 1 });
				if (quantity < settings.beans_golds) {
					reject(
						new Error(
							'quantity is invalid, it must at least ' +
								settings.beans_golds +
								' beans'
						)
					);
					return;
				}
				console.log(user_id);
				const convertResult = await User.updateOne(
					{
						_id: user_id,
						'wallet.beans': {
							$gte: quantity,
						},
					},
					{
						$inc: {
							'wallet.golds': quantity / settings.beans_golds,
							'wallet.beans': -quantity,
						},
					}
				);
				if (!convertResult.matchedCount) {
					reject(
						new Error(
							'your beans is not enough to convert them to golds, you must have at lease ' +
								settings.beans_golds +
								' beans.'
						)
					);
					return;
				}
				resolve({ success: convertResult });
			} catch (error) {
				console.log('errrrr', error);
				reject(error);
			}
		});
	}
}

/**======================
 *   parameter passed to addUser method
 *  @typedef UserInfo
 *  @property { object } name
 *  @property { number } age
 *  @property { string } avatar
 *  @property { string } email
 *  @property { string } password
 *  @property { string } gender
 *  @property { string } phone
 *========================**/

/**-----------------------
 * 	parameter passed to addfriendrequest method
 *  @typedef RequestInfo
 *  @property {number} requester
 *  @property {number} recipiant
 *  @property {number} request_id
 *------------------------**/

/**======================
 *  Success/Error return object
 *  @typedef DAOResponse
 *  @property { boolean } [success] //Success
 *  @property { string } [error] // Error
 *========================**/

module.exports = UserDAO;
