const { User, Agency } = require('./src/schemas/users.schema');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
// Coonect To DB
mongoose.connect(process.env.DB_URI).catch((err) => console.log(err));

let users = JSON.parse(fs.readFileSync(`${__dirname}/user.json`, 'utf-8'));
let agencies = JSON.parse(
	fs.readFileSync(`${__dirname}/agencies.json`, 'utf-8')
);
const importData = async () => {
	try {
		// await User.create(users);
		await Agency.create(agencies);
		console.log('Data Imported ...');
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

// Delete Data
const deleteData = async () => {
	try {
		// await User.deleteMany();
		await Agency.deleteMany({ _id: { $ne: '7085377' } });

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
