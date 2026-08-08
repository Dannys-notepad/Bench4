import {
    createNewReport,
    getReportById,
    getReportsByUser,
    finalizeReport,
    getReportPdf
} from './report.service.js'
import { confirmTranscript } from '#modules/reports/pipelines/digitized.service.js'
import { success } from '#lib/response.js'

export const handleCreateNewReport = async (req, res) => {
    const result = await createNewReport({
        ...req.body,
        files: req.files || [],
        userId: req.user.id
    })
    return success(res, result.message, result.data, result.status || 200)
}

export const handleGetReports = async (req, res) => {
    const result = await getReportsByUser(req.user.id)
    return success(res, result.message, result.data)
}

export const handleGetReport = async (req, res) => {
    const result = await getReportById(req.params.id, req.user.id)
    return success(res, result.message, result.data)
}

export const handleFinalizeReport = async (req, res) => {
    const { structuredData } = req.body
    const result = await finalizeReport(req.params.id, structuredData, req.user.id)
    return success(res, result.message, result.data)
}

export const handleGetReportPdf = async (req, res) => {
    const result = await getReportPdf(req.params.id, req.user.id)
    return success(res, result.message, result.data)
}

export const handleConfirmTranscript = async (req, res) => {
    const { transcript } = req.body
    const result = await confirmTranscript(req.params.id, transcript, req.user.id)
    return success(res, result.message, result.data, result.status || 200)
}
