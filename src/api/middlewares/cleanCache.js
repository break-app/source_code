const { clearHash } = require('../utils/cache');
module.exports = async (req, res, next, ArrayOrHashKey, start_name) => {
	await next();
	clearHash(ArrayOrHashKey, start_name);
};
