const mongoose = require('mongoose');
const idGenerator = require('../api/helpers/idGenerator');
const Schema = mongoose.Schema;
const id = mongoose.Schema.Types.String;

const transfersSchema = new Schema(
	{
		from: {
			type: id,
			required: [true, 'sender id is required'],
		},
		to: {
			type: id,
			required: [true, 'receiver id is required'],
		},
		quantity: {
			type: Number,
			required: [true, 'quantity is required'],
		},
		as: {
			type: String,
			enum: ['personal', 'agency', 'reseller'],
			require: true,
		},
	},
	{
		timestamps: true,
	}
);

transfersSchema.pre('save', async function (next) {
	this._id = idGenerator();
	next();
});
const Transfers = mongoose.model('Transfers', transfersSchema);
module.exports = { Transfers };
