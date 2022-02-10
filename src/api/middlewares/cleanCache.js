const { clearHash } = require('../utils/cache');
module.exports = async (req, res, next, isArrayOrHashKey, start_name) => {
	await next();
	clearHash(isArrayOrHashKey, start_name);
};
