const { body } = require('express-validator');

const validationRules = function() {
    return [
        body('exercise_type').isLength({ min: 1 }).escape(),
        body('minutes').isNumeric(),
        body('calorie_burn').isNumeric(),
        body('calories').isNumeric(),
        body('protein').isNumeric(),
        body('carbs').isNumeric(),
        body('fat').isNumeric(),
        body('weight').isNumeric(),
        body('notes').optional({ checkFalsy: true }).escape()
    ]
}

module.exports = { validationRules }