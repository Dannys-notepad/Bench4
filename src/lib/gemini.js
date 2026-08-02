import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '../config/env.js'

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

/**
 * Helper to fetch a remote image and format it for Gemini's vision API
 * @param {string} url - The URL of the image (e.g., Cloudinary)
 */
async function urlToGenerativePart(url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType: response.headers.get('content-type') || 'image/jpeg'
        }
    }
}

/**
 * Transcribes handwritten lab notes from an image URL using Gemini 2.5 Flash
 * @param {string[]} photoUrls - Array of URLs of the uploaded image
 * @returns {Promise<string>} - The raw text transcript
 */
export const transcribeImage = async (photoUrls) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' })
    
    const imageParts = await Promise.all(photoUrls.map(url => urlToGenerativePart(url)));
    const prompt = "You are a professional lab assistant. Please read the handwritten notes in this image and provide a highly accurate raw text transcript. If a word or digit is ambiguous or smudged, flag it clearly (e.g., [UNSURE: text]). Do not make up any missing information."

    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()
    
    return text
}

/**
 * Maps a raw transcript into structured JSON based on the template type.
 * @param {string} transcript - The raw text transcript
 * @param {string} template - The report template (e.g., 'titration')
 * @returns {Promise<string>} - The JSON string
 */
export const structureTranscript = async (transcript, template) => {
    // We use gemini-1.5-flash for the fast structured mapping
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })
    
    const prompt = `
You are a professional data structuring assistant for a chemistry lab.
I will provide a raw transcript of handwritten lab notes. Your job is to extract the data and map it perfectly into the following JSON structure for a '${template}' report.

REQUIRED JSON FORMAT:
{
    "objective": "string",
    "materials": ["array of strings"],
    "methods": "string",
    "rawData": {
        // extract any tables, measurements, or raw values here as key-value pairs
    },
    "results": "string",
    "conclusion": "string"
}

RULES:
1. Do NOT make up any missing data. If a section or field is completely missing from the notes, output "[MISSING]" for that field.
2. If any value contains "[UNSURE: text]" from the transcript, keep that exact tag in the JSON so the human researcher knows to verify it.
3. Return ONLY raw JSON. No markdown backticks, no explanations.

RAW TRANSCRIPT:
${transcript}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}
