const Store = require('../schemas/store.schema');

class StoreDAO {
	// /**
	//  * @param {ProductInfo} productInfo
	//  **/
	static async addProduct(productInfo) {
		try {
			return await Store.create(productInfo);
		} catch (error) {
			throw error;
		}
	}
}

/**
 *  paramater passed to addproduct method
 *  @typedef ProductInfo
 *  @property {string} name
 *  @property {number} price
 *  @property {string} description
 **/

module.exports = StoreDAO;
