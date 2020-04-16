require('dotenv').config();
const createError = require('http-errors'),
      express = require('express'),
      path = require('path'),
      logger = require('morgan'),
      //bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      mongoose = require('mongoose');

const indexRouter = require('./routes/index'),
      viewRouter = require('./routes/view');
      apiRouter = require('./routes/api');


const app = express();
mongoose.set('toJSON', { getters: true, virtuals: true, versionKey: false });
mongoose.set('toObject', { getters: true, virtuals: true, versionKey: false });


isAuthenticated = false;

//Set up mongoose connection
const mongoDB = process.env.MONGODB;
mongoose.connect(mongoDB, { 
  useNewUrlParser: true,
  useUnifiedTopology: true, 
  useCreateIndex: true,
  useFindAndModify: false
 });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Use Routes
app.use('/', indexRouter);
app.use('/view', viewRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
