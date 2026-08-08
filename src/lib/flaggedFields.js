/**
 * Extracts confidence and gap markers from transcript or structured content.
 * @param {string} text - Raw transcript or stringified JSON
 * @returns {{ unsure: string[], missing: string[], crossedOut: string[], diagrams: string[], total: number }}
 */
export const extractFlaggedFields = (text) => {
    if (!text) return { unsure: [], missing: [], crossedOut: [], diagrams: [], total: 0 }

    const unsure = [...text.matchAll(/\[UNSURE:\s*([^\]]*)\]/gi)].map(m => m[1].trim())
    const missing = [...text.matchAll(/\[MISSING(?::\s*([^\]]*))?\]/gi)].map(m => (m[1] || 'field').trim())
    const crossedOut = [...text.matchAll(/\[CROSSED OUT:\s*([^\]]*)\]/gi)].map(m => m[1].trim())
    const diagrams = [...text.matchAll(/\[DIAGRAM:\s*([^\]]*)\]/gi)].map(m => m[1].trim())

    return {
        unsure,
        missing,
        crossedOut,
        diagrams,
        total: unsure.length + missing.length + crossedOut.length + diagrams.length
    }
}

/**
 * Merges flagged fields from transcript and structured data.
 * @param {string} transcript
 * @param {object|null} structuredData
 */
export const buildFlaggedFields = (transcript, structuredData = null) => {
    const fromTranscript = extractFlaggedFields(transcript)
    const fromStructured = structuredData
        ? extractFlaggedFields(JSON.stringify(structuredData))
        : { unsure: [], missing: [], crossedOut: [], diagrams: [], total: 0 }

    return {
        unsure: [...new Set([...fromTranscript.unsure, ...fromStructured.unsure])],
        missing: [...new Set([...fromTranscript.missing, ...fromStructured.missing])],
        crossedOut: [...new Set([...fromTranscript.crossedOut, ...fromStructured.crossedOut])],
        diagrams: [...new Set([...fromTranscript.diagrams, ...fromStructured.diagrams])],
        total: fromTranscript.total + fromStructured.total
    }
}

export default extractFlaggedFields
