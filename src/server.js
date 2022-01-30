const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
/**------------------------------------------------------------------------
 *                            ?ImportROUTES
 *------------------------------------------------------------------------**/
const users = require('./api/routes/users.route');
const rooms = require('./api/routes/rooms.route');
const store = require('./api/routes/store.route');
const errorHandler = require('./api/middlewares/errorHandler');
const app = express();

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**======================
 *    ?UseRoutes
 *========================**/
app.use('/api/v1/users', users);
app.use('/api/v1/rooms', rooms);
app.use('/api/v1/store', store);

/**======================
 *    ?Hanle DB Errors
 *========================**/
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	// close the server & exit process
	server.close(() => process.exit(1));
});

module.exports = app;
