const checkDataExist = (data, dataName = 'data') => {
    if (!data || data?.length === 0) {
        const error = {
            message: `${dataName}_NOT_FOUND`,
            statusCode: 404,
        };
        throw error;
    }
};

module.exports = checkDataExist;
