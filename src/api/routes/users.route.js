const { Router } = require('express');

const UserCtrl = require('../controllers/users.controller');

const router = Router();

router.route('/register').post(UserCtrl.register);
router.route('/login').post(UserCtrl.login);
router.route('/delete/:email').delete(UserCtrl.delete);
router.route('/logout').post(UserCtrl.logout);
router.route('/addFriendRequest').post(UserCtrl.addFriendRequest);
router.route('/getFriendRequests').get(UserCtrl.getPendingFriendRequests);
module.exports = router;
