const StoreController = require('../controllers/store.controller');
const cleanCache = require('../middlewares/cleanCache');

const router = require('express').Router();

function clearCache(isArrayOrHashKey, start_name) {
	return (req, res, next) =>
		cleanCache(req, res, next, isArrayOrHashKey, start_name);
}

router
	.route('/addProduct')
	.post(clearCache([], `all_products`), StoreController.addProduct);
router
	.route('/category')
	.post(clearCache([], 'all_categories'), StoreController.addCategory)
	.get(StoreController.getCategories);
router
	.route('/getCategoryProducts/:category_id')
	.get(StoreController.getCategoryProducts);

module.exports = router;
