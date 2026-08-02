import { processTranscriptionJob } from '../../workers/transcriptionWorker.js'

/**
 * Enqueue a new transcription job natively.
 * This runs the processTranscriptionJob in the background without awaiting it,
 * simulating a queue so the main request thread isn't blocked.
 * 
 * @param {string} reportId - The database ID of the report
 * @param {string} rawPhotoUrl - The URL of the uploaded image
 */
export const enqueueTranscriptionJob = (reportId, rawPhotoUrl) => {
    // We call the async function without awaiting it.
    // This fires off the promise in the background.
    processTranscriptionJob(reportId, rawPhotoUrl).catch(err => {
        console.error(`Unhandled error in background job for report ${reportId}:`, err)
    })
    
    console.log(`[Queue] Native background job started for report: ${reportId}`)
}
