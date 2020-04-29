const models = require('../models/viewModel');
const moment = require('moment');
const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight,
      Mood = models.mood;


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
    } else if (segment === 'mood') {
        return Mood;
    }
}

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

const returnAvg = (arr, divisor) => {
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
                startTime: item.startTime,
                endTime: item.endTime,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            };
        case 'weight':
            return {
                weight: item.weight,
                unit: item.unit,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            };
        case 'mood':
            return {
                mood: item.mood,
                date_formatted: item.date_formatted,
                date_of_entry: item.date_of_entry
            }
    }
}

const dateRange = (start, end, duration) => {
    if (!start) {
        start = moment().startOf('day');
        if (duration) {
            start.subtract(duration, 'days');
        }
        start.format('YYYY-MM-DD')
    }
    if (!end) {
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

//Gets data for all segments to display on home page
const fetchSegments = async (startDate, endDate, segments, reqUserID) => {
    try {
        const filter = {
            userID: reqUserID,
            date_of_entry: {
                $gt: startDate,
                $lt: endDate
            }
        }
        for (segment in segments) {
            let documents = await getDB(segment).find(filter)
            .sort([['date_of_entry', 'desc']])
            .exec()
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


// Queries mongo for data on data range and calculates averages
const generateStats = async (stats, reqUserID) => {
    try {
        const dateFilter = (days) => {
            end = moment();
            end.add( 1, 'days');
            start = moment();
            start.subtract(days, 'days');
            return {
                userID: reqUserID,
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
                        } else if (segment === 'mood') {
                            arr.push(item.mood);
                        }
                    });
                    if (arr.length) {
                        stats[segment][seg].count = returnAvg(arr, divisor);
                    }
                    
                }
            }
        }
        return stats

    } catch (err) {
        console.log(err)
    }
}




// Home Controller on GET.
exports.home_get = function(req, res, next) {

    const reqStart = req.query.start;
    const reqEnd = req.query.end;
    const reqUserID = req.user.id;
    const results = {
        date : {},
        stats: {
            exercise: {
                cal_burn: {
                    type: "average",
                    days: 7,
                    divide_by_days: false,
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
                    days: 5, 
                    divide_by_days: false, 
                    description: "Weight",
                    count:0
                }
            },
            mood: { 
                mood_avg: {
                    type: "average", 
                    days: 7, 
                    divide_by_days: false, 
                    description: "Mood",
                    count:0
                }
            }
        },
        segments: {
            exercise : [],
            nutrition : [],
            sleep : [],
            weight : [],
            mood : []
        }
    }

    async function container() {
        try {

            results.date = dateRange(reqStart, reqEnd);
            results.segments = await fetchSegments(
                results.date.start,
                results.date.end,
                results.segments,
                reqUserID
            );
            
            results.stats = await generateStats(results.stats, reqUserID);
            
            //res.json(results)
            
            res.render('home', { title: 'Health & Fitness', data: results, date: moment(results.date.start).format('MMMM Do YYYY')});
        } catch (err) {
            console.log(err)
        };       
    };
       
    container();

};

//****************************************************************************
//  View Stats
//****************************************************************************


exports.view_stats = function(req, res, next) {
    
    

    reqStart = req.query.start;
    reqEnd = req.query.end;
    reqUserID = req.user.id
    
    async function container() {
        try {
            
            let results = {
                date : {},
                segments: {
                    exercise : [],
                    nutrition : [],
                    sleep : [],
                    weight : [],
                    mood : []
                }
            }
            results.date = dateRange(reqStart, reqEnd, 15);
            results.segments = await fetchSegments(
                results.date.start,
                results.date.end,
                results.segments,
                reqUserID
            );
            results.stats = {}
            let segments = results.segments
            for (let segment in segments) {
                results.stats[segment] = {};
                if (segment === 'exercise') {
                    let exercise_type = [];
                    let minutes = [];
                    let calorie_burn = [];
                    let date_of_entry = [];
                    for (let item in segments[segment]) {
                        let aaa = segments[segment][item].exercise_type;
                        if (aaa === 'Daily') {
                            exercise_type.push(segments[segment][item].exercise_type);
                            minutes.push(segments[segment][item].minutes);
                            calorie_burn.push(segments[segment][item].calorie_burn);
                            date_of_entry.push(segments[segment][item].date_of_entry);
                        };

                    };
                    results.stats[segment].exercise_type = exercise_type;
                    results.stats[segment].minutes = minutes;
                    results.stats[segment].calorie_burn = calorie_burn;
                    results.stats[segment].date_of_entry = date_of_entry;
                } else if (segment === 'nutrition') {
                    let calories = [];
                    let protein = [];
                    let carbs = [];
                    let fat = [];
                    let date_of_entry = [];
                    for (let item in segments[segment]) {
                        calories.push(segments[segment][item].calories);
                        protein.push(segments[segment][item].protein);
                        carbs.push(segments[segment][item].carbs);
                        fat.push(segments[segment][item].fat);
                        date_of_entry.push(`'${moment(segments[segment][item].date_of_entry).format('MM-DD')}'`);
                    };
                    results.stats[segment].calories = calories;
                    results.stats[segment].protein = protein;
                    results.stats[segment].carbs = carbs;
                    results.stats[segment].fat = fat;
                    results.stats[segment].date_of_entry = date_of_entry;
                } else if (segment === 'sleep') {
                    let hours = [];
                    let startTime = [];
                    let endTime = [];
                    let date_of_entry = [];
                    for (let item in segments[segment]) {
                        hours.push(segments[segment][item].hours);
                        startTime.push(segments[segment][item].startTime);
                        endTime.push(segments[segment][item].endTime);
                        date_of_entry.push(segments[segment][item].date_of_entry);
                    };
                    results.stats[segment].hours = hours;
                    results.stats[segment].startTime = startTime;
                    results.stats[segment].endTime = endTime;
                    results.stats[segment].date_of_entry = date_of_entry;
                } else if (segment === 'weight') {
                    let weight = [];
                    let date_of_entry = [];
                    for (let item in segments[segment]) {
                        weight.push(segments[segment][item].weight);
                        date_of_entry.push(segments[segment][item].date_of_entry);
                    };
                    results.stats[segment].weight = weight;
                    results.stats[segment].date_of_entry = date_of_entry;
                } else if (segment === 'mood') {
                    let mood = [];
                    let date_of_entry = [];
                    for (let item in segments[segment]) {
                        mood.push(segments[segment][item].mood);
                        date_of_entry.push(segments[segment][item].date_of_entry);
                    }
                }
            }



            res.render('stats', { title: 'My Stats', data: results, date: moment(results.date.start).format('MMMM Do YYYY')});
            //res.json(results.stats)
            
        } catch (err) {
            console.log(err)
        };       
    };

    container();
    
  };