import fs from 'fs'
import AppError from '../lib/AppError.js'

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            /*throw new AppError('Validation failed', 400, {
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            })*/
            return res.status(400).json({ message: 'Validation failed' })
        }

        req.body = result.data
        next()
    }
}

export const validateFiles = (schema, { required = true } = {}) => {
    return (req, res, next) => {
        const files = req.files || []
        if (files.length === 0) {
            if (required) return res.status(400).json({ message: 'No uploaded file provided' })/*throw new AppError('No uploaded file provided', 400)*/
        }

        for (const file of files) {
            const result = schema.safeParse(file)

            if (!result.success) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Failed to delete rejected upload', err)
                    })
                }

                return res.status(400).json({ message: 'Invalid file' })/*throw new AppError('Invalid file', 400, {
                    error: 'Invalid file',
                    details: result.error.flatten().fieldErrors
                })*/
            }
        }

        next()
    }
}