const { clearHash } = require('../utils/cache');

/**-----------------------
//  *  @param {boolean} multiple determine wether there is multiple keys to be removed
 * 	@param {string} key the first name of the keys or key to remove
 *------------------------**/
module.exports = async (key, next) => {
	await next();
	clearHash(key);
};
