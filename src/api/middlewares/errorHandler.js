const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Mongo bad Id
    if (err.name === 'CastError') {
        error = {
            message: 'Resource not found',
            statusCode: 404,
        };
    }

    // mongo dublicate Field
    if (err.code === 11000) {
        const fields = Object.keys(err.keyValue);
        error = {
            message: fields.forEach((f) => `this ${f} is alrady in use`),
            statusCode: 400,
        };
    }

    res.status(error.statusCode || 500).json({
        error: error.message || 'Server Error',
    });
};

module.exports = errorHandler;
