const StoreController = require('../controllers/store.controller');
let cleanCache = require('../middlewares/cleanCache');

const router = require('express').Router();

router
	.route('/addProduct')
	.post(
		(req, res, next) =>
			cleanCache(`all_products&category=${req.body.category}`, next),
		StoreController.addProduct
	);
router
	.route('/category')
	.post(
		(req, res, next) => cleanCache('all_categories', next),
		StoreController.addCategory
	)
	.get(StoreController.getCategories);
router
	.route('/getCategoryProducts/:category_id')
	.get(StoreController.getCategoryProducts);

module.exports = router;
