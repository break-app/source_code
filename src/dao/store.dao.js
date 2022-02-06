const idGenerator = require('../api/helpers/idGenerator');
const { Store, ProductCategory } = require('../schemas/store.schema');

class StoreDAO {
	constructor(page) {
		this.page = page;
	}

	/**
	 * @param {ProductInfo} productInfo
	 **/
	static async addProduct(productInfo) {
		try {
			return await Store.create({ ...productInfo, _id: idGenerator() });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @param {CategoryInfo} categoryInfo
	 **/
	static async addCategory(categoryInfo) {
		try {
			return await ProductCategory.create({
				...categoryInfo,
				_id: idGenerator(),
			});
		} catch (error) {
			throw error;
		}
	}

	static async getCategories() {
		try {
			return await ProductCategory.find({}, { name: 1, avatar: 1 }).limit(
				10
			);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @param {string} category_id // the id of category
	 **/
	async getCategoryProducts(category_id) {
		try {
			return await Store.aggregate([
				{ $match: { category: category_id } },
				{ $skip: this.page * 10 },
				{ $limit: 10 },
			]);
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
 *  @property {string} avatar
 **/

/**
 *  paramater passed to addproduct method
 *  @typedef CategoryInfo
 *  @property {string} name
 *  @property {string} avatar
 **/

module.exports = StoreDAO;
