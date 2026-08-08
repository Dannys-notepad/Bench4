import reportRepository from '#repositories/report.repo.js'
import AppError from '#lib/AppError.js'
import { processStructuringJob } from '#workers/structuringWorker.js'

export const confirmTranscript = async (id, transcript, userId) => {
    const report = await reportRepository.find(id)
    if (!report) throw new AppError('Report not found', 404)
    if (report.userId !== userId) throw new AppError('Unauthorized', 401)
    if (report.status !== 'needs_review') {
        throw new AppError('Report transcript cannot be confirmed in its current state', 400)
    }
    
    await reportRepository.update(id, { transcript, status: 'structuring' })

    processStructuringJob(id, transcript, report.template).catch(err => {
        console.error(`Unhandled error in structuring job for report ${id}:`, err)
    })

    return { message: 'Transcript confirmed. Structuring started.', data: { id } }
}
