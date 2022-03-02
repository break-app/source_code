const ResellerCtrl = require('../../controllers/reseller/reseller.controller');

const router = require('express').Router();

router.route('/sendToClient').post(ResellerCtrl.sendToclient);
module.exports = router;
