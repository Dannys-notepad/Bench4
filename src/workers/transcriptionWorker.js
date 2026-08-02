import reportRepository from '../repositories/report.repo.js'
import { transcribeImage } from '../lib/gemini.js'

/**
 * Processes the transcription job asynchronously.
 * This runs natively in the Node.js event loop without requiring an external queue like Redis.
 * 
 * @param {string} reportId - The database ID of the report
 * @param {string[]} rawPhotoUrls - Array of URLs of the uploaded image
 */
export const processTranscriptionJob = async (reportId, rawPhotoUrls) => {
    console.log(`[Background Job] Started transcription for report ${reportId}`)

    try {
        // 1. Mark report as 'structuring' so the UI knows it's being processed
        await reportRepository.update(reportId, { status: 'structuring' })

        // 2. Call Gemini Vision to transcribe the image
        const rawTranscript = await transcribeImage(rawPhotoUrl)
        console.log(`[Background Job] Successfully got transcript for report ${reportId}`)
        console.log(rawTranscript)

        // 3. Save the transcript to the database
        await reportRepository.update(reportId, { 
            transcript: rawTranscript,
            status: 'structuring' 
        })
        
        console.log(`[Background Job] Finished transcription for report ${reportId}`)
        
    } catch (error) {
        console.error(`[Background Job] Failed transcription for report ${reportId}:`, error)
        // Optionally update the status to 'failed' in the database here so the UI can reflect it
    }
}
