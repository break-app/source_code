const ResellerDAO = require('../../../dao/reseller/reseller.dao');

class ResellerCtrl {
	static async sendToclient(req, res, next) {
		try {
			const { clientId, qty } = req.body;
			const result = await ResellerDAO.sendToclient(qty, clientId);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = ResellerCtrl;
