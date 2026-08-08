import reportRepository from '#repositories/report.repo.js'
import { transcribeImage } from '#lib/gemini.js'
import { extractFlaggedFields } from '#lib/flaggedFields.js'

/**
 * Processes the transcription job asynchronously.
 * Runs natively in the Node.js event loop without an external queue.
 *
 * @param {string} reportId - The database ID of the report
 * @param {string[]} rawPhotoUrls - Array of URLs of the uploaded images
 * @param {string|null} editInstructions - Optional user edit instructions
 */
export const processTranscriptionJob = async (reportId, rawPhotoUrls, editInstructions) => {
    console.log(`[Background Job] Started transcription for report ${reportId}`)

    try {
        await reportRepository.update(reportId, { status: 'transcribing' })

        const rawTranscript = await transcribeImage(rawPhotoUrls, editInstructions)
        console.log(`[Background Job] Successfully got transcript for report ${reportId}`)

        const flaggedFields = extractFlaggedFields(rawTranscript)

        await reportRepository.update(reportId, { 
            transcript: rawTranscript,
            flaggedFields,
            status: 'needs_review' 
        })
        
        console.log(`[Background Job] Finished transcription for report ${reportId}`)
        
    } catch (error) {
        console.error(`[Background Job] Failed transcription for report ${reportId}:`, error)
        await reportRepository.update(reportId, { status: 'failed' })
    }
}
