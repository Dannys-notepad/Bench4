import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import AppError from './AppError.js';

/**
 * Generates a PDF buffer from a finalized report
 * @param {Object} report - The full report object from the database
 * @param {Object} structuredData - The parsed JSON structured data
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
export const generatePDF = async (report, structuredData) => {
    let browser = null;
    
    try {
        // We use sparticuz/chromium to avoid downloading full chromium in production environments
        // If it's local, you might need to point executablePath to a local Chrome installation,
        // but for this implementation we rely on sparticuz's smart resolution.
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        
        // Build a beautiful HTML template for the PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    h1 { border-bottom: 2px solid #2563eb; padding-bottom: 10px; color: #1e40af; }
                    .meta { color: #6b7280; font-size: 0.9em; margin-bottom: 30px; }
                    .section { margin-top: 25px; }
                    .section-title { font-size: 1.2em; font-weight: bold; color: #374151; margin-bottom: 10px; text-transform: uppercase; }
                    .content { background: #f3f4f6; padding: 15px; border-radius: 6px; }
                    .tag { display: inline-block; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>${report.title}</h1>
                <div class="meta">
                    <p><strong>Report ID:</strong> ${report.id}</p>
                    <p><strong>Template:</strong> ${report.template}</p>
                    <p><strong>Approved At:</strong> ${new Date(report.approvedAt).toLocaleString()}</p>
                    <p><strong>Version:</strong> ${report.version}</p>
                </div>

                ${Object.entries(structuredData).map(([key, value]) => `
                    <div class="section">
                        <div class="section-title">${key}</div>
                        <div class="content">
                            ${typeof value === 'object' ? JSON.stringify(value, null, 2).replace(/\n/g, '<br>') : value}
                        </div>
                    </div>
                `).join('')}

                <div class="section" style="margin-top: 50px; font-size: 0.8em; color: #9ca3af; text-align: center;">
                    <p>Generated securely by Bench 4 AI Pipeline</p>
                </div>
            </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
        });

        return pdfBuffer;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new AppError('Failed to generate PDF', 500);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
