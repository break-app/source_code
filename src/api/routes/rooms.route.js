const RoomControllers = require('../controllers/rooms.controller');
const { catchValidationError } = require('../middlewares/validationError');
const { validate } = require('../validationLayers/room.layers');

const router = require('express').Router();

router
    .route('/')
    .post(
        validate('createRoom'),
        catchValidationError,
        RoomControllers.createRoom
    );

module.exports = router;
