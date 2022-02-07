const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./api/middlewares/errorHandler');
const app = express();
/**------------------------------------------------------------------------
 *                            ?ImportROUTES
 *------------------------------------------------------------------------**/
const users = require('./api/routes/users/users.route');
const usersStatistics = require('./api/routes/users/users.statistics.route');
const rooms = require('./api/routes/rooms.route');
const store = require('./api/routes/store.route');
const settings = require('./api/routes/settings.route');
const groups = require('./api/routes/groups.route');

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**======================
 *    ?UseRoutes
 *========================**/
app.use('/api/v1/users', users);
app.use('/api/v1/statistics/users', usersStatistics);
app.use('/api/v1/rooms', rooms);
app.use('/api/v1/store', store);
app.use('/api/v1/settings', settings);
app.use('/api/v1/groups', groups);

/**======================
 *    ?Hanle DB Errors
 *========================**/
app.use(errorHandler);

module.exports = app;
