/**
 * Wraps an async Express handler and forwards any errors,
 * to the error handler middleware.
 * @param {Function} fn - Async route handler
 * @returns {Function} Custom error middleware
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler