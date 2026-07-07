import { generateInterviewReport } from "../services/ai.service.js";

export async function checkLLM() {
    console.log("🧪 LLM CHECK STARTED");

    const start = Date.now();

    try {
        const result = await generateInterviewReport({
            resume: "test resume",
            selfDescription: "test user",
            jobDescription: "test job"
        });

        const time = Date.now() - start;

        console.log("✅ LLM WORKING");
        console.log("⏱️ Response time:", time, "ms");
        console.log("📦 Output:", result);

        return { ok: true, time, result };

    } catch (err) {
        const time = Date.now() - start;

        console.log("❌ LLM FAILED");
        console.log("⏱️ Time before failure:", time, "ms");
        console.log("🚨 Error:", err);

        return { ok: false, time, error: err.message };
    }
}