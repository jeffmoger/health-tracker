const models = require('../models/apiModels');

const Exercise = models.exercise,
      Nutrition = models.nutrition,
      Sleep = models.sleep,
      Weight = models.weight;



//Date - Use 0 for current date. Add days with d for cookies
const newDate = (d) => {
    let date = new Date();
    return date.setDate(date.getDate() + d);
}


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

// Display list
exports.view_list = function(req, res, next) {  
    db = getDB(req.params.segment);
    db.find({userID: req.payload.id})
    .sort([['date_of_entry', 'desc']])
    .exec(function (err, items) {
        if (err) throw err;
        const returnList = {
            section: req.params.segment,
            items
        }
        
        return res.json(returnList);
      });
  };


// Display Detail
exports.view_detail = function(req, res, next) {

    db = getDB(req.params.segment);
    db.findById(req.params.id)
      .exec(function (err, item) {
        if (err) { return next(err); }
        
        const returnItem = {
            section: req.params.segment,
            item
        }
        return res.json(returnItem);
      });
  };


// Handle item delete on POST.
exports.delete_post = function(req, res, next) {
    db = getDB(req.params.segment);
    db.findById(req.params.id)
    .exec(function (err, result) {
      if (err) { return next(err); }
      //success
      if (result==null) { // No results.
          var err = new Error('Item not found');
          err.status = 404;
          return next(err);
        } else {
            db.findByIdAndDelete(req.params.id, function deleteRecord(err) {
                if (err) { return next(err); }
                deletedItem = req.params,id;
                res.json({
                    deletedItem
                });

            })
        }
    })
};

// Create new item on POST
exports.create_post = async function(req, res, next) {
   
    const getRequest = async () => {
        let item
        //const item = req.body
        if (!req.body.item ) {
            item = req.query;
        } else {
            item = req.body.item;
        }
        
        const userID = req.payload.id;
        const segment = req.params.segment;

        item.userID = userID;
        const newItem = {
            segment,
            item
        };

        return newItem;
    }

    const saveRequest = async (newItem) => {

        const Segment = getDB(newItem.segment);
        const item = new Segment(newItem.item);
        item.save(function (err) {
            if (err) { return next(err); }
        });
        return item;
    }
    
    const returnSavedRequest = async () => {
        try {
            item = await getRequest()
            item = await saveRequest(item);
            res.json(item);
            console.log('done')
        } 
        catch (err) {
            res.json('error', err);
        }
    }
    
returnSavedRequest();
}

// Edit form on POST.
exports.edit_post = function(req, res, next) {       
    let item
    if (!req.body.item ) {
        item = req.query;
    } else {
        item = req.body.item;
    }
    
    const segment = req.params.segment;
    db = getDB(segment);
    const saveRequest = async () => {
        try {
            const filter = { _id: req.params.id };
            let updated = await db.findByIdAndUpdate(filter,item, {new: true});
            console.log(updated)
            res.json(updated)
        } catch (err) {
            console.log(err);
        }
    }

    saveRequest();

};
