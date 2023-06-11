const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  console.log('handle case error');
  console.log(err);
  const message = `Invalid ${err.path}: ${err.stringValue}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // the above trick didin't work so i wrote convert
  // console.log('error found', err.errmsg.name)
  console.log('handle duplicate error');

  let convert = `"${err.keyValue.name}"`;
  const value = convert.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('invalid web tokens. please login again', 401);
const handleTokenExpired = err => new AppError('you token has expired. please login agian', 401);

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};


const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  let error = { ...err };
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', error);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {

    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    console.log("error found oow yeah", error);
    if (error._message === 'Validation failed') error = handleValidationErrorDB(error); 
    if(error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if(error.name === 'TokenExpiredError') error = handleTokenExpired(error);
        
    sendErrorProd(error, res);
  }
};
