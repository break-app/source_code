const { check } = require('express-validator');

exports.validate = (method) => {
	switch (method) {
		case 'addProuct': {
			return [
				check('name')
					.trim()
					.notEmpty()
					.withMessage('REQUIRED')
					.bail()
					.isLength({ min: 3, max: 15 })
					.withMessage('LENGTH_MIN_3_MAX_15')
					.bail()
					.isString()
					.withMessage('name must be string'),
				check('price')
					.notEmpty()
					.withMessage('REQUIRED')
					.bail()
					.isInt({ min: 0 })
					.withMessage('price must be >= 0')
					.bail(),
				check('description')
					.trim()
					.notEmpty()
					.withMessage('REQUIRED')
					.isLength({ min: 10, max: 200 })
					.withMessage('LENGTH_MIN_10_MAX_200')
					.bail()
					.isString()
					.withMessage('description must be string'),
			];
		}
	}
};
