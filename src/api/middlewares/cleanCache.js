const { clearHash } = require('../utils/cache');

/**-----------------------
 *  @param {boolean} ArrayOrHashKey determine wether there is multiple keys to be removed
 * @param {string} key the first name of the keys or key to remove
 *------------------------**/
module.exports = async (req, res, next, multiple, key) => {
	await next();
	clearHash(multiple, key);
};
