const { User } = require('../../schemas/users.schema');
class ResellerDAO {
	static sendToClient(qty, clientId) {
		return new Promise(async (resolve, reject) => {
			try {
				const updateClientWallet = User.updateOne(
					{ _id: clientId },
					{
						$inc: {
							'wallet.golds': qty,
						},
					}
				);
				if (
					!updateClientWallet.matchedCount ||
					!updateClientWallet.modifiedCount
				) {
					reject(
						new Error('someting go wrong, please try again later.')
					);
				}
			} catch (error) {
				reject(error);
			}
		});
	}
}
module.exports = ResellerDAO;
