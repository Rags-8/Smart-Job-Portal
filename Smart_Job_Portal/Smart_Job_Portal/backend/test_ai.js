require('dotenv').config({ path: 'c:/Users/ragha/Downloads/Smart_Job_Portal (2)/Smart_Job_Portal/Smart_Job_Portal/backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 10));
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (e) {
        console.error("Gemini Error:", e);
    }
}
testGemini();
