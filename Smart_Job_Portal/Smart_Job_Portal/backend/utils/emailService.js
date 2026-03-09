const nodemailer = require('nodemailer');
const getUser = () => (process.env.SMTP_USER || "").trim();
const getPass = () => (process.env.SMTP_PASS || "").replace(/\s/g, "");

/**
 * Sends an email to the specified recipient.
 */
const sendEmail = async (to, subject, htmlContent) => {
    const user = getUser();
    const pass = getPass();

    try {
        if (!user || !pass) {
            console.warn("⚠️ SMTP_USER or SMTP_PASS not defined. Skipping email to:", to);
            return false;
        }

        // Use explicit configuration for better reliability in production
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: { user, pass },
            debug: true, // show debug output in logs
            logger: true // log to console
        });

        // Verify connection configuration
        await transporter.verify();
        console.log("SMTP Connection verified successfully.");

        const info = await transporter.sendMail({
            from: `"Smart Job Portal" <${user}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });

        console.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            recipient: to
        };
        console.error("Critical Error sending email:", errorDetails);
        return errorDetails; // Return the error object instead of just false
    }
};

module.exports = {
    sendEmail
};
