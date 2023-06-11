const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const globalErrorHandler = require('./controller/errorController');
const appError = require('./utils/appError');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const tourRouter = require('./router/tourRoute');
const userRouter = require('./router/userRoutes');
const reviewRouter = require('./router/reviewRoutes');
const viewRouter = require('./router/viewRouter');
const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug'); // defined views engine
app.set('views', path.join(__dirname, 'views')); // allocate where the #"--views--"# is actually located in file system

// global middleware
// serving static file
app.use(express.static(path.join(__dirname, './public'))); // serving static files which means all the static files will be loaded from this file


// set security http headers
app.use(helmet());
  

// development login
if (process.env === 'development') {
  app.use(morgan('dev'));
}

//setting limit on IP address
const limiter = rateLimit({
  max: 100, //how many request we allow per hour
  windowMS: 60 * 60 * 100, // windowMILISECOND
  message: 'too many requirest from same IP Address',
});
// the limiter ditermines that in one hour we can request certain data only 100 times and in another hour it reset again
// just to prevent form hackers

app.use('/api', limiter);

// if the file is greater then 10kb then i will not be accepted
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// data sanitization for noSQL query injection
app.use(mongoSanitize());

// "email":{"$gte" : ""}
// data sanitiazation is used to prevent form the error like above

// data sanitization for XSS
app.use(xss());

// duplicate query protection (http pollution protection)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//for test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // shows the time required to run an code
  console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  // const err  = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail',
  // err.statusCode = 400;

  next(new appError(`cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// note:- two response are not allowed in event loop
