const createHttpError = require('http-errors');
const RoomDAO = require('../../dao/rooms.dao');
class RoomControllers {
    static async createRoom(req, res, next) {
        try {
            const roomResult = await RoomDAO.createRoom(req.body);
            res.status(201).json({
                success: true,
                result: 'roomResult',
            });
        } catch (err) {
            next(err);
        }
    }
}

// exports.createRoom = asyncHandler(async (req, res, next) => {
//     try {
//         // console.log(req);
//         // catchValidationError(req, res, next);
//         const roomResult = await RoomDAO.createRoom(req.body);
//         console.log(roomResult);
//         // if (!roomResult.success) {
//         //     // return res.status(400).json({ error: roomResult.error });
//         //     return next(createHttpError(400, 'roomResult.error'));
//         // }
//         res.status(201).json({
//             success: true,
//             result: 'roomResult',
//         });
//     } catch (error) {
//         next(createHttpError(400, error.message));
//     }
// });

module.exports = RoomControllers;
