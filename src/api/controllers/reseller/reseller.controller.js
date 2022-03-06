const ResellerDAO = require('../../../dao/reseller/reseller.dao');

class ResellerCtrl {
	static async sendToclient(req, res, next) {
		try {
			const { clientId, qty } = req.body;
			const resellerId = req.user.id;
			const result = await ResellerDAO.sendToClient({
				qty,
				clientId,
				resellerId,
			});
			res.send(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = ResellerCtrl;
