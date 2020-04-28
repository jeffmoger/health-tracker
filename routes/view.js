const router = require('express').Router();
      
const user_controller = require('../controllers/userController'),
      view_controller = require('../controllers/controller'),
      verify = require('../auth/verify');

const { validate } = require('../controllers/validation.js');
const { validationRules } = require('../controllers/validationRules.js');



router.use('/:segment*', function(req, res, next) {
      res.locals.segment = req.body.segment;
      res.locals.interface = 'view'
      next();
});




/* LOGIN and USER ROUTES
____________________________________*/
router.get('/users/logout', user_controller.user_logout);

router.get('/users/create', verify, user_controller.user_create_get)
router.post('/users/create', verify, user_controller.new_user_create_post)

router.get('/users/login', user_controller.login_get);


router.post('/users/login', user_controller.login_post);

router.get('/users/:id', verify, user_controller.user_detail);
router.get('/users/:id/settings', verify, user_controller.settings_get);


      /* SEGMENT ROUTES
____________________________________*/


router.get('/:segment/create', verify, view_controller.create_get);

router.post('/:segment/create', verify, validationRules(), validate, view_controller.create_post);

router.get('/:segment/:id/edit', verify, view_controller.edit_get);
router.post('/:segment/:id/edit', verify, validationRules(), validate, view_controller.edit_post);

router.get('/:segment/:id/delete', verify, view_controller.view_delete_get);
router.post('/:segment/:id/delete', verify, view_controller.view_delete_post);

router.get('/:segment/:id', verify, view_controller.view_detail);
router.get('/:segment', verify, view_controller.view_list);



// EXPORT

module.exports = router;