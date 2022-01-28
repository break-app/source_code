const { User, Friend } = require('../schemas/users.schema');
const Session = require('../schemas/sessions.schema');

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
		return await User.findOne({ email }, { _id: 0 });
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
			console.log(
				'🚀 ~ file: users.dao.js ~ line 36 ~ UserDAO ~ addUser ~ error',
				error
			);
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
	 * @param {string} email - The email of the user to delete
	 * @returns {DAOResponse} Returns either a "success" or an "error" Object
	 */
	static async deleteUser(email) {
		try {
			await User.deleteOne({ email });
			await Session.deleteOne({ user_id: email });
			if (
				!(await this.getUser(email)) &&
				!(await this.getUserSession(email))
			) {
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
	 *  add frient request to `friends` collections
	 *	@param {RequestInfo} requestInfo
	 *	@returns {DAOResponse} return either success or an error object
	 *------------------------**/
	static async addFriendRequest(requestInfo) {
		try {
			await Friend.create({
				requester: requestInfo.requester,
				recipiant: requestInfo.recipiant,
				request_id: requestInfo.request_id,
				status: 1,
			});

			return { success: true };
		} catch (error) {
			console.log(`Error occured while creating friend request ${error}`);
			return { error };
		}
	}

	/**-----------------------
	 *  get pending friend requests from `friends` collection
	 *  @param {number} id // the id of the recipiant user
	 *	@returns {DAOResponse} return either success or an error object
	 *------------------------**/
	static async getPendingFriendRequests(id) {
		try {
			return await Friend.aggregate([
				{ $match: { recipiant: id, status: 1 } },
				{
					$lookup: {
						from: 'users',
						let: { requester: '$requester' },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ['$user_id', '$$requester'] },
								},
							},
							{
								$project: {
									_id: 0,
									name: 1,
									picture: 1,
								},
							},
						],
						as: 'friend_requests',
					},
				},
				{ $project: { _id: 0, friend_requests: 1 } },
			]);
		} catch (error) {
			console.log(`Error occured while get pending request ${error}`);
			return { error };
		}
	}

	/**-----------------------
	 *  add frient request to `friends` collection
	 *	@param {number} request_id
	 *	@returns {DAOResponse} return either success or an error object
	 *------------------------**/
	static async approveFriendRequest(request_id) {
		try {
			const request = await Friend.findOneAndUpdate(
				{ request_id },
				{ $set: { status: 3 } }
			);
			await User.findOneAndUpdate(
				{ user_id: request.recipiant },
				{ $push: { friends: request.requester } }
			);
			return { success: true };
		} catch (error) {
			console.log(`Error occured while creating friend request ${error}`);
			return { error };
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
