import { Router } from 'express'
import { upload } from '#config/upload.js'
import requireAuth from '#middleware/auth.middleware.js'
import { validateBody, validateFiles } from '#middleware/validate.middleware.js'
import { 
    handleCreateNewReport, 
    handleGetReports,
    handleGetReport, 
    handleConfirmTranscript, 
    handleFinalizeReport,
    handleGetReportPdf
} from './report.controller.js'
import asyncHandler from '#lib/asyncHandler.js'

import {
    createReportSchema,
    photoFileSchema,
    confirmTranscriptSchema,
    finalizeReportSchema
} from './report.validator.js'

import { checkDigitizedLimit } from '#modules/reports/limits/enforceDailyLimit.middleware.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(handleGetReports))
router.post('/new/digitized', requireAuth, checkDigitizedLimit, upload.array('photos', 10), validateBody(createReportSchema), validateFiles(photoFileSchema), asyncHandler(handleCreateNewReport))
router.get('/:id', requireAuth, asyncHandler(handleGetReport))
router.get('/:id/pdf', requireAuth, asyncHandler(handleGetReportPdf))
router.patch('/:id/confirm-transcript', requireAuth, validateBody(confirmTranscriptSchema), asyncHandler(handleConfirmTranscript))
router.post('/:id/finalize', requireAuth, validateBody(finalizeReportSchema), asyncHandler(handleFinalizeReport))

export default router
