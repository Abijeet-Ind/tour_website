class AppError extends Error {
    constructor(message, status){
        super(message);

        this.statusCode = status;
        this.status = `${status}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
    con(message){
        console.log('app error message', message);
    }
}

module.exports = AppError;

