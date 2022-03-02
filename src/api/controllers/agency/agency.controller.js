const AgencyDAO = require('../../../dao/agency/agency.dao');

class AgencyController {
	/**-----------------------
	 *  create Agency
	 *  get Agency
	 *  get Agencies
	 *  join Agency
	 *  leave Agency
	 *------------------------**/

	static async createAgnecy(req, res, next) {
		try {
			const createResult = await AgencyDAO.createAgnecy(req.body);
			res.json(createResult);
		} catch (error) {
			next(error);
		}
	}

	static async createReqJoinFromUserToAgency(req, res, next) {
		try {
			const result = await AgencyDAO.createReqJoinFromUserToAgency(
				req.params.agencyId,
				req.user.id
			);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
	static async getAgencyJoinReqs(req, res, next) {
		try {
			const result = await AgencyDAO.getAgencyJoinReqs(
				req.params.agencyId
			);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}

	static async approveAgencyJoinReqs(req, res, next) {
		try {
			const result = await AgencyDAO.approveAgencyJoinReqs(
				req.params.agencyId,
				req.body.userId
			);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}

	static async getAgencyMembers(req, res, next) {
		try {
			const result = await AgencyDAO.getAgencyMembers(
				req.params.agencyId
			);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}

	static async sendGiftFromUserToAgencyMember(req, res, next) {
		try {
			const result = await AgencyDAO.sendGiftFromUserToAgencyMember({
				userId: req.user.id,
				memberId: req.body.memberId,
				giftId: req.body.giftId,
				giftQty: req.body.giftQty,
			});
			res.send(result);
		} catch (error) {
			next(error);
		}
	}

	static async awardAgencyMembers(req, res, next) {
		try {
			const result = await AgencyDAO.awardAgencyMembers(
				req.params.agencyId
			);
			res.send(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = AgencyController;
