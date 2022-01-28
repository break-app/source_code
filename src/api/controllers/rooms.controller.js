const RoomDAO = require('../../dao/rooms.dao');
const asyncHandler = require('../middlewares/asyncHandler');
class RoomControllers {
    static async createRoom() {
        return asyncHandler((req, res) => {
            const roomResult = await RoomDAO.createRoom(req.body);
            if (!roomResult.success) {
                res.status(400).json({ error: roomResult.error });
                return;
            }
            res.status(201).json({
                success: true,
                result: roomResult,
            });
        });
    }
}

module.exports = RoomControllers;
