const RoomControllers = require('../controllers/rooms.controller');
const { validate } = require('../validationLayers/room.layers');

const router = require('mongoose').Router();

router.route('/').use(validate('createRoom')).post(RoomControllers.createRoom);
