const { Router } = require('express');
const SearchCtrl = require('../controllers/search.controller');

const router = Router();

router.route('/general').get(SearchCtrl.general_search);

module.exports = router;
