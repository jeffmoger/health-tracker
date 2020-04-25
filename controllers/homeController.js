const models = require('../models/viewModel');
const moment = require('moment');
const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight;


//Return appropriate model schema
const getDB = segment => {
    if (segment === 'exercise') {
        return Exercise;
    } else if (segment === 'nutrition') {
        return Nutrition;
    } else if (segment === 'sleep') {
        return Sleep;
    } else if (segment === 'weight') {
        return Weight;
    }
}


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

    const returnAvg = (arr,divisor) => {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        const sum = arr.reduce(reducer);
        if (!divisor) {
            divisor = arr.length;
        }
        if (divisor>0) {
            avg = sum/divisor;
            avg1 = Math.round(avg*10)
            return avg1/10
        } else {
            return 0
        }
    }

    const dateRange = () => {
        let start = req.query.start
        let end = req.query.end
        if (!req.query.start) {
            start = moment().format('YYYY-MM-DD')
        }
        if (!req.query.end) {
            end = moment().startOf('day')
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

    const generateStats = async (stats) => {
        try {
            const dateFilter = (days) => {
                end = moment();
                end.add( 1, 'days');
                start = moment();
                start.subtract(days, 'days');
                return {
                    userID: req.user.id,
                    date_of_entry: {
                        $gt: start,
                        $lt: end
                    }
                };
            }
            
            for (let segment in stats) {
                for (let seg in stats[segment]) {
                    if (stats[segment][seg].type === 'average') {
                        let arr = [];
                        let daysNum = stats[segment][seg].days
                        let divisor
                        if (stats[segment][seg].divide_by_days === true) {
                            divisor = daysNum
                        };
                        let documents = await getDB(segment).find(dateFilter(daysNum)).exec()
                        documents.forEach((item) => {
                            entry = returnFields(segment, item)
                            if (segment === 'exercise') {
                                arr.push(item.calorie_burn);
                            } else if (segment === 'nutrition') {
                                arr.push(item.calories);
                            } else if (segment === 'sleep') {
                                arr.push(item.hours);
                            } else if (segment === 'weight') {
                                arr.push(item.weight);
                            }
                        });
                        stats[segment][seg].count = returnAvg(arr, divisor);
                    }
                }
            }
            return stats

        } catch (err) {
            console.log(err)
        }
    }
    

    const returnFields = (segment, item) => {
        switch(segment) {
            case 'exercise':
                return {
                    exercise_type: item.exercise_type,
                    minutes: item.minutes,
                    calorie_burn: item.calorie_burn,
                    date_formatted: item.date_formatted,
                    date_of_entry: item.date_of_entry
                };
            case 'nutrition':
                return {
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat,
                    date_formatted: item.date_formatted,
                    date_of_entry: item.date_of_entry
                };
            case 'sleep':
                return {
                    hours: item.hours,
                    date_formatted: item.date_formatted,
                    date_of_entry: item.date_of_entry
                };
            case 'weight':
                return {
                    weight: item.weight,
                    unit: item.unit,
                    date_formatted: item.date_formatted,
                    date_of_entry: item.date_of_entry
                }
        }
    }


    const fetchSegments = async (startDate, endDate, segments) => {
        try {
            const filter = {
                userID: req.user.id,
                date_of_entry: {
                    $gt: startDate,
                    $lt: endDate
                }
            }
            for (segment in segments) {
                let documents = await getDB(segment).find(filter).exec()
                documents.forEach((item) => {
                    entry = returnFields(segment, item)
                    segments[segment].push(entry);
                });
            }
            return segments;

        } catch(err) {
            console.log(err)
        }
    }
    
    async function container() {
        try {
            //get container
            const results = {
                date : {},
                stats: {
                    exercise: {
                        cal_burn: {
                            type: "average",
                            days: 7,
                            divide_by_days: true,
                            description: "Average calories burned",
                            count:0
                        }
                    },
                    nutrition: { 
                        cal_in: {
                            type: "average",
                            days: 7,
                            divide_by_days: false,
                            description: "Average calories consumed",
                            count:0
                        }
                    },
                    sleep: { 
                        sleep_avg: {
                            type: "average", 
                            days: 4,
                            divide_by_days: true, 
                            description: "Daily sleep average",
                            count:0
                        }
                    },
                    weight: { 
                        weight_avg: {
                            type: "average", 
                            days: 3, 
                            divide_by_days: false, 
                            description: "Weight",
                            count:0
                        }
                    }
                },
                segments: {
                    exercise : [],
                    nutrition : [],
                    sleep : [],
                    weight : []
                }
            }
            
            //get dates
            results.date = dateRange();
            //get data
            
            await fetchSegments(
                results.date.start,
                results.date.end,
                results.segments
            );
            
            //get stats for weekly averages
            await generateStats(results.stats);
            
            //res.json(results)
            
            res.render('home', { title: 'Health & Fitness', data: results, date: moment(results.date.start).format('MMMM Do YYYY')});
        } catch (err) {
            console.log(err)
        };       
    };
       
    container();

};