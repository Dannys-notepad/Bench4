import reportRepository from '#repositories/report.repo.js'
import { structureTranscript } from '#lib/gemini.js'
import { buildFlaggedFields } from '#lib/flaggedFields.js'

/**
 * Processes the structuring job asynchronously.
 * @param {string} reportId - The database ID of the report
 * @param {string} transcript - The raw, human-confirmed transcript
 * @param {string} template - The template type to map into (e.g., titration)
 */
export const processStructuringJob = async (reportId, transcript, template) => {
    console.log(`[Background Job] Started structuring for report ${reportId}`)

    try {
        const rawJsonString = await structureTranscript(transcript, template)
        
        let structuredData;
        try {
            const cleanJsonString = rawJsonString.replace(/```json\n?|```/g, '').trim()
            structuredData = JSON.parse(cleanJsonString)
        } catch (e) {
            console.error(`[Background Job] Failed to parse JSON for report ${reportId}:`, e)
            await reportRepository.update(reportId, { status: 'failed' })
            return
        }

        const flaggedFields = buildFlaggedFields(transcript, structuredData)

        await reportRepository.update(reportId, { 
            structuredData,
            flaggedFields,
            status: 'needs_review'
        })
        
        console.log(`[Background Job] Finished structuring for report ${reportId}`)
        
    } catch (error) {
        console.error(`[Background Job] Failed structuring for report ${reportId}:`, error)
        await reportRepository.update(reportId, { status: 'failed' })
    }
}
