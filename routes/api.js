const router = require('express').Router(),
      user_controller = require('../controllers/apiUserController'),
      api_controller = require('../controllers/apiController'),
      auth = require('../auth/auth');


/* LOGIN
____________________________________*/

router.post('/users/login', auth.optional, user_controller.login_post);


/* SEGMENT ROUTES
____________________________________*/

router.post('/:segment/create', auth.required, api_controller.create_post);
router.post('/:segment/:id/edit', auth.required, api_controller.edit_post);
router.post('/:segment/:id/delete', auth.required, api_controller.delete_post);
router.get('/:segment/:id', auth.required, api_controller.view_detail);
router.get('/:segment', auth.required, api_controller.view_list);



module.exports = router;