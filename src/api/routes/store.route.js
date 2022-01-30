const StoreController = require('../controllers/store.controller');
const { catchValidationError } = require('../middlewares/validationError');
const { validate } = require('../validationLayers/store.layer');

const router = require('express').Router();

router.route('/addProduct').post(StoreController.addProduct);

module.exports = router;
