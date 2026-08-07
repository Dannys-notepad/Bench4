import reportRepository from '../repositories/report.repo.js'
import { structureTranscript } from '../lib/gemini.js'
import AppError from '../lib/AppError.js'

/**
 * Processes the structuring job asynchronously natively in Node.js.
 * @param {string} reportId - The database ID of the report
 * @param {string} transcript - The raw, human-confirmed transcript
 * @param {string} template - The template type to map into (e.g., titration)
 */
export const processStructuringJob = async (reportId, transcript, template) => {
    console.log(`[Background Job] Started structuring for report ${reportId}`)

    try {
        // 1. Call Gemini to map transcript into structured JSON
        const rawJsonString = await structureTranscript(transcript, template)
        
        let structuredData;
        try {
            // Clean up any markdown code blocks Gemini might return (e.g. ```json ... ```)
            const cleanJsonString = rawJsonString.replace(/```json\n?|```/g, '').trim()
            structuredData = JSON.parse(cleanJsonString)
        } catch (e) {
            console.error(`[Background Job] Failed to parse JSON for report ${reportId}:`, e)
            throw new AppError('Server Error', 500)
        }

        console.log(`[Background Job] Successfully structured data for report ${reportId}`)

        // 2. Save the structured data and update status to 'completed'
        await reportRepository.update(reportId, { 
            structuredData,
            status: 'completed'
        })
        
        console.log(`[Background Job] Finished structuring for report ${reportId}`)
        
    } catch (error) {
        if (error instanceof AppError) throw error
        console.error(`[Background Job] Failed structuring for report ${reportId}:`, error)
        throw new AppError('Server Error', 500)
    }
}
