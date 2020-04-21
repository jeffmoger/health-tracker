const passport = require('passport');
const Users = require('../models/userModel');
const { body, check } = require('express-validator');

require('../auth/passport')

// determine if API or View
const getSegment = path => {
    type = path.split('/')[1];
    section = path.split('/')[2];
    return [type, section]
}


//USER_CREATE_GET: Create New User form on GET
exports.user_create_get = function(req, res, next) {
    res.render('user_create', { title: 'Create New User', method: 'GET'});
};


//NEW_USER_VIEW: POST new user
exports.new_user_create_post = [
  
  //Validate and Sanitize
  body('first_name').isLength({ min: 1 }).trim().withMessage('First Name is required.')
  .isAlphanumeric().withMessage('First Name has non-alphanumeric characters.'),
  body('family_name').isLength({ min: 1 }).trim().withMessage('Family Name is required.')
  .isAlphanumeric().withMessage('Family Name has non-alphanumeric characters.'),
  body('email').isLength({ min: 1 }).trim().withMessage('Email is required.')
  .isAlphanumeric().withMessage('Email has non-alphanumeric characters.'),
  body('password').isLength({ min: 1 }).trim().withMessage('Password is required.'),
  body('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  check('first_name').escape(),
  check('family_name').escape(),
  check('email').escape(),
  check('password').escape(),
  check('date_of_birth').toDate(),
  (req, res, next) => {
    const user = new Users({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      email: req.body.email,
      password: req.body.password,
      date_of_birth: req.body.date_of_birth
    });
    const finalUser = new Users(user);
    finalUser.setPassword(req.body.password);
    finalUser.save(function (err) {
      if (err) { return next(err); }
      
      res.redirect(user.url);
    });
  }
];





// USER_DETAIL: Display Details for user
exports.user_detail = function(req, res, next) {
  segment = getSegment(req._parsedOriginalUrl.path);
  db = Users;
  db.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { return next(err); }
        console.log(result)
        res.render('user_detail', { title: 'User Entry', item: result, section: `${segment[1]}`});
    });
};


//LOGIN_GET: Login form on GET
exports.login_get = function(req, res, next) {
  res.render('login_form', { title: 'Login', method: 'GET', page: 'login'});
};


//LOGIN_POST: POST login route 
exports.login_post = [
  
  //Validate and Sanitize
  body('email').isLength({ min: 1 }).trim().withMessage('Email is required.'),
  body('password').isLength({ min: 1 }).trim().withMessage('Password Name is required.'),
  check('email').escape(),
  check('password').escape(),
  (req, res, next) => {
    
    //const { body: { user } } = req;

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if(err || !passportUser) {
        return res.status(400).json({
          message: 'Something is not right',
          user   : passportUser
        });
      } else {
        
        const user = passportUser;
        user.token = passportUser.generateJWT();
        //set cookie expiry date (allow 14 day)
        let d = new Date();
        d.setDate(d.getDate() + 14);

        res.cookie('token', user.token, { 
            path: '/',
            expires: d,
            httpOnly: true,
            secure: true
          });

          res.cookie('name', user.first_name, {
            path: '/',
            expires: d,
          })

          //res.redirect('/view/users/'+user.id+'/settings');
          res.redirect('/')
        
      }
      //return status(400).info;
    })(req, res, next);
  }
]

// LOGOUT
exports.user_logout = function(req, res, next) {
  //remove cookies
  let d = new Date();
  d.setDate(d.getDate() - 1);
  res.cookie('token', '', {expires: d});
  res.cookie('name', '', {expires: d})
  res.redirect('/');
};


// SETTINGS_GET: Success and Settings Page for login
exports.settings_get = function(req, res, next) {
  res.render('login_settings', { title: 'Success'});
};


