const idGenerator = require('../api/helpers/idGenerator');
const { Store, ProductCategory } = require('../schemas/store.schema');

class StoreDAO {
	static async addProduct(productInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(
					await Store.create({ ...productInfo, _id: idGenerator() })
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	static async addCategory(categoryInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				const result = await ProductCategory.create({
					...categoryInfo,
					_id: idGenerator(),
				});
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * @param {number} page // number of page
	 **/
	static async getCategories(page) {
		return new Promise(async (resolve, reject) => {
			try {
				const limit = 10;
				const result = await ProductCategory.aggregate([
					{ $project: { name: 1, avatar: 1 } },
					{ $skip: (page - 1) * 2 },
					{ $limit: 2 },
				]).cache({
					key: `all_categories page=${page}`,
				});
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * @param {string} category_id // the id of category
	 * @param {number} page // number of page
	 **/
	static async getCategoryProducts(category_id, page) {
		return new Promise(async (resolve, reject) => {
			try {
				const limit = 10;
				const result = await Store.aggregate([
					{ $match: { category: category_id } },
					{ $skip: (page - 1) * limit },
					{ $limit: limit },
				]).cache({
					key: `all_products&category=${category_id}&page=${page}`,
				});
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = StoreDAO;
