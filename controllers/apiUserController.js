//const mongoose = require('mongoose');
const passport = require('passport');
const Users = require('../models/userModel');
//const async = require('async');
const { body, check } = require('express-validator');

require('../auth/passport')


// determine if API or View
const getSegment = path => {
    type = path.split('/')[1];
    section = path.split('/')[2];
    return [type, section]
}


//POST login route API
exports.login_post = function(req, res, next) {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err || !passportUser) {
      return res.status(400).json({
        message: 'Something is not right',
        user   : passportUser
      });
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
};





//POST new user route for API
exports.new_user_api_post = function(req, res, next) {
  segment = getSegment(req._parsedOriginalUrl.path);
  const { body: {user } } = req;      

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }
  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }
  console.log(user)
  const finalUser = new Users(user);
  finalUser.setPassword(user.password);
  return finalUser.save()
  .then(() => res.json({ user: finalUser.toAuthJSON() }));
};

//POST new user route for VIEW
exports.new_user_view_post = [
  
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

// Display Detail
exports.user_detail = function(req, res, next) {
  segment = getSegment(req._parsedOriginalUrl.path);
  db = Users;
  db.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { return next(err); }
      if (segment[0] === 'view') {
          console.log(result)
          res.render('user_detail', { title: 'User Entry', item: result, section: `${segment[1]}`});
      } else if (segment[0] === 'api') {
          res.send(result);
      }
    });
};


//POST login route VIEW
exports.login_view_post = [
  
  //Validate and Sanitize
  body('email').isLength({ min: 1 }).trim().withMessage('Email is required.'),
  body('password').isLength({ min: 1 }).trim().withMessage('Password Name is required.'),
  check('email').escape(),
  check('password').escape(),
  (req, res, next) => {
    
    const { body: { user } } = req;
    console.log(user)


    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
      if(err || !passportUser) {
        return res.status(400).json({
          message: 'Something is not right',
          user   : passportUser
        });
      } else {
        
        const user = passportUser;
        user.token = passportUser.generateJWT();
        //set cookie expiry date (allow 1 day)
        let d = new Date();
        d.setDate(d.getDate() + 1);

        res.cookie('token', user.token, { 
            path: '/',
            expires: d,
            httpOnly: true,
            secure: true
          });

          res.cookie('name', user.first_name, {
            path: '/'
          })

          res.redirect('/view/users/'+user.id+'/settings');
        
      }
      //return status(400).info;
    })(req, res, next);
  }
]





//GET current route (required, only authenticated users have access)
exports.current_route_get = function(req, res, next){

  const { payload: { id } } = req;
    return Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }
  
        return res.json({ user: user.toAuthJSON() });
      });
  };