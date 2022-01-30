const { Router } = require('express');

const { UserController } = require('../controllers/users.controller');
const auth = require('../middlewares/auth.middleware');
const router = Router();

router.route('/register').post(UserController.register);
router.route('/login').post(UserController.login);
router.route('/delete/:id').delete(UserController.delete);
router.route('/logout').post(auth, UserController.logout);
router.route('/follow').post(auth, UserController.FollowSomeOne);
router.route('/unfollow').post(auth, UserController.UnfollowSomeOne);
router.route('/get_followers').get(auth, UserController.getFollowers);
router.route('/add_visit').post(auth, UserController.addVisitor);
router.route('/buy_product').get(auth, UserController.buyProduct);
// router.route('/addFriendRequest').post(auth, UserController.addFriendRequest);
// router
// 	.route('/getFriendRequests')
// 	.get(auth, UserController.getPendingFriendRequests);
module.exports = router;
