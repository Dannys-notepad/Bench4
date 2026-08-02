import { createNewReport,
    getReportById,
    confirmTranscript,
    finalizeReport
} from './report.service.js'
import AppError from '../../lib/AppError.js'
import asyncHandler from '../../lib/asyncHandler.js';

const sendJson = (res, body, status) => {
    return res.status(status).json(body) 
}

/**
 * Controller: Handles the HTTP request and response for creating a new report.
 * As a best practice, the controller only extracts data from the request, 
 * passes it to the service layer (which holds the business logic), 
 * and then formats the HTTP response based on the service's result.
 */
export const handleCreateNewReport = asyncHandler(async (req, res) => {
    const body = req.body
    const file = req.file
        
    const userId = req.user?.id
    if (!userId) throw new AppError('User authentication required', 401)

    const reportPayload = {
        ...body,
        file,
        userId
    }

    const result = await createNewReport(reportPayload)
    const { message, data, status } = result
    return sendJson(res, { message, data }, status)
})

export const handleGetReport = asyncHandler(async (req, res) => {
    const result = await getReportById(req.params.id, req.user?.id)
    return sendJson(res, { message: result.message, data: result.data }, result.status)  
})

export const handleConfirmTranscript = asyncHandler(async (req, res) => {
    const { transcript } = req.body
    const result = await confirmTranscript(req.params.id, transcript, req.user?.id)
    return sendJson(res, { message: result.message, data: result.data }, result.status)
})

export const handleFinalizeReport = asyncHandler(async (req, res) => {
    const result = await finalizeReport(req.params.id, structuredData, req.user?.id)
    return sendJson(res, { message: result.message, data: result.data }, result.status)
})