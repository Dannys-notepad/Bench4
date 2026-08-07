import reportRepository from '../../../repositories/report.repo.js'
import { ok, fail } from '../../../lib/https.js'
import AppError from '../../../lib/AppError.js'
import { processStructuringJob } from '../../../workers/structuringWorker.js'
import { generatePDF } from '../../../lib/pdf.js'

export const confirmTranscript = async (id, transcript, userId) => {
    try {
        const report = await reportRepository.find(id);
        if (!report) return fail('Report not found', {}, 404);
        if (report.userId !== userId) return fail('Unauthorized', {}, 401);
        
        // 1. Update the DB with the human-confirmed transcript and change status to 'structuring'
        await reportRepository.update(id, { transcript, status: 'structuring' });

        // 2. Enqueue the native background task to map it to JSON
        processStructuringJob(id, transcript, report.template).catch(err => {
            console.error(`Unhandled error in structuring job for report ${id}:`, err)
        })

        return ok('Transcript confirmed. Structuring started.', { id }, 200);
    } catch(error) {
        console.error('Error confirming transcript:')
        throw error
    }
}