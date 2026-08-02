import fs from 'fs'
import AppError from '../lib/AppError.js'

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            throw new AppError('Validation failed', 400, {
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            })
        }

        req.body = result.data
        next()
    }
}

export const validateFile = (schema, { required = true } = {}) => {
    return (req, res, next) => {
        if (!req.file) {
            if (required) throw new AppError('No uploaded file provided', 400)
            return next()
        }

        const result = schema.safeParse(req.file)

        if (!result.success) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Failed to delete rejected upload', err)
                })
            }

            throw new AppError('Invalid file', 400, {
                error: 'Invalid file',
                details: result.error.flatten().fieldErrors
            })
        }

        next()
    }
}