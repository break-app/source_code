const { check } = require('express-validator');

const validate = (method) => {
	switch (method) {
		case 'createGroup': {
			return [
				check('name')
					.notEmpty()
					.trim()
					.withMessage('REQUIRED')
					.bail()
					.isString('group name must be string')
					.bail(),
				check('description')
					.notEmpty()
					.trim()
					.withMessage('REQUIRED')
					.isLength({ min: 20 })
					.withMessage('description is too short')
					.bail()
					.isString('description must be text'),
				check('avatar').isString('invalid image').bail(),
			];
		}
		// case 'createReqJoinFromUserToJoin':{
		// 	return [
		// 		check('')
		// 	]
		// }
	}
};
module.exports = validate;
