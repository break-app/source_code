const GroupDAO = require('../../dao/groups.dao');

class GroupController {
	/**-----------------------
	 *  create group
	 *  get group
	 *  get groups
	 *  join group
	 *  leave group
	 *------------------------**/

	static async createGroup(req, res, next) {
		try {
			const createResult = await GroupDAO.createGroup(req.body);
			res.json(createResult);
		} catch (error) {
			next(error);
		}
	}

	static async getGroup(req, res, next) {
		try {
			const { groupId } = req.params;
			const getResult = await GroupDAO.getGroup(groupId);
			res.json(getResult);
		} catch (error) {
			next(error);
		}
	}

	static async joinGroup(req, res, next) {
		try {
			const userId = req.user.id;
			const { groupId } = req.body;
			const joinResult = await GroupDAO.joinGroup({ groupId, userId });
			res.json(joinResult);
		} catch (error) {
			next(error);
		}
	}

	static async leaveGroup(req, res, next) {
		try {
			const userId = req.user.id;
			const { groupId } = req.body;
			const leaveResult = await GroupDAO.leaveGroup({ groupId, userId });
			res.json(leaveResult);
		} catch (error) {
			next(error);
		}
	}

	static async getGroups(req, res, next) {
		try {
			const Result = await GroupDAO.getGroups();
			res.json(Result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = GroupController;
