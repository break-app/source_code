const { Router } = require('express');

const { UserController } = require('../../controllers/users/users.controller');
const validate = require('../../helpers/validationLayers/user.layer');
const auth = require('../../middlewares/auth.middleware');
const { catchValidationError } = require('../../middlewares/validationError');
const cleanCache = require('../../middlewares/cleanCache');
const router = Router();
const multer = require('multer');
const { uploadImage } = require('../../utils/firebase');

const Multer = multer({
	storage: multer.memoryStorage(),
	limits: 1024 * 1024,
});

router.route('/register').post(
	// validate('addUser'),
	Multer.single('avatar'),
	uploadImage,
	catchValidationError,
	UserController.register
);
router
	.route('/login')
	.post(validate('loginUser'), catchValidationError, UserController.login);

router.route('/delete/:id').delete(UserController.delete);

router.route('/logout').post(auth, UserController.logout);

router
	.route('/follow')
	.post(
		auth,
		(req, res, next) => cleanCache(`user_followers=${req.user.id}`, next),
		UserController.FollowSomeOne
	);

router
	.route('/unfollow')
	.post(
		auth,
		(req, res, next) => cleanCache(`user_profile=${req.user.id}`, next),
		UserController.UnfollowSomeOne
	);

router.route('/get_followers').get(auth, UserController.getFollowers);

// router.route('/add_visit').post(auth, UserController.addVisitor);

router.route('/buy_product').post(auth, UserController.buyProduct);

router.route('/send_gift').post(auth, UserController.sendGift);

router.route('/convert_currence').post(auth, UserController.convertCurrence);

router.route('/getUserProfile').get(auth, UserController.getUserProfile);

router
	.route('/updateProfile')
	.put(
		auth,
		(req, res, next) => cleanCache(`user_profile=${req.user.id}`, next),
		UserController.updateProfile
	);
router.route('/getMyProfile').get(auth, UserController.getMyProfile);

module.exports = router;
