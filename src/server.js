const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
/**------------------------------------------------------------------------
 *                            ?ImportROUTES
 *------------------------------------------------------------------------**/
const users = require('./api/routes/users.route');
const errorHandler = require('./api/middlewares/errorHandler');
const { catchValidationError } = require('./api/middlewares/validationError');
const app = express();

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(expressValidator());

/**======================
 *  ?Hanle Validation Errors
 *========================**/
app.use(catchValidationError);

/**======================
 *    ?UseRoutes
 *========================**/
app.use('/api/v1/users', users);

/**======================
 *    ?Hanle DB Errors
 *========================**/
app.use(errorHandler);

module.exports = app;
