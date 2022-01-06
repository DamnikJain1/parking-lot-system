const express = require('express');
const path = require('path');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');

// Loads the configuration from config.env to process.env
require("dotenv").config({ path: "./.env" });

const PORT = process.env.PORT || 5000

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var parkingSlotsRouter = require('./routes/parkingslots')

var app = express();

app.use(session({
  secret: 'secretkey@123',
  resave: true,
  saveUninitialized: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/parking/slot', parkingSlotsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Server Error');
});


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
