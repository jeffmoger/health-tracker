const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')


const BaseSchema = (add, segment) => {
  var schema = new Schema({
    date_of_entry: {type: Date, default: Date.now, required: true},
    userID: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    notes: {type: String},
    createdAt: Number,
    updatedAt: Number
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000)}
  });

  if(add) {
    schema.add(add);
  }
  if(segment) {
    schema.virtual('url').get(function () {
      return `/view/${segment}/${this._id}`
    })
  }


  schema.virtual('date_formatted').get(function () {
      return moment(this.date_of_entry).format('LL');
  })


  return schema;
}

const exerciseSchema = BaseSchema(
  {
    minutes: {type: Number, required: true},
    calorie_burn: {type: Number, required: true},
    exercise_type: {type: String}
    },'exercise'
);


const nutritionSchema = BaseSchema(
  {
    calories: {type: Number, required: true},
    fat: {type: Number},
    protein: {type: Number},
    carbs: {type: Number}
    },'nutrition'
);

const sleepSchema = BaseSchema(
  {
    hours: {type: String},
    minutes: {type: Number},
    startTime: {type: Date},
    endTime: {type: Date}
    },'sleep'
);

const weightSchema = BaseSchema(
  {
    weight: {type: Number, required: true},
    unit: {type: String}
    },'weight'
);


//Export models
exports.exercise = mongoose.model('viewExercise', exerciseSchema, 'exercise');
exports.nutrition = mongoose.model('viewNutrition', nutritionSchema, 'nutrition');
exports.sleep = mongoose.model('viewSleep', sleepSchema, 'sleep');
exports.weight = mongoose.model('viewWeight', weightSchema, 'weight');