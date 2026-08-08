import reportRepository from '#repositories/report.repo.js'
import userRepository from '#repositories/user.repo.js'
import AppError from '#lib/AppError.js'
import { enqueueTranscriptionJob } from '#lib/queue/transcriptionQueue.js'
import { generatePDF } from '#lib/pdf.js'
import { uploadPdfBuffer } from '#lib/storage.js'
import { buildFlaggedFields } from '#lib/flaggedFields.js'

export const createNewReport = async (data) => {
    if (!data?.title || !data?.template || !data?.userId) {
        throw new AppError('Missing required payload data', 400)
    }
    if (data.reportType === 'digitized' && (!data.files || data.files.length === 0)) {
        throw new AppError('No uploaded files', 400)
    }

    const { title, template, status, reportType, editInstructions, version, userId, files } = data
    const aiAssisted = Boolean(editInstructions)

    let rawPhotoUrls, rawPhotoPublicIds
    if (files?.length > 0) {
        rawPhotoUrls = files.map(f => f.path)
        rawPhotoPublicIds = files.map(f => f.filename || f.public_id)
    }
    
    const report = await reportRepository.create({
        userId,
        title,
        template,
        reportType,
        status,
        version,
        aiAssisted,
        editInstructions: editInstructions || null,
        rawPhotoUrls: rawPhotoUrls || null,
        rawPhotoPublicIds: rawPhotoPublicIds || null
    })

    if (!report) throw new AppError('Report could not be created', 400)

    await userRepository.incrementUsage(userId, reportType)

    if (reportType === 'digitized') {
        enqueueTranscriptionJob(report.id, report.rawPhotoUrls, report.editInstructions)
    }
    
    return { message: 'Report created successfully', data: report, status: 201 }
}

export const getReportsByUser = async (userId) => {
    const reports = await reportRepository.findAllByUser(userId)
    return { message: 'Reports fetched successfully', data: reports }
}

export const getReportById = async (id, userId) => {
    const report = await reportRepository.find(id)
    if (!report) throw new AppError('Report not found', 404)
    if (report.userId !== userId) throw new AppError('Unauthorized', 401)
    
    return { message: 'Report fetched successfully', data: report }
}

export const finalizeReport = async (id, structuredData, userId) => {
    const report = await reportRepository.find(id)
    if (!report) throw new AppError('Report not found', 404)
    if (report.userId !== userId) throw new AppError('Unauthorized', 401)
    if (report.status === 'completed') throw new AppError('Report is already finalized', 400)
    if (!['needs_review', 'structuring'].includes(report.status)) {
        throw new AppError('Report is not ready for finalization', 400)
    }

    const flaggedFields = buildFlaggedFields(report.transcript, structuredData)
    const approvedAt = new Date()

    const pdfBuffer = await generatePDF(report, structuredData)
    const { url: pdfUrl, publicId: pdfPublicId } = await uploadPdfBuffer(pdfBuffer, id)

    const finalReport = await reportRepository.update(id, { 
        structuredData, 
        flaggedFields,
        status: 'completed', 
        approvedAt,
        pdfUrl,
        pdfPublicId
    })

    return { 
        message: 'Report finalized successfully', 
        data: { id, pdfUrl, report: finalReport } 
    }
}

export const getReportPdf = async (id, userId) => {
    const report = await reportRepository.find(id)
    if (!report) throw new AppError('Report not found', 404)
    if (report.userId !== userId) throw new AppError('Unauthorized', 401)
    if (!report.pdfUrl) throw new AppError('PDF not available for this report', 404)

    return { message: 'PDF URL fetched successfully', data: { pdfUrl: report.pdfUrl } }
}
