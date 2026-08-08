const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Something went wrong';

    if (!err.isOperational) {
        console.error('UNEXPECTED ERROR', err);
    } else {
        console.error(`[${req.method} ${req.originalUrl}]`, err.message);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.isOperational && err.details && Object.keys(err.details).length > 0 && { errors: err.details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
