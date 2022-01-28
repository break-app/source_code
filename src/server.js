const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
/**------------------------------------------------------------------------
 *                                ?ROUTES
 *------------------------------------------------------------------------**/
const users = require('./api/routes/users.route');
const app = express();

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**======================
 *    ?Routes
 *========================**/
app.use('/api/v1/users', users);

module.exports = app;
