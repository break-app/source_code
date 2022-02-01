const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
	{
		name: {
			first: {
				type: String,
				required: [true, 'this field is required'],
			},
			last: {
				type: String,
				required: [true, 'this filed is required'],
			},
		},
		age: {
			type: Number,
			required: [true, 'this field is required'],
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
			default: 0,
		},

		auth_token: {
			type: String,
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
