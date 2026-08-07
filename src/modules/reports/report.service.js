import reportRepository from '../../repositories/report.repo.js'
import { ok, fail } from '../../lib/https.js'
import AppError from '../../lib/AppError.js'
import { enqueueTranscriptionJob } from '../../lib/queue/transcriptionQueue.js'
import { processStructuringJob } from '../../workers/structuringWorker.js'
import { generatePDF } from '../../lib/pdf.js'

export const createNewReport = async (data) => {

    let rawPhotoUrls, rawPhotoPublicIds
    
    if (!data || !data.title || !data.template || !data.userId) return fail('Missing required payload data')
    if ( data.type === 'digitized' && (!data.files || data.files.length === 0)) return fail('No uploaded files')
        
    try {
        const { title, template, status, reportType, editInstruction, version, userId, files } = data

        const aiAssisted = Boolean(editInstruction)

        if (files && files.length > 0) {
            // Cloudinary puts the file's uploaded URL in `file.path`
            rawPhotoUrls = files.map(f => f.path);
            rawPhotoPublicIds = files.map(file => file.publicId)
        }
        
        const report = await reportRepository.create({
            userId,

            title,
            template,
            reportType,
            status,
            version,
            aiAssisted,

            editInstruction: editInstruction || null,
            rawPhotoUrls: rawPhotoUrls || null,
            rawPhotoPublicIds: rawPhotoPublicIds || null
        })

        if (!report) return fail('Report could not be created', {}, 400)

        // 3. Enqueue the async Transcription job for Gemini
        enqueueTranscriptionJob(report.id, report.rawPhotoUrls)

        // 4. Return Standardized Response
        return ok('Report created successfully', report, 201)
    } catch (error) {
        console.error('Error creating report:')
        throw error
    }
}

export const getReportById = async (id, userId) => {
    try {
        const report = await reportRepository.find(Number(id));
        if (!report) return fail('Report not found', {}, 404)
        
        // Security check
        if (report.userId !== userId) return fail('Unauthorized', {}, 401)
        
        return ok('Report fetched successfully', report, 200);
    } catch (error) {
        console.error('Error geting report')
        throw error
    }
}

export const confirmTranscript = async (id, transcript, userId) => {
    try {
        const report = await reportRepository.find(Number(id));
        if (!report) throw new AppError('Report not found', 404);
        if (report.userId !== userId) throw new AppError('Unauthorized', 401);
        
        // 1. Update the DB with the human-confirmed transcript and move status to 'mapping'
        await reportRepository.update(Number(id), { transcript, status: 'mapping' });

        // 2. Enqueue the native background task to map it to JSON
        processStructuringJob(Number(id), transcript, report.template).catch(err => {
            console.error(`Unhandled error in structuring job for report ${id}:`, err)
        })

        return ok('Transcript confirmed. Structuring started.', { id }, 200);
    } catch(error) {
        console.error('Error confirming transcript:')
        throw error
    }
}

export const finalizeReport = async (id, structuredData, userId) => {
    try {
        const report = await reportRepository.find(Number(id));
        if (!report) return error('Report not found', {}, 404);
        if (report.userId !== userId) return error('Unauthorized', {}, 401);

        // 1. Mark as finalized and store the human-approved structured data
        const approvedAt = new Date();
        const finalReport = await reportRepository.update(Number(id), { 
            structuredData, 
            status: 'finalized', 
            approvedAt
        });

        // 2. Synchronous PDF generation
        const pdfBuffer = await generatePDF(finalReport, structuredData);
        
        // In a real production app, we would upload this pdfBuffer to Cloudinary or AWS S3,
        // and save the pdfUrl to the database. For this implementation, since we just have
        // the buffer, we could return it as base64, or just acknowledge it was generated.
        // Returning a placeholder URL to simulate a complete upload flow.
        const pdfUrl = `https://mock-storage.com/reports/${id}.pdf`;

        return ok('Report finalized successfully', { id, pdfUrl }, 200);
    } catch(error) {
        console.error('Error finalizing report:')
        throw error
    }
}