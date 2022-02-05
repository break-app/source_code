// - create Room    ---> (roomInfo)              --->  line ~ 21
// - update Room    ---> (roomId, roomInfo)      --->  line ~ 29
// - addMembers     ---> (membersArray, roomId)  --->  line ~ 41
// - joinMembers    ---> (memberId, roomId)      --->  line ~ 52
// - removeMembers  ---> (membersArray, roomId)  --->  line ~ 63
// - addAdmins      ---> (adminsArray, roomId)   --->  line ~ 74
// - removeAdmins   ---> (adminsArray, roomId)   --->  line ~ 86
// - addGeneras     ---> (generasArray, roomId)  --->  line ~ 98
// - removeGeneras  ---> (generasArray, roomId)  --->  line ~ 110
// - get Room by Id ---> (roomId)                --->  line ~ 123
// - get all Rooms  ---> ()                      --->  line ~ 199
// - delete Room    ---> (roomId)                --->  line ~ 283
// - search         ---> (searchInfo)            --->  line ~ 318

const checkDataExist = require('../api/helpers/notFoundData');
const verifyUpdates = require('../api/helpers/verifyUpdates');
const Room = require('../schemas/rooms.schema');
const { ObjectId } = require('bson');
const idGenerator = require('../api/helpers/idGenerator');
const UserDAO = require('./users/users.dao');

class RoomDAO {
    static createRoom(roomInfo) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.create({
                    ...roomInfo,
                    _id: idGenerator(),
                });
                resolve(room);
            } catch (error) {
                reject(error);
            }
        });
    }

    static updateRoomInfoById(roomId, roomInfo) {
        const whiteList = ['room_name', 'private', 'password', 'announcement'];
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByIdAndUpdate(roomId, {
                    $set: verifyUpdates(roomInfo, whiteList),
                });
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static addRoomMembers(roomId, membersArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByIdAndUpdate(roomId, {
                    $addToSet: { room_members: { $each: membersArray } },
                });
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static joinRoom(roomId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByIdAndUpdate(roomId, {
                    $addToSet: { room_members: userId },
                });
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static removeRoomMembers(roomId, membersArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByIdAndUpdate(roomId, {
                    $pullAll: { room_members: membersArray },
                });
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static addRoomAdmins(roomId, adminsArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.updateOne(
                    { _id: roomId },
                    { $addToSet: { room_admins: { $each: adminsArray } } }
                );
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static removeRoomAdmins(roomId, adminsArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.updateOne(
                    { _id: roomId },
                    { $pullAll: { room_admins: adminsArray } }
                );
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static addRoomGeneras(roomId, generasArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.updateOne(
                    { _id: roomId },
                    { $addToSet: { room_generas: { $each: generasArray } } }
                );
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static removeRoomGeneras(roomId, generasArray = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.updateOne(
                    { _id: roomId },
                    { $pullAll: { room_generas: generasArray } }
                );
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static getRoomById(roomId) {
        const pipeline = [
            { $match: { _id: roomId } },
            {
                $lookup: {
                    from: 'users',
                    let: { userMembers: '$room_members' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$userMembers'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userAdmins: '$room_admins' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$userAdmins'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_admins',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userOwner: '$room_owner' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userOwner'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_owner',
                },
            },
            { $unwind: '$room_owner' },
        ];
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.aggregate(pipeline);
                checkDataExist(room);
                resolve(room[0]);
            } catch (error) {
                reject(error);
            }
        });
    }

    static getAllRooms() {
        const pipeline = [
            { $match: {} },
            {
                $lookup: {
                    from: 'users',
                    let: { userIds: '$room_members' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$userIds'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userAdmins: '$room_admins' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$userAdmins'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_admins',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userOwner: '$room_owner' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userOwner'] },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                avatar: 1,
                            },
                        },
                    ],
                    as: 'room_owner',
                },
            },
            { $unwind: '$room_owner' },
        ];
        return new Promise(async (resolve, reject) => {
            try {
                const rooms = await Room.aggregate(pipeline);
                resolve(rooms);
            } catch (error) {
                reject(error);
            }
        });
    }

    static deleteRoomById(roomId) {
        return new Promise(async (resolve, reject) => {
            try {
                const room = await Room.findByIdAndDelete(roomId);
                checkDataExist(room);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static searchForRooms(room_name = null, room_id = null) {
        const matchId = {
            room_id: { $regex: room_id, $options: 'i' },
        };
        const matchName = {
            room_name: { $regex: room_name, $options: 'i' },
        };
        const pipeline = [
            {
                $match:
                    matchName.room_name.$regex === null
                        ? matchId
                        : matchId.room_id.$regex === null
                        ? matchName
                        : {},
            },
            {
                $project: {
                    _id: 0,
                    room_name: 1,
                    room_avatar: 1,
                    announcement: 1,
                },
            },
        ];
        return new Promise(async (resolve, reject) => {
            try {
                const rooms = await Room.aggregate(pipeline);
                resolve(rooms);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = RoomDAO;
