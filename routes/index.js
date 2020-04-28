const router = require('express').Router();
const home_controller = require('../controllers/homeController');
const verify = require('../auth/verify')


// GET home page.
router.get('/', verify, home_controller.home_get);

// GET stats page.
router.get('/stats', verify, home_controller.view_stats);

module.exports = router;
