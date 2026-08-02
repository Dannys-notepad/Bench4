import AppError from "../lib/AppError";

const notFound = (req, res, next) => {
    const error404 = new AppError(`Route not found - ${req.originalUrl}`, 404)
    next(error404)
}

export default notFound