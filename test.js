const { User } = require('./src/schemas/users.schema');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
// Coonect To DB
mongoose.connect(process.env.DB_URI).catch((err) => console.log(err));

let users = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, 'utf-8'));
const importData = async () => {
	try {
		await User.create(users);
		console.log('Data Imported ...');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

// Delete Data
const deleteData = async () => {
	try {
		await User.deleteMany();

		console.log('Data Distroyed...');
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
