import fs from 'fs'
import AppError from '../lib/AppError.js'
import { error } from '../lib/response.js'

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return error(res, 'Validation failed', result.error.flatten().fieldErrors)
        }

        req.body = result.data
        next()
    }
}

export const validateFiles = (schema, { required = true } = {}) => {
    return (req, res, next) => {
        const files = req.files || []
        if (files.length === 0) {
            if (required) return error(res, 'No uploaded file provided')
        }

        for (const file of files) {
            const result = schema.safeParse(file)

            if (!result.success) {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Failed to delete rejected upload', err)
                    })
                }

                return error(res, 'Invalid file', result.error.flatten().fieldErrors)
            }
        }

        next()
    }
}