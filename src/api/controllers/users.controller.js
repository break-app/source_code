const uid = function () {
	return Math.floor(100000 + Math.random() * 900000);
};

const UserDAO = require('../../dao/users.dao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => await bcrypt.hash(password, 10);

class User {
	constructor({ name, age, avatar, email, password, gender, id } = {}) {
		this.name = name;
		this.age = age;
		this.avatar = avatar;
		this.email = email;
		this.password = password;
		this.gender = gender;
		this.id = id;
	}
	toJson() {
		return {
			name: this.name,
			age: this.age,
			avatar: this.avatar,
			email: this.email,
			gender: this.gender,
			id: this.id,
		};
	}
	async comparePassword(plainText) {
		return await bcrypt.compare(plainText, this.password);
	}
	encoded() {
		return jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
				...this.toJson(),
			},
			process.env.SECRET_KEY
		);
	}
	static async decoded(userJwt) {
		return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
			if (error) {
				return { error };
			}
			return new User(res);
		});
	}
}

class UserController {
	static async register(req, res) {
		try {
			let userFromBody = req.body;
			let errors = {};

			if (
				(userFromBody && userFromBody.name?.first.length < 3) ||
				userFromBody.name?.last.length < 3
			) {
				errors.name = 'you must specify at least three characters';
			}
			if (userFromBody && userFromBody.password.length < 8) {
				errors.password = 'your password must be at least 8 characters';
			}
			if (Object.keys(errors).length > 0) {
				res.status(400).json(errors);
				return;
			}

			const userInfo = {
				...userFromBody,
				password: await hashPassword(userFromBody.password),
				name: {
					first: userFromBody.first,
					last: userFromBody.last,
				},
			};
			const insertResult = await UserDAO.addUser(userInfo);
			if (!insertResult.success) {
				errors.email = insertResult.error;
			}

			const userFromDB = await UserDAO.getUser(userFromBody.email);

			if (!userFromDB) {
				errors.general = 'Internal error, please try again later.';
			}
			if (Object.keys(errors).length > 0) {
				res.status(400).json(errors);
				return;
			}

			const user = new User(userFromDB);

			res.status(201).json({
				auth_token: user.encoded(),
				info: user.toJson(),
			});
		} catch (error) {
			res.status(500).json({ error });
		}
	}
	static async login(req, res) {
		try {
			const { email, password } = req.body;
			if (!email || typeof email !== 'string') {
				res.status(400).json({
					error: 'Bad email format, expected string.',
				});
				return;
			}
			if (!password || typeof password !== 'string') {
				res.status(400).json({
					error: 'Bad email format, expected string.',
				});
				return;
			}

			let userData = await UserDAO.getUser(email);
			if (!userData) {
				res.status(401).json({
					error: 'Make sure your email is correct.',
				});
				return;
			}
			const user = new User(userData);

			if (!(await user.comparePassword(password))) {
				res.status(401).json({
					error: 'Make sure your password is correct.',
				});
				return;
			}
			const loginResponse = await UserDAO.loginUser(
				user.email,
				user.encoded()
			);
			if (!loginResponse.success) {
				res.status(500).json({ error: loginResponse.error });
				return;
			}
			res.json({ auth_token: user.encoded(), info: user.toJson() });
		} catch (error) {
			console.log(error);
			res.status(400).json({ error });
			return;
		}
	}

	static async logout(req, res) {
		try {
			const userObj = req.user;
			const logoutResult = await UserDAO.logoutUser(userObj.email);

			if (logoutResult.error) {
				res.status(500).json({ error: logoutResult.error });
				return;
			}
			res.json(logoutResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async delete(req, res) {
		try {
			const { id } = req.params;
			const deleteResult = await UserDAO.deleteUser(id);
			if (!deleteResult.success) {
				res.status(500).json({ error: deleteResult.error });
				return;
			}
			res.json(deleteResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async FollowSomeOne(req, res) {
		try {
			const { id } = req.user;
			const { id_to_follow } = req.body;
			const followResult = await UserDAO.Follow(id, id_to_follow);
			if (!followResult.success) {
				res.status(400).json({ error: followResult.error });
				return;
			}
			res.json(followResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async UnfollowSomeOne(req, res) {
		try {
			const { id } = req.user;
			const { id_to_unfollow } = req.body;
			const followResult = await UserDAO.Unfollow(id, id_to_unfollow);
			if (!followResult.success) {
				res.status(400).json({ error: followResult.error });
				return;
			}
			res.json(followResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async getFollowers(req, res) {
		try {
			const { id } = req.user;
			const followersResult = await UserDAO.getFollowers(id);
			res.json(followersResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}
	static async addVisitor(req, res) {
		try {
			const { id } = req.user; // id of visitor user
			const { user_to_visit } = req.body; //  id of user to visit
			const followersResult = await UserDAO.addVisitor(id, user_to_visit);
			if (!followersResult.success) {
				res.status(400).json({ error: followersResult.error });
				return;
			}
			res.json(followersResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async buyProduct(req, res, next) {
		try {
			const { id } = req.user;
			const { product, quantity } = req.body;
			const info = {
				buyer: id,
				product,
				quantity,
			};
			const buyResult = await UserDAO.buyProduct(info);
			res.status(200).json({
				result: buyResult,
			});
		} catch (error) {
			next(error);
		}
	}

	// static async getPendingFriendRequests(req, res) {
	// 	try {
	// 		const userObj = req.user;

	// 		const { id } = userObj;
	// 		const requestsResults = await UserDAO.getPendingFriendRequests(id);

	// 		if (requestsResults.error) {
	// 			res.status(500).json({ error: requestsResults.error });
	// 			return;
	// 		}
	// 		res.json({
	// 			requestsResults,
	// 		});
	// 	} catch (error) {
	// 		res.status(500).json({ error });
	// 	}
	// }

	// static async addFriendRequest(req, res) {
	// 	try {
	// 		const { recipiant } = req.body;
	// 		const userObj = req.user;
	// 		const { user_id } = userObj;
	// 		const RequestInfo = {
	// 			request_id: uid(),
	// 			requester: user_id,
	// 			recipiant,
	// 		};
	// 		const requestResult = await UserDAO.addFriendRequest(RequestInfo);
	// 		if (!requestResult.success) {
	// 			res.status(400).json({ error: requestResult.error });
	// 			return;
	// 		}
	// 		res.json({
	// 			success: true,
	// 			info: requestResult,
	// 		});
	// 	} catch (error) {
	// 		res.status(500).json({ error });
	// 	}
	// }
}

module.exports = { UserController, User };
