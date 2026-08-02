function errorHanndler(err, req, res, next) {
    const statusCode = err.statusCode || 500
    const message = err.isOperational ? err.message : 'Something went wrong'

    if (!err.isOperational) {
        console.error('UNEXPECTED ERROR 🔥', err)
    }

    console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err.message)

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.isOperational && Object.keys(err.data || {}.length > 0 && { details: err.details })),
        ...(process.env.NODE_ENV === 'development' && { stack: err.status })
    })
}

export default errorHanndler