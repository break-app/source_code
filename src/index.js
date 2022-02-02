const app = require('./server');

const mongoose = require('mongoose');
function dbconnect() {
	mongoose
		.connect(process.env.DB_URI)
		.then(() => {
			console.log(`DB Connected.`);
		})
		.catch((err) => {
			console.log(
				`Mongoose default connection has occured ${err} error.`
			);
		});
	mongoose.connection.on('disconnected', () => {
		console.log('Mongoose default connection is disconnected.');
	});
	process.on('SIGINT', () => {
		mongoose.connection.close(() => {
			console.log(
				'Mongoose default connection is disconnected due to application termination.'
			);
			process.exit(0);
		});
	});
}
dbconnect();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log('server listening to port', PORT);
});
