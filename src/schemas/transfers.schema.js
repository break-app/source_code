const mongoose = require('mongoose');
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
	},
	{
		timestamps: true,
	}
);

const Transfers = mongoose.model('Transfers', transfersSchema);
module.exports = { Transfers };
