const { clearCache } = require('../utils/cache');

module.exports = async (req, res, next) => {
    await next();

    clearCache(req.user.id);
};
