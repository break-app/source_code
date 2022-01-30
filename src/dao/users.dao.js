const { User, Friend } = require('../schemas/users.schema');
const Session = require('../schemas/sessions.schema');
const Store = require('../schemas/store.schema');
const ObjectId = require('mongoose').Types.ObjectId;
class UserDAO {
	/**-----------------------
     *  For this ticket, you will need to implement the following methods:
     * 
     * - getUser 
     * - addUser   
     * - loginUser  
     * - logoutUser
     * - deleteUser  
     
     * You can find these methods below this comment. Make sure to read the     comments Sin each method to better understand the implementation.
     *------------------------**/

	/**
	 * Finds a user in the `users` collection
	 * @param {string} email - The email of the desired user
	 * @returns {Object | null} Returns either a single user or nothing
	 */
	static async getUser(email) {
		return await User.findOne({ email });
	}

	/**
	 * Adds a user to the `users` collection
	 * @param {UserInfo} userInfo - The information of the user to add
	 * @returns {DAOResponse} Returns either a "success" or an "error" Object
	 */
	static async addUser(userInfo) {
		try {
			await User.create(userInfo);
			return { success: true };
		} catch (error) {
			if (
				String(error).startsWith(
					'MongoServerError: E11000 duplicate key error'
				)
			) {
				return { error: 'A user with the given email already exists.' };
			}
			console.error(`Error occurred while adding new user, ${error}.`);
			return { error };
		}
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

	/**
	 * Gets a user from the `sessions` collection
	 * @param {string} email - The email of the user to search for in `sessions`
	 * @returns {Object | null} Returns a user session Object, an "error" Object
	 * if something went wrong, or null if user was not found.
	 */
	static async getUserSession(email) {
		try {
			// TODO Ticket: User Management
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

	static async Follow(user_id, id_to_follow) {
		try {
			await User.updateOne(
				{
					_id: user_id,
					followings: { $nin: [id_to_follow, null] },
				},
				{ $push: { followings: id_to_follow } }
			);
			return { success: true };
		} catch (error) {
			console.error(`Error occured while follow someone ${error}`);
			return { error };
		}
	}

	/**
	 *  add user_id to `followings` field in his document
	 *  @param {number} user_id // the id of user you want to unfollow
	 *  @param {number} id_to_unfollow
	 *  @returns {DAOResponse} // return either success or an error object
	 **/
	static async Unfollow(user_id, id_to_unfollow) {
		try {
			await User.updateOne(
				{
					_id: user_id,
					followings: { $in: [id_to_unfollow, null] },
				},
				{ $pull: { followings: id_to_unfollow } }
			);
			return { success: true };
		} catch (error) {
			console.error(`Error occured while follow someone ${error}`);
			return { error };
		}
	}

	/**
	 *  add user_id to `followings` field in his document
	 *  @param {string} user_id // the id of user that has followers
	 *  @returns {DAOResponse} // return either success or an error object
	 **/
	static async getFollowers(user_id) {
		try {
			return await User.find(
				{
					_id: { $ne: user_id },
					followings: { $in: [user_id] },
				},
				{ name: 1, picture: 1, _id: 1, gender: 1 }
			);
		} catch (error) {
			console.error(`Error occured while follow someone ${error}`);
			return { error };
		}
	}

	/**
	 *  add user_id to `followings` field in his document
	 *  @param {string} user_id // the id of visitor user
	 *  @param {string} user_to_visit // the id of user you want to visit
	 *  @returns {DAOResponse} // return either success or an error object
	 **/
	static async addVisitor(user_id, user_to_visit) {
		try {
			await User.updateOne(
				{ _id: user_id, visits: { $nin: [user_to_visit] } },
				{ $push: { visits: user_to_visit } }
			);
			return { success: true };
		} catch (error) {
			console.error(`Error occured while add visitor ${error}`);
			return { error };
		}
	}

	static async buyProduct(info) {
		try {
			let { buyer, product, quantity } = info;
			const productObj = await Store.findById(product, {
				_id: 0,
				price: 1,
			});
			let totalPrice = productObj.price * quantity;
			const user = await User.updateOne(
				{
					_id: buyer,
					'wallet.golds': { $gte: totalPrice },
					'products.product': { $nin: [product] },
				},
				{
					$push: {
						products: { product, quantity },
					},
					$inc: {
						'wallet.golds': -totalPrice,
					},
				}
			);
			return user;
		} catch (error) {
			throw error;
		}
	}
}

/**======================
 *   parameter passed to addUser method
 *  @typedef UserInfo
 *  @property { object } name
 *  @property { number } age
 *  @property { string } picture
 *  @property { string } email
 *  @property { string } password
 *  @property { string } gender
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
