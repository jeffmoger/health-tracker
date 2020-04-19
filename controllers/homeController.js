const models = require('../models/viewModel');
const moment = require('moment');

const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight;


// Home Controller on GET.
exports.home_get = function(req, res, next) {    
    
    //Calculate number of days between two dates, and generate an array of date
    const dateArray = (start, end) => {
        const date = dateRange(start, end)
        const diff = date.end.getTime() - date.start.getTime()

        startDate = moment(date.start);
        date.days = diff / (1000*60*60*24)

        date.myarray = [];
        for (i=0; i < date.days; i++) {
            date.myarray.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'days')
        }
        return date.myarray
    }

    let resultList = {
        exercise : [],
        nutrition : [],
        sleep : [],
        weight : []
    }

    const dateRange = () => {
        let start
        let end
        if (!req.params.start) {
            start = moment().format('YYYY-MM-DD')
        }
        if (!req.params.end) {
            end = moment()
            end.add(1, 'days')
            end.format('YYYY-MM-DD')
        }
        start = moment(start).toDate();
        end = moment(end).toDate();
        
        return {
            start,
            end
        }
    }
    
    async function fetchData(resultList) {

        const date = dateRange()
        const filter = {
            userID: req.user.id,
            date_of_entry: { $gt: date.start, $lt: date.end }
        }
        const exercise = await Exercise.find(filter).exec()
        const nutrition = await Nutrition.find(filter).exec()
        const sleep = await Sleep.find(filter).exec()
        const weight = await Weight.find(filter).exec()
    
        exercise.forEach((item) => {
            const entry = {
                exercise_type: item.exercise_type,
                minutes: item.minutes,
                calorie_burn: item.calorie_burn,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            }
            resultList.exercise.push(entry);
        });
        nutrition.forEach((item) => {
            const entry = {
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            }
            resultList.nutrition.push(entry);
        });
        sleep.forEach((item) => {
            const entry = {
                hours: item.hours,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            }
            resultList.sleep.push(entry);
        });
        weight.forEach((item) => {
            const entry = {
                weight: item.weight,
                unit: item.unit,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            }
            resultList.weight.push(entry);
        })
    }
    
    async function container() {
        try {
            await fetchData(resultList);
            //res.json(resultList)
            res.render('home', { title: 'Health & Fitness Log', data: resultList});
        } catch (err) {
            console.log(err)
        };       
    };
    
    container()

};