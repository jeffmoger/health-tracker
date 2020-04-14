// Home Controller on GET.
exports.home_get = function(req, res, next) {    
    res.render('home', { title: 'Health & Fitness Log'});
};