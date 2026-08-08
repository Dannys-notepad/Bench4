import { Readable } from 'stream'
import cloudinary from '#config/cloudinary.js'
import AppError from '#lib/AppError.js'

/**
 * Uploads a PDF buffer to Cloudinary.
 * @param {Buffer} buffer - Generated PDF buffer
 * @param {string} reportId - Report ID used as the public_id
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadPdfBuffer = (buffer, reportId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'bench4/reports/pdf',
                resource_type: 'raw',
                format: 'pdf',
                public_id: reportId,
                overwrite: true
            },
            (err, result) => {
                if (err) return reject(new AppError('Failed to upload PDF', 500))
                resolve({ url: result.secure_url, publicId: result.public_id })
            }
        )

        Readable.from(buffer).pipe(uploadStream)
    })
}

export default uploadPdfBuffer
