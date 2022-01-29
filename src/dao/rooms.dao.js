// - CRUD Room -> userId, roomInfo
// - addMembers -> memberId, roomId
// - goinMembers -> memberId, roomId

const Room = require('../schemas/rooms.schema');

class RoomDAO {
    static async createRoom(roomInfo) {
        try {
            const room = await Room.create(roomInfo);
            return room;
        } catch (error) {
            throw error;
        }
    }
    static async updateRoom(roomId, roomInfo) {
        let room;
        try {
            // for fields like room_members, room_admins, generas
            if (('room_members' || 'room_admins' || 'generas') in roomInfo) {
                room = await Room.updateOne(
                    { _id: roomId },
                    { 'roomInfo.operator': roomInfo }
                );
            } else {
                room = await Room.updateOne(
                    { _id: roomId },
                    { $set: roomInfo }
                );
            }
            return room;
        } catch (error) {
            throw error;
        }
    }
    static async getRoom(roomId) {
        try {
            const room = await Room.findById(roomId);
            return room;
        } catch (error) {
            throw error;
        }
    }
    static async searchForRooms(roomInfo) {
        const pipeline = [{ $match: { roomInfo } }];
        try {
            const room = await Room.aggregate(pipeline);
            return room;
        } catch (error) {
            throw error;
        }
    }
    static async deleteRoom(roomId) {
        try {
            const room = await Room.findByIdAndDelete(roomId);
            return room;
        } catch (error) {
            throw error;
        }
    }
}

// exports.createRoom = (roomInfo) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const room = await Room.create(roomInfo);

//             resolve(room);
//         } catch (error) {
//             error.status = error.status || 400;
//             reject(error);
//         }
//     });
// };

module.exports = RoomDAO;
