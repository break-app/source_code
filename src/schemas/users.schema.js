const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');

const givingSchema = new mongoose.Schema(
	{
		giver: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
		scope: {
			type: String,
			required: true,
		},
	},
	{
		_id: false,
		timestamps: true,
	}
);
const usersSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.String,
			required: [true, 'document must has an id'],
		},

		first_name: {
			type: String,
			required: [true, 'this field is required'],
			minlength: [2, 'your first name must be more than one character'],
			text: true,
		},
		last_name: {
			type: String,
			required: [true, 'this filed is required'],
			minlength: [2, 'your last name must be more than one character'],
			text: true,
		},

		age: {
			type: Number,
			required: [true, 'this field is required'],
			min: [18, 'you must be older than 18 years'],
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			required: true,
			default: 'user',
		},
		avatar: {
			type: String,
			default: 'default avatar src',
		},
		phone: {
			type: String,
		},
		email: {
			// or username
			type: String,
			required: [true, 'this filed is required'],
			unique: [true, 'this field is unique'],
			text: true,
		},
		password: {
			type: String,
			required: [true, 'this filed is required'],
			minlength: [8, 'password cannot less than 8 characters'],
		},
		gender: {
			type: String,
			enum: ['Male', 'Female', 'Non-binary'],
			required: [true, 'this field is required'],
		},
		wallet: {
			golds: {
				type: Number,
				default: 6000,
				min: [0, "your golds can't be less than 0"],
			},
			beans: {
				type: Number,
				default: 0,
				min: [0, "your beans can't be less than 0"],
			},
			spends: {
				type: Number,
				default: 0,
			},
		},
		level: {
			type: Number,
			default: 1,
			min: [1, 'level cannot be less than 1'],
		},
		agency: {
			id: {
				type: mongoose.Schema.Types.String,
				ref: 'Agency',
			},
			status: {
				type: String,
				enum: ['joined', 'refused', 'pending'],
				default: 'pending',
			},
			total_balance: {
				type: Number,
				default: 0,
			},
		},
		followings: [{ type: mongoose.Schema.Types.String, ref: 'User' }],
		gives: [givingSchema],
		visits: [
			{
				type: mongoose.Schema.Types.String,
				ref: 'User',
			},
		],
		products: [
			{
				id: {
					type: mongoose.Schema.Types.String,
					ref: 'Store',
				},
				quantity: {
					type: Number,
					min: [1, 'quantity cannot be less than 0'],
				},
			},
		],
		country: {
			type: String,
			required: true,
		},
		unique_id: {
			type: String,
		},
	},
	{ timestamps: true }
);

const agencySchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.String,
			required: [true, 'this field is required'],
		},
		name: {
			type: String,
			required: [true, 'this field is required'],
			text: true,
		},
		avatar: {
			type: String,
			default: 'group picture',
		},
		description: String,
		total_balance: {
			expire_date: {
				type: Date,
				default: Date.now(),
			},
			current_value: {
				type: Number,
				default: 0,
			},
			target_value: {
				type: Number,
				default: 0,
			},
		},
	},
	{ timestamps: true }
);

// Hash password
usersSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcryptjs.genSalt(10);
	this.password = await bcryptjs.hash(this.password, salt);
	next();
});
const User = mongoose.model('User', usersSchema);
const Agency = mongoose.model('Agency', agencySchema);
module.exports = { User, Agency };
