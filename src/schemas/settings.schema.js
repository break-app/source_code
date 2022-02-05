const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
	beans_golds: {
		type: Number,
		required: [true, 'there is no equation between golds and beans'],
	},
	level_reqs: {
		// level requirements
		spends: {
			type: Number,
			required: [true, 'this field is required'],
		},
	},
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
