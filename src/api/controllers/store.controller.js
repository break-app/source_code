const StoreDAO = require('../../dao/store.dao');

class StoreController {
	static async addProduct(req, res, next) {
		try {
			const proudctResult = await StoreDAO.addProduct(req.body);
			res.status(201).json({
				success: true,
				result: proudctResult,
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = StoreController;
