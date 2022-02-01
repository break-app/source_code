const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
	{
		name: {
			first: {
				type: String,
				required: [true, 'this field is required'],
				minlength: [
					2,
					'your first name must be more than one character',
				],
			},
			last: {
				type: String,
				required: [true, 'this filed is required'],
				minlength: [
					2,
					'your last name must be more than one character',
				],
			},
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
		},

		password: {
			type: String,
			required: [true, 'this filed is required'],
			minlength: [8, 'password cannot less than 8 characters'],
		},
		gender: {
			type: String,
			enum: ['male', 'female', 'other'],
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
		},
		level: {
			type: Number,
			default: 1,
			min: [1, 'level cannot be less than 1'],
		},

		groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
		followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		rating: { type: Number, default: 0 },
		gives: {
			global: {
				type: Number,
				default: 0,
			},
			room: {
				type: Number,
				default: 0,
			},
		},
		visits: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		products: [
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Store',
				},
				quantity: {
					type: Number,
					min: [1, 'quantity cannot be less than 0'],
				},
			},
		],
	},
	{ timestamps: true }
);

const groupsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'this field is required'],
	},
	group_id: {
		type: Number,
		required: [true, 'this field is required'],
		unique: true,
	},
	picture: {
		type: String,
		default: 'group picture',
	},
	description: String,
	category: {
		type: mongoose.Schema.Types.Number,
		ref: 'Category',
	},
});

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'this field is required'],
	},
	description: String,
});

const User = mongoose.model('User', usersSchema);
const Group = mongoose.model('Group', groupsSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = { User, Group, Category };
