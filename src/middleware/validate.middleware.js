import fs from 'fs'
import AppError from '#lib/AppError.js'

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return next(new AppError('Validation failed', 400, result.error.flatten().fieldErrors))
        }

        req.body = result.data
        next()
    }
}

export const validateFiles = (schema, { required = true } = {}) => {
    return (req, res, next) => {
        const files = req.files || []
        if (files.length === 0 && required) {
            return next(new AppError('No uploaded file provided', 400))
        }

        for (const file of files) {
            const result = schema.safeParse(file)

            if (!result.success) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Failed to delete rejected upload', err)
                    })
                }

                return next(new AppError('Invalid file', 400, result.error.flatten().fieldErrors))
            }
        }

        next()
    }
}
