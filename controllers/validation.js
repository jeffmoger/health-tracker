const { body, validationResult } = require('express-validator');

const { allFields } = require('../controllers/validationMsg.js')

const validate = (req, res, next) => {
  const interface = res.locals.interface;
  const segment = res.locals.segment;
  console.log(interface)

  const fields = Object.entries(allFields[segment])

  
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []

  errors.array().map(err => extractedErrors.push({
    [err.param]: err.msg }));
    const errorList = []
    for (i=0; i < extractedErrors.length; i++) {
      errorItem = Object.keys(extractedErrors[i]);
      for ( j=0; j < fields.length; j++ ) {
        if ( errorItem[0] === fields[j][0] ) {
          errorList.push(errorItem[0],fields[j][1])
        }
      }
    }
    if (errorList.length<1) {
      console.log('Validation passed')
      next()

    } else {
      console.log(errorList)
      if (interface === 'api') {
        return res.status(422).json({
          errors: errorList,
        })
      } else {
        return res.render('view_form', { title: `Create ${req.body.segment} record`, section: req.body.segment, userID: req.user.id, errorList: errorList})
        
      }
    }




  
  


}

module.exports = {
  validate
}
