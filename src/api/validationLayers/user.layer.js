const { check } = require('express-validator');

exports.validate = (method) => {
	switch (method) {
		case 'createUser': {
			return [];
		}
	}
};
