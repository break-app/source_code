const { Group, User } = require('../schemas/users.schema');
const idGenerator = require('../api/helpers/idGenerator');
class GroupDAO {
	/**-----------------------
	 *  create group --- gruopInfo
	 *  get group --- groupId
	 *  get groups
	 *  join group -- {groupId, userId}
	 *  leave group -- {groupId, userId}
	 *------------------------**/

	static createGroup(groupInfo) {
		return new Promise(async (resolve, reject) => {
			try {
				const { name, description, avatar } = groupInfo;
				resolve(
					await Group.create({
						name,
						description,
						avatar,
						_id: idGenerator(),
					})
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	static getGroup(groupId) {
		return new Promise(async (resolve, reject) => {
			try {
				const group = await Group.aggregate([
					{ $match: { _id: groupId } },
				]);
				resolve(group);
			} catch (error) {
				reject(error);
			}
		});
	}

	static joinGroup({ groupId, userId }) {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await User.updateOne(
					{
						_id: userId,
						groups: { $nin: [groupId] },
					},
					{
						$push: {
							groups: groupId,
						},
					}
				);
				if (!user.matchedCount) {
					reject(new Error('you already joined to this group'));
					return;
				}
				if (!user.modifiedCount) {
					reject(new Error('something went wrong'));
					return;
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static leaveGroup({ groupId, userId }) {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await User.updateOne(
					{
						_id: userId,
						groups: { $in: [groupId] },
					},
					{
						$pull: {
							groups: groupId,
						},
					}
				);
				if (!user.matchedCount) {
					reject(new Error('you are not join to this orject'));
					return;
				}
				if (!user.modifiedCount) {
					reject(new Error('something went wrong'));
					return;
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static getGroups() {
		return new Promise(async (resolve, reject) => {
			try {
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = GroupDAO;
