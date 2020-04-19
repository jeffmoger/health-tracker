const models = require('../models/viewModel');

const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight;



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
    }
}

// Display list
exports.view_list = function(req, res, next) {
   
    segment = req.params.segment;
    db = getDB(segment);
    db.find({userID: req.user.id})
    .sort([['date_of_entry', 'desc']])
    .exec(function (err, result) {
        if (err) throw err;
        res.render('view_list', { title: `${capitalize(segment)} Entries:`, view_list: result, section: `${segment}`});
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
        res.render('view_delete', { title: `Delete ${capitalize(segment)} Entry:`, item: result, section: `${segment}`});
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
    res.render('view_form', { title: `Create ${capitalize(segment)} record`, section: segment, userID: req.user.id});
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
        res.render('view_form_edit', { title: `${capitalize(segment)} Entry:`, item: result, section: `${segment}`});
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



