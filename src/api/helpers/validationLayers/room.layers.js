const { check } = require('express-validator');

exports.validate = (method) => {
    switch (method) {
        case 'createRoom': {
            return [
                check('room_name')
                    .trim()
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isLength({ min: 3, max: 20 })
                    .withMessage('NUMBER_MIN_3_MAX_15')
                    .bail()
                    .isString()
                    .withMessage('must be string'),
                check('password')
                    .optional()
                    .custom((value, { req }) => req.body.private === true)
                    .withMessage('the room must be private to have a password')
                    .bail()
                    .isNumeric()
                    .withMessage('password must be numbers')
                    .bail()
                    .isLength({ min: 6, max: 6 })
                    .withMessage('password length must be 6 digits'),
                check('announcement')
                    .optional()
                    .isString()
                    .withMessage('announcement must be string'),
            ];
        }
        case 'updateRoom': {
            return [
                check('room_name')
                    .trim()
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isLength({ min: 3, max: 15 })
                    .withMessage('NUMBER_MIN_3_MAX_15')
                    .bail()
                    .isString()
                    .withMessage('must be string'),
                check('password')
                    .optional()
                    .custom((value, { req }) => req.body.private === true)
                    .withMessage('the room must be private to have a password')
                    .bail()
                    .isNumeric()
                    .withMessage('password must be numbers')
                    .bail()
                    .isLength({ min: 6, max: 6 })
                    .withMessage('password length must be 6 digits'),
                check('announcement')
                    .optional()
                    .isString()
                    .withMessage('announcement must be string'),
            ];
        }
        case 'add-members': {
            return [
                check('members')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one userID'),
            ];
        }
        case 'remove-members': {
            return [
                check('members')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one userID'),
            ];
        }
        case 'add-admins': {
            return [
                check('admins')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one userID'),
            ];
        }
        case 'remove-admins': {
            return [
                check('admins')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one userID'),
            ];
        }
        case 'add-generas': {
            return [
                check('generas')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one genera'),
            ];
        }
        case 'remove-generas': {
            return [
                check('generas')
                    .notEmpty()
                    .withMessage('REQUIRED')
                    .bail()
                    .isArray({ min: 1 })
                    .withMessage('must be an array of at least one genera'),
            ];
        }
        default:
            return;
    }
};
