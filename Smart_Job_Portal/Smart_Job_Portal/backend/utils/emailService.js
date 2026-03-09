const { Resend } = require('resend');

const getResendKey = () => (process.env.RESEND_API_KEY || "").trim();

/**
 * Sends an email using the Resend API.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const apiKey = getResendKey();

    try {
        if (!apiKey) {
            console.warn("⚠️ RESEND_API_KEY not defined. Skipping email to:", to);
            return { error: "Missing RESEND_API_KEY in environment variables." };
        }

        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'Smart Job Portal <onboarding@resend.dev>', // Resend default for unverified domains
            to: to,
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return error;
        }

        console.log(`Email sent successfully via Resend to ${to} (ID: ${data.id})`);
        return true;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            recipient: to
        };
        console.error("Critical Error sending email via Resend:", errorDetails);
        return errorDetails;
    }
};

module.exports = {
    sendEmail
};
