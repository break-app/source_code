const ResellerCtrl = require('../../controllers/reseller/reseller.controller');
const auth = require('../../middlewares/auth.middleware');
const router = require('express').Router();

router.route('/sendToClient').put(auth, ResellerCtrl.sendToclient);
module.exports = router;
