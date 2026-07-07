import "dotenv/config";

import { z } from "zod";
import puppeteer from "puppeteer";
import { GoogleGenAI } from "@google/genai";


const googleGenAiApiKey = process.env.GOOGLE_GENAI_API_KEY;
let ai = null;

if (!googleGenAiApiKey) {
    console.warn(
        "⚠️ Gemini API key not found. AI endpoints will return 503."
    );
} else {
    ai = new GoogleGenAI({
        apiKey: googleGenAiApiKey
    });
}


// =============================== INTERVIEW REPORT SCHEMA ===============================

const interviewReportSchema = z.object({

    matchScore: z.number(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum([
                "low",
                "medium",
                "high"
            ])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    title: z.string()

});


// =============================== GENERATE INTERVIEW REPORT ===============================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    if (!ai) {
        const error = new Error(
            "Gemini API key is not configured."
        );

        error.statusCode = 503;

        throw error;
    }

    console.log("========== GEMINI DEBUG ==========");

    console.log({
        resumeLength: resume?.length || 0,
        selfDescriptionLength: selfDescription?.length || 0,
        jobDescriptionLength: jobDescription?.length || 0
    });


    const prompt = `
                    You are an expert technical interviewer.
                    Analyze the candidate profile and job description.
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

                    Return ONLY JSON.
                    Do not add markdown.
                    Do not add explanations.

                    Use exactly this structure:
                        {
                            "matchScore": number,

                            "technicalQuestions":[
                                {
                                    "question":"",
                                    "intention":"",
                                    "answer":""
                                }
                            ],

                            "behavioralQuestions":[
                                {
                                    "question":"",
                                    "intention":"",
                                    "answer":""
                                }
                            ],

                            "skillGaps":[
                                {
                                "skill":"",
                                "severity":"low|medium|high"
                                }
                            ],

                            "preparationPlan":[
                                {
                                "day":1,
                                "focus":"",
                                "tasks":[]
                                }
                            ],

                            "title":""
                        }
                `;

    console.log("Prompt length:", prompt.length);

    try {
        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

        console.log("✅ Gemini interview response received");

        const raw = response.text;
        let parsed;

        try {
            parsed = JSON.parse(raw);
        }
        catch (error) {
            console.error(raw);
            throw new Error("Gemini returned invalid JSON");
        }

        const validation = interviewReportSchema.safeParse(parsed);

        if (!validation.success) {
            console.error(validation.error.format());

            throw new Error(
                "Interview response schema mismatch"
            );
        }

        console.log("✅ Interview schema validated");

        return validation.data;
    }
    catch (error) {
        console.error("Gemini interview error:", error);

        throw error;
    }

}


// =============================== HTML TO PDF ===============================

async function generatePdfFromHtml(htmlContent) {
    if (!htmlContent) {
        throw new Error("HTML content missing");
    }

    const browser = await puppeteer.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })

        return pdfBuffer;
    }
    finally {
        await browser.close();
    }

}


// =============================== GENERATE RESUME PDF ===============================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {


    if (!ai) {

        const error =
            new Error(
                "Gemini API key is not configured."
            );

        error.statusCode = 503;

        throw error;

    }



    const resumePdfSchema =
        z.object({

            html: z.string()

        });





    const prompt = `

Generate an ATS friendly professional resume.

Candidate Resume:
${resume}


Candidate Description:
${selfDescription}


Job Description:
${jobDescription}



Return ONLY JSON.

Structure:

{
 "html":"complete html resume"
}


Requirements:

- Professional design
- ATS friendly
- 1-2 pages
- Clean HTML
- Inline CSS
- No markdown

`;




    try {


        const response =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: prompt,

                config: {
                    responseMimeType: "application/json"
                }

            });



        console.log(
            "✅ Resume Gemini response received"
        );



        const raw =
            response.text;



        let parsed;



        try {

            parsed =
                JSON.parse(raw);

        }
        catch (error) {

            console.error(raw);

            throw new Error(
                "Invalid resume JSON"
            );

        }

        const validation = resumePdfSchema.safeParse(parsed);

        if (!validation.success) {
            console.error(validation.error.format());

            throw new Error("Resume schema validation failed");
        }



        console.log(
            "HTML size:",
            validation.data.html.length
        );



        const pdfBuffer =
            await generatePdfFromHtml(validation.data.html);
        return pdfBuffer;
    }
    catch (error) {
        console.error("Resume generation error:", error);
        throw error;
    }
}


export {
    generateInterviewReport,
    generateResumePdf
};






// PDF Upload
//     |
//     ↓
// Extract Resume Text
//     |
//     ↓
// Gemini
//     |
//     ↓
// JSON Response
//     |
//     ↓
// Zod Validation
//     |
//     ↓
// MongoDB Save
//     |
//     ↓
// Resume HTML
//     |
//     ↓
// Puppeteer PDF