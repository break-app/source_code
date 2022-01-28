const { body } = require('express-validator/check');

exports.validate = (method) => {
    switch (method) {
        case 'createRoom': {
            return [
                body('room_name', "room_name doesn't exist")
                    .exists()
                    .isString(),
            ];
        }
    }
};
