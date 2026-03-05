require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 10));
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Success with Flash:", response.text());
    } catch (e) {
        console.error("Flash Error:", e.message);
        if (e.status) console.error("Status:", e.status);
    }
}
testGemini();
