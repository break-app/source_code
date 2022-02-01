const mongoose = require('mongoose');
const productCategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	avatar: {
		type: String,
		default: 'avatar default',
	},
});
const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'this field is required'],
		unique: [true, 'this product is already exists'],
	},
	price: {
		type: Number,
		required: [true, 'this field is required'],
	},
	description: {
		type: String,
		required: [true, 'this field is required'],
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ProductCategory',
		required: true,
	},
	avatar: {
		type: String,
		default: 'avatar default',
	},
});

const Store = mongoose.model('Store', storeSchema);
const ProductCategory = mongoose.model(
	'ProductCategory',
	productCategorySchema
);
module.exports = { Store, ProductCategory };
