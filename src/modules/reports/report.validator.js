import { nullable, z } from 'zod'

export const createReportSchema = z.object({
    title: z.string().min(3, 'Title is required and should be at least 3 characters long').max(255),
    template: z.enum(['titration', 'synthesis', 'spectroscopy', 'tests'], {
        errorMap: () => ({ message: 'Template must be either titration, synthesis, spectroscopy, or tests' })
    }),
    status: z.string().default('draft'),
    reportType: z.enum(['digitized', 'guided'], {
        errorMap: () => ({ message: 'Type must be either digitized or guided' })
    }),
    editInstruction: z.string().max(50, 'Edit instruction should not be more than 50 words').nullable(),
    version: z.number().int().min(1).default(1),
})

export const photoFileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    mimetype: z.string().regex(/^image\//, 'File must be an image'),
    buffer: z.any().optional(), // In case memory storage is used
    size: z.number().max(10 * 1024 * 1024, 'File is too large (max 10MB)')
})

export const confirmTranscriptSchema = z.object({
    transcript: z.string().min(1, 'Transcript cannot be empty')
})

export const finalizeReportSchema = z.object({
    // We expect a structured object from the frontend (the finalized JSON)
    structuredData: z.record(z.any()),
}).loose()//.passthrough()