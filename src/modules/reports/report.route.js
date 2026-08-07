import { Router } from 'express'
import { upload } from '../../config/upload.js'
import requireAuth from '../../middleware/auth.middleware.js'
import { validateBody, validateFiles } from '../../middleware/validate.middleware.js'
import { 
    handleCreateNewReport, 
    handleGetReport, 
    handleConfirmTranscript, 
    handleFinalizeReport 
} from './report.controller.js'

import {
    createReportSchema,
    photoFileSchema,
    confirmTranscriptSchema,
    finalizeReportSchema
} from './report.validator.js'

import { checkDigitizedLimit, checkGuidedLimit } from './limits/enforceDailyLimit.middleware.js'

const router = Router()

router.post('/new/digitized', requireAuth, checkDigitizedLimit, upload.array('photos', 10), validateBody(createReportSchema), validateFiles(photoFileSchema), handleCreateNewReport)
router.get('/:id', requireAuth, handleGetReport)
router.patch('/:id/confirm-transcript', requireAuth, validateBody(confirmTranscriptSchema), handleConfirmTranscript)
router.post('/:id/finalize', requireAuth, validateBody(finalizeReportSchema), handleFinalizeReport)

export default router