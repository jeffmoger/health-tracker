const models = require('../models/viewModel');
const moment = require('moment');

const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight;
      Mood = models.mood;


// determine if API or View
const getSegment = path => {
    type = path.split('/')[1];
    section = path.split('/')[2];
    return [type, section]
}

const newDate = (d) => {
    let date = new Date();
    return date.setDate(date.getDate() + d);
}

//This ensures a time is included when using date picker.
//Important because we're saving dates in UTC.
const dateWithTime = date => {
    timeNow = new Date().toTimeString();
    return new Date(date + ' ' + timeNow);
}


//Capitalize section for titles
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

//Return appropriate model schema
const getDB = section => {
    if (section === 'exercise') {
        return Exercise;
    } else if (section === 'nutrition') {
        return Nutrition;
    } else if (section === 'sleep') {
        return Sleep;
    } else if (section === 'weight') {
        return Weight;
    } else if (section === 'mood') {
        return Mood;
    } 
}

// Functions for parsing sleep time
function splitTime(time) {
    let t = time.split(":");
    return t
}
function parseTime(endTime, startTime, date) {
    const newEndTime = moment(date).hour(splitTime(endTime)[0]).minutes(splitTime(endTime)[1]);
    const newStartTime = moment(date).hour(splitTime(startTime)[0]).minutes(splitTime(startTime)[1]);
    if ( newStartTime.isAfter(newEndTime)) {
        newStartTime.subtract(1, 'days');               
    }
    return [newEndTime, newStartTime]
}
function getHours(endTime, startTime) {
    let mins = Math.round(Math.abs(endTime - startTime) /1000/60);
    let remainder = mins % 60;
    let hours = (mins-remainder)/60;
    return hours + Math.round(remainder/60*10)/10
}

function getMinutes(endTime, startTime) {
    return Math.round(Math.abs(endTime - startTime) /1000/60)
}

function formatMinutes(minutes){
    let remainder = minutes % 60;
    let hours = (minutes - remainder /60)
    return `${hours} hrs ${remainder} mins`
}


// Display list
exports.view_list = function(req, res, next) {
   
    segment = req.params.segment;
    db = getDB(segment);
    db.find({userID: req.user.id})
    .sort([['date_of_entry', 'desc']])
    .exec(function (err, result) {
        if (err) throw err;
        res.render('view_list', { title: `${capitalize(segment)}`, view_list: result, section: `${segment}`});
      });
  };


// Display Detail
exports.view_detail = function(req, res, next) {
    
    segment = req.params.segment;
    db = getDB(segment);
    db.findById(req.params.id)
      .exec(function (err, result) {
        if (err) { return next(err); }
        res.render('view_detail', { title: `${capitalize(segment)} Entry:`, item: result, section: `${segment}`});
      });
  };


// GET page to delete selected item
exports.view_delete_get = (req, res, next) => {

    segment = req.params.segment;
    db = getDB(segment);
    db.findById(req.params.id)
      .exec(function (err, result) {
        if (err) { return next(err); }
        res.render('view_delete', { title: `Delete Entry:`, item: result, section: `${segment}`});
      });
  };


// Handle item delete on POST.
exports.view_delete_post = function(req, res, next) {
    segment = req.params.segment;
    db = getDB(segment);
    db.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { return next(err); }
      if (result==null) {
          var err = new Error('Item not found');
          err.status = 404;
          return next(err);
        } else {
            db.findByIdAndRemove(req.body.itemid, function deleteRecord(err) {
                if (err) { return next(err); }
                res.redirect('/view/' + segment);
            });
        };
    });
};

// Create form on GET.
exports.create_get = function(req, res, next) {       
    segment = req.params.segment
    todayDate = moment().format('YYYY-MM-DD');
    res.render('view_form', { title: `${capitalize(segment)}`, section: segment, userID: req.user.id, todayDate: todayDate});
};


// Create form on POST.
exports.create_post = function(req, res, next) {
    const getRequest = () => {
        const segment = req.body.segment;
        const item = req.body;
        
        if (!item.date_of_entry) {
            item.date_of_entry = new Date(Date.now());
        }
        if (item.date_of_entry.length === 10) {
            item.date_of_entry = dateWithTime(item.date_of_entry);
        }

        if (item.endTime) {
            let sleepTime = parseTime(item.endTime, item.startTime, item.date_of_entry);
            item.hours = getHours(sleepTime[0], sleepTime[1]);
            item.minutes = getMinutes(sleepTime[0], sleepTime[1]);
            item.endTime = sleepTime[0];
            item.startTime = sleepTime[1];
        }





        const newItem = {
            segment,
            item
        };
        return newItem;
    };

    const saveRequest = (newItem) => {
        const Segment = getDB(newItem.segment);
        const item = new Segment(newItem.item);
        item.save(function (err) {
            if (err) { 
                return next(err); 
            }
            res.redirect(item.url)
        });
    };


saveRequest(getRequest());

};



// Edit Detail
exports.edit_get = function(req, res, next) {
    segment = req.params.segment;
    db = getDB(segment);
    
    db.findById(req.params.id)
      .exec(function (err, result) {
        if (err) { return next(err); }
        startTime = moment(result.startTime).format('HH:mm');
        endTime = moment(result.endTime).format('HH:mm');
        date_of_entry = moment(result.date_of_entry).format('YYYY-MM-DD');
        console.log(result)
        
        res.render('view_form_edit', { title: `${capitalize(segment)} Entry:`, item: result, section: `${segment}`, startTime: startTime, endTime: endTime, date_of_entry: date_of_entry });
      });
  };



// Edit form on POST.
exports.edit_post = function(req, res, next) {       
    const segment = req.params.segment
    console.log(req.body.date_of_entry);
    if (!req.body.date_of_entry) {
        req.body.date_of_entry = new Date(Date.now());
    }
    if (req.body.date_of_entry.length === 10) {
        req.body.date_of_entry = dateWithTime(req.body.date_of_entry);
    }
    
    console.log(req.body.date_of_entry);
    
    if (req.body.endTime) {
        let sleepTime = parseTime(req.body.endTime, req.body.startTime, req.body.date_of_entry);
        req.body.hours = getHours(sleepTime[0], sleepTime[1]);
        req.body.minutes = getMinutes(sleepTime[0], sleepTime[1]);
        req.body.endTime = sleepTime[0];
        req.body.startTime = sleepTime[1];
    }


    const db = getDB(segment);
    const saveRequest = async () => {
        try {
            const filter = { _id: req.params.id };
            const update = req.body;
            let updated = await db.findByIdAndUpdate(filter,update, {new: true});
            res.redirect(updated.url)
        } catch (err) {
            console.log(err);
        }
    }

    saveRequest();

};



