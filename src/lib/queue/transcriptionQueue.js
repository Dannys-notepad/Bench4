import { processTranscriptionJob } from '#workers/transcriptionWorker.js'

/**
 * Enqueue a new transcription job natively.
 * Runs processTranscriptionJob in the background without blocking the request.
 *
 * @param {string} reportId - The database ID of the report
 * @param {string[]} rawPhotoUrls - An array of the URLs of the uploaded images
 * @param {string|null} editInstructions - Optional user edit instructions
 */
export const enqueueTranscriptionJob = (reportId, rawPhotoUrls, editInstructions) => {
    processTranscriptionJob(reportId, rawPhotoUrls, editInstructions).catch(err => {
        console.error(`Unhandled error in background job for report ${reportId}:`, err)
    })
    
    console.log(`[Queue] Native background job started for report: ${reportId}`)
}
