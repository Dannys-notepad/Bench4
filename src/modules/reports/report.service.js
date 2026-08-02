import reportRepository from '../../repositories/report.repo.js'
import { ok, /*fail*/ } from '../../lib/https.js'
import AppError from '../../lib/AppError.js'
import { enqueueTranscriptionJob } from '../../lib/queue/transcriptionQueue.js'
import { processStructuringJob } from '../../workers/structuringWorker.js'
import { generatePDF } from '../../lib/pdf.js'

export const createNewReport = async (data) => {
    // 1. Validation at the service level (defensive programming). 
    // Even though Zod handles this at the route level, it's good practice 
    // to ensure the service receives what it expects independently, in case 
    // it's called from somewhere else (like a script or internal queue).
    if (!data || !data.file || !data.title || !data.template || !data.userId) throw new AppError('Required report data missing', 400)

    try {
        const { title, template, status, version, userId, file } = data
        
        // Cloudinary puts the file's uploaded URL in `file.path`
        const rawPhotoUrl = file.path 

        // 2. Database Insertion
        // We interact with the repository layer instead of writing raw SQL or ORM code here. 
        // This abstracts the DB logic (Drizzle ORM) away from the service logic.
        const report = await reportRepository.create({
            userId,
            title,
            template,
            status: status || 'draft',
            version: version || 1,
            rawPhotoUrl
        })

        if (!report) throw AppError('Report could not be created', 500)

        // 3. Enqueue the async Transcription job for Gemini
        // We import it dynamically or statically at the top of the file
        enqueueTranscriptionJob(report.id, report.rawPhotoUrl)

        // 4. Return Standardized Response
        return ok('Report created successfully', report, 201)
    } catch (error) {
        if (error instanceof AppError) throw error
        console.error('Error creating report:', error)
        AppError('Server error', 500)
    }
}

export const getReportById = async (id, userId) => {
    try {
        const report = await reportRepository.find(Number(id));
        if (!report) throw new AppError('Report not found', 404)
        
        // Security check
        if (report.userId !== userId) throw new AppError('Unauthorized', 401)
        
        return ok('Report fetched successfully', report, 200);
    } catch (error) {
        if(error instanceof AppError) throw error
        console.error('Error fetching report:', error)
        return fail('Server error', null, 500);
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
        if(error instanceof AppError) throw error
        console.error('Error confirming transcript:', e)
        throw new AppError('Server error', 500);
    }
}

export const finalizeReport = async (id, structuredData, userId) => {
    try {
        const report = await reportRepository.find(Number(id));
        if (!report) throw new AppError('Report not found', 404);
        if (report.userId !== userId) throw new AppError('Unauthorized', 401);

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
        if(error instanceof AppError) throw error
        console.error('Error finalizing report:', error)
        throw new AppError('Server error', 500);
    }
}