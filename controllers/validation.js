const { body, validationResult } = require('express-validator');

const validationRules = function(segment) {
  switch(segment) {
      case 'exercise':
          return [
              body('exercise_type', 'Describe your activity').isLength({ min: 1 }).escape(),
              body('minutes').isNumeric().withMessage('Minutes must be a number'),
              body('calorie_burn').isNumeric().withMessage('Calories Burned must be a number'),
              body('notes').optional({ checkFalsy: true }).escape()
          ]
      case 'nutrition':
          return [
              body('calories').isNumeric().withMessage('Calories must be a number'),
              body('protein').isNumeric().withMessage('Protein must be a number'),
              body('carbs').isNumeric().withMessage('Carbs must be a number'),
              body('fat').isNumeric().withMessage('Fat must be a number'),
              body('notes').optional({ checkFalsy: true }).escape()
          ]
      case 'sleep':
          return [
              body('hours').isNumeric().withMessage('Hours must be a number'),
              body('notes').optional({ checkFalsy: true }).escape()
          ]
      case 'weight':
          return [
              body('weight').isNumeric().withMessage('must be numeric'),
              body('notes').optional({ checkFalsy: true }).escape()
          ]
      default:
        break
      }
}

const validate = (req, res, next) => {
 
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  //return res.status(422).json({
  //  errors: extractedErrors,
  //})
  console.log(extractedErrors);
  return res.render('view_form', { title: `Create ${req.body.segment} record`, section: req.body.segment, userID: req.user.id, errorObj: extractedErrors})


}

module.exports = {
  validate,
  validationRules
}
