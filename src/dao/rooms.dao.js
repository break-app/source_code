// - CRUD Room -> userId, roomInfo
// - addMembers -> memberId, roomId
// - goinMembers -> memberId, roomId

const Room = require('../schemas/rooms.schema');

class RoomDAO {
    static async createRoom(roomInfo) {
        try {
            const room = await Room.create(roomInfo);
            return { room, success: true };
        } catch (error) {
            console.log(
                '🚀 ~ file: rooms.dao.js ~ line 10 ~ RoomDAO ~ createRoom ~ error',
                error
            );
            console.log(`Error occurred while creating a new room, ${error} `);
            return error;
        }
    }
    static async updateRoom(roomId, roomInfo) {
        let room;
        try {
            // for fields like room_members, room_admins, generas
            if (('room_members' || 'room_admins' || 'generas') in roomInfo) {
                room = await Room.updateOne(
                    { _id: roomId },
                    { $push: roomInfo }
                );
            } else {
                room = await Room.updateOne(
                    { _id: roomId },
                    { $set: roomInfo }
                );
            }
            return { room, success: true };
        } catch (error) {
            console.log(
                '🚀 ~ file: rooms.dao.js ~ line 29 ~ RoomDAO ~ updateRoom ~ error',
                error
            );
            console.log(`Error occurred while updating a room, ${error} `);
            return error;
        }
    }
    static async getRoom(roomId) {
        try {
            const room = await Room.findById(roomId);
            return room;
        } catch (error) {
            console.log(
                '🚀 ~ file: rooms.dao.js ~ line 48 ~ RoomDAO ~ getRoom ~ error',
                error
            );
            console.log(`Error occurred while updating a room, ${error} `);
            return error;
        }
    }
    static async searchForRooms(roomInfo) {
        const pipeline = [{ $match: { roomInfo } }];
        try {
            const room = await Room.aggregate(pipeline);
            return room;
        } catch (error) {
            console.log(
                '🚀 ~ file: rooms.dao.js ~ line 60 ~ RoomDAO ~ searchForRooms ~ error',
                error
            );
            console.log(`Error occurred while updating a room, ${error} `);
            return error;
        }
    }
    static async deleteRoom(roomId) {
        try {
            const room = await Room.findByIdAndDelete(roomId);
            return room;
        } catch (error) {
            console.log(
                '🚀 ~ file: rooms.dao.js ~ line 75 ~ RoomDAO ~ deleteRoom ~ error',
                error
            );
            console.log(`Error occurred while updating a room, ${error} `);
            return error;
        }
    }
}

module.exports = RoomDAO;
