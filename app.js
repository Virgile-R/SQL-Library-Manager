var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sequelize = require('./models').sequelize
var indexRouter = require('./routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
   next(createError(404, 'Page not found'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message || "Something went wrong...";
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page  
  res.status(err.status || 500);
  if (res.statusCode === 404){
    res.render("page-not-found", {err})
  } else {
    console.error(err.status + ': ' + err.message)
    res.render('error', {err});
}
});
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database present, syncing...');
    await sequelize.sync()
    console.log('database synced')
  } catch (error){  
    console.error('An error occured' + error)
  }
})();
module.exports = app;
