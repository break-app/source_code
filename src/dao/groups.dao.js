const { User, Group } = require('../schemas/users.schema');
const mongoose = require('mongoose');

const idGenerator = require('../api/helpers/idGenerator');
const verifyUpdates = require('../api/helpers/verifyUpdates');
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
					{
						$lookup: {
							from: 'users',
							pipeline: [
								{
									$match: {
										$expr: { $in: [groupId, '$groups'] },
									},
								},
								{
									$group: {
										_id: '$_id',
									},
								},
							],
							as: 'members',
						},
					},
					{
						$project: {
							name: 1,
							description: 1,
							avatar: 1,
							members: { $size: '$members' },
						},
					},
				]).cache({
					key: `single_group=${groupId}`,
				});
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
					reject(new Error('you are not join to this group'));
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

	static getGroups(page) {
		return new Promise(async (resolve, reject) => {
			try {
				const limit = 10;
				const groups = await Group.aggregate([
					{
						$lookup: {
							from: 'users',
							let: { groupId: '$_id' },
							pipeline: [
								{
									$match: {
										$expr: {
											$in: ['$$groupId', '$groups'],
										},
									},
								},
								{
									$group: {
										_id: '$_id',
									},
								},
							],
							as: 'members',
						},
					},
					{
						$project: {
							name: 1,
							description: 1,
							avatar: 1,
							members: { $size: '$members' },
						},
					},
					{ $skip: (page - 1) * limit },
					{ $limit: limit },
				]).cache({
					key: `all_groups&page=${page}`,
				});
				resolve(groups);
			} catch (error) {
				reject(error);
			}
		});
	}

	static updateGroup({ id, data }) {
		return new Promise(async (resolve, reject) => {
			try {
				const whiteList = ['name', 'description', 'avatar'];
				const updateResult = await Group.updateOne(
					{ _id: id },
					{ $set: verifyUpdates(data, whiteList) }
				);
				if (!updateResult.matchedCount) {
					reject('group not found');
				}
				if (!updateResult.modifiedCount) {
					reject('please try again later');
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = GroupDAO;
