const router = require('express').Router(),
      user_controller = require('../controllers/apiUserController'),
      api_controller = require('../controllers/apiController'),
      auth = require('../auth/auth'),
      { validate } = require('../controllers/validation.js'),
      { validationRules } = require('../controllers/validationRules.js');



router.use('/:segment*', function(req, res, next) {
    res.locals.segment = req.params.segment;
    res.locals.interface = 'api'
    next();
});


/* LOGIN
____________________________________*/

router.post('/users/login', auth.optional, user_controller.login_post);


/* SEGMENT ROUTES
____________________________________*/

router.post('/:segment/create', auth.required, validationRules(), validate, api_controller.create_post);
router.post('/:segment/:id/edit', auth.required, api_controller.edit_post);
router.post('/:segment/:id/delete', auth.required, api_controller.delete_post);
router.get('/:segment/:id', auth.required, api_controller.view_detail);
router.get('/:segment', auth.required, api_controller.view_list);



module.exports = router;