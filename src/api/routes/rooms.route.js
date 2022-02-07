const RoomControllers = require('../controllers/rooms.controller');
const { catchValidationError } = require('../middlewares/validationError');
const { validate } = require('../helpers/validationLayers/room.layers');

const router = require('express').Router();
const auth = require('./../middlewares/auth.middleware');
const cleanCache = require('../middlewares/cleanCache');

router
    .route('/')
    .get(auth, RoomControllers.getAllRooms)
    .post(
        auth,
        validate('createRoom'),
        catchValidationError,
        cleanCache,
        RoomControllers.createRoom
    );

router.route('/search').get(RoomControllers.searchForRooms);

router
    .route('/:id')
    .get(RoomControllers.getRoomById)
    .put(
        auth,
        // validate('updateRoom'),
        catchValidationError,
        RoomControllers.updateRoomById
    )
    .delete(auth, RoomControllers.deleteRoomById);

router.route('/:id/add-members').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.addRoomMembers
);

router.route('/:id/join-member').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.joinRoom
);

router.route('/:id/remove-members').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.removeRoomMembers
);

router.route('/:id/add-admins').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.addRoomAdmins
);

router.route('/:id/remove-admins').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.removeRoomAdmins
);

router.route('/:id/add-generas').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.addRoomGeneras
);

router.route('/:id/remove-generas').put(
    auth,
    // validate('updateRoom'),
    catchValidationError,
    RoomControllers.removeRoomGeneras
);

module.exports = router;
