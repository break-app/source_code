const { checkUpdated } = require('../../api/helpers/checkUpdated');
const Settings = require('../../schemas/settings.schema');
const { Transfers } = require('../../schemas/transfers.schema');
const { User } = require('../../schemas/users.schema');

class ResellerHelper {
	static async RetrieveToReseller({ resellerId, qty, clientId }) {
		// let msg =
		// 	'Error occured when retrieve your gift, please contact support';
		let reseller, client;
		if (resellerId) {
			reseller = await User.updateOne(
				{
					_id: resellerId,
					role: 'reseller',
				},
				{
					$inc: {
						'wallet.golds': qty,
					},
				}
			);
			if (!(await checkUpdated(reseller))) {
				throw new Error(
					'error occured while retrieving your golds, please contact support'
				);
			}
		}
		if (clientId) {
			client = await User.updateOne(
				{
					_id: clientId,
				},
				{
					$inc: {
						'wallet.golds': -qty,
					},
				}
			);
			if (!(await checkUpdated(client))) {
				throw new Error(
					'error occured while retrieving client golds, please contact support'
				);
			}
		}

		throw new Error('Problem occured while sending your gift');
	}
}
class ResellerDAO {
	static sendToClient(obj) {
		let { clientId, resellerId, qty } = obj;
		return new Promise(async (resolve, reject) => {
			try {
				let updateResellerWallet, updateClientWallet;
				updateClientWallet = User.updateOne(
					{ _id: clientId },
					{
						$inc: {
							'wallet.golds': qty,
						},
					}
				);

				updateResellerWallet = User.updateOne(
					{
						_id: resellerId,
						role: 'reseller',
						'wallet.golds': { $gte: qty },
					},
					{
						$inc: {
							'wallet.golds': -qty,
						},
					}
				);

				const [updateResellerWalletResult, updateClientWalletResult] =
					await Promise.all([
						updateResellerWallet,
						updateClientWallet,
					]);

				if (
					!(await checkUpdated(updateResellerWalletResult)) &&
					(await checkUpdated(updateClientWalletResult))
				) {
					console.log('reseller not updated');
					reject(
						await ResellerHelper.RetrieveToReseller({
							resellerId: null,
							clientId,
							qty,
						})
					);
				} else if (
					(await checkUpdated(updateResellerWalletResult)) &&
					!(await checkUpdated(updateClientWalletResult))
				) {
					reject(
						await ResellerHelper.RetrieveToReseller({
							resellerId,
							qty,
							clientId: null,
						})
					);
				}
				const settings = await Settings.findOne({}, { beans_golds });
				await Transfers.create({
					from: resellerId,
					to: clientId,
					quantity: qty * settings.beans_golds,
					as: 'reseller',
				});
				resolve({
					success: true,
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}
module.exports = ResellerDAO;
