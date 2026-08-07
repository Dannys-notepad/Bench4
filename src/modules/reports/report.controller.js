import {
    createNewReport,
    getReportById,
    finalizeReport
} from './report.service.js'
import { confirmTranscript } from './pipelines/digitized.service.js'
import AppError from '../../lib/AppError.js'
import { error } from '../../lib/response.js';

const sendJson = (res, body, status) => {
    return res.status(status).json(body)
}

// GENERAL FUNCTIONS USED BY BOTH PIPELINES
export const handleCreateNewReport = async (req, res) => {
    try {
        const body = req.body
        const userId = req.user?.id

        const reportPayload = {
            ...body,
            files: req.files || [],
            userId
        }

        const result = await createNewReport(reportPayload)
        return sendJson(res, { message: result.message, data: result.data }, result.status)

    } catch (e) {
        console.error('Error creating report', e)
        return error(res, 'Server Error', {}, 500)
    }
}

export const handleGetReport = async (req, res) => {
    try {
        const result = await getReportById(req.params.id, req.user?.id)
        return sendJson(res, { message: result.message, data: result.data }, result.status)
    } catch (e) {
        console.error('Error getting report', e)
        return error(res, 'Server Error', {}, 500)
    }
}

export const handleFinalizeReport = async (req, res) => {
    try {
        const { structuredData } = req.body
        const result = await finalizeReport(req.params.id, structuredData, req.user?.id)
        return sendJson(res, { message: result.message, data: result.data }, result.status)
    } catch (e) {
        console.error('Error finalizing report', e)
        return error(res, 'Server Error', {}, 500)
    }
}


// FUNCTIONS USED ONLY BY THE DIGITIZED PIPELINE

export const handleConfirmTranscript = async (req, res) => {
    try {
        const { transcript } = req.body
        const result = await confirmTranscript(req.params.id, transcript, req.user?.id)
        return sendJson(res, { message: result.message, data: result.data }, result.status)
    } catch (e) {
        console.error('Error confirming transcript', e)
        return error(res, 'Server Error', {}, 500)
    }
}