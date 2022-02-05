const checkDataExist = (data) => {
    if (!data || data?.length === 0) {
        const error = {
            message: 'NOT_FOUND',
            statusCode: 404,
        };
        throw error;
    }
};

module.exports = checkDataExist;
