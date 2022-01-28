const uid = function () {
	return Math.floor(100000 + Math.random() * 900000);
};

const UserDAO = require('../../dao/users.dao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => await bcrypt.hash(password, 10);

class User {
	constructor({ name, age, picture, email, password, user_id, gender } = {}) {
		this.name = name;
		this.age = age;
		this.picture = picture;
		this.email = email;
		this.password = password;
		this.user_id = user_id;
		this.gender = gender;
	}
	toJson() {
		return {
			name: this.name,
			age: this.age,
			picture: this.picture,
			email: this.email,
			user_id: this.user_id,
			gender: this.gender,
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
				user_id: uid(),
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
			const userJwt = req.get('Authorization').slice('Bearer '.length);
			const userObj = await User.decoded(userJwt);

			if (userObj.error) {
				res.status(401).json({ error: userObj.error });
				return;
			}
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
			const { email } = req.params;
			const deleteResult = await UserDAO.deleteUser(email);
			if (!deleteResult.success) {
				res.status(500).json({ error: deleteResult.error });
				return;
			}
			res.json(deleteResult);
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async getPendingFriendRequests(req, res) {
		try {
			const userJwt = req.get('Authorization').slice('Bearer '.length);
			const userObj = await User.decoded(userJwt);
			if (userObj.error) {
				res.status(401).json({ error: userObj.error });
				return;
			}
			const { user_id } = userObj;
			const requestsResults = await UserDAO.getPendingFriendRequests(
				user_id
			);
			if (requestsResults.error) {
				res.status(500).json({ error: requestsResults.error });
				return;
			}
			res.json({
				requestsResults,
			});
		} catch (error) {
			res.status(500).json({ error });
		}
	}

	static async addFriendRequest(req, res) {
		try {
			const { recipiant } = req.body;
			const userJwt = req.get('Authorization').slice('Bearer '.length);
			const userObj = await User.decoded(userJwt);
			if (userObj.error) {
				res.status(401).json({ error: userObj.error });
				return;
			}
			const { user_id } = userObj;
			const RequestInfo = {
				request_id: uid(),
				requester: user_id,
				recipiant,
			};
			const requestResult = await UserDAO.addFriendRequest(RequestInfo);
			if (!requestResult.success) {
				res.status(400).json({ error: requestResult.error });
				return;
			}
			res.json({
				success: true,
				info: requestResult,
			});
		} catch (error) {
			res.status(500).json({ error });
		}
	}
}

module.exports = UserController;
