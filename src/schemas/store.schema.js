const mongoose = require('mongoose');

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
	product_id: {
		type: Number,
		required: [true, 'this field is required'],
		unique: [true, 'this product is already exists'],
	},
});

const Store = mongoose.model('Store', storeSchema);
module.exports = { Store };
