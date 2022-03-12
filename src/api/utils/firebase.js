var admin = require('firebase-admin');

var serviceAccount = require('../config/firebaseServiceKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: serviceAccount.storageBucket,
});

const bucket = admin.storage().bucket();

const uploadImage = (req, res, next) => {
	if (!req.file) return next();
	const avatar = req.file;
	const newAvatarName =
		Date.now() + '.' + avatar.originalname.split('.').pop();

	const file = bucket.file(newAvatarName);

	const stream = file.createWriteStream({
		contentType: avatar.mimetype,
	});

	stream.on('error', (err) => {
		console.error(err);
	});

	stream.on('finish', async () => {
		await file.makePublic();
		req.file.firebaseUrl = `https://storage.googleapis.com/${serviceAccount.storageBucket}/${newAvatarName}`;
		next();
	});

	stream.end(avatar.buffrer);
};

module.exports = { admin, uploadImage };
