const createHttpError = require('http-errors');
const RoomDAO = require('../../dao/rooms.dao');
const UserDAO = require('../../dao/users/users.dao');
const idGenerator = require('../helpers/idGenerator');

class RoomControllers {
    static async createRoom(req, res, next) {
        try {
            const roomFromBody = req.body;
            const { id, picture } = req.user;

            const roomResult = await RoomDAO.createRoom({
                room_name: roomFromBody.room_name,
                room_owner: id,
                room_avatar: picture,
                private: roomFromBody.private || undefined,
                room_password: roomFromBody.room_password || undefined,
                room_id: idGenerator(),
            });
            res.status(201).json({
                success: true,
                result: roomResult,
            });
        } catch (err) {
            next(err);
        }
    }

    static async updateRoomById(req, res, next) {
        try {
            const roomFromBody = req.body;
            const { id: roomId } = req.params;

            await RoomDAO.updateRoomInfoById(roomId, roomFromBody);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async deleteRoomById(req, res, next) {
        try {
            const { id: roomId } = req.params;
            await RoomDAO.deleteRoomById(roomId);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getRoomById(req, res, next) {
        try {
            const { id: roomId } = req.params;
            const room = await RoomDAO.getRoomById(roomId);
            res.status(200).json({
                success: true,
                room,
            });
        } catch (err) {
            next(err);
        }
    }

    static async getAllRooms(req, res, next) {
        try {
            const rooms = await RoomDAO.getAllRooms(req);
            res.status(200).json({
                success: true,
                rooms,
            });
        } catch (err) {
            next(err);
        }
    }

    static async addRoomMembers(req, res, next) {
        try {
            const { members } = req.body;
            const { id: roomId } = req.params;

            // check if the members exists
            for (let m in members) {
                await UserDAO.getUserById(members[m]);
            }

            await RoomDAO.addRoomMembers(roomId, members);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async joinRoom(req, res, next) {
        try {
            const { id: userId } = req.user;
            const { room_password } = req.body;
            const { id: roomId } = req.params;

            const room = await RoomDAO.getRoomById(roomId);
            if (room.private && room_password !== room.room_password) {
                return createHttpError(400, 'this password is wrong');
            }

            await RoomDAO.joinRoom(roomId, userId);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async removeRoomMembers(req, res, next) {
        try {
            const { members } = req.body;
            const { id: roomId } = req.params;

            await RoomDAO.removeRoomMembers(roomId, members);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async addRoomAdmins(req, res, next) {
        try {
            const { admins } = req.body;
            const { id: roomId } = req.params;

            // check if the members exists
            for (let m in admins) {
                await UserDAO.getUserById(admins[m]);
            }

            await RoomDAO.addRoomAdmins(roomId, admins);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async removeRoomAdmins(req, res, next) {
        try {
            const { admins } = req.body;
            const { id: roomId } = req.params;

            await RoomDAO.removeRoomAdmins(roomId, admins);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async addRoomGeneras(req, res, next) {
        try {
            const { generas } = req.body;
            const { id: roomId } = req.params;

            await RoomDAO.addRoomGeneras(roomId, generas);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async removeRoomGeneras(req, res, next) {
        try {
            const { generas } = req.body;
            const { id: roomId } = req.params;

            await RoomDAO.removeRoomGeneras(roomId, generas);
            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    }

    static async searchForRooms(req, res, next) {
        try {
            const { room_name, room_id } = req.query;

            const rooms = await RoomDAO.searchForRooms(room_name, room_id);
            res.status(200).json({
                success: true,
                rooms,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = RoomControllers;
