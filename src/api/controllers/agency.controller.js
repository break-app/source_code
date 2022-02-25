const AgencyDAO = require('../../dao/agency.dao');

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

	static async getGroup(req, res, next) {
		try {
			const { groupId } = req.params;
			const getResult = await AgencyDAO.getGroup(groupId);
			res.json(getResult);
		} catch (error) {
			next(error);
		}
	}

	static async joinGroup(req, res, next) {
		try {
			const userId = req.user.id;
			const { groupId } = req.body;
			const joinResult = await AgencyDAO.joinGroup({ groupId, userId });
			res.json(joinResult);
		} catch (error) {
			next(error);
		}
	}

	static async leaveGroup(req, res, next) {
		try {
			const userId = req.user.id;
			const { groupId } = req.body;
			const leaveResult = await AgencyDAO.leaveGroup({ groupId, userId });
			res.json(leaveResult);
		} catch (error) {
			next(error);
		}
	}

	static async getGroups(req, res, next) {
		try {
			const Result = await AgencyDAO.getGroups(req.query.page);
			res.json(Result);
		} catch (error) {
			next(error);
		}
	}

	static async upateGroup(req, res, next) {
		try {
			const result = await AgencyDAO.updateGroup({
				id: req.params.id,
				data: req.body,
			});

			res.json(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = AgencyController;
