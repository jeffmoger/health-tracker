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
        date : [],
        calorie_avg : [],
        exercise : [],
        nutrition : [],
        sleep : [],
        weight : []
    }

    const dateRange = () => {
        let start = req.query.start
        let end = req.query.end
        if (!req.query.start) {
            start = moment().format('YYYY-MM-DD')
        }
        if (!req.query.end) {
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

    const calorieAvg = async days => {

        try {
            end = moment();
            await end.add( 1, 'days');
            
            start = moment();
            await start.subtract(days, 'days');
    
            const calorieList = [];
            const filter = {
                userID: req.user.id,
                date_of_entry: {
                    $gt: start,
                    $lt: end
                }
            };
            const nutrition = await Nutrition.find(filter).exec()
            nutrition.forEach((item) => {
                calorieList.push(item.calories)
            });

            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            const sum = calorieList.reduce(reducer);
            const divisor = calorieList.length
            if (divisor>0) {
                avg = sum/divisor;
                return Math.round(avg)
            } else {
                return 0
            }

        } catch (err) {
            console.log(err)
        }
    }
    



    async function fetchData(resultList) {

        resultList.date = dateRange();
        const filter = {
            userID: req.user.id,
            date_of_entry: {
                $gt: resultList.date.start,
                $lt: resultList.date.end
            }
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
            resultList.calorie_avg.push(await calorieAvg(7))
            //res.json(resultList)
            res.render('home', { title: 'Health & Fitness', data: resultList, date: moment(resultList.date.start).format('MMMM Do YYYY')});
        } catch (err) {
            console.log(err)
        };       
    };
    

    
    container();

};